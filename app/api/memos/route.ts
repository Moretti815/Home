/**
 * Memos API 路由
 * 代理 Memos 请求，解决 CORS 问题
 */
import { NextResponse } from "next/server";

const MEMOS_API_URL = "https://m.314926.xyz/api/v1/memos";

export async function GET() {
    try {
        const response = await fetch(MEMOS_API_URL, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                "Accept": "application/json",
            },
            next: { revalidate: 60 }, // 1 分钟缓存
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: `Failed to fetch: ${response.status}` },
                { status: response.status }
            );
        }

        const data = await response.json();

        return NextResponse.json(data, {
            headers: {
                "Cache-Control": "public, max-age=60",
            },
        });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}
