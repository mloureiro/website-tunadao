import { GlobalConfig } from 'payload';

// NOTE: intentionally NO hooks.afterChange — writing status must never trigger a rebuild.
export const RebuildStatus: GlobalConfig = {
  slug: 'rebuild-status',
  admin: {
    group: 'Settings',
    description: 'Estado do último despoletar de rebuild do site',
  },
  access: {
    // Deliberate deviation from the public-read convention:
    // the static site must NOT read this global; admin-only.
    read: ({ req: { user } }) => Boolean(user),
    // No `update` entry — written via the local API (overrideAccess), not edited by hand.
  },
  fields: [
    {
      name: 'outcome',
      type: 'select',
      label: 'Resultado',
      options: [
        { label: 'Sucesso', value: 'success' },
        { label: 'Falha', value: 'failure' },
        { label: 'Ignorado', value: 'skipped' },
      ],
      admin: { description: 'Resultado do último despoletar de rebuild' },
    },
    {
      name: 'timestamp',
      type: 'date',
      label: 'Data/Hora',
      admin: {
        description: 'Quando o rebuild foi tentado',
        date: { pickerAppearance: 'dayAndTime' },
      },
    },
    {
      name: 'workflowFile',
      type: 'text',
      label: 'Workflow',
      admin: { description: 'Ficheiro de workflow GitHub Actions despoletado' },
    },
    {
      name: 'triggerCollection',
      type: 'text',
      label: 'Origem',
      admin: { description: 'Coleção ou global que despoletou o rebuild' },
    },
    {
      name: 'triggerOperation',
      type: 'text',
      label: 'Operação',
      admin: { description: 'Operação (create/update) que despoletou o rebuild' },
    },
    {
      name: 'httpStatus',
      type: 'number',
      label: 'Código HTTP',
      admin: { description: 'Código de resposta HTTP (quando houve tentativa)' },
    },
    {
      name: 'errorDetail',
      type: 'textarea',
      label: 'Detalhe do erro',
      admin: { description: 'Corpo da resposta ou mensagem de erro (em caso de falha)' },
    },
  ],
};
