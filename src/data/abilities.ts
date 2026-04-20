import type { Component } from "vue";
import { Search, Brain, Database, AlertTriangle } from "lucide-vue-next";

export type AbilityDomain = "NLP" | "LLM" | "MCP";
export type AbilityPrice = "free" | "paid";
export type AbilityHotTag = "本周新增" | "热门" | "企业推荐" | "稳定";

export type Ability = {
  id: string;
  name: string;
  apiName: string;
  domain: AbilityDomain;
  summary: string;
  tags: string[];
  hotTag: AbilityHotTag;
  version: string;
  calls: number;
  rating: number;
  price: AbilityPrice;
  icon: Component;
};

export const ABILITIES: Ability[] = [
  // AI知识库（NLP）- 仅保留一个
  { id: "kb-safety-production", name: "AI知识库", apiName: "kb-safety-production", domain: "NLP", summary: "汇聚安全生产法规、操作规程、事故案例与隐患排查标准，支持全领域智能问答与合规检索。", tags: ["safety", "knowledge", "compliance"], hotTag: "企业推荐", version: "v2.0.0", calls: 32800, rating: 4.9, price: "free", icon: Search },

  // AI 智能体（LLM）- EHS 智能体、NL2SQL、隐患识别
  { id: "llm-ehs-api", name: "EHS 智能体", apiName: "ehs-llm-api", domain: "LLM", summary: "面向安全生产的智能问答与合规助手，问一句就给可执行建议。", tags: ["ehs", "llm", "safety"], hotTag: "热门", version: "v1.0.4", calls: 245600, rating: 4.7, price: "paid", icon: Brain },
  { id: "llm-nl2sql", name: "NL2SQL", apiName: "nl2sql-llm-api", domain: "LLM", summary: "将自然语言问题自动转换为 SQL 查询语句，支持安全生产数据库智能问数，无需编写代码即可完成数据分析。", tags: ["nl2sql", "database", "analytics"], hotTag: "企业推荐", version: "v1.2.0", calls: 98400, rating: 4.8, price: "paid", icon: Database },
  { id: "llm-hazard-detection", name: "隐患识别", apiName: "hazard-detection-llm-api", domain: "LLM", summary: "基于 AI 视觉与语义分析，自动识别作业现场安全隐患，生成隐患报告与整改建议，助力安全风险管控。", tags: ["hazard", "safety", "detection"], hotTag: "热门", version: "v1.0.1", calls: 67200, rating: 4.7, price: "paid", icon: AlertTriangle },
];

export const DOMAIN_LABEL: Record<AbilityDomain, string> = {
  NLP: "AI知识库",
  LLM: "AI 智能体",
  MCP: "AI 技能",
};

export const PRICE_LABEL: Record<AbilityPrice, string> = {
  free: "免费",
  paid: "付费",
};
