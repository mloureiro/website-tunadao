import { describe, it, expect, vi, beforeEach } from 'vitest';
import { verifyTurnstileToken } from './verifyTurnstile';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeFetch(response: { success?: boolean }): typeof fetch {
  return vi.fn().mockResolvedValue({
    json: () => Promise.resolve(response),
  }) as unknown as typeof fetch;
}

function rejectingFetch(error: Error = new Error('network error')): typeof fetch {
  return vi.fn().mockRejectedValue(error) as unknown as typeof fetch;
}

// ---------------------------------------------------------------------------
// verifyTurnstileToken — unit tests
// ---------------------------------------------------------------------------

describe('verifyTurnstileToken', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns true when Cloudflare responds { success: true }', async () => {
    const mockFetch = makeFetch({ success: true });
    const result = await verifyTurnstileToken('valid-token', mockFetch);
    expect(result).toBe(true);
  });

  it('returns false when Cloudflare responds { success: false }', async () => {
    const mockFetch = makeFetch({ success: false });
    const result = await verifyTurnstileToken('bad-token', mockFetch);
    expect(result).toBe(false);
  });

  it('returns false when fetch rejects (network error — fail closed)', async () => {
    const mockFetch = rejectingFetch();
    const result = await verifyTurnstileToken('some-token', mockFetch);
    expect(result).toBe(false);
  });

  it('returns false when token is empty string (short-circuit, no fetch call)', async () => {
    const mockFetch = vi.fn() as unknown as typeof fetch;
    const result = await verifyTurnstileToken('', mockFetch);
    expect(result).toBe(false);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('sends the TURNSTILE_SECRET_KEY from process.env in the request body', async () => {
    vi.stubEnv('TURNSTILE_SECRET_KEY', 'test-secret-key');
    const mockFetch = makeFetch({ success: true });

    await verifyTurnstileToken('some-token', mockFetch);

    const calls = (mockFetch as ReturnType<typeof vi.fn>).mock.calls as [string, RequestInit][];
    expect(calls).toHaveLength(1);
    const bodyString = calls[0][1].body?.toString() ?? '';
    expect(bodyString).toContain('secret=test-secret-key');
    expect(bodyString).toContain('response=some-token');
  });

  it('uses an empty secret when TURNSTILE_SECRET_KEY is not set', async () => {
    delete process.env.TURNSTILE_SECRET_KEY;
    const mockFetch = makeFetch({ success: true });

    await verifyTurnstileToken('some-token', mockFetch);

    const calls = (mockFetch as ReturnType<typeof vi.fn>).mock.calls as [string, RequestInit][];
    expect(calls).toHaveLength(1);
    const bodyString = calls[0][1].body?.toString() ?? '';
    expect(bodyString).toContain('secret=');
  });
});
