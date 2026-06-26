/**
 * Cloudflare Turnstile server-side token verification.
 *
 * Extracted into its own module so the unit test can inject a mock `fetch`
 * without touching the network. The `ContactSubmissions` collection hook
 * calls `verifyTurnstileToken` and decides what to do with the result.
 */

const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const TIMEOUT_MS = 5000;

/**
 * Verify a Cloudflare Turnstile response token against the siteverify endpoint.
 *
 * @param token    The `cf-turnstile-response` value sent from the client widget.
 * @param fetchImpl  Injected `fetch` implementation (default: global `fetch`). Allows test mocking.
 * @returns `true` when Cloudflare responds `{ success: true }`, `false` on any
 *          failure (invalid token, network error, timeout). Fails closed — never throws.
 */
export async function verifyTurnstileToken(
  token: string,
  fetchImpl: typeof fetch = fetch,
): Promise<boolean> {
  if (!token) return false;

  const secret = process.env.TURNSTILE_SECRET_KEY ?? '';
  const body = new URLSearchParams({ secret, response: token });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetchImpl(SITEVERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
      signal: controller.signal,
    });

    const result = (await res.json()) as { success?: boolean };
    return result.success === true;
  } catch {
    // Network error, timeout, or JSON parse failure — fail closed.
    return false;
  } finally {
    clearTimeout(timer);
  }
}
