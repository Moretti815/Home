/**
 * Icefox data helpers.
 */

import type { IcefoxMedia, IcefoxMediaObject, IcefoxPost, IcefoxResponse } from "../types/icefox";

export interface NormalizedMedia {
  title?: string;
  artist?: string;
  url?: string;
  cover?: string;
  poster?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function getMediaField(media: IcefoxMediaObject, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = getString(media[key]);
    if (value) return value;
  }
  return undefined;
}

export function toTimestamp(value: number | string | undefined | null): number {
  if (value === undefined || value === null) return 0;

  if (typeof value === "number") {
    return value < 1_000_000_000_000 ? value * 1000 : value;
  }

  const numericValue = Number(value);
  if (!Number.isNaN(numericValue)) {
    return numericValue < 1_000_000_000_000 ? numericValue * 1000 : numericValue;
  }

  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function formatRelativeTime(
  value: number | string,
  minutesAgo: string = "分钟前",
  hoursAgo: string = "小时前",
  daysAgo: string = "天前"
): string {
  const timestamp = toTimestamp(value);
  if (!timestamp) return "";

  const diffInMinutes = Math.max(0, Math.floor((Date.now() - timestamp) / (1000 * 60)));
  if (diffInMinutes < 60) return `${diffInMinutes}${minutesAgo}`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}${hoursAgo}`;
  return `${Math.floor(diffInMinutes / 1440)}${daysAgo}`;
}

export function formatFullDate(value: number | string): string {
  const timestamp = toTimestamp(value);
  if (!timestamp) return "";

  return new Date(timestamp).toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function normalizeContent(content: string): string {
  return content.replace(/<!--\s*markdown\s*-->/gi, "").trim();
}

export function formatCount(value: number | string | undefined | null): string {
  if (value === undefined || value === null || value === "") return "0";
  const numberValue = Number(value);
  if (Number.isNaN(numberValue)) return String(value);
  if (numberValue >= 10000) return `${(numberValue / 10000).toFixed(1)}w`;
  if (numberValue >= 1000) return `${(numberValue / 1000).toFixed(1)}k`;
  return String(numberValue);
}

export function getPostViews(post: IcefoxPost): number | string {
  return post.views ?? post.view ?? 0;
}

export function getPostCommentsCount(post: IcefoxPost): number | string {
  return post.commentsCount ?? post.comentsCount ?? post.comments?.length ?? 0;
}

export function extractIcefoxPosts(data: IcefoxResponse): IcefoxPost[] {
  if (Array.isArray(data.posts)) return data.posts;
  if (Array.isArray(data.data)) return data.data;
  if (data.data && Array.isArray(data.data.posts)) return data.data.posts;
  return [];
}

export function sortIcefoxPosts(posts: IcefoxPost[]): IcefoxPost[] {
  return [...posts].sort((a, b) => {
    if (a.isTop && !b.isTop) return -1;
    if (!a.isTop && b.isTop) return 1;
    return toTimestamp(b.created) - toTimestamp(a.created);
  });
}

export function getAllTags(posts: IcefoxPost[]): string[] {
  const tagSet = new Set<string>();

  posts.forEach((post) => {
    post.tags?.forEach((tag) => {
      if (tag.name) tagSet.add(tag.name);
    });
  });

  return Array.from(tagSet).sort();
}

export function filterPostsByTag(posts: IcefoxPost[], tag: string): IcefoxPost[] {
  if (tag === "all") return posts;
  return posts.filter((post) => post.tags?.some((item) => item.name === tag));
}

export function normalizeMedia(media: IcefoxMedia | IcefoxMedia[] | null | undefined): NormalizedMedia[] {
  if (!media) return [];

  const mediaList = Array.isArray(media) ? media : [media];

  return mediaList
    .map((item): NormalizedMedia | null => {
      if (typeof item === "string") {
        return item.trim() ? { title: "Media", url: item } : null;
      }

      if (!isRecord(item)) return null;

      const mediaObject = item as IcefoxMediaObject;
      const url = getMediaField(mediaObject, ["url", "link", "src"]);
      const title = getMediaField(mediaObject, ["title", "name"]) ?? (url ? "Media" : undefined);

      return {
        title,
        artist: getMediaField(mediaObject, ["artist", "author", "singer"]),
        url,
        cover: getMediaField(mediaObject, ["cover", "pic", "picture"]),
        poster: getMediaField(mediaObject, ["poster", "cover", "pic", "picture"]),
      };
    })
    .filter((item): item is NormalizedMedia => Boolean(item));
}
