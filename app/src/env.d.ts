/// <reference types="astro/client" />

// Allow importing .astro files in TypeScript
// This handles the case where tsc runs separately from astro check
declare module '*.astro' {
  import type { AstroComponentFactory } from 'astro/runtime/server/index.js';
  const Component: AstroComponentFactory;
  export default Component;
}

// Cloudflare Turnstile global — injected by the api.js loader script.
// Declared here so TypeScript recognises `window.turnstile.reset()` in the contact form script.
interface Window {
  turnstile?: {
    render: (container: string | HTMLElement, params: Record<string, unknown>) => string;
    reset: (widgetId?: string) => void;
    getResponse: (widgetId?: string) => string | undefined;
    remove: (widgetId?: string) => void;
  };
}
