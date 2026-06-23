import { CollectionConfig } from 'payload';
import { triggerFrontendRebuild } from '../utils/triggerRebuild';

export const Albums: CollectionConfig = {
  slug: 'albums',
  hooks: {
    afterChange: [
      async ({ doc, operation, req }) => {
        if (doc.status === 'published') {
          await triggerFrontendRebuild(req.payload, 'albums', operation);
        }
        return doc;
      },
    ],
  },
  admin: {
    useAsTitle: 'title',
    group: 'Content',
    description: 'Álbuns de música',
    defaultColumns: ['title', 'year', 'status'],
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
      required: true,
      admin: {
        description: 'Nome do álbum',
      },
    },
    {
      name: 'year',
      type: 'number',
      required: true,
      admin: {
        description: 'Ano de lançamento',
      },
    },
    {
      name: 'coverImage',
      type: 'relationship',
      relationTo: 'media',
      required: true,
      admin: {
        description: 'Capa do álbum',
      },
    },
    {
      name: 'description',
      type: 'richText',
      admin: {
        description: 'Descrição/história do álbum',
      },
    },
    {
      name: 'spotifyUrl',
      type: 'text',
      admin: {
        description: 'Link para o álbum no Spotify',
      },
    },
    {
      name: 'tracks',
      type: 'array',
      admin: {
        description: 'Lista de faixas',
      },
      fields: [
        {
          name: 'number',
          type: 'number',
          required: true,
          admin: {
            width: '20%',
          },
        },
        {
          name: 'title',
          type: 'text',
          required: true,
          admin: {
            width: '60%',
          },
        },
        {
          name: 'duration',
          type: 'text',
          admin: {
            description: 'Duração (ex: 3:45)',
            width: '20%',
          },
        },
      ],
    },
    {
      name: 'recordingType',
      type: 'select',
      options: [
        { label: 'Ao Vivo', value: 'live' },
        { label: 'Estúdio', value: 'studio' },
      ],
      admin: {
        description: 'Tipo de gravação',
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
