import { CollectionConfig } from 'payload';
import { triggerFrontendRebuild } from '../utils/triggerRebuild';

export const FestivalParticipants: CollectionConfig = {
  slug: 'festival-participants',
  hooks: {
    afterChange: [
      async ({ doc, operation, req }) => {
        const festivalId =
          typeof doc.festival === 'object' && doc.festival !== null
            ? doc.festival.id
            : doc.festival;
        if (festivalId) {
          try {
            const festival = await req.payload.findByID({ collection: 'festivals', id: festivalId });
            if (festival?.status === 'published') {
              await triggerFrontendRebuild(req.payload, 'festival-participants', operation);
            }
          } catch {}
        }
        return doc;
      },
    ],
  },
  admin: {
    useAsTitle: 'id',
    group: 'Content',
    description: 'Participacoes de tunas nos festivais externos',
    defaultColumns: ['festival', 'tuna', 'type'],
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
        description: 'Festival',
      },
    },
    {
      name: 'tuna',
      type: 'relationship',
      relationTo: 'tunas',
      required: true,
      admin: {
        description: 'Tuna participante',
      },
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      defaultValue: 'contestant',
      options: [
        { label: 'A Concurso', value: 'contestant' },
        { label: 'Convidado', value: 'guest' },
      ],
      admin: {
        description: 'Tipo de participacao',
      },
    },
  ],
};
