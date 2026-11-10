import { CollectionConfig } from 'payload';
import { triggerFrontendRebuild } from '../utils/triggerRebuild';

export const Festivals: CollectionConfig = {
  slug: 'festivals',
  labels: {
    singular: 'Festival',
    plural: 'Festivais',
  },
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
    group: 'Conteúdos',
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
      label: 'Nome',
      type: 'text',
      required: true,
      admin: {
        description: 'Nome do festival',
      },
    },
    {
      name: 'date',
      label: 'Data',
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
      label: 'Localidade',
      type: 'text',
      admin: {
        description: 'Localidade',
      },
    },
    {
      name: 'organizingTuna',
      label: 'Tuna organizadora',
      type: 'relationship',
      relationTo: 'tunas',
      admin: {
        description: 'Tuna organizadora do festival',
      },
    },
    {
      name: 'poster',
      label: 'Cartaz',
      type: 'relationship',
      relationTo: 'media',
      admin: {
        description: 'Cartaz do festival',
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
