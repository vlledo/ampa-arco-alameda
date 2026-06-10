import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const events = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/events' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      date: z.coerce.date(),
      location: z.string(),
      poster: image(),
      posterAlt: z.string().min(1, 'El alt del cartel es obligatorio'),
      featured: z.boolean().default(false),
      isHero: z.boolean().default(false),
      shortDescription: z.string(),
    }),
});

const services = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/services' }),
  schema: ({ image }) =>
    z
      .object({
        title: z.string(),
        season: z.string(),
        shortDescription: z.string(),
        heroImage: image().optional(),
        heroImageAlt: z.string().optional(),
        formUrl: z.string().url().optional(),
        formPdf: z.string().optional(),
        documents: z
          .array(
            z.object({
              label: z.string(),
              file: z.string(),
            })
          )
          .default([]),
        order: z.number().default(99),
      })
      .refine(
        (data) => !(data.formUrl && data.formPdf),
        { message: 'formUrl y formPdf son mutuamente excluyentes' }
      )
      .refine(
        (data) => !data.heroImage || data.heroImageAlt,
        { message: 'heroImageAlt es obligatorio cuando hay heroImage' }
      ),
});

const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
  }),
});

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: ({ image }) =>
    z
      .object({
        title: z.string(),
        pubDate: z.coerce.date(),
        description: z.string(),
        cover: image().optional(),
        coverAlt: z.string().optional(),
        tags: z.array(z.string()).default([]),
      })
      .refine(
        (data) => !data.cover || data.coverAlt,
        { message: 'coverAlt es obligatorio cuando hay cover' }
      ),
});

export const collections = { events, services, pages, posts };
