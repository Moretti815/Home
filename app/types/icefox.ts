/**
 * Icefox data source types.
 */

export interface IcefoxAuthor {
  name?: string;
  avatar?: string;
  url?: string;
}

export interface IcefoxTag {
  name: string;
  slug?: string;
  permalink?: string;
}

export interface IcefoxPosition {
  name: string;
  url?: string | null;
}

export interface IcefoxLinkCard {
  icon?: string;
  title?: string;
  description?: string;
  url?: string;
  link?: string;
}

export interface IcefoxMediaObject {
  title?: string;
  name?: string;
  artist?: string;
  author?: string;
  singer?: string;
  url?: string;
  link?: string;
  src?: string;
  cover?: string;
  pic?: string;
  picture?: string;
  poster?: string;
  [key: string]: unknown;
}

export type IcefoxMedia = string | IcefoxMediaObject;

export interface IcefoxComment {
  coid: number | string;
  author?: string;
  authorId?: number | string;
  mail?: string | null;
  url?: string | null;
  text: string;
  created: number | string;
  level?: number;
  replies?: IcefoxComment[];
}

export interface IcefoxPost {
  cid: number | string;
  title?: string;
  slug?: string;
  content: string;
  summary?: string;
  created: number | string;
  modified?: number | string;
  permalink?: string;
  author?: IcefoxAuthor;
  tags?: IcefoxTag[];
  categories?: IcefoxTag[];
  images?: string[];
  video?: null | IcefoxMedia | IcefoxMedia[];
  music?: null | IcefoxMedia | IcefoxMedia[];
  linkCard?: IcefoxLinkCard | null;
  isAd?: boolean;
  isTop?: boolean;
  position?: IcefoxPosition | null;
  views?: number | string;
  view?: number | string;
  likesCount?: number | string;
  likes?: unknown[];
  commentsCount?: number | string;
  comentsCount?: number | string;
  comments?: IcefoxComment[];
}

export interface IcefoxResponseData {
  posts?: IcefoxPost[];
  total?: number;
  page?: number;
  pageSize?: number;
  hasMore?: boolean;
}

export interface IcefoxResponse {
  code?: number;
  message?: string;
  data?: IcefoxResponseData | IcefoxPost[];
  posts?: IcefoxPost[];
}
