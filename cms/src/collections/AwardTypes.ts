import { CollectionConfig } from 'payload';

export const AwardTypes: CollectionConfig = {
  slug: 'award-types',
  labels: {
    singular: 'Tipo de prémio',
    plural: 'Tipos de prémio',
  },
  admin: {
    useAsTitle: 'name',
    group: 'Conteúdos',
    description: 'Tipos de prémios (usados no Citadão e Palmarés)',
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
        description: 'Nome principal do prémio (ex: Melhor Pandeireta)',
      },
    },
    {
      name: 'slug',
      label: 'Identificador',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Identificador único (ex: melhor-pandeireta)',
      },
    },
    {
      name: 'aliases',
      label: 'Nomes alternativos',
      type: 'array',
      admin: {
        description: 'Nomes alternativos usados por outros festivais',
      },
      fields: [
        {
          name: 'alias',
          label: 'Nome alternativo',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'description',
      label: 'Descrição',
      type: 'textarea',
      admin: {
        description: 'Descrição do prémio (aparece em tooltip)',
      },
    },
    {
      name: 'criteria',
      label: 'Critérios',
      type: 'richText',
      admin: {
        description: 'Critérios de avaliação detalhados',
      },
    },
    {
      name: 'icon',
      label: 'Ícone',
      type: 'text',
      admin: {
        description: 'Ícone do prémio (emoji ou código)',
      },
    },
  ],
};
