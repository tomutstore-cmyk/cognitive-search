import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    let query = '';
    try {
      const body = await req.json();
      query = (body?.query || '').toString();
    } catch {
      const url = new URL(req.url);
      query = url.searchParams.get('query') || '';
    }

    if (!query.trim()) {
      return Response.json({ error: 'Query is required' }, { status: 400 });
    }

    const encoded = encodeURIComponent(query.trim());
    const ddgUrl = `https://html.duckduckgo.com/html/?q=${encoded}`;

    const resp = await fetch(ddgUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    if (!resp.ok) {
      return Response.json(
        { error: `Search provider error: ${resp.status}` },
        { status: 502 }
      );
    }

    const html = await resp.text();
    const results = parseResults(html, query);

    return Response.json({ query, count: results.length, results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function decodeEntities(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

function stripTags(str) {
  return decodeEntities(str.replace(/<[^>]*>/g, '')).replace(/\s+/g, ' ').trim();
}

function extractRealUrl(href) {
  // DuckDuckGo wraps links as //duckduckgo.com/l/?uddg=ENCODED&rut=...
  try {
    const u = href.startsWith('http') ? href : `https:${href}`;
    const parsed = new URL(u);
    const uddg = parsed.searchParams.get('uddg');
    if (uddg) return decodeURIComponent(uddg);
    return u;
  } catch {
    return href;
  }
}

function hostOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

function parseResults(html, query) {
  const out = [];
  // Each organic result block contains a result__a link and a result__snippet
  const re =
    /<a[^>]*class="[^"]*result__a[^"]*"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?<a[^>]*class="[^"]*result__snippet[^"]*"[^>]*>([\s\S]*?)<\/a>/g;

  let m;
  while ((m = re.exec(html)) !== null) {
    const url = extractRealUrl(m[1]);
    const title = stripTags(m[2]);
    const snippet = stripTags(m[3]);
    if (!title || !url) continue;
    // skip internal duckduckgo nav links
    if (/duckduckgo\.com\/?(\?|$)/i.test(url)) continue;
    out.push({
      title,
      url,
      snippet: snippet || title,
      source: hostOf(url),
    });
    if (out.length >= 30) break;
  }

  // Fallback: some layouts use result__url instead of snippets
  if (out.length === 0) {
    const re2 =
      /<a[^>]*class="[^"]*result__a[^"]*"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g;
    while ((m = re2.exec(html)) !== null) {
      const url = extractRealUrl(m[1]);
      const title = stripTags(m[2]);
      if (!title || !url) continue;
      out.push({ title, url, snippet: title, source: hostOf(url) });
      if (out.length >= 30) break;
    }
  }

  return out;
}