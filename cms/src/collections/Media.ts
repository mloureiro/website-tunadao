import type { CollectionConfig } from 'payload';

export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: 'Ficheiro multimédia',
    plural: 'Multimédia',
  },
  admin: {
    group: 'Multimédia',
    defaultColumns: ['filename', 'alt', 'url', 'createdAt'],
    useAsTitle: 'filename',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'filename',
      label: 'Nome do ficheiro',
      type: 'text',
      required: true,
      admin: {
        description: 'Nome do ficheiro para referência',
      },
    },
    {
      name: 'cloudinary',
      label: 'Imagem',
      type: 'json',
      required: true,
      admin: {
        components: {
          Field: '@/components/CloudinaryUpload',
        },
      },
    },
    {
      name: 'url',
      label: 'URL',
      type: 'text',
      admin: {
        readOnly: true,
        description: 'URL da imagem (auto-preenchido do Cloudinary)',
      },
      hooks: {
        beforeChange: [
          ({ siblingData }) => {
            return siblingData?.cloudinary?.secure_url || '';
          },
        ],
      },
    },
    {
      name: 'publicId',
      label: 'ID público (Cloudinary)',
      type: 'text',
      admin: {
        readOnly: true,
        condition: () => false,
      },
      hooks: {
        beforeChange: [
          ({ siblingData }) => {
            return siblingData?.cloudinary?.public_id || '';
          },
        ],
      },
    },
    {
      name: 'width',
      label: 'Largura',
      type: 'number',
      admin: {
        readOnly: true,
      },
      hooks: {
        beforeChange: [
          ({ siblingData }) => {
            return siblingData?.cloudinary?.width || null;
          },
        ],
      },
    },
    {
      name: 'height',
      label: 'Altura',
      type: 'number',
      admin: {
        readOnly: true,
      },
      hooks: {
        beforeChange: [
          ({ siblingData }) => {
            return siblingData?.cloudinary?.height || null;
          },
        ],
      },
    },
    {
      name: 'format',
      type: 'text',
      admin: {
        readOnly: true,
        condition: () => false,
      },
      hooks: {
        beforeChange: [
          ({ siblingData }) => {
            return siblingData?.cloudinary?.format || '';
          },
        ],
      },
    },
    {
      name: 'mimeType',
      label: 'Tipo MIME',
      type: 'text',
      admin: {
        readOnly: true,
        condition: () => false,
      },
      hooks: {
        beforeChange: [
          ({ siblingData }) => {
            const format = siblingData?.cloudinary?.format || '';
            const resourceType = siblingData?.cloudinary?.resource_type || 'image';
            if (format) {
              return `${resourceType}/${format}`;
            }
            return '';
          },
        ],
      },
    },
    {
      name: 'filesize',
      label: 'Tamanho (bytes)',
      type: 'number',
      admin: {
        readOnly: true,
        condition: () => false,
      },
      hooks: {
        beforeChange: [
          ({ siblingData }) => {
            return siblingData?.cloudinary?.bytes || 0;
          },
        ],
      },
    },
    {
      name: 'alt',
      label: 'Texto alternativo',
      type: 'text',
      required: true,
      admin: {
        description: 'Texto alternativo para acessibilidade',
      },
    },
    {
      name: 'caption',
      label: 'Legenda',
      type: 'text',
      admin: {
        description: 'Legenda opcional',
      },
    },
  ],
};
