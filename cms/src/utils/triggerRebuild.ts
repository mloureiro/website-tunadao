/**
 * Triggers a frontend rebuild via GitHub Actions workflow_dispatch.
 * Dispatches immediately; rapid successive edits are coalesced by GitHub
 * Actions concurrency (cancel-in-progress on ci.yml).
 */
export async function triggerFrontendRebuild(collection: string, operation: string): Promise<void> {
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;

  if (!token || !owner || !repo) {
    console.log('[Rebuild] Skipping - GitHub credentials not configured');
    return;
  }

  const workflowFile = process.env.GITHUB_WORKFLOW_FILE ?? 'ci.yml';
  const ref = process.env.GITHUB_REF ?? 'main';

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
    } else {
      const errorText = await response.text();
      console.error(`[Rebuild] Failed (${response.status}) dispatching ${workflowFile}: ${errorText}`);
    }
  } catch (error) {
    console.error(`[Rebuild] Error dispatching ${workflowFile}:`, error);
  }
}
