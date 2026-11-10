import { GlobalConfig } from 'payload';

// NOTE: intentionally NO hooks.afterChange — writing status must never trigger a rebuild.
export const RebuildStatus: GlobalConfig = {
  slug: 'rebuild-status',
  label: 'Estado da atualização do site',
  admin: {
    group: 'Definições',
    description: 'Estado do último pedido de atualização do site',
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
      admin: { description: 'Resultado do último pedido de atualização' },
    },
    {
      name: 'timestamp',
      type: 'date',
      label: 'Data/Hora',
      admin: {
        description: 'Quando a atualização foi pedida',
        date: { pickerAppearance: 'dayAndTime' },
      },
    },
    {
      name: 'workflowFile',
      type: 'text',
      label: 'Fluxo de trabalho (GitHub Actions)',
      admin: { description: 'Fluxo de trabalho GitHub Actions utilizado no pedido' },
    },
    {
      name: 'triggerCollection',
      type: 'text',
      label: 'Origem',
      admin: { description: 'Coleção ou global que pediu a atualização' },
    },
    {
      name: 'triggerOperation',
      type: 'text',
      label: 'Operação',
      admin: { description: 'Operação (create/update) que pediu a atualização' },
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
