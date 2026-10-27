import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const targetUrl = searchParams.get('url');

  if (!targetUrl) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(targetUrl);
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return NextResponse.json({ error: 'Invalid URL protocol' }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: 'Malformed URL' }, { status: 400 });
  }

  const defaultFavicon = `https://www.google.com/s2/favicons?domain=${parsedUrl.hostname}&sz=128`;
  const fallbackResponse = {
    success: true,
    url: targetUrl,
    title: parsedUrl.hostname.replace(/^www\./, ''),
    description: `Web link to ${parsedUrl.hostname}`,
    siteName: parsedUrl.hostname.replace(/^www\./, ''),
    favicon: defaultFavicon,
    image: null,
  };

  try {
    const res = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml',
      },
      signal: AbortSignal.timeout(6000),
      redirect: 'follow',
    });

    if (!res.ok) {
      return NextResponse.json(fallbackResponse);
    }

    const html = await res.text();

    // Helper regex extractors
    const getMeta = (prop: string) => {
      const match =
        html.match(new RegExp(`<meta[^>]*property=["'](?:og:|twitter:)?${prop}["'][^>]*content=["']([^"']+)["']`, 'i')) ||
        html.match(new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*property=["'](?:og:|twitter:)?${prop}["']`, 'i')) ||
        html.match(new RegExp(`<meta[^>]*name=["'](?:twitter:)?${prop}["'][^>]*content=["']([^"']+)["']`, 'i'));
      return match ? match[1].trim() : null;
    };

    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = getMeta('title') || (titleMatch ? titleMatch[1].trim() : parsedUrl.hostname);
    const description = getMeta('description') || `Web page on ${parsedUrl.hostname}`;
    let image = getMeta('image');
    const siteName = getMeta('site_name') || parsedUrl.hostname.replace(/^www\./, '');

    // Resolve relative image URLs
    if (image && !image.startsWith('http')) {
      try {
        image = new URL(image, targetUrl).toString();
      } catch {
        image = null;
      }
    }

    return NextResponse.json({
      success: true,
      url: targetUrl,
      title,
      description,
      siteName,
      image: image || null,
      favicon: defaultFavicon,
    });
  } catch (err) {
    console.warn(`Link preview fallback for ${targetUrl}:`, err);
    return NextResponse.json(fallbackResponse);
  }
}
