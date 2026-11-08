import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';
import { SITE_TITLE, AUTHOR, DESCRIPTION, BASE_PATH } from '../utils/site';

export const GET: APIRoute = async ({ site }) => {
  const posts = (await getCollection('logbook', ({ data }) => !data.draft)).sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
  const origin = site ?? new URL('https://example.com');
  const base = new URL(BASE_PATH, origin);
  const updated = posts[0]?.data.updated ?? posts[0]?.data.date ?? new Date();
  const entries = posts.map((post) => `
    <entry>
      <title>${xml(post.data.title)}</title>
      <id>${new URL(`logbook/${post.id}/`, base).toString()}</id>
      <link href="${new URL(`logbook/${post.id}/`, base).toString()}" />
      <published>${post.data.date.toISOString()}</published>
      <updated>${(post.data.updated ?? post.data.date).toISOString()}</updated>
      <summary>${xml(post.data.description)}</summary>
      ${post.data.tags.map((tag) => `<category term="${xml(tag)}" />`).join('')}
    </entry>`).join('');
  const xmlBody = `<?xml version="1.0" encoding="utf-8"?>
  <feed xmlns="http://www.w3.org/2005/Atom">
    <title>${xml(SITE_TITLE)}</title><id>${base.toString()}</id><updated>${updated.toISOString()}</updated>
    <author><name>${xml(AUTHOR)}</name></author><subtitle>${xml(DESCRIPTION)}</subtitle>
    <link href="${new URL('atom.xml', base).toString()}" rel="self" />${entries}
  </feed>`;
  return new Response(xmlBody, { headers: { 'Content-Type': 'application/atom+xml; charset=utf-8' } });
};
function xml(value: string) { return value.replace(/[<>&'"]/g, (char) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[char]!); }
