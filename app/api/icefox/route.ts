/**
 * Icefox API route.
 * Proxies Icefox requests to avoid browser-side CORS issues.
 */
import { NextResponse } from "next/server";
import configData from "../../../config.json";

const DEFAULT_ICEFOX_API_URL = "https://m.2005815.xyz/v1/memo";

export async function GET() {
  try {
    const apiUrl = configData.momentsPage?.icefox?.apiUrl || DEFAULT_ICEFOX_API_URL;
    const response = await fetch(apiUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "application/json",
      },
      next: { revalidate: 60 },
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
