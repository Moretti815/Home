/**
 * 说说滚动条 API 路由
 * 获取最新的说说数据，无缓存，每次刷新都获取最新数据
 */
import { NextResponse } from "next/server";

const MEMOS_API_URL = "https://m.314926.xyz/api/v1/memos";
const RSS_URL = "https://rsshub.261770.xyz/jike/user/07152f0c-0f65-4501-855b-031f3e20e4a5";
const TGTALK_API_URL = "https://tgtalk.kemiaosw.top/";

interface MomentItem {
    id: string;
    content: string;
    date: string;
    type: "text" | "image" | "music" | "video" | "link";
}

// 去除 HTML 标签
function stripHtml(html: string): string {
    if (!html) return "";
    return html.replace(/<[^>]*>/g, "").trim();
}

// 格式化日期
function formatDate(dateString: string): string {
    if (!dateString) return "";
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString("zh-CN", {
            month: "short",
            day: "numeric",
        });
    } catch {
        return dateString;
    }
}

// 简单的 XML 解析（不使用 DOMParser）
function parseSimpleXML(xmlText: string): Array<{ title: string; description: string; pubDate: string }> {
    const items: Array<{ title: string; description: string; pubDate: string }> = [];

    // 匹配 item 标签内容
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;

    while ((match = itemRegex.exec(xmlText)) !== null) {
        const itemContent = match[1];

        // 提取 title
        const titleMatch = itemContent.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/);
        const title = titleMatch ? titleMatch[1].trim() : "";

        // 提取 description
        const descMatch = itemContent.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/);
        const description = descMatch ? descMatch[1].trim() : "";

        // 提取 pubDate
        const dateMatch = itemContent.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
        const pubDate = dateMatch ? dateMatch[1].trim() : "";

        items.push({ title, description, pubDate });
    }

    return items;
}

// 获取 Memos 数据
async function fetchMemos(): Promise<MomentItem[]> {
    try {
        const response = await fetch(MEMOS_API_URL, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                "Accept": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`Memos API error: ${response.status}`);
        }

        const data = await response.json();
        const items: MomentItem[] = [];

        if (data && typeof data === "object" && "memos" in data) {
            const memos = (data as { memos: Array<{ id: number; content: string; createTime: string; resources?: unknown[] }> }).memos;
            memos?.forEach((memo) => {
                items.push({
                    id: String(memo.id),
                    content: stripHtml(memo.content),
                    date: formatDate(memo.createTime),
                    type: memo.resources && memo.resources.length > 0 ? "image" : "text",
                });
            });
        }

        return items;
    } catch (error) {
        console.error("[Moments Ticker] Memos fetch error:", error);
        return [];
    }
}

// 获取 Moments (RSS) 数据
async function fetchMoments(): Promise<MomentItem[]> {
    try {
        console.log(`[Moments Ticker] Fetching from RSS: ${RSS_URL}`);
        const response = await fetch(RSS_URL, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
                "Accept-Encoding": "gzip, deflate, br",
                "Connection": "keep-alive",
                "Upgrade-Insecure-Requests": "1",
                "Sec-Fetch-Dest": "document",
                "Sec-Fetch-Mode": "navigate",
                "Sec-Fetch-Site": "none",
                "Cache-Control": "max-age=0",
            },
        });

        if (!response.ok) {
            console.error(`[Moments Ticker] RSS error: ${response.status} ${response.statusText}`);
            throw new Error(`Moments API error: ${response.status}`);
        }

        const xmlText = await response.text();
        console.log(`[Moments Ticker] RSS response length: ${xmlText.length}`);

        const items: MomentItem[] = [];

        const entries = parseSimpleXML(xmlText);
        console.log(`[Moments Ticker] Parsed ${entries.length} entries`);

        entries.forEach((entry, index) => {
            items.push({
                id: `moment-${index}`,
                content: stripHtml(entry.description || entry.title),
                date: formatDate(entry.pubDate),
                type: entry.description?.includes("<img") ? "image" : "text",
            });
        });

        return items;
    } catch (error) {
        console.error("[Moments Ticker] Moments fetch error:", error);
        return [];
    }
}

// 获取 TGTalk 数据
async function fetchTGTalk(): Promise<MomentItem[]> {
    try {
        const response = await fetch(TGTALK_API_URL, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                "Accept": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`TGTalk API error: ${response.status}`);
        }

        const data = await response.json();
        const items: MomentItem[] = [];

        if (Array.isArray(data)) {
            data.forEach((item: { id?: string; content?: string; text?: string; created_at?: string; date?: string; media?: unknown[] }, index) => {
                items.push({
                    id: item.id || `tgtalk-${index}`,
                    content: stripHtml(item.content || item.text || ""),
                    date: formatDate(item.created_at || item.date || new Date().toISOString()),
                    type: item.media && item.media.length > 0 ? "image" : "text",
                });
            });
        }

        return items;
    } catch (error) {
        console.error("[Moments Ticker] TGTalk fetch error:", error);
        return [];
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const source = searchParams.get("source") || "memos";
        const maxItems = parseInt(searchParams.get("max") || "5", 10);

        console.log(`[Moments Ticker API] Source: ${source}, maxItems: ${maxItems}`);

        let items: MomentItem[] = [];

        switch (source) {
            case "memos":
                items = await fetchMemos();
                break;
            case "moments":
                items = await fetchMoments();
                break;
            case "tgtalk":
                items = await fetchTGTalk();
                break;
            default:
                return NextResponse.json(
                    { error: "Invalid source" },
                    { status: 400 }
                );
        }

        console.log(`[Moments Ticker API] Fetched ${items.length} items`);

        // 限制返回数量
        const limitedItems = items.slice(0, maxItems);

        return NextResponse.json(limitedItems, {
            headers: {
                "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
                "Pragma": "no-cache",
                "Expires": "0",
            },
        });
    } catch (error) {
        console.error("[Moments Ticker] Error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}
