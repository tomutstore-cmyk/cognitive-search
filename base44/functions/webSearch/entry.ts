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

    const results = await searchDuckDuckGo(query.trim());

    return Response.json({ query, count: results.length, results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function searchDuckDuckGo(query) {
  // Try the html endpoint first
  let results = await fetchHtmlResults(query);
  if (results.length === 0) {
    results = await fetchLiteResults(query);
  }
  return results;
}

async function fetchHtmlResults(query) {
  const encoded = encodeURIComponent(query);
  const ddgUrl = `https://html.duckduckgo.com/html/?q=${encoded}`;
  const resp = await fetch(ddgUrl, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
    },
  });
  if (!resp.ok) return [];
  const html = await resp.text();
  return parseHtmlResults(html);
}

async function fetchLiteResults(query) {
  const encoded = encodeURIComponent(query);
  const ddgUrl = `https://lite.duckduckgo.com/lite/?q=${encoded}`;
  const resp = await fetch(ddgUrl, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
    },
  });
  if (!resp.ok) return [];
  const html = await resp.text();
  return parseLiteResults(html);
}

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
  try {
    const u = href.startsWith('http') ? href : `https:${href}`;
    const parsed = new URL(u);
    // Skip ad redirect links
    if (parsed.pathname === '/y.js') return null;
    const uddg = parsed.searchParams.get('uddg');
    if (uddg) return decodeURIComponent(uddg);
    // duckduckgo internal nav / sponsored
    if (/duckduckgo\.com/i.test(parsed.hostname)) return null;
    return u;
  } catch {
    return null;
  }
}

function hostOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

function isAdUrl(url) {
  return /duckduckgo\.com\/y\.js/i.test(url) || /doubleclick\.net/i.test(url);
}

function parseHtmlResults(html) {
  const out = [];
  const re =
    /<a[^>]*class="[^"]*result__a[^"]*"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?<a[^>]*class="[^"]*result__snippet[^"]*"[^>]*>([\s\S]*?)<\/a>/g;

  let m;
  while ((m = re.exec(html)) !== null) {
    const url = extractRealUrl(m[1]);
    const title = stripTags(m[2]);
    const snippet = stripTags(m[3]);
    if (!title || !url || isAdUrl(url)) continue;
    out.push({
      title,
      url,
      snippet: snippet || title,
      source: hostOf(url),
    });
    if (out.length >= 30) break;
  }

  if (out.length === 0) {
    const re2 =
      /<a[^>]*class="[^"]*result__a[^"]*"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g;
    while ((m = re2.exec(html)) !== null) {
      const url = extractRealUrl(m[1]);
      const title = stripTags(m[2]);
      if (!title || !url || isAdUrl(url)) continue;
      out.push({ title, url, snippet: title, source: hostOf(url) });
      if (out.length >= 30) break;
    }
  }

  return out;
}

// Lite endpoint uses a simple table layout:
// <a class="result-link" href="...">title</a> ... <td class="result-snippet">snippet</td>
function parseLiteResults(html) {
  const out = [];
  const re =
    /<a[^>]*class="[^"]*result-link[^"]*"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?<td[^>]*class="[^"]*result-snippet[^"]*"[^>]*>([\s\S]*?)<\/td>/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    const url = extractRealUrl(m[1]);
    const title = stripTags(m[2]);
    const snippet = stripTags(m[3]);
    if (!title || !url || isAdUrl(url)) continue;
    out.push({
      title,
      url,
      snippet: snippet || title,
      source: hostOf(url),
    });
    if (out.length >= 30) break;
  }

  if (out.length === 0) {
    const re2 =
      /<a[^>]*class="[^"]*result-link[^"]*"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g;
    while ((m = re2.exec(html)) !== null) {
      const url = extractRealUrl(m[1]);
      const title = stripTags(m[2]);
      if (!title || !url || isAdUrl(url)) continue;
      out.push({ title, url, snippet: title, source: hostOf(url) });
      if (out.length >= 30) break;
    }
  }

  return out;
}