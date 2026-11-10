import { CollectionConfig } from 'payload';
import { triggerFrontendRebuild } from '../utils/triggerRebuild';

export const FestivalAwards: CollectionConfig = {
  slug: 'festival-awards',
  labels: {
    singular: 'Prémio em festival',
    plural: 'Prémios em festivais',
  },
  hooks: {
    afterChange: [
      async ({ doc, operation, req }) => {
        const festivalId =
          typeof doc.festival === 'object' && doc.festival !== null
            ? doc.festival.id
            : doc.festival;
        if (festivalId) {
          try {
            const festival = await req.payload.findByID({
              collection: 'festivals',
              id: festivalId,
            });
            if (festival?.status === 'published') {
              await triggerFrontendRebuild(req.payload, 'festival-awards', operation);
            }
          } catch {}
        }
        return doc;
      },
    ],
  },
  admin: {
    useAsTitle: 'id',
    group: 'Conteúdos',
    description: 'Prémios ganhos em festivais',
    defaultColumns: ['festival', 'awardType', 'customName'],
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'festival',
      type: 'relationship',
      relationTo: 'festivals',
      required: true,
      admin: {
        description: 'Festival onde o prémio foi ganho',
      },
    },
    {
      name: 'awardType',
      label: 'Tipo de prémio',
      type: 'relationship',
      relationTo: 'award-types',
      admin: {
        description: 'Tipo de prémio (opcional se não existir na lista)',
      },
    },
    {
      name: 'customName',
      label: 'Nome personalizado',
      type: 'text',
      admin: {
        description: 'Nome personalizado (se diferente do tipo)',
      },
    },
  ],
};
