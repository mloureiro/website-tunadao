import { CollectionConfig } from 'payload';
import { triggerFrontendRebuild } from '../utils/triggerRebuild';

export const Festivals: CollectionConfig = {
  slug: 'festivals',
  hooks: {
    afterChange: [
      async ({ doc, operation, req }) => {
        if (doc.status === 'published') {
          await triggerFrontendRebuild(req.payload, 'festivals', operation);
        }
        return doc;
      },
    ],
  },
  admin: {
    useAsTitle: 'name',
    group: 'Content',
    description: 'Festivais de tunas onde participamos',
    defaultColumns: ['name', 'date', 'location', 'status'],
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'Nome do festival',
      },
    },
    {
      name: 'date',
      type: 'date',
      required: true,
      admin: {
        description: 'Data do festival',
        date: {
          pickerAppearance: 'dayOnly',
          displayFormat: 'yyyy-MM-dd',
        },
      },
    },
    {
      name: 'location',
      type: 'text',
      admin: {
        description: 'Localidade',
      },
    },
    {
      name: 'organizingTuna',
      type: 'relationship',
      relationTo: 'tunas',
      admin: {
        description: 'Tuna organizadora do festival',
      },
    },
    {
      name: 'poster',
      type: 'relationship',
      relationTo: 'media',
      admin: {
        description: 'Cartaz do festival',
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
