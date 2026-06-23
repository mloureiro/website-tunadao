import { CollectionConfig } from 'payload';
import { triggerFrontendRebuild } from '../utils/triggerRebuild';

export const Pages: CollectionConfig = {
  slug: 'pages',
  hooks: {
    afterChange: [
      async ({ doc, operation, req }) => {
        if (doc.status === 'published') {
          await triggerFrontendRebuild(req.payload, 'pages', operation);
        }
        return doc;
      },
    ],
  },
  admin: {
    useAsTitle: 'title',
    group: 'Content',
    description: 'Páginas de conteúdo estático',
    defaultColumns: ['title', 'slug', 'status'],
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => user?.role === 'admin',
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
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'URL da página (ex: sobre-nos)',
      },
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
    },
    {
      type: 'collapsible',
      label: 'SEO',
      fields: [
        {
          name: 'seoTitle',
          type: 'text',
          admin: {
            description: 'Título para motores de busca (deixar vazio para usar o título principal)',
          },
        },
        {
          name: 'seoDescription',
          type: 'textarea',
          maxLength: 160,
          admin: {
            description: 'Descrição para motores de busca (máx 160 caracteres)',
          },
        },
        {
          name: 'seoImage',
          type: 'relationship',
          relationTo: 'media',
          admin: {
            description: 'Imagem para partilha em redes sociais',
          },
        },
      ],
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
