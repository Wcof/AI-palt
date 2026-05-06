import type { Component } from "vue";
import { Search, Brain, Database, AlertTriangle, FileText, Wrench } from "lucide-vue-next";

export type AbilityDomain = "NLP" | "LLM" | "MCP" | "AGENT";
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
  updateTime: string;
  remark: string;
};

export const ABILITIES: Ability[] = [
  { id: "kb-safety-production", name: "AI知识库", apiName: "kb-safety-production", domain: "NLP", summary: "汇聚安全生产法规、操作规程、事故案例与隐患排查标准，支持全领域智能问答与合规检索。", tags: ["safety", "knowledge", "compliance"], hotTag: "企业推荐", version: "v2.0.0", calls: 32800, rating: 4.9, price: "free", icon: Search, updateTime: "2026-04-01 09:29:00", remark: "安全生产知识库智能问答系统" },
  { id: "llm-ehs-api", name: "EHS 智能体", apiName: "ehs-llm-api", domain: "LLM", summary: "面向安全生产的智能问答与合规助手，问一句就给可执行建议。", tags: ["ehs", "llm", "safety"], hotTag: "热门", version: "v1.0.4", calls: 245600, rating: 4.7, price: "paid", icon: Brain, updateTime: "2026-04-01 09:29:00", remark: "安全生产智能问答助手" },
  { id: "llm-nl2sql", name: "NL2SQL", apiName: "nl2sql-llm-api", domain: "LLM", summary: "执行NL2SQL查询并按标准SSE输出thinking与最终结构化data。", tags: ["nl2sql", "database", "analytics"], hotTag: "企业推荐", version: "v1.2.0", calls: 98400, rating: 4.8, price: "paid", icon: Database, updateTime: "2026-04-01 09:29:34", remark: "执行NL2SQL查询并按标准SSE输出thinking与最终结构化data。" },
  { id: "llm-hazard-detection", name: "隐患识图", apiName: "hazard-detection-llm-api", domain: "LLM", summary: "基于图片与知识库检索执行隐患识别。", tags: ["hazard", "safety", "detection", "image"], hotTag: "热门", version: "v1.0.1", calls: 67200, rating: 4.7, price: "paid", icon: AlertTriangle, updateTime: "2026-04-01 09:29:40", remark: "基于图片与知识库检索执行隐患识别。" },
  { id: "llm-rag-retrieval", name: "RAG检索", apiName: "rag-retrieval-llm-api", domain: "LLM", summary: "基于知识库检索的多步RAGAgent，对用户问题执行问题拆分、检索、证据筛选与最终总结。", tags: ["rag", "retrieval", "knowledge"], hotTag: "本周新增", version: "v1.0.0", calls: 12500, rating: 4.9, price: "paid", icon: Search, updateTime: "2026-04-01 09:30:46", remark: "基于知识库检索的多步RAGAgent，对用户问题执行问题拆分、检索、证据筛选与最终总结。" },
  { id: "mcp-tool-registry", name: "MCP 工具注册", apiName: "mcp-tool-registry", domain: "MCP", summary: "MCP/Skill 统一管理示例，支持 Skill.md 文档装载与简版详情展示。", tags: ["mcp", "skill", "tool"], hotTag: "稳定", version: "v0.1.0", calls: 8600, rating: 4.6, price: "paid", icon: Wrench, updateTime: "2026-04-20 11:00:00", remark: "MCP Skill 管理与展示能力" },
  { id: "agent-report-writer", name: "报告生成 Agent", apiName: "report-writer-agent", domain: "AGENT", summary: "模板 + 输入描述 + NL2SQL 结果引用，输出 Markdown 报告。", tags: ["report", "template", "nl2sql"], hotTag: "本周新增", version: "v0.1.0", calls: 3200, rating: 4.7, price: "paid", icon: FileText, updateTime: "2026-04-20 11:00:00", remark: "报告生成双栏链路" },
];

export const DOMAIN_LABEL: Record<AbilityDomain, string> = {
  NLP: "AI知识库",
  LLM: "AI 智能体",
  MCP: "AI 技能",
  AGENT: "AI 智能体",
};

export const PRICE_LABEL: Record<AbilityPrice, string> = {
  free: "免费",
  paid: "付费",
};
