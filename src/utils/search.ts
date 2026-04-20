export function normalizeQuery(raw: string) {
  return raw.trim().replace(/\s+/g, " ");
}

export function splitKeywords(query: string) {
  const normalized = normalizeQuery(query);
  if (!normalized) return [];
  return normalized
    .split(" ")
    .map((k) => k.trim())
    .filter(Boolean);
}

export function fuzzyScore(query: string, text: string) {
  const q = query.trim().toLowerCase();
  const t = text.toLowerCase();
  if (!q) return 0;
  if (t === q) return 100;
  if (t.startsWith(q)) return 80;
  const idx = t.indexOf(q);
  if (idx >= 0) return 60 - Math.min(idx, 24);
  let ti = 0;
  let hits = 0;
  for (let qi = 0; qi < q.length; qi += 1) {
    const ch = q[qi];
    const found = t.indexOf(ch, ti);
    if (found === -1) return 0;
    hits += 1;
    ti = found + 1;
  }
  return 30 + Math.min(hits, 10);
}

export function scoreByKeywords(query: string, text: string) {
  const keys = splitKeywords(query);
  if (!keys.length) return 0;
  let score = 0;
  for (const k of keys) {
    score += fuzzyScore(k, text);
  }
  return score;
}

export function getKeywordFromUrl(searchParams: URLSearchParams) {
  return (searchParams.get("keyword") ?? searchParams.get("q") ?? "").trim();
}

export function setKeywordToUrl(searchParams: URLSearchParams, keyword: string) {
  const next = new URLSearchParams(searchParams);
  const k = keyword.trim();
  if (!k) {
    next.delete("keyword");
    next.delete("q");
    return next;
  }
  next.set("keyword", k);
  next.delete("q");
  return next;
}

export function highlightParts(text: string, query: string) {
  const keys = splitKeywords(query);
  if (!keys.length) return [{ text, highlight: false }];

  const lower = text.toLowerCase();
  const ranges: Array<{ start: number; end: number }> = [];
  for (const kRaw of keys) {
    const k = kRaw.toLowerCase();
    if (!k) continue;
    let from = 0;
    while (from < lower.length) {
      const idx = lower.indexOf(k, from);
      if (idx === -1) break;
      ranges.push({ start: idx, end: idx + k.length });
      from = idx + k.length;
    }
  }

  if (!ranges.length) return [{ text, highlight: false }];
  ranges.sort((a, b) => a.start - b.start);
  const merged: Array<{ start: number; end: number }> = [];
  for (const r of ranges) {
    const last = merged[merged.length - 1];
    if (!last || r.start > last.end) {
      merged.push({ ...r });
    } else {
      last.end = Math.max(last.end, r.end);
    }
  }

  const parts: Array<{ text: string; highlight: boolean }> = [];
  let pos = 0;
  for (const r of merged) {
    if (pos < r.start) {
      parts.push({ text: text.slice(pos, r.start), highlight: false });
    }
    parts.push({ text: text.slice(r.start, r.end), highlight: true });
    pos = r.end;
  }
  if (pos < text.length) {
    parts.push({ text: text.slice(pos), highlight: false });
  }
  return parts;
}
