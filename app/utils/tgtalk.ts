/**
 * TGTalk 工具函数
 */

import type { TGTalkItem } from "../types/tgtalk";

/**
 * 格式化相对时间
 */
export function formatRelativeTime(
    timestamp: number,
    minutesAgo: string = "分钟前",
    hoursAgo: string = "小时前",
    daysAgo: string = "天前"
): string {
    const diffInMinutes = Math.floor((Date.now() - timestamp) / (1000 * 60));

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
export function formatFullDate(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleString("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
}

/**
 * 从 TGTalk 内容中提取标签
 * 格式：<a href="?q=%23标签">#标签</a>
 */
export function extractTags(text: string): string[] {
    const tagRegex = /<a href="\?q=%23[^"]+">#([^<]+)<\/a>/g;
    const tags: string[] = [];
    let match;

    while ((match = tagRegex.exec(text)) !== null) {
        tags.push(match[1]);
    }

    return tags;
}

/**
 * 清理 TGTalk 内容
 * - 移除标签链接
 * - 保留其他 HTML
 * - 处理 emoji 图片
 */
export function cleanContent(text: string): string {
    // 移除标签链接，保留标签文字
    let cleaned = text.replace(/<a href="\?q=%23[^"]+">#([^<]+)<\/a>/g, "#$1");

    // 处理 Telegram emoji 图片 - 保留 emoji 字符，移除图片
    // 格式：<i class="emoji" style="background-image:url('//telegram.org/img/emoji/40/F09FA4AE.png')"><b>🤮</b></i>
    cleaned = cleaned.replace(
        /<i class="emoji"[^>]*><b>([^<]+)<\/b><\/i>/g,
        "$1"
    );

    return cleaned;
}

/**
 * 过滤图片列表
 * - 移除 Telegram emoji 图片（以 //telegram.org 开头的）
 * - 保留真实图片
 */
export function filterImages(images: string[]): string[] {
    return images.filter((img) => {
        // 过滤掉 Telegram emoji 图片
        if (img.startsWith("//telegram.org/img/emoji")) {
            return false;
        }
        return true;
    });
}

/**
 * 获取所有唯一的标签
 */
export function getAllTags(items: TGTalkItem[]): string[] {
    const tagSet = new Set<string>();

    items.forEach((item) => {
        const tags = extractTags(item.text);
        tags.forEach((tag) => tagSet.add(tag));
    });

    return Array.from(tagSet).sort();
}

/**
 * 按标签筛选 TGTalk 数据
 */
export function filterItemsByTag(items: TGTalkItem[], tag: string): TGTalkItem[] {
    if (tag === "all") return items;
    return items.filter((item) => {
        const tags = extractTags(item.text);
        return tags.includes(tag);
    });
}

/**
 * 确保图片 URL 完整
 */
export function ensureFullUrl(url: string): string {
    if (url.startsWith("//")) {
        return `https:${url}`;
    }
    if (url.startsWith("http")) {
        return url;
    }
    return url;
}
