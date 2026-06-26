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
// Field length caps — exported constant for testing
// ---------------------------------------------------------------------------

// Field length caps are defined as a module-level const in ContactSubmissions.ts.
// We duplicate the values here to assert the same boundaries (the authoritative
// source is the implementation; this tests the observable behaviour).
const CAPS = { name: 120, email: 254, subject: 200, message: 5000 } as const;

// ---------------------------------------------------------------------------
// Pull hooks from the collection definition
// ---------------------------------------------------------------------------

const beforeValidateHooks = ContactSubmissions.hooks?.beforeValidate;
if (!beforeValidateHooks || beforeValidateHooks.length === 0) {
  throw new Error('ContactSubmissions.hooks.beforeValidate must have at least one hook');
}

// The first collection-level hook handles Turnstile + length caps.
const beforeValidateHook = beforeValidateHooks[0];

const afterChangeHooks = ContactSubmissions.hooks?.afterChange;
if (!afterChangeHooks || afterChangeHooks.length === 0) {
  throw new Error('ContactSubmissions.hooks.afterChange must have at least one hook');
}

const afterChangeHook = afterChangeHooks[0];

// Keep the original name for backwards-compat within this file.
const turnstileHook = beforeValidateHook;

type HookData = Record<string, unknown>;
type HookArgs = Parameters<typeof beforeValidateHook>[0];

function makeArgs(data: HookData, operation: 'create' | 'update' = 'create'): HookArgs {
  return { data, operation, req: {} } as HookArgs;
}

type AfterChangeArgs = Parameters<typeof afterChangeHook>[0];

function makeAfterChangeArgs(
  doc: Record<string, unknown>,
  sendEmail: (args: { to: string; subject: string; html: string }) => Promise<void>,
): AfterChangeArgs {
  return {
    doc,
    operation: 'create',
    req: {
      payload: {
        email: { transport: 'resend' }, // truthy — triggers email path
        sendEmail,
      },
    },
  } as unknown as AfterChangeArgs;
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

// ---------------------------------------------------------------------------
// ContactSubmissions beforeValidate — server-side length caps
// ---------------------------------------------------------------------------

describe('ContactSubmissions beforeValidate — server-side length caps', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Turnstile passes so length-cap checks are reached.
    vi.mocked(verifyTurnstileToken).mockResolvedValue(true);
  });

  it('accepts a submission where all fields are exactly at the cap (boundary passes)', async () => {
    const data: HookData = {
      name: 'a'.repeat(CAPS.name),
      email: `${'a'.repeat(CAPS.email - '@x.co'.length)}@x.co`,
      subject: 'b'.repeat(CAPS.subject),
      message: 'c'.repeat(CAPS.message),
      turnstileToken: 'valid-token',
    };

    // Should not throw.
    await expect(beforeValidateHook(makeArgs(data))).resolves.not.toThrow();
  });

  it('rejects when name exceeds the cap', async () => {
    const data: HookData = {
      name: 'a'.repeat(CAPS.name + 1),
      email: 'test@example.com',
      subject: 'hello',
      message: 'world',
      turnstileToken: 'valid-token',
    };

    await expect(beforeValidateHook(makeArgs(data))).rejects.toThrow();
  });

  it('rejects when email exceeds the cap', async () => {
    const data: HookData = {
      name: 'Test',
      email: 'a'.repeat(CAPS.email + 1),
      subject: 'hello',
      message: 'world',
      turnstileToken: 'valid-token',
    };

    await expect(beforeValidateHook(makeArgs(data))).rejects.toThrow();
  });

  it('rejects when subject exceeds the cap', async () => {
    const data: HookData = {
      name: 'Test',
      email: 'test@example.com',
      subject: 's'.repeat(CAPS.subject + 1),
      message: 'world',
      turnstileToken: 'valid-token',
    };

    await expect(beforeValidateHook(makeArgs(data))).rejects.toThrow();
  });

  it('rejects when message exceeds the cap', async () => {
    const data: HookData = {
      name: 'Test',
      email: 'test@example.com',
      subject: 'hello',
      message: 'm'.repeat(CAPS.message + 1),
      turnstileToken: 'valid-token',
    };

    await expect(beforeValidateHook(makeArgs(data))).rejects.toThrow();
  });

  it('length-cap rejection message does not name the field or limit', async () => {
    const data: HookData = {
      name: 'Test',
      email: 'test@example.com',
      subject: 'hello',
      message: 'm'.repeat(CAPS.message + 1),
      turnstileToken: 'valid-token',
    };

    try {
      await beforeValidateHook(makeArgs(data));
      expect.fail('Expected hook to throw');
    } catch (err) {
      const message = err instanceof Error ? err.message.toLowerCase() : '';
      // Must not reveal which field or what the limit is.
      expect(message).not.toContain('message');
      expect(message).not.toContain('5000');
      expect(message).not.toContain('name');
      expect(message).not.toContain('email');
      expect(message).not.toContain('subject');
    }
  });

  it('does NOT enforce caps on update operations', async () => {
    // Admin can update; Turnstile + caps are skipped entirely.
    const data: HookData = {
      message: 'm'.repeat(CAPS.message + 1), // over the cap
    };

    await expect(beforeValidateHook(makeArgs(data, 'update'))).resolves.not.toThrow();
    expect(verifyTurnstileToken).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// ContactSubmissions afterChange — HTML-escaped email body
// ---------------------------------------------------------------------------

describe('ContactSubmissions afterChange — HTML-escaped email body', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('escapes <script> in name — does not appear raw in email HTML', async () => {
    const sendEmail = vi.fn().mockResolvedValue(undefined);
    const doc = {
      name: '<script>alert("xss")</script>',
      email: 'attacker@example.com',
      subject: 'hello',
      message: 'normal message',
    };

    await afterChangeHook(makeAfterChangeArgs(doc, sendEmail));

    expect(sendEmail).toHaveBeenCalledOnce();
    const { html } = (sendEmail.mock.calls[0] as [{ to: string; subject: string; html: string }])[0];
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('escapes an anchor tag with href in email field', async () => {
    const sendEmail = vi.fn().mockResolvedValue(undefined);
    const doc = {
      name: 'Alice',
      email: '<a href="evil.com">click</a>',
      subject: 'phish',
      message: 'please click',
    };

    await afterChangeHook(makeAfterChangeArgs(doc, sendEmail));

    const { html } = (sendEmail.mock.calls[0] as [{ to: string; subject: string; html: string }])[0];
    expect(html).not.toContain('<a href=');
    expect(html).toContain('&lt;a ');
  });

  it('preserves message newlines as <br> after escaping', async () => {
    const sendEmail = vi.fn().mockResolvedValue(undefined);
    const doc = {
      name: 'Bob',
      email: 'bob@example.com',
      subject: 'multi-line',
      // The < must be escaped; the \n must become <br>; order matters.
      message: 'a\n<b>',
    };

    await afterChangeHook(makeAfterChangeArgs(doc, sendEmail));

    const { html } = (sendEmail.mock.calls[0] as [{ to: string; subject: string; html: string }])[0];
    // Newline → <br>; < → &lt; (the <br> from conversion must NOT get re-escaped)
    expect(html).toContain('a<br>&lt;b&gt;');
    // The raw <b> tag must not appear unescaped in the HTML body
    expect(html).not.toContain('<b>');
    // Verify the <br> itself is not escaped (i.e. not &lt;br&gt;)
    expect(html).not.toContain('&lt;br&gt;');
  });

  it('escapes & in fields (& → &amp;, not double-escaped)', async () => {
    const sendEmail = vi.fn().mockResolvedValue(undefined);
    const doc = {
      name: 'Alice & Bob',
      email: 'alice@example.com',
      subject: 'Cats & Dogs',
      message: 'fish & chips',
    };

    await afterChangeHook(makeAfterChangeArgs(doc, sendEmail));

    const { html } = (sendEmail.mock.calls[0] as [{ to: string; subject: string; html: string }])[0];
    expect(html).toContain('Alice &amp; Bob');
    expect(html).toContain('Cats &amp; Dogs');
    expect(html).toContain('fish &amp; chips');
    // Must not be double-encoded
    expect(html).not.toContain('&amp;amp;');
  });

  it('strips CR/LF from email subject header to prevent header injection', async () => {
    const sendEmail = vi.fn().mockResolvedValue(undefined);
    const doc = {
      name: 'Eve',
      email: 'eve@example.com',
      subject: 'Hello\r\nBcc: victim@evil.com',
      message: 'inject',
    };

    await afterChangeHook(makeAfterChangeArgs(doc, sendEmail));

    const { subject } = (sendEmail.mock.calls[0] as [{ to: string; subject: string; html: string }])[0];
    expect(subject).not.toContain('\r');
    expect(subject).not.toContain('\n');
    expect(subject).toContain('Hello');
  });

  it('does NOT send email on update operations', async () => {
    const sendEmail = vi.fn().mockResolvedValue(undefined);
    const doc = { name: 'Alice', email: 'a@b.com', subject: 'hi', message: 'test' };
    const args = {
      doc,
      operation: 'update' as const,
      req: {
        payload: {
          email: { transport: 'resend' },
          sendEmail,
        },
      },
    } as unknown as AfterChangeArgs;

    await afterChangeHook(args);

    expect(sendEmail).not.toHaveBeenCalled();
  });

  it('does NOT send email when req.payload.email is falsy (no Resend configured)', async () => {
    const sendEmail = vi.fn().mockResolvedValue(undefined);
    const doc = { name: 'Alice', email: 'a@b.com', subject: 'hi', message: 'test' };
    const args = {
      doc,
      operation: 'create' as const,
      req: {
        payload: {
          email: undefined,
          sendEmail,
        },
      },
    } as unknown as AfterChangeArgs;

    await afterChangeHook(args);

    expect(sendEmail).not.toHaveBeenCalled();
  });
});
