import { CollectionConfig } from 'payload';
import { triggerFrontendRebuild } from '../utils/triggerRebuild';

export const BlogPosts: CollectionConfig = {
  slug: 'blog-posts',
  labels: {
    singular: 'Artigo',
    plural: 'Artigos',
  },
  hooks: {
    afterChange: [
      async ({ doc, operation, req }) => {
        if (doc.status === 'published') {
          await triggerFrontendRebuild(req.payload, 'blog-posts', operation);
        }
        return doc;
      },
    ],
  },
  admin: {
    useAsTitle: 'title',
    group: 'Conteúdos',
    description: 'Artigos do blog',
    defaultColumns: ['title', 'author', 'publishedAt', 'status'],
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
    },
    {
      name: 'slug',
      label: 'Endereço (slug)',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'URL amigável (ex: primeiro-festival-2024)',
      },
    },
    {
      name: 'excerpt',
      label: 'Resumo',
      type: 'textarea',
      required: true,
      maxLength: 300,
      admin: {
        description: 'Resumo curto para listagens',
      },
    },
    {
      name: 'content',
      label: 'Conteúdo',
      type: 'richText',
      required: true,
    },
    {
      name: 'featuredImage',
      label: 'Imagem de destaque',
      type: 'relationship',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'author',
      label: 'Autor',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        description: 'Autor do artigo',
      },
    },
    {
      name: 'tags',
      label: 'Etiquetas',
      type: 'array',
      fields: [
        {
          name: 'tag',
          label: 'Etiqueta',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'publishedAt',
      label: 'Data de publicação',
      type: 'date',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'status',
      label: 'Estado',
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
