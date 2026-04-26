import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const country = searchParams.get("country");

  if (!country) {
    return NextResponse.json({ articles: [] });
  }

  try {
    const query = encodeURIComponent(`"${country}"`);
    const url = `https://api.gdeltproject.org/api/v2/doc/doc?query=${query}&mode=ArtList&maxrecords=10&format=json`;

    const res = await fetch(url, {
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      return NextResponse.json({ articles: [] });
    }

    const data = await res.json();

    const articles =
      data.articles?.map((article: any) => ({
        title: article.title,
        url: article.url,
        domain: article.domain,
        seendate: article.seendate,
        sourceCountry: article.sourceCountry,
      })) || [];

    return NextResponse.json({ articles });
  } catch {
    return NextResponse.json({ articles: [] });
  }
}