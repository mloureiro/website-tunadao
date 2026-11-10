import { GlobalConfig } from 'payload';
import { triggerFrontendRebuild } from '../utils/triggerRebuild';

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Definições do site',
  hooks: {
    afterChange: [
      async ({ doc, req }) => {
        await triggerFrontendRebuild(req.payload, 'site-settings', 'update');
        return doc;
      },
    ],
  },
  admin: {
    group: 'Definições',
  },
  access: {
    read: () => true,
    update: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'siteName',
      label: 'Nome do site',
      type: 'text',
      required: true,
      defaultValue: 'Tunadão 1998',
    },
    {
      name: 'siteDescription',
      label: 'Descrição do site',
      type: 'textarea',
      required: true,
      defaultValue: 'Tuna do Instituto Politécnico de Viseu',
    },
    {
      name: 'logo',
      label: 'Logótipo',
      type: 'relationship',
      relationTo: 'media',
    },
    {
      name: 'favicon',
      type: 'relationship',
      relationTo: 'media',
    },
    {
      type: 'collapsible',
      label: 'Redes Sociais',
      fields: [
        {
          name: 'instagram',
          type: 'text',
          admin: {
            description: 'URL do Instagram',
          },
        },
        {
          name: 'facebook',
          type: 'text',
          admin: {
            description: 'URL do Facebook',
          },
        },
        {
          name: 'tiktok',
          type: 'text',
          admin: {
            description: 'URL do TikTok',
          },
        },
        {
          name: 'youtube',
          type: 'text',
          admin: {
            description: 'URL do YouTube',
          },
        },
        {
          name: 'spotify',
          type: 'text',
          admin: {
            description: 'URL do Spotify',
          },
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'SEO por omissão',
      fields: [
        {
          name: 'defaultSeoImage',
          label: 'Imagem de partilha por omissão',
          type: 'relationship',
          relationTo: 'media',
          admin: {
            description: 'Imagem padrão para partilha em redes sociais',
          },
        },
        {
          name: 'googleAnalyticsId',
          label: 'ID do Google Analytics',
          type: 'text',
          admin: {
            description: 'Google Analytics ID (ex: G-XXXXXXXXXX)',
          },
        },
      ],
    },
  ],
};
