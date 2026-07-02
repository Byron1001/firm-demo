import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'practiceArea',
  title: 'Service',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string' }),
    defineField({ name: 'description', title: 'Description', type: 'text' }),
    defineField({
      name: 'icon',
      title: 'Icon',
      type: 'string',
      description: 'Icon key: star, heart, building, chart, message, briefcase, clock, location, shield',
    }),
    defineField({ name: 'order', title: 'Order', type: 'number' }),
  ],
})
