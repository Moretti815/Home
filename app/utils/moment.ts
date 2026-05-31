/**
 * 说说/动态工具函数
 */

import type { RSSItem, Moment } from "../types/moment";

/**
 * 解析 RSS XML 数据
 */
export function parseRSS(xmlText: string): RSSItem[] {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "text/xml");
    const items = xmlDoc.querySelectorAll("item");

    return Array.from(items).map((item) => ({
        title: item.querySelector("title")?.textContent || "",
        description: item.querySelector("description")?.textContent || "",
        link: item.querySelector("link")?.textContent || "",
        pubDate: item.querySelector("pubDate")?.textContent || "",
        guid: item.querySelector("guid")?.textContent || "",
    }));
}

/**
 * 将 RSS Item 转换为 Moment
 */
export function transformRSSItemToMoment(item: RSSItem, index: number): Moment {
    // 解析 HTML 内容中的图片
    const images = extractImagesFromHTML(item.description);

    // 清理 HTML 标签，保留纯文本
    const content = stripHtml(item.description);

    return {
        id: item.guid || String(index),
        content,
        date: item.pubDate,
        link: item.link,
        images: images.length > 0 ? images : undefined,
    };
}

/**
 * 从 HTML 中提取图片 URL
 */
export function extractImagesFromHTML(html: string): string[] {
    const images: string[] = [];
    const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
    let match;

    while ((match = imgRegex.exec(html)) !== null) {
        images.push(match[1]);
    }

    return images;
}

/**
 * 去除 HTML 标签
 */
export function stripHtml(html: string): string {
    // 先替换 <br> 为换行
    let text = html.replace(/<br\s*\/?>/gi, "\n");
    // 移除所有 HTML 标签
    text = text.replace(/<[^>]+>/g, "");
    // 解码 HTML 实体
    const textarea = document.createElement("textarea");
    textarea.innerHTML = text;
    text = textarea.value;
    // 清理多余空白
    return text.trim();
}

/**
 * 格式化相对时间
 */
export function formatRelativeTime(
    dateString: string,
    minutesAgo: string = "分钟前",
    hoursAgo: string = "小时前",
    daysAgo: string = "天前"
): string {
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((Date.now() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 60) {
        return `${diffInMinutes}${minutesAgo}`;
    }
    if (diffInMinutes < 1440) {
        return `${Math.floor(diffInMinutes / 60)}${hoursAgo}`;
    }
    return `${Math.floor(diffInMinutes / 1440)}${daysAgo}`;
}

/**
 * 格式化完整日期
 */
export function formatFullDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
}
