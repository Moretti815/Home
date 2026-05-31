/**
 * 说说/动态类型定义
 */

export interface RSSItem {
    title: string;
    description: string;
    link: string;
    pubDate: string;
    guid: string;
}

export interface Moment {
    id: string;
    content: string;
    date: string;
    link: string;
    images?: string[];
}

export interface MomentsConfig {
    enabled: boolean;
    title: {
        zh: string;
        en: string;
    };
    rssUrl: string;
    subtitle?: {
        zh: string;
        en: string;
    };
}
