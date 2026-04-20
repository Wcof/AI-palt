import { ABILITIES, type Ability, type AbilityDomain, type AbilityHotTag, type AbilityPrice } from "@/data/abilities";
import { scoreByKeywords } from "@/utils/search";

export type SortKey = "recommend" | "latest" | "calls" | "rating";

export function parseDomain(v: string | null): AbilityDomain | null {
  if (v === "NLP" || v === "LLM" || v === "MCP") return v;
  return null;
}

export function parsePrice(v: string | null): AbilityPrice | null {
  if (v === "free" || v === "paid") return v;
  return null;
}

export function parseHot(v: string | null): AbilityHotTag | null {
  if (v === "本周新增" || v === "热门" || v === "企业推荐" || v === "稳定") return v;
  return null;
}

export function parseSort(v: string | null): SortKey {
  if (v === "latest" || v === "calls" || v === "rating" || v === "recommend") return v;
  return "recommend";
}

export function parseMode(v: string | null) {
  if (v === "paged" || v === "infinite") return v;
  return "infinite";
}

export function parseTags(v: string | null) {
  return (v ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

export function sortAbilities(list: Ability[], sort: SortKey, keyword: string) {
  if (sort === "latest") return list.slice().sort((a, b) => b.version.localeCompare(a.version));
  if (sort === "calls") return list.slice().sort((a, b) => b.calls - a.calls);
  if (sort === "rating") return list.slice().sort((a, b) => b.rating - a.rating);

  const k = keyword.trim();
  if (!k) {
    return list
      .slice()
      .sort((a, b) => b.calls - a.calls)
      .sort((a, b) => b.rating - a.rating);
  }

  return list
    .map((a) => {
      const text = `${a.name} ${a.apiName} ${a.summary} ${a.tags.join(" ")}`;
      const score = scoreByKeywords(k, text);
      return { a, score };
    })
    .sort((x, y) => y.score - x.score)
    .map((x) => x.a);
}

export function filterAbilities({
  keyword,
  domain,
  hot,
  tags,
  sort,
}: {
  keyword: string;
  domain: AbilityDomain | null;
  hot: AbilityHotTag | null;
  tags: string[];
  sort: SortKey;
}) {
  let list = ABILITIES.slice();
  if (domain) list = list.filter((a) => a.domain === domain);
  if (hot) list = list.filter((a) => a.hotTag === hot);
  if (tags.length) list = list.filter((a) => tags.every((t) => a.tags.includes(t)));
  if (keyword) {
    const k = keyword.toLowerCase();
    list = list.filter((a) => {
      const text = `${a.name} ${a.apiName} ${a.summary} ${a.tags.join(" ")}`.toLowerCase();
      return scoreByKeywords(k, text) > 0;
    });
  }
  return sortAbilities(list, sort, keyword);
}

export function getAllTags() {
  const set = new Set<string>();
  for (const a of ABILITIES) {
    for (const t of a.tags) set.add(t);
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

