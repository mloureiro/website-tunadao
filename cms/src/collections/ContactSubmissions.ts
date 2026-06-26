import { CollectionConfig } from 'payload';
import { verifyTurnstileToken } from '../utils/verifyTurnstile';

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
    // Honeypot field for spam protection
    {
      name: 'honeypot',
      type: 'text',
      admin: {
        hidden: true,
      },
      hooks: {
        beforeValidate: [
          ({ value }) => {
            // If honeypot has a value, it's likely spam
            if (value) {
              throw new Error('Spam detected');
            }
            return value;
          },
        ],
      },
    },
  ],
  hooks: {
    // Collection-level beforeValidate: runs before field-level hooks.
    // This hook handles anti-abuse checks in the following order:
    //   1. Turnstile token verification (Iter 2, this hook)
    //   2. Length caps (Iter 3 — add here)
    //   3. Honeypot silent-accept (Iter 4 — add here, replace field-level throw)
    // Structuring all gates here keeps the security surface consolidated.
    beforeValidate: [
      async ({ data, operation }) => {
        // Only validate on create (public form submissions); skip admin updates.
        if (operation !== 'create') return data;

        // --- Turnstile verification (finding [ck0]) ---
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

        // Strip the transient field so Payload doesn't see an unknown key.
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
        // Send email notification on new submission
        if (operation === 'create' && req.payload.email) {
          try {
            await req.payload.sendEmail({
              to: process.env.CONTACT_EMAIL || 'tunadao@gmail.com',
              subject: `Novo contacto: ${doc.subject}`,
              html: `
                <h2>Novo contacto recebido</h2>
                <p><strong>Nome:</strong> ${doc.name}</p>
                <p><strong>Email:</strong> ${doc.email}</p>
                <p><strong>Assunto:</strong> ${doc.subject}</p>
                <p><strong>Mensagem:</strong></p>
                <p>${doc.message.replace(/\n/g, '<br>')}</p>
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
