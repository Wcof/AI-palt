export type KnowledgeDocStatus = "ready" | "processing" | "failed";

export type KnowledgeDoc = {
  id: string;
  kbId: string;
  title: string;
  summary: string;
  status: KnowledgeDocStatus;
  uploadedAt: number;
};

export const KNOWLEDGE_DOCS: KnowledgeDoc[] = [
  {
    id: "doc-sp-001",
    kbId: "kb-safety-production",
    title: "安全生产法律法规汇编",
    summary: "涵盖《安全生产法》《职业病防治法》等核心法规条文及解读要点。",
    status: "ready",
    uploadedAt: Date.parse("2025-09-05T09:00:00Z"),
  },
  {
    id: "doc-sp-002",
    kbId: "kb-safety-production",
    title: "重大事故隐患判定标准与整改规程",
    summary: "针对化工、工贸、建筑等行业重大隐患场景的判定口径与整改措施指引。",
    status: "ready",
    uploadedAt: Date.parse("2025-09-18T10:30:00Z"),
  },
  {
    id: "doc-sp-003",
    kbId: "kb-safety-production",
    title: "安全生产事故案例与教训汇编",
    summary: "典型事故原因分析、追责机制与风险预警清单，助力举一反三防范事故复发。",
    status: "ready",
    uploadedAt: Date.parse("2025-10-01T08:15:00Z"),
  },
  {
    id: "doc-sp-004",
    kbId: "kb-safety-production",
    title: "安全生产标准化达标评审手册",
    summary: "标准化评审维度、制度体系建设要求与现场检查核查清单。",
    status: "ready",
    uploadedAt: Date.parse("2025-10-10T14:00:00Z"),
  },
  {
    id: "doc-sp-005",
    kbId: "kb-safety-production",
    title: "隐患排查治理体系建设指南",
    summary: "隐患排查流程设计、分级管控机制与信息化台账管理要求。",
    status: "processing",
    uploadedAt: Date.parse("2025-10-20T11:45:00Z"),
  },
];

