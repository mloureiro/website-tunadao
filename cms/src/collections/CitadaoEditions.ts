import { CollectionConfig } from 'payload';
import { triggerFrontendRebuild } from '../utils/triggerRebuild';

export const CitadaoEditions: CollectionConfig = {
  slug: 'citadao-editions',
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
    group: 'Content',
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
      type: 'relationship',
      relationTo: 'media',
      admin: {
        description: 'Cartaz do evento',
      },
    },
    {
      name: 'schedule',
      type: 'array',
      admin: {
        description: 'Programação por dia/local',
      },
      fields: [
        {
          name: 'date',
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
          type: 'relationship',
          relationTo: 'venues',
          required: true,
        },
      ],
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Descrição pública do evento',
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      admin: {
        description: 'Notas internas (ex: 10º Aniversário)',
      },
    },
    {
      name: 'status',
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
