import { CollectionConfig } from 'payload';
import { verifyTurnstileToken } from '../utils/verifyTurnstile';
import { escapeHtml } from '../utils/escapeHtml';

// Server-side length caps for contact form fields (finding [ck0]).
// These must match or exceed the client-side maxlength attributes.
const FIELD_MAX_LENGTHS = {
  name: 120,
  email: 254,
  subject: 200,
  message: 5000,
} as const;

export const ContactSubmissions: CollectionConfig = {
  slug: 'contact-submissions',
  admin: {
    useAsTitle: 'subject',
    group: 'Admin',
    description: 'Mensagens recebidas pelo formulário de contacto',
    defaultColumns: ['name', 'email', 'subject', 'status', 'createdAt'],
  },
  access: {
    // Only authenticated users can view submissions
    read: ({ req: { user } }) => Boolean(user),
    // Public can create (submit form)
    create: () => true,
    // Only admins can update/delete
    update: ({ req: { user } }) => user?.role === 'admin',
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'email',
      type: 'email',
      required: true,
    },
    {
      name: 'subject',
      type: 'text',
      required: true,
    },
    {
      name: 'message',
      type: 'textarea',
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'new',
      options: [
        { label: 'Nova', value: 'new' },
        { label: 'Lida', value: 'read' },
        { label: 'Respondida', value: 'replied' },
        { label: 'Arquivada', value: 'archived' },
      ],
      access: {
        create: () => false, // Can't set status on creation
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      admin: {
        description: 'Notas internas sobre este contacto',
      },
      access: {
        create: () => false,
      },
    },
    // Honeypot field for spam protection (finding [scdl]).
    // The field-level throw has been replaced by a collection-level silent-accept
    // strategy (Iter 4): see the collection beforeValidate hook below.
    {
      name: 'honeypot',
      type: 'text',
      admin: {
        hidden: true,
      },
    },
  ],
  hooks: {
    // Collection-level beforeValidate: consolidates all anti-abuse checks.
    // Hook order (finding [scdl]):
    //   1. Honeypot check FIRST (Iter 4) — if filled, mark req.context.isSpam and
    //      skip remaining checks so the bot never gets a Turnstile 4xx disclosure.
    //   2. Length caps (Iter 3)
    //   3. Turnstile token verification (Iter 2)
    //   4. Strip transient fields
    // Structuring all gates here keeps the security surface consolidated.
    beforeValidate: [
      async ({ data, operation, req }) => {
        // Only validate on create (public form submissions); skip admin updates.
        if (operation !== 'create') return data;

        // --- 1. Honeypot check (finding [scdl]) ---
        // The form sends the honeypot as `website` (the input name in ContactForm.astro).
        // Tolerate `honeypot` as well in case a future form revision renames it.
        // If either is non-empty the request is from a bot: mark it as spam and allow
        // the create to proceed so the client receives a 2xx success-shaped response.
        // Skip ALL remaining anti-abuse checks — a bot filling the honeypot won't have
        // a valid Turnstile token and we must not leak that via a Turnstile 4xx.
        const honeypotValue =
          (typeof data?.website === 'string' ? data.website : '') ||
          (typeof data?.honeypot === 'string' ? data.honeypot : '');

        if (honeypotValue) {
          // Signal spam to afterChange without throwing (throwing would yield a 4xx).
          // Mutate req.context in place so the object reference shared with afterChange
          // (and with tests) picks up the flag.
          if (!req.context) req.context = {};
          req.context.isSpam = true;
          // Strip both transient honeypot keys before Payload persists the document.
          if (data) {
            delete data.website;
            delete data.honeypot;
            delete data.turnstileToken;
          }
          return data;
        }

        // Strip the honeypot key even on clean submissions (it is not a stored field
        // under that name — the stored field is `honeypot` which Payload handles via
        // the field definition above; `website` is the client-side input name).
        if (data) {
          delete data.website;
        }

        // --- 2. Server-side length caps (finding [ck0] / [53o]) ---
        // Generic rejection — do not name the field or limit that was exceeded.
        for (const [field, max] of Object.entries(FIELD_MAX_LENGTHS)) {
          const rawValue = data?.[field];
          const value = typeof rawValue === 'string' ? rawValue : String(rawValue ?? '');
          if (value.length > max) {
            throw new Error('Validação falhou. Verifica os dados e tenta novamente.');
          }
        }

        // --- 3. Turnstile verification (finding [ck0]) ---
        // Read the transient token sent by the client widget. It is NOT a stored
        // collection field — we verify it here and delete it before Payload persists
        // the document, so no unknown-field error occurs.
        const token = typeof data?.turnstileToken === 'string' ? data.turnstileToken : '';

        const valid = await verifyTurnstileToken(token);
        if (!valid) {
          // Generic message — never disclose captcha mechanism, Cloudflare error-codes,
          // or which specific check failed.
          throw new Error('Validação falhou. Tenta novamente.');
        }

        // --- 4. Strip transient fields ---
        // Strip turnstileToken so Payload doesn't see an unknown key.
        // `data` is narrowed to non-undefined here because we returned early above
        // when `operation !== 'create'`, and a create payload always has `data`.
        if (data) {
          delete data.turnstileToken;
        }

        return data;
      },
    ],
    afterChange: [
      async ({ doc, operation, req }) => {
        // Do not notify for honeypot-flagged (spam) submissions (finding [scdl]).
        if (req.context?.isSpam) {
          return doc;
        }

        // Send email notification on new submission
        if (operation === 'create' && req.payload.email) {
          try {
            // HTML-escape all user-supplied fields before interpolating into the
            // email body (finding [53o]). Escape order: escape first, THEN convert
            // newlines to <br> so the `<br>` tags are not themselves escaped.
            const safeName = escapeHtml(String(doc.name ?? ''));
            const safeEmail = escapeHtml(String(doc.email ?? ''));
            const safeSubject = escapeHtml(String(doc.subject ?? ''));
            // Escape message first, then convert newlines to <br> so line breaks
            // in the original message are preserved in the rendered HTML.
            const safeMessage = escapeHtml(String(doc.message ?? '')).replace(/\n/g, '<br>');

            // Strip CR/LF from the email subject header to prevent header injection.
            // HTML-escaping the subject is not applicable (it's a header, not HTML),
            // but CR/LF characters would split the header line.
            const safeSubjectHeader = String(doc.subject ?? '').replace(/[\r\n]+/g, ' ');

            await req.payload.sendEmail({
              to: process.env.CONTACT_EMAIL || 'tunadao@gmail.com',
              subject: `Novo contacto: ${safeSubjectHeader}`,
              html: `
                <h2>Novo contacto recebido</h2>
                <p><strong>Nome:</strong> ${safeName}</p>
                <p><strong>Email:</strong> ${safeEmail}</p>
                <p><strong>Assunto:</strong> ${safeSubject}</p>
                <p><strong>Mensagem:</strong></p>
                <p>${safeMessage}</p>
              `,
            });
          } catch (error) {
            console.error('Failed to send contact notification email:', error);
          }
        }
        return doc;
      },
    ],
  },
  timestamps: true,
};
