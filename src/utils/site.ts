export const SITE_TITLE = "logbook";
export const AUTHOR = "Geetansh Jangid";
export const DESCRIPTION =
  "notes, research, and technical observations by geetansh jangid.";

/** Normalized base path that always ends with a single slash. */
export const BASE_PATH = `${import.meta.env.BASE_URL.replace(/\/+$/, '')}/`;

/** Build an internal URL under the configured base path. */
export function withBase(path = '') {
  const clean = path.replace(/^\/+/, '');
  if (!clean) return BASE_PATH;
  return `${BASE_PATH}${clean}`;
}

export function formatDate(date: Date | string | number, options: Intl.DateTimeFormatOptions = {}) {
  const d = new Date(date);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    ...options,
  }).format(d).toLowerCase();
}

export function readingTime(text: string) {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.ceil(words / 200))} min read`;
}

export function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
}

export function clsx(...args: any[]): string {
  return args.filter(Boolean).join(' ');
}

export function getCategoryColor(category?: string): string {
  switch (category?.toLowerCase()) {
    case 'ai':
      return 'bg-yellow-300';
    case 'design':
      return 'bg-lime-300';
    case 'product':
      return 'bg-green-300';
    case 'engineering':
      return 'bg-purple-300';
    case 'productivity':
      return 'bg-pink-300';
    case 'learning':
      return 'bg-blue-300';
    case 'opensource':
      return 'bg-orange-400';
    case 'thoughts':
    case 'observations':
      return 'bg-red-400';
    case 'tools':
      return 'bg-cyan-300';
    case 'work':
      return 'bg-teal-300';
    default:
      return 'bg-amber-300';
  }
}
