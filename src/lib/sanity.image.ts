import { createImageUrlBuilder } from '@sanity/image-url'
import { client } from './sanity'

const noopUrlBuilder = {
  url: () => '',
  width: () => noopUrlBuilder,
  height: () => noopUrlBuilder,
  blur: () => noopUrlBuilder,
  format: () => noopUrlBuilder,
  quality: () => noopUrlBuilder,
  fit: () => noopUrlBuilder,
  crop: () => noopUrlBuilder,
  auto: () => noopUrlBuilder,
  size: () => noopUrlBuilder,
}

export function urlFor(source: any) {
  if (!client) return noopUrlBuilder
  return createImageUrlBuilder(client).image(source)
}
