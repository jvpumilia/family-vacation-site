import { NextResponse } from "next/server";
import ogs from "open-graph-scraper";

export async function POST(req: Request) {
  try {
    const { url } = (await req.json()) as { url?: string };
    if (!url) return NextResponse.json({ error: "url required" }, { status: 400 });
    const { result, error } = await ogs({ url, timeout: 8000 });
    if (error) {
      return NextResponse.json({
        ok: false,
        fallback: true,
        title: null,
        description: null,
        image: null,
        message: "Could not extract OG tags (Airbnb/VRBO often block scrapers). Fill fields manually.",
      });
    }
    return NextResponse.json({
      ok: true,
      fallback: false,
      title: result.ogTitle || result.twitterTitle || result.dcTitle || null,
      description: result.ogDescription || result.twitterDescription || null,
      image: result.ogImage?.[0]?.url || result.twitterImage?.[0]?.url || null,
    });
  } catch {
    return NextResponse.json({
      ok: false,
      fallback: true,
      title: null,
      description: null,
      image: null,
      message: "Fetch failed — enter details manually.",
    });
  }
}
