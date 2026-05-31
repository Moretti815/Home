/**
 * 说说数据 API 路由
 * 代理 RSSHub 请求，解决 CORS 问题
 */
import { NextResponse } from "next/server";

const RSS_URL = "https://rsshub.261770.xyz/jike/user/07152f0c-0f65-4501-855b-031f3e20e4a5";

export async function GET() {
    try {
        const response = await fetch(RSS_URL, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            },
            next: { revalidate: 300 }, // 5 分钟缓存
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: `Failed to fetch: ${response.status}` },
                { status: response.status }
            );
        }

        const xmlText = await response.text();

        return new NextResponse(xmlText, {
            headers: {
                "Content-Type": "application/xml",
                "Cache-Control": "public, max-age=300",
            },
        });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}
