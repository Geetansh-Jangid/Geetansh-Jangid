import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';
import { SITE_TITLE, AUTHOR, DESCRIPTION, BASE_PATH } from '../utils/site';

export const GET: APIRoute = async ({ site }) => {
  const posts = (await getCollection('logbook', ({ data }) => !data.draft)).sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
  const origin = site ?? new URL('https://example.com');
  const base = new URL(BASE_PATH, origin);
  const feed = {
    version: 'https://jsonfeed.org/version/1.1',
    title: SITE_TITLE,
    description: DESCRIPTION,
    home_page_url: base.toString(),
    feed_url: new URL('feed.json', base).toString(),
    authors: [{ name: AUTHOR }],
    items: posts.map((post) => ({
      id: new URL(`logbook/${post.id}/`, base).toString(),
      url: new URL(`logbook/${post.id}/`, base).toString(),
      title: post.data.title,
      summary: post.data.description,
      content_text: post.body ?? '',
      date_published: post.data.date.toISOString(),
      date_modified: (post.data.updated ?? post.data.date).toISOString(),
      tags: post.data.tags,
    })),
  };
  return new Response(JSON.stringify(feed, null, 2), { headers: { 'Content-Type': 'application/feed+json; charset=utf-8' } });
};
