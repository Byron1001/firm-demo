import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'career',
  title: 'Career',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Job Title', type: 'string' }),
    defineField({ name: 'department', title: 'Department', type: 'string' }),
    defineField({ name: 'location', title: 'Location', type: 'string' }),
    defineField({ name: 'type', title: 'Type', type: 'string' }),
    defineField({ name: 'description', title: 'Description', type: 'text' }),
    defineField({ name: 'linkedinUrl', title: 'LinkedIn Apply URL', type: 'url' }),
    defineField({ name: 'order', title: 'Order', type: 'number' }),
  ],
})
