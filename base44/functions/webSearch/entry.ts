// Web search powered by the user's own OpenAI API key (no Base44 AI quota used).
// Uses the Responses API with the web_search tool, then extracts real URLs from
// the citation annotations in the model's grounded answer.

Deno.serve(async (req) => {
  try {
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

    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) {
      return Response.json({ error: 'OPENAI_API_KEY not set' }, { status: 500 });
    }

    const resp = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        tools: [{ type: 'web_search' }],
        instructions:
          "You are a web search engine. For the given query, search the web and write a concise, factual summary that cites the most relevant real web pages. Cite each distinct source with an inline URL citation. Aim for up to 10 distinct, high-quality sources, ordered by relevance. Only cite real pages found via search — never invent URLs.",
        input: query.trim(),
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      return Response.json({ error: `OpenAI error: ${errText}` }, { status: 502 });
    }

    const data = await resp.json();

    let text = '';
    const annotations = [];
    for (const item of data.output || []) {
      if (item.type === 'message' && Array.isArray(item.content)) {
        for (const c of item.content) {
          if (c.type === 'output_text') {
            text = c.text || '';
            if (Array.isArray(c.annotations)) annotations.push(...c.annotations);
          }
        }
      }
    }

    const results = [];
    const seen = new Set();
    for (const ann of annotations) {
      if (ann.type !== 'url_citation' || !ann.url) continue;
      const url = cleanUrl(ann.url);
      if (seen.has(url)) continue;
      seen.add(url);
      results.push({
        title: ann.title || hostOf(url),
        url,
        snippet: makeSnippet(text, ann.start_index),
        source: hostOf(url),
      });
      if (results.length >= 10) break;
    }

    return Response.json({ query, count: results.length, results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function hostOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

// Strip OpenAI tracking params and normalise the URL.
function cleanUrl(raw) {
  try {
    const u = new URL(raw);
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach((p) =>
      u.searchParams.delete(p)
    );
    if (Array.from(u.searchParams.keys()).length === 0) {
      return u.origin + u.pathname + u.hash;
    }
    return u.origin + u.pathname + u.search + u.hash;
  } catch {
    return raw;
  }
}

// Use the text leading up to the citation as a snippet.
function makeSnippet(text, start) {
  if (!text || start == null) return '';
  const s = Math.max(0, start - 220);
  let seg = text.slice(s, start).replace(/\s+/g, ' ').trim();
  const dot = seg.lastIndexOf('. ');
  if (dot > 40) seg = seg.slice(dot + 2);
  if (seg.length > 200) seg = seg.slice(-200).trim();
  return seg;
}