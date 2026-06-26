/**
 * HTML-escape a string for safe interpolation into an HTML document.
 *
 * Escape order matters: `&` MUST be replaced first so that subsequent
 * replacements (which introduce `&`) are not double-escaped.
 *
 * Characters escaped:
 *   & → &amp;
 *   < → &lt;
 *   > → &gt;
 *   " → &quot;
 *   ' → &#39;
 */
export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;') // MUST be first
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
