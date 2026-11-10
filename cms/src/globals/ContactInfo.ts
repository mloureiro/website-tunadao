import { GlobalConfig } from 'payload';
import { triggerFrontendRebuild } from '../utils/triggerRebuild';

export const ContactInfo: GlobalConfig = {
  slug: 'contact-info',
  label: 'Contactos',
  hooks: {
    afterChange: [
      async ({ doc, req }) => {
        await triggerFrontendRebuild(req.payload, 'contact-info', 'update');
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
      name: 'email',
      label: 'E-mail',
      type: 'email',
      required: true,
      defaultValue: 'tunadao@gmail.com',
    },
    {
      name: 'phone',
      label: 'Telefone',
      type: 'text',
      defaultValue: '+351 928 155 399',
    },
    {
      name: 'address',
      label: 'Morada',
      type: 'textarea',
      defaultValue: 'Campus Politécnico de Viseu\n3504-510 Viseu',
    },
    {
      type: 'collapsible',
      label: 'Mapa',
      fields: [
        {
          name: 'mapEmbedUrl',
          label: 'URL do mapa (Google Maps)',
          type: 'text',
          admin: {
            description: 'URL do Google Maps embed (opcional)',
          },
        },
        {
          name: 'coordinates',
          label: 'Coordenadas',
          type: 'group',
          fields: [
            {
              name: 'latitude',
              type: 'number',
            },
            {
              name: 'longitude',
              type: 'number',
            },
          ],
        },
      ],
    },
  ],
};
