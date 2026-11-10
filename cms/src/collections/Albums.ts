import { CollectionConfig } from 'payload';
import { triggerFrontendRebuild } from '../utils/triggerRebuild';

export const Albums: CollectionConfig = {
  slug: 'albums',
  labels: {
    singular: 'Álbum',
    plural: 'Álbuns',
  },
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
    group: 'Conteúdos',
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
      label: 'Título',
      type: 'text',
      required: true,
      admin: {
        description: 'Nome do álbum',
      },
    },
    {
      name: 'year',
      label: 'Ano',
      type: 'number',
      required: true,
      admin: {
        description: 'Ano de lançamento',
      },
    },
    {
      name: 'coverImage',
      label: 'Capa',
      type: 'relationship',
      relationTo: 'media',
      required: true,
      admin: {
        description: 'Capa do álbum',
      },
    },
    {
      name: 'description',
      label: 'Descrição',
      type: 'richText',
      admin: {
        description: 'Descrição/história do álbum',
      },
    },
    {
      name: 'spotifyUrl',
      label: 'URL do Spotify',
      type: 'text',
      admin: {
        description: 'Link para o álbum no Spotify',
      },
    },
    {
      name: 'tracks',
      label: 'Faixas',
      type: 'array',
      admin: {
        description: 'Lista de faixas',
      },
      fields: [
        {
          name: 'number',
          label: 'N.º',
          type: 'number',
          required: true,
          admin: {
            width: '20%',
          },
        },
        {
          name: 'title',
          label: 'Título',
          type: 'text',
          required: true,
          admin: {
            width: '60%',
          },
        },
        {
          name: 'duration',
          label: 'Duração',
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
      label: 'Tipo de gravação',
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
