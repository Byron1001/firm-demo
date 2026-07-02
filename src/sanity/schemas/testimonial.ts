import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'testimonial',
  title: 'Testimonial',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Client Name', type: 'string' }),
    defineField({ name: 'role', title: 'Role / Company', type: 'string' }),
    defineField({ name: 'text', title: 'Testimonial Text', type: 'text' }),
    defineField({
      name: 'photo',
      title: 'Photo',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({ name: 'order', title: 'Order', type: 'number' }),
  ],
})
