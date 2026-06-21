import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
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
    const mockFetch = vi.fn().mockResolvedValue(makeFetchResponse(true, 204));
    global.fetch = mockFetch as unknown as typeof global.fetch;

    await triggerFrontendRebuild('albums', 'update');

    expect(mockFetch).toHaveBeenCalledOnce();
    const [url, opts] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toMatch(/\/actions\/workflows\/ci\.yml\/dispatches$/);
    const body = JSON.parse(opts.body as string) as unknown;
    expect(body).toEqual({ ref: 'main', inputs: { deploy_target: 'app-only' } });
  });

  // --- Case 2: GITHUB_WORKFLOW_FILE override ---
  it('uses GITHUB_WORKFLOW_FILE env var when set', async () => {
    process.env.GITHUB_WORKFLOW_FILE = 'other.yml';
    const mockFetch = vi.fn().mockResolvedValue(makeFetchResponse(true, 204));
    global.fetch = mockFetch as unknown as typeof global.fetch;

    await triggerFrontendRebuild('albums', 'update');

    const [url] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toMatch(/\/actions\/workflows\/other\.yml\/dispatches$/);
  });

  // --- Case 3: Non-2xx response is logged ---
  it('logs an error with status and workflow file on non-2xx response', async () => {
    global.fetch = vi.fn().mockResolvedValue(
      makeFetchResponse(false, 404, 'nope')
    ) as unknown as typeof global.fetch;
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    await triggerFrontendRebuild('albums', 'update');

    expect(errorSpy).toHaveBeenCalledOnce();
    const msg = errorSpy.mock.calls[0]?.[0] as string;
    expect(msg).toContain('404');
    expect(msg).toContain('ci.yml');
  });

  // --- Case 4: Immediate dispatch — no setTimeout ---
  it('does not call setTimeout (dispatches immediately)', async () => {
    global.fetch = vi.fn().mockResolvedValue(
      makeFetchResponse(true, 204)
    ) as unknown as typeof global.fetch;
    const setTimeoutSpy = vi.spyOn(global, 'setTimeout');

    await triggerFrontendRebuild('albums', 'update');

    expect(setTimeoutSpy).not.toHaveBeenCalled();
  });

  // --- Case 5: Missing credentials — fetch not called ---
  it('skips fetch and logs when GitHub credentials are missing', async () => {
    delete process.env.GITHUB_TOKEN;
    delete process.env.GITHUB_OWNER;
    delete process.env.GITHUB_REPO;
    const mockFetch = vi.fn();
    global.fetch = mockFetch as unknown as typeof global.fetch;
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);

    await triggerFrontendRebuild('albums', 'update');

    expect(mockFetch).not.toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalledOnce();
    const msg = logSpy.mock.calls[0]?.[0] as string;
    expect(msg).toContain('Skipping');
  });

  // --- Bonus: GITHUB_REF is respected ---
  it('uses GITHUB_REF env var for the ref field', async () => {
    process.env.GITHUB_REF = 'refs/heads/staging';
    const mockFetch = vi.fn().mockResolvedValue(makeFetchResponse(true, 204));
    global.fetch = mockFetch as unknown as typeof global.fetch;

    await triggerFrontendRebuild('albums', 'update');

    const [, opts] = mockFetch.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(opts.body as string) as { ref: string };
    expect(body.ref).toBe('refs/heads/staging');
  });
});
