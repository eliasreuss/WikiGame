import { useEffect, useReducer } from 'react';

export type WikiSummary = {
  title: string;
  extract: string;
  description?: string;
  thumbnail?: string;
  /** A larger rendition of the lead image, capped so a full-screen view doesn't pull a multi-megabyte original. */
  image?: string;
  url: string;
};

const cache = new Map<string, Promise<WikiSummary | null>>();

function largeImage(j: { thumbnail?: { source: string }; originalimage?: { source: string; width: number } }) {
  const original = j.originalimage;
  if (!j.thumbnail?.source) return original?.source;
  if (original && original.width <= 1600) return original.source;
  // Never ask for a rendition bigger than the file; Wikimedia 404s those.
  const cap = Math.min(1280, original?.width ?? 1280);
  return j.thumbnail.source.replace(/\/\d+px-/, `/${cap}px-`);
}

type MediaItem = {
  title?: string;
  type?: string;
  leadImage?: boolean;
  showInGallery?: boolean;
  srcset?: { src: string }[];
};

const NOT_A_PHOTO = /flag|icon|logo|locator|ambox|clef|riff|notation|diagram|commons-logo|question.book|\.svg/i;

/**
 * These pages lead with a logo, or have no lead image and the generic picker lands on the wrong file.
 * Each name is a real photo already on that Wikipedia page.
 */
const PREFERRED_FILE: Record<string, RegExp> = {
  Marmite: /Marmite_Jars\.jpg/i,
  Pokémon: /Liam_meets_pikachu/i,
  Lego: /Lego_by_Christian_Ursilva_\(2025\)/i,
  Minecraft: /Minecraft_Creeper_\(Crop\)/i,
  'Mickey Mouse': /Modern_Mickey_Mouse/i,
  Emoji: /Texting_Emoji/i,
  'QR code': /QR_code_on_Pepsi/i,
};

function isWeakLead(src: string) {
  return NOT_A_PHOTO.test(decodeURIComponent(src));
}

function pixels(src: string) {
  const match = /\/(\d+)px-/.exec(src);
  return match ? Number(match[1]) : 0;
}

function absolute(src: string) {
  return src.startsWith('//') ? `https:${src}` : src;
}

/** A rendition Wikimedia has already generated, nearest to `px` without going past it. Invented widths 400. */
function rendition(item: MediaItem, px: number) {
  const options = (item.srcset ?? [])
    .map((entry) => ({ src: absolute(entry.src), width: pixels(entry.src) }))
    .filter((option) => option.src && option.width > 0);
  const fits = options.filter((option) => option.width <= px);
  if (fits.length) return fits.sort((a, b) => b.width - a.width)[0].src;
  return options.sort((a, b) => a.width - b.width)[0]?.src ?? null;
}

function widest(item: MediaItem) {
  return (item.srcset ?? []).reduce((max, entry) => Math.max(max, pixels(entry.src)), 0);
}

/**
 * Pages like Reggae have no lead image. Pick the most photographic file on the page instead:
 * a real photo, preferably one whose name matches the subject, rather than a flag or a diagram.
 */
function photoOf(item: MediaItem) {
  const thumbnail = rendition(item, 480);
  if (!thumbnail) return null;
  return { thumbnail, image: rendition(item, 1280) ?? thumbnail };
}

function choosePagePhoto(pageTitle: string, items: MediaItem[]) {
  const preferred = PREFERRED_FILE[pageTitle];
  const pinned = preferred ? items.find((item) => item.title && preferred.test(item.title)) : undefined;
  if (pinned) {
    const photo = photoOf(pinned);
    if (photo) return photo;
  }
  const words = pageTitle.toLowerCase().split(/[^a-z0-9]+/).filter((word) => word.length > 3);
  let best: { score: number; item: MediaItem } | null = null;
  for (let index = 0; index < items.length; index++) {
    const item = items[index];
    if (item.type !== 'image' || !item.title) continue;
    const file = item.title.replace(/^File:/i, '');
    if (/\.svg$/i.test(file) || NOT_A_PHOTO.test(file)) continue;
    const width = widest(item);
    if (!width || width < 300) continue;
    if (width > 0 && width < 300) continue;
    const name = file.toLowerCase();
    let score = 0;
    if (/\.(jpe?g|webp)$/i.test(file)) score += 60;
    if (words.some((word) => name.includes(word))) score += 50;
    if (item.leadImage) score += 200;
    if (item.showInGallery) score += 15;
    score += Math.max(0, 24 - index);
    score += Math.min(width, 1600) / 80;
    if (!best || score > best.score) best = { score, item };
  }
  return best ? photoOf(best.item) : null;
}

async function photoFromPage(title: string) {
  try {
    const response = await fetch(`https://en.wikipedia.org/api/rest_v1/page/media-list/${encodeURIComponent(title)}`);
    if (!response.ok) return null;
    const json = (await response.json()) as { items?: MediaItem[] };
    return choosePagePhoto(title, json.items ?? []);
  } catch {
    return null;
  }
}

export function fetchSummary(title: string) {
  let pending = cache.get(title);
  if (!pending) {
    pending = fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then(async (j) => {
        if (!j) return null;
        const weakLead = !j.thumbnail?.source || isWeakLead(j.thumbnail.source);
        const fallback = weakLead ? await photoFromPage(title) : null;
        const photo = fallback ?? (j.thumbnail?.source ? { thumbnail: j.thumbnail.source, image: largeImage(j) } : null);
        return {
          title: j.title,
          extract: j.extract,
          description: j.description,
          thumbnail: photo?.thumbnail,
          image: photo?.image,
          url: j.content_urls?.mobile?.page ?? `https://en.m.wikipedia.org/wiki/${title}`,
        };
      })
      .catch(() => null)
      .then((s) => {
        resolved.set(title, s);
        return s;
      });
    cache.set(title, pending);
  }
  return pending;
}

const resolved = new Map<string, WikiSummary | null>();

export function useWikiSummary(title?: string) {
  const [, rerender] = useReducer((n: number) => n + 1, 0);
  useEffect(() => {
    if (!title || resolved.has(title)) return;
    let alive = true;
    fetchSummary(title).then(() => alive && rerender());
    return () => {
      alive = false;
    };
  }, [title]);
  return title ? (resolved.get(title) ?? null) : null;
}

export function flagUrl(iso2: string, width: 40 | 80 | 160 = 80) {
  return `https://flagcdn.com/w${width}/${iso2}.png`;
}
