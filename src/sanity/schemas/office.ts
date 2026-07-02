import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'office',
  title: 'Office',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Location Name', type: 'string' }),
    defineField({ name: 'address', title: 'Address', type: 'text' }),
    defineField({ name: 'phone', title: 'Phone', type: 'string' }),
    defineField({ name: 'email', title: 'Email', type: 'string' }),
    defineField({ name: 'hours', title: 'Business Hours', type: 'string' }),
    defineField({ name: 'mapLink', title: 'Google Maps Link', type: 'url' }),
    defineField({ name: 'order', title: 'Order', type: 'number' }),
  ],
})
