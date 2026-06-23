import type { Payload } from 'payload';

/**
 * Records the outcome of a rebuild dispatch to the rebuild-status global.
 * Wrapped in a non-throwing try/catch — a persistence failure must never
 * escape into the editor's save.
 */
async function recordStatus(
  payload: Payload,
  data: {
    outcome: 'success' | 'failure' | 'skipped';
    workflowFile: string;
    triggerCollection: string;
    triggerOperation: string;
    httpStatus?: number;
    errorDetail?: string;
  },
): Promise<void> {
  try {
    await payload.updateGlobal({
      slug: 'rebuild-status',
      data: { ...data, timestamp: new Date().toISOString() },
    });
  } catch (err) {
    // Best-effort: never let a status-write failure break the save.
    console.error('[Rebuild] Failed to record rebuild status:', err);
  }
}

/**
 * Triggers a frontend rebuild via GitHub Actions workflow_dispatch.
 * Dispatches immediately; rapid successive edits are coalesced by GitHub
 * Actions concurrency (cancel-in-progress on ci.yml).
 */
export async function triggerFrontendRebuild(
  payload: Payload,
  collection: string,
  operation: string,
): Promise<void> {
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  // Resolve workflowFile before the credentials check so skipped records include it.
  const workflowFile = process.env.GITHUB_WORKFLOW_FILE ?? 'ci.yml';
  const ref = process.env.GITHUB_REF ?? 'main';

  if (!token || !owner || !repo) {
    console.log('[Rebuild] Skipping - GitHub credentials not configured');
    await recordStatus(payload, {
      outcome: 'skipped',
      workflowFile,
      triggerCollection: collection,
      triggerOperation: operation,
    });
    return;
  }

  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${workflowFile}/dispatches`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json',
        },
        body: JSON.stringify({ ref, inputs: { deploy_target: 'app-only' } }),
      }
    );

    if (response.ok || response.status === 204) {
      console.log(`[Rebuild] Triggered ${workflowFile} for ${collection} ${operation}`);
      await recordStatus(payload, {
        outcome: 'success',
        workflowFile,
        triggerCollection: collection,
        triggerOperation: operation,
        httpStatus: response.status,
      });
    } else {
      const errorText = await response.text();
      console.error(`[Rebuild] Failed (${response.status}) dispatching ${workflowFile}: ${errorText}`);
      await recordStatus(payload, {
        outcome: 'failure',
        workflowFile,
        triggerCollection: collection,
        triggerOperation: operation,
        httpStatus: response.status,
        errorDetail: errorText,
      });
    }
  } catch (error) {
    console.error(`[Rebuild] Error dispatching ${workflowFile}:`, error);
    await recordStatus(payload, {
      outcome: 'failure',
      workflowFile,
      triggerCollection: collection,
      triggerOperation: operation,
      errorDetail: String(error),
    });
  }
}
