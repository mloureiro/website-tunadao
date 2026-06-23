import { CollectionConfig } from 'payload';
import { triggerFrontendRebuild } from '../utils/triggerRebuild';

export const Videos: CollectionConfig = {
  slug: 'videos',
  hooks: {
    afterChange: [
      async ({ doc, operation, req }) => {
        if (doc.status === 'published') {
          await triggerFrontendRebuild(req.payload, 'videos', operation);
        }
        return doc;
      },
    ],
  },
  admin: {
    useAsTitle: 'title',
    group: 'Content',
    description: 'Vídeos do YouTube',
    defaultColumns: ['title', 'category', 'publishedAt', 'status'],
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
    },
    {
      name: 'youtubeUrl',
      type: 'text',
      required: true,
      admin: {
        description: 'URL completo do vídeo (ex: https://youtube.com/watch?v=...)',
      },
      validate: (value: string | null | undefined) => {
        if (!value) return 'URL é obrigatório';
        if (!value.includes('youtube.com') && !value.includes('youtu.be')) {
          return 'Deve ser um URL do YouTube';
        }
        return true;
      },
    },
    {
      name: 'youtubeId',
      type: 'text',
      admin: {
        hidden: true,
      },
      hooks: {
        beforeChange: [
          ({ siblingData }) => {
            const url = siblingData.youtubeUrl;
            if (!url) return '';
            // Extract video ID from various YouTube URL formats
            const match = url.match(
              /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/
            );
            return match ? match[1] : '';
          },
        ],
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Descrição do vídeo',
      },
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: [
        { label: 'Atuação', value: 'atuacao' },
        { label: 'Festival', value: 'festival' },
        { label: 'Serenata', value: 'serenata' },
        { label: 'Citadão', value: 'citadao' },
        { label: 'Outro', value: 'outro' },
      ],
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Mostrar em destaque na página de vídeos',
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      required: true,
      admin: {
        description: 'Data de publicação/evento',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Rascunho', value: 'draft' },
        { label: 'Publicado', value: 'published' },
      ],
    },
  ],
};
