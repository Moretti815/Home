/**
 * Memos 工具函数
 */

import type { Memo, MemoAttachment } from "../types/memo";

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

/**
 * 从 Memos 内容中提取标签
 */
export function extractTags(content: string): string[] {
    const tagRegex = /#([^\s#]+)/g;
    const tags: string[] = [];
    let match;

    while ((match = tagRegex.exec(content)) !== null) {
        tags.push(match[1]);
    }

    return tags;
}

/**
 * 移除内容中的标签
 */
export function removeTags(content: string): string {
    return content.replace(/#[^\s#]+\s*/g, "").trim();
}

/**
 * 获取所有唯一的标签
 */
export function getAllTags(memos: Memo[]): string[] {
    const tagSet = new Set<string>();

    memos.forEach((memo) => {
        memo.tags.forEach((tag) => tagSet.add(tag));
    });

    return Array.from(tagSet).sort();
}

/**
 * 按标签筛选 Memos
 */
export function filterMemosByTag(memos: Memo[], tag: string): Memo[] {
    if (tag === "all") return memos;
    return memos.filter((memo) => memo.tags.includes(tag));
}

/**
 * 获取图片 URL
 */
export function getImageUrl(attachment: MemoAttachment, baseUrl: string = "https://m.314926.xyz"): string {
    return `${baseUrl}/file/${attachment.name}/${attachment.filename}`;
}

/**
 * 判断是否为图片附件
 */
export function isImageAttachment(attachment: MemoAttachment): boolean {
    return attachment.type.startsWith("image/");
}
