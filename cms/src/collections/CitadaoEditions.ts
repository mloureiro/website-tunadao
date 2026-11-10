import { CollectionConfig } from 'payload';
import { triggerFrontendRebuild } from '../utils/triggerRebuild';

export const CitadaoEditions: CollectionConfig = {
  slug: 'citadao-editions',
  labels: {
    singular: 'Edição do Citadão',
    plural: 'Edições do Citadão',
  },
  hooks: {
    afterChange: [
      async ({ doc, operation, req }) => {
        if (doc.status === 'published') {
          await triggerFrontendRebuild(req.payload, 'citadao-editions', operation);
        }
        return doc;
      },
    ],
  },
  admin: {
    useAsTitle: 'title',
    group: 'Conteúdos',
    description: 'Edições do Festival Citadão',
    defaultColumns: ['editionNumber', 'startDate', 'endDate', 'status'],
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'title',
      label: 'Título',
      type: 'text',
      admin: {
        hidden: true,
      },
      hooks: {
        beforeChange: [
          ({ siblingData }) => {
            const year = siblingData.startDate
              ? new Date(siblingData.startDate).getFullYear()
              : '?';
            return `${siblingData.editionNumber}º Citadão (${year})`;
          },
        ],
      },
    },
    {
      name: 'editionNumber',
      label: 'Número da edição',
      type: 'number',
      required: true,
      unique: true,
      admin: {
        description: 'Número da edição',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'startDate',
          label: 'Data de início',
          type: 'date',
          required: true,
          admin: {
            description: 'Data de início',
            width: '50%',
            date: {
              pickerAppearance: 'dayOnly',
              displayFormat: 'd MMM yyyy',
            },
          },
        },
        {
          name: 'endDate',
          label: 'Data de fim',
          type: 'date',
          required: true,
          admin: {
            description: 'Data de fim',
            width: '50%',
            date: {
              pickerAppearance: 'dayOnly',
              displayFormat: 'd MMM yyyy',
            },
          },
        },
      ],
    },
    {
      name: 'poster',
      label: 'Cartaz',
      type: 'relationship',
      relationTo: 'media',
      admin: {
        description: 'Cartaz do evento',
      },
    },
    {
      name: 'schedule',
      label: 'Programação',
      type: 'array',
      admin: {
        description: 'Programação por dia/local',
      },
      fields: [
        {
          name: 'date',
          label: 'Data',
          type: 'date',
          required: true,
          admin: {
            date: {
              pickerAppearance: 'dayOnly',
              displayFormat: 'd MMM yyyy',
            },
          },
        },
        {
          name: 'venue',
          label: 'Local',
          type: 'relationship',
          relationTo: 'venues',
          required: true,
        },
      ],
    },
    {
      name: 'description',
      label: 'Descrição',
      type: 'textarea',
      admin: {
        description: 'Descrição pública do evento',
      },
    },
    {
      name: 'notes',
      label: 'Notas internas',
      type: 'textarea',
      admin: {
        description: 'Notas internas (ex: 10º Aniversário)',
      },
    },
    {
      name: 'status',
      label: 'Estado',
      type: 'select',
      required: true,
      defaultValue: 'published',
      options: [
        { label: 'Rascunho', value: 'draft' },
        { label: 'Publicado', value: 'published' },
      ],
    },
  ],
};
