import { CollectionConfig } from 'payload';

export const Venues: CollectionConfig = {
  slug: 'venues',
  labels: {
    singular: 'Local',
    plural: 'Locais',
  },
  admin: {
    useAsTitle: 'name',
    group: 'Conteúdos',
    description: 'Locais dos eventos',
    defaultColumns: ['name', 'address'],
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'name',
      label: 'Nome',
      type: 'text',
      required: true,
      admin: {
        description: 'Nome do local (ex: Aula Magna da UPV)',
      },
    },
    {
      name: 'address',
      label: 'Morada',
      type: 'text',
      admin: {
        description: 'Morada',
      },
    },
    {
      name: 'photo',
      label: 'Fotografia',
      type: 'relationship',
      relationTo: 'media',
      admin: {
        description: 'Foto do local',
      },
    },
  ],
};
