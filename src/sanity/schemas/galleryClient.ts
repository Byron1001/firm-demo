import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'galleryClient',
  title: 'Gallery Client',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Company Name', type: 'string' }),
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({ name: 'industry', title: 'Industry', type: 'string' }),
    defineField({ name: 'order', title: 'Order', type: 'number' }),
  ],
})
