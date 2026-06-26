import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---------------------------------------------------------------------------
// Module mocks — must be declared before any imports that use them.
// ---------------------------------------------------------------------------

vi.mock('../utils/triggerRebuild', () => ({
  triggerFrontendRebuild: vi.fn().mockResolvedValue(undefined),
}));

// Mock verifyTurnstileToken so the hook tests control pass/fail without
// hitting the network. The real implementation is tested in verifyTurnstile.test.ts.
vi.mock('../utils/verifyTurnstile', () => ({
  verifyTurnstileToken: vi.fn(),
}));

import { ContactSubmissions } from './ContactSubmissions';
import { verifyTurnstileToken } from '../utils/verifyTurnstile';

// ---------------------------------------------------------------------------
// Pull hooks from the collection definition
// ---------------------------------------------------------------------------

const beforeValidateHooks = ContactSubmissions.hooks?.beforeValidate;
if (!beforeValidateHooks || beforeValidateHooks.length === 0) {
  throw new Error('ContactSubmissions.hooks.beforeValidate must have at least one hook');
}

// The first collection-level hook handles Turnstile verification.
const turnstileHook = beforeValidateHooks[0];

type HookData = Record<string, unknown>;
type HookArgs = Parameters<typeof turnstileHook>[0];

function makeArgs(data: HookData, operation: 'create' | 'update' = 'create'): HookArgs {
  return { data, operation, req: {} } as HookArgs;
}

// ---------------------------------------------------------------------------
// ContactSubmissions beforeValidate — Turnstile hook tests
// ---------------------------------------------------------------------------

describe('ContactSubmissions beforeValidate — Turnstile verification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('throws a generic error when turnstileToken is missing from data', async () => {
    vi.mocked(verifyTurnstileToken).mockResolvedValue(false);
    const data: HookData = { name: 'Test', email: 'test@example.com', message: 'Hello' };

    await expect(turnstileHook(makeArgs(data))).rejects.toThrow('Validação falhou. Tenta novamente.');
  });

  it('throws a generic error when turnstileToken is an empty string', async () => {
    vi.mocked(verifyTurnstileToken).mockResolvedValue(false);
    const data: HookData = { turnstileToken: '' };

    await expect(turnstileHook(makeArgs(data))).rejects.toThrow('Validação falhou. Tenta novamente.');
  });

  it('throws a generic error when token verification fails (invalid token)', async () => {
    vi.mocked(verifyTurnstileToken).mockResolvedValue(false);
    const data: HookData = { turnstileToken: 'invalid-token' };

    await expect(turnstileHook(makeArgs(data))).rejects.toThrow('Validação falhou. Tenta novamente.');
  });

  it('throws a generic error when network fails (verifyTurnstileToken returns false)', async () => {
    vi.mocked(verifyTurnstileToken).mockResolvedValue(false);
    const data: HookData = { turnstileToken: 'some-token' };

    await expect(turnstileHook(makeArgs(data))).rejects.toThrow('Validação falhou. Tenta novamente.');
  });

  it('strips turnstileToken from data when verification succeeds', async () => {
    vi.mocked(verifyTurnstileToken).mockResolvedValue(true);
    const data: HookData = {
      name: 'Test',
      email: 'test@example.com',
      message: 'Hello',
      turnstileToken: 'valid-token',
    };

    const result = await turnstileHook(makeArgs(data));

    expect(result).not.toHaveProperty('turnstileToken');
  });

  it('returns the original data fields (minus turnstileToken) on success', async () => {
    vi.mocked(verifyTurnstileToken).mockResolvedValue(true);
    const data: HookData = {
      name: 'Test User',
      email: 'test@example.com',
      message: 'Hello there',
      turnstileToken: 'valid-token',
    };

    const result = await turnstileHook(makeArgs(data));

    expect(result).toMatchObject({ name: 'Test User', email: 'test@example.com', message: 'Hello there' });
  });

  it('does NOT run Turnstile verification on update operations', async () => {
    vi.mocked(verifyTurnstileToken).mockResolvedValue(false);
    const data: HookData = { status: 'read' }; // admin update, no token needed

    // Should not throw
    const result = await turnstileHook(makeArgs(data, 'update'));
    expect(result).toEqual(data);
    expect(verifyTurnstileToken).not.toHaveBeenCalled();
  });

  it('generic error message does NOT contain "turnstile", "captcha", or Cloudflare error codes', async () => {
    vi.mocked(verifyTurnstileToken).mockResolvedValue(false);
    const data: HookData = { turnstileToken: 'bad-token' };

    try {
      await turnstileHook(makeArgs(data));
      expect.fail('Expected hook to throw');
    } catch (err) {
      const message = err instanceof Error ? err.message.toLowerCase() : '';
      expect(message).not.toContain('turnstile');
      expect(message).not.toContain('captcha');
      expect(message).not.toContain('cloudflare');
      expect(message).not.toContain('error-code');
      expect(message).not.toContain('missing-input');
      expect(message).not.toContain('invalid-input');
    }
  });
});
