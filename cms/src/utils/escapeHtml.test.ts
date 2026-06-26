import { describe, it, expect } from 'vitest';
import { escapeHtml } from './escapeHtml';

describe('escapeHtml', () => {
  // --- Individual character mappings ---

  it('escapes & to &amp;', () => {
    expect(escapeHtml('a & b')).toBe('a &amp; b');
  });

  it('escapes < to &lt;', () => {
    expect(escapeHtml('<div>')).toBe('&lt;div&gt;');
  });

  it('escapes > to &gt;', () => {
    expect(escapeHtml('a > b')).toBe('a &gt; b');
  });

  it('escapes " to &quot;', () => {
    expect(escapeHtml('say "hello"')).toBe('say &quot;hello&quot;');
  });

  it("escapes ' to &#39;", () => {
    expect(escapeHtml("it's fine")).toBe('it&#39;s fine');
  });

  // --- Escape order: & must be first ---

  it('does not double-escape: & in the original becomes &amp; only once', () => {
    // If & were escaped AFTER < and >, the introduced &lt;/&gt; would get their & re-escaped.
    expect(escapeHtml('<b>&')).toBe('&lt;b&gt;&amp;');
  });

  it('handles a string with all five special chars', () => {
    expect(escapeHtml('& < > " \'')).toBe('&amp; &lt; &gt; &quot; &#39;');
  });

  // --- Script tag injection ---

  it('neutralises a <script> tag', () => {
    const result = escapeHtml('<script>alert("xss")</script>');
    expect(result).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
    expect(result).not.toContain('<script>');
    expect(result).not.toContain('</script>');
  });

  it('neutralises an anchor with javascript: href', () => {
    const result = escapeHtml('<a href="javascript:evil()">click</a>');
    expect(result).not.toContain('<a ');
    expect(result).toContain('&lt;a ');
  });

  // --- Edge cases ---

  it('returns an empty string unchanged', () => {
    expect(escapeHtml('')).toBe('');
  });

  it('leaves plain text (no special chars) unchanged', () => {
    expect(escapeHtml('Hello world 123')).toBe('Hello world 123');
  });

  it('does not convert newlines (caller is responsible for \\n→<br>)', () => {
    expect(escapeHtml('line1\nline2')).toBe('line1\nline2');
  });

  // --- Idempotency note: escaping twice double-escapes ---

  it('double-escaping produces double-encoded output (escape only once)', () => {
    const once = escapeHtml('<b>');
    const twice = escapeHtml(once);
    // First pass: <b> → &lt;b&gt;
    // Second pass: &lt;b&gt; → &amp;lt;b&amp;gt; (the & gets escaped again)
    expect(twice).toBe('&amp;lt;b&amp;gt;');
    expect(twice).not.toBe(once);
  });
});
