import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const logbook = defineCollection({
  loader: glob({
    pattern: '**/*.{md,mdx}',
    base: './content/logbook',
    generateId: ({ entry }) => entry.replace(/\/index\.(md|mdx)$/, '').replace(/\.(md|mdx)$/, ''),
  }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    category: z.string().optional(),
    cover: z.string().optional(),
    draft: z.boolean().default(false),
    featured: z.boolean().default(false),
  }),
});

const observations = defineCollection({
  loader: glob({
    pattern: '**/*.{md,mdx}',
    base: './content/observations',
    generateId: ({ entry }) => entry.replace(/\/index\.(md|mdx)$/, '').replace(/\.(md|mdx)$/, ''),
  }),
  schema: z.object({
    title: z.string().optional(),
    description: z.string(),
    date: z.coerce.date(),
    category: z.string().default('observations'),
    draft: z.boolean().default(false),
  }),
});

export const collections = { logbook, observations };
