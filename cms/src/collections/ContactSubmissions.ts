import { APIError, CollectionConfig } from 'payload';
import { email } from 'payload/shared';
import { verifyTurnstileToken } from '../utils/verifyTurnstile';
import { escapeHtml } from '../utils/escapeHtml';

const FIELD_MAX_LENGTHS = {
  name: 120,
  email: 254,
  subject: 200,
  message: 5000,
} as const;

const REJECTION_MESSAGE = 'Validação falhou. Tenta novamente.';

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
      maxLength: FIELD_MAX_LENGTHS.name,
    },
    {
      name: 'email',
      type: 'email',
      required: true,
      validate: (value, args) =>
        typeof value === 'string' && value.length > FIELD_MAX_LENGTHS.email
          ? REJECTION_MESSAGE
          : email(value, args),
    },
    {
      name: 'subject',
      type: 'text',
      required: true,
      maxLength: FIELD_MAX_LENGTHS.subject,
    },
    {
      name: 'message',
      type: 'textarea',
      required: true,
      maxLength: FIELD_MAX_LENGTHS.message,
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
        { label: 'Spam', value: 'spam' },
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
    {
      name: 'honeypot',
      type: 'text',
      admin: {
        hidden: true,
      },
    },
  ],
  hooks: {
    beforeValidate: [
      async ({ data, operation, req }) => {
        if (operation !== 'create') return data;

        const honeypotValue =
          (typeof data?.website === 'string' ? data.website : '') ||
          (typeof data?.honeypot === 'string' ? data.honeypot : '');

        if (data) {
          delete data.website;
          delete data.honeypot;
        }

        for (const [field, max] of Object.entries(FIELD_MAX_LENGTHS)) {
          const rawValue = data?.[field];
          const value = typeof rawValue === 'string' ? rawValue : String(rawValue ?? '');
          if (value.length > max) {
            throw new APIError(REJECTION_MESSAGE, 400);
          }
        }

        const token = typeof data?.turnstileToken === 'string' ? data.turnstileToken : '';

        if (!(await verifyTurnstileToken(token))) {
          throw new APIError(REJECTION_MESSAGE, 400);
        }

        if (data) {
          delete data.turnstileToken;
        }

        if (honeypotValue) {
          if (!req.context) req.context = {};
          req.context.isSpam = true;
        }

        return data;
      },
    ],
    beforeChange: [
      ({ data, operation, req }) =>
        // Payload strips a client-sent status during field-level beforeValidate and does not re-check field access afterwards, so a value set here persists.
        operation === 'create' && req.context?.isSpam ? { ...data, status: 'spam' } : data,
    ],
    afterChange: [
      async ({ doc, operation, req }) => {
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
