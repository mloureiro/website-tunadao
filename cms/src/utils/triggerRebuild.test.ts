import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { Payload } from 'payload';
import { triggerFrontendRebuild } from './triggerRebuild';

const VALID_ENV = {
  GITHUB_TOKEN: 'test-token',
  GITHUB_OWNER: 'test-owner',
  GITHUB_REPO: 'test-repo',
};

function makeFetchResponse(ok: boolean, status: number, body?: string): Response {
  return {
    ok,
    status,
    text: async () => body ?? '',
  } as unknown as Response;
}

function saveEnv(keys: string[]): Record<string, string | undefined> {
  const saved: Record<string, string | undefined> = {};
  for (const k of keys) saved[k] = process.env[k];
  return saved;
}

function restoreEnv(saved: Record<string, string | undefined>): void {
  for (const [k, v] of Object.entries(saved)) {
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
}

function makePayload(): { updateGlobal: ReturnType<typeof vi.fn> } & Pick<Payload, 'updateGlobal'> {
  return {
    updateGlobal: vi.fn().mockResolvedValue(undefined),
  } as unknown as { updateGlobal: ReturnType<typeof vi.fn> } & Pick<Payload, 'updateGlobal'>;
}

const ENV_KEYS = ['GITHUB_TOKEN', 'GITHUB_OWNER', 'GITHUB_REPO', 'GITHUB_WORKFLOW_FILE', 'GITHUB_REF'];

describe('triggerFrontendRebuild()', () => {
  let savedEnv: Record<string, string | undefined>;
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    savedEnv = saveEnv(ENV_KEYS);
    originalFetch = global.fetch;
    // Set valid creds by default; individual tests can override
    for (const [k, v] of Object.entries(VALID_ENV)) process.env[k] = v;
    // Remove optional vars so defaults apply
    delete process.env.GITHUB_WORKFLOW_FILE;
    delete process.env.GITHUB_REF;
  });

  afterEach(() => {
    restoreEnv(savedEnv);
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  // --- Case 1: Correct dispatch URL and body ---
  it('dispatches to the correct URL and body for ci.yml', async () => {
    const payload = makePayload();
    const mockFetch = vi.fn().mockResolvedValue(makeFetchResponse(true, 204));
    global.fetch = mockFetch as unknown as typeof global.fetch;

    await triggerFrontendRebuild(payload as unknown as Payload, 'albums', 'update');

    expect(mockFetch).toHaveBeenCalledOnce();
    const [url, opts] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toMatch(/\/actions\/workflows\/ci\.yml\/dispatches$/);
    const body = JSON.parse(opts.body as string) as unknown;
    expect(body).toEqual({ ref: 'main', inputs: { deploy_target: 'app-only' } });
  });

  // --- Case 2: GITHUB_WORKFLOW_FILE override ---
  it('uses GITHUB_WORKFLOW_FILE env var when set', async () => {
    process.env.GITHUB_WORKFLOW_FILE = 'other.yml';
    const payload = makePayload();
    const mockFetch = vi.fn().mockResolvedValue(makeFetchResponse(true, 204));
    global.fetch = mockFetch as unknown as typeof global.fetch;

    await triggerFrontendRebuild(payload as unknown as Payload, 'albums', 'update');

    const [url] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toMatch(/\/actions\/workflows\/other\.yml\/dispatches$/);
  });

  // --- Case 3: Non-2xx response is logged ---
  it('logs an error with status and workflow file on non-2xx response', async () => {
    const payload = makePayload();
    global.fetch = vi.fn().mockResolvedValue(
      makeFetchResponse(false, 404, 'nope')
    ) as unknown as typeof global.fetch;
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    await triggerFrontendRebuild(payload as unknown as Payload, 'albums', 'update');

    // First call is the fetch error log; second call may be updateGlobal failure (but won't occur here)
    const firstCall = errorSpy.mock.calls.find(
      (c) => typeof c[0] === 'string' && (c[0] as string).includes('404')
    );
    expect(firstCall).toBeDefined();
    const msg = firstCall![0] as string;
    expect(msg).toContain('ci.yml');
  });

  // --- Case 4: Immediate dispatch — no setTimeout ---
  it('does not call setTimeout (dispatches immediately)', async () => {
    const payload = makePayload();
    global.fetch = vi.fn().mockResolvedValue(
      makeFetchResponse(true, 204)
    ) as unknown as typeof global.fetch;
    const setTimeoutSpy = vi.spyOn(global, 'setTimeout');

    await triggerFrontendRebuild(payload as unknown as Payload, 'albums', 'update');

    expect(setTimeoutSpy).not.toHaveBeenCalled();
  });

  // --- Case 5: Missing credentials — fetch not called ---
  it('skips fetch and logs when GitHub credentials are missing', async () => {
    delete process.env.GITHUB_TOKEN;
    delete process.env.GITHUB_OWNER;
    delete process.env.GITHUB_REPO;
    const payload = makePayload();
    const mockFetch = vi.fn();
    global.fetch = mockFetch as unknown as typeof global.fetch;
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);

    await triggerFrontendRebuild(payload as unknown as Payload, 'albums', 'update');

    expect(mockFetch).not.toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalledOnce();
    const msg = logSpy.mock.calls[0]?.[0] as string;
    expect(msg).toContain('Skipping');
  });

  // --- Bonus: GITHUB_REF is respected ---
  it('uses GITHUB_REF env var for the ref field', async () => {
    process.env.GITHUB_REF = 'refs/heads/staging';
    const payload = makePayload();
    const mockFetch = vi.fn().mockResolvedValue(makeFetchResponse(true, 204));
    global.fetch = mockFetch as unknown as typeof global.fetch;

    await triggerFrontendRebuild(payload as unknown as Payload, 'albums', 'update');

    const [, opts] = mockFetch.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(opts.body as string) as { ref: string };
    expect(body.ref).toBe('refs/heads/staging');
  });

  // --- Recording: success outcome ---
  it('records success outcome with correct fields', async () => {
    const payload = makePayload();
    global.fetch = vi.fn().mockResolvedValue(makeFetchResponse(true, 204)) as unknown as typeof global.fetch;

    await triggerFrontendRebuild(payload as unknown as Payload, 'albums', 'update');

    expect(payload.updateGlobal).toHaveBeenCalledOnce();
    const call = (payload.updateGlobal as ReturnType<typeof vi.fn>).mock.calls[0][0] as {
      slug: string;
      data: Record<string, unknown>;
    };
    expect(call.slug).toBe('rebuild-status');
    expect(call.data).toMatchObject({
      outcome: 'success',
      httpStatus: 204,
      workflowFile: 'ci.yml',
      triggerCollection: 'albums',
      triggerOperation: 'update',
    });
    expect(typeof call.data.timestamp).toBe('string');
  });

  // --- Recording: failure (non-2xx) outcome ---
  it('records failure outcome with httpStatus and errorDetail on non-2xx response', async () => {
    const payload = makePayload();
    global.fetch = vi.fn().mockResolvedValue(makeFetchResponse(false, 404, 'nope')) as unknown as typeof global.fetch;
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    await triggerFrontendRebuild(payload as unknown as Payload, 'blog-posts', 'create');

    expect(payload.updateGlobal).toHaveBeenCalledOnce();
    const call = (payload.updateGlobal as ReturnType<typeof vi.fn>).mock.calls[0][0] as {
      slug: string;
      data: Record<string, unknown>;
    };
    expect(call.slug).toBe('rebuild-status');
    expect(call.data).toMatchObject({
      outcome: 'failure',
      httpStatus: 404,
      errorDetail: 'nope',
      workflowFile: 'ci.yml',
      triggerCollection: 'blog-posts',
      triggerOperation: 'create',
    });
    expect(typeof call.data.timestamp).toBe('string');
  });

  // --- Recording: failure (throw/network error) outcome ---
  it('records failure outcome with errorDetail on fetch throw, with no httpStatus', async () => {
    const payload = makePayload();
    const networkError = new Error('network failure');
    global.fetch = vi.fn().mockRejectedValue(networkError) as unknown as typeof global.fetch;
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    await triggerFrontendRebuild(payload as unknown as Payload, 'citadao-editions', 'update');

    expect(payload.updateGlobal).toHaveBeenCalledOnce();
    const call = (payload.updateGlobal as ReturnType<typeof vi.fn>).mock.calls[0][0] as {
      slug: string;
      data: Record<string, unknown>;
    };
    expect(call.slug).toBe('rebuild-status');
    expect(call.data.outcome).toBe('failure');
    expect(call.data.errorDetail).toContain('network failure');
    expect(call.data.httpStatus).toBeUndefined();
    expect(typeof call.data.timestamp).toBe('string');
  });

  // --- Recording: skipped outcome ---
  it('records skipped outcome when GitHub credentials are missing', async () => {
    delete process.env.GITHUB_TOKEN;
    delete process.env.GITHUB_OWNER;
    delete process.env.GITHUB_REPO;
    const payload = makePayload();
    global.fetch = vi.fn() as unknown as typeof global.fetch;
    vi.spyOn(console, 'log').mockImplementation(() => undefined);

    await triggerFrontendRebuild(payload as unknown as Payload, 'festivals', 'update');

    expect(payload.updateGlobal).toHaveBeenCalledOnce();
    const call = (payload.updateGlobal as ReturnType<typeof vi.fn>).mock.calls[0][0] as {
      slug: string;
      data: Record<string, unknown>;
    };
    expect(call.slug).toBe('rebuild-status');
    expect(call.data).toMatchObject({
      outcome: 'skipped',
      workflowFile: 'ci.yml',
      triggerCollection: 'festivals',
      triggerOperation: 'update',
    });
    expect(call.data.httpStatus).toBeUndefined();
    expect(call.data.errorDetail).toBeUndefined();
    expect(typeof call.data.timestamp).toBe('string');
  });

  // --- Safety: persistence failure must NOT throw out of triggerFrontendRebuild ---
  it('does not throw when updateGlobal rejects', async () => {
    const payload = {
      updateGlobal: vi.fn().mockRejectedValue(new Error('DB down')),
    } as unknown as Payload;
    global.fetch = vi.fn().mockResolvedValue(makeFetchResponse(true, 204)) as unknown as typeof global.fetch;
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    await expect(
      triggerFrontendRebuild(payload, 'albums', 'update')
    ).resolves.toBeUndefined();
  });
});
