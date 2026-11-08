import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';
import type { APIContext } from 'astro';
import { SITE_TITLE, DESCRIPTION, BASE_PATH } from '../utils/site';

const basePath = BASE_PATH;

export async function GET(context: APIContext) {
  const posts = (await getCollection('logbook', ({ data }) => !data.draft))
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

  const items = await Promise.all(posts.map(async (post) => {
    const articleUrl = new URL(`${basePath}logbook/${post.id}/`.replace(/\/+/g, '/'), context.site).toString();
    let html = await marked.parse(post.body ?? '');
    // Make local media URLs absolute so RSS readers can display them outside the website.
    const localBase = basePath === '/' ? '' : basePath.replace(/^\//, '');
    const mediaPattern = new RegExp(`(src|href)=([\"'])/(?:${localBase})?(media|images)/`, 'g');
    html = html.replace(mediaPattern, (_match, attribute, quote, directory) => `${attribute}=${quote}${new URL(`${basePath}${directory}/`, context.site).toString()}`);
    html = sanitizeHtml(html, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2', 'h3', 'h4', 'figure', 'figcaption', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'del', 'pre', 'code']),
      allowedAttributes: { a: ['href', 'name', 'target'], img: ['src', 'alt', 'title', 'width', 'height'], code: ['class'], pre: ['class'], th: ['align'], td: ['align'] },
      allowedSchemes: ['http', 'https', 'mailto', 'data'],
    });
    return {
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: articleUrl,
      categories: post.data.tags,
      content: `${html}<hr /><p><a href=\"${articleUrl}\">view this entry on logbook</a></p>`,
    };
  }));

  return rss({ title: SITE_TITLE, description: DESCRIPTION, site: context.site!, items });
}
