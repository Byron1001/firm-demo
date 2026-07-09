import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'firmName',
      title: 'Company Name',
      type: 'string',
      initialValue: 'Double Brain Creative & Event SDN BHD',
    }),
    defineField({
      name: 'tagline',
      title: 'Tagline',
      type: 'string',
      initialValue: 'Malaysia\'s Premier Event Management Company',
    }),
    defineField({
      name: 'heroTitle',
      title: 'Hero Title',
      type: 'string',
      initialValue: 'Turning Visions Into Unforgettable Events',
    }),
    defineField({
      name: 'heroDescription',
      title: 'Hero Description',
      type: 'text',
      initialValue: 'With creative vision and precision execution, Double Brain Creative & Event SDN BHD delivers unforgettable corporate events, weddings, branding, and exhibitions from three locations across Malaysia.',
    }),
    defineField({
      name: 'aboutDescription',
      title: 'About Description',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      initialValue: 'hello@doublebraincreative.com',
    }),
    defineField({
      name: 'phone',
      title: 'Phone',
      type: 'string',
      initialValue: '+60 3-1234 5678',
    }),
    defineField({
      name: 'whatsapp',
      title: 'WhatsApp Number',
      type: 'string',
      initialValue: '+60123456789',
    }),
    defineField({
      name: 'linkedin',
      title: 'LinkedIn URL',
      type: 'url',
    }),
    defineField({
      name: 'facebook',
      title: 'Facebook URL',
      type: 'url',
    }),
    defineField({
      name: 'instagram',
      title: 'Instagram URL',
      type: 'url',
    }),
    defineField({
      name: 'aboutImage',
      title: 'About Page Image',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'teamBannerImage',
      title: 'Team Banner Image',
      type: 'image',
      options: { hotspot: true },
    }),
  ],
})
