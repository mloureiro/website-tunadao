import { CollectionConfig } from 'payload';

export const Tunas: CollectionConfig = {
  slug: 'tunas',
  labels: {
    singular: 'Tuna',
    plural: 'Tunas',
  },
  admin: {
    useAsTitle: 'fullName',
    group: 'Conteúdos',
    description: 'Tunas académicas e grupos similares',
    defaultColumns: ['shortName', 'fullName', 'city', 'type'],
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'shortName',
      label: 'Sigla',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Nome abreviado/sigla (ex: TDK, TEUP) - identificador único',
      },
    },
    {
      name: 'fullName',
      label: 'Nome completo',
      type: 'text',
      required: true,
      admin: {
        description: 'Nome completo oficial',
      },
    },
    {
      name: 'logo',
      label: 'Logótipo',
      type: 'relationship',
      relationTo: 'media',
      admin: {
        description: 'Logótipo da tuna',
      },
    },
    {
      name: 'city',
      label: 'Cidade',
      type: 'text',
      admin: {
        description: 'Cidade de origem',
      },
    },
    {
      name: 'type',
      label: 'Tipo',
      type: 'select',
      defaultValue: 'tuna',
      options: [
        { label: 'Tuna', value: 'tuna' },
        { label: 'Tuna Feminina', value: 'tuna-feminina' },
        { label: 'Tuna Veterana', value: 'tuna-veterana' },
        { label: 'Tuna Sénior', value: 'tuna-senior' },
        { label: 'Internacional', value: 'international' },
        { label: 'Grupo', value: 'group' },
        { label: 'Solista', value: 'soloist' },
      ],
      admin: {
        description: 'Tipo de tuna/grupo',
      },
    },
    {
      name: 'website',
      type: 'text',
      admin: {
        description: 'Website ou perfil (URL completo)',
      },
    },
    {
      name: 'description',
      label: 'Descrição',
      type: 'textarea',
      admin: {
        description: 'Descrição da tuna',
      },
    },
  ],
};
