# 代码与 PRD 一致性审计

> 审计日期：2026-05-28
> 审计级别：strict

## 审计结论

共发现 62 个问题，其中高优先级（P2+）0 个。

## 不一致问题清单

| 优先级 | 问题类型 | 文件/页面 | 表现 | 建议修复 |
|---|---|---|---|---|
| P1 | 变更记录引用不存在功能 | `docs/product/changelog/newAI-agent-change.md` | newAI-agent-change->feat-agent-list | 修正 affected_feature_ids |
| P1 | 变更记录引用不存在功能 | `docs/product/changelog/newAI-apiKey-change.md` | newAI-apiKey-change->feat-api-key | 修正 affected_feature_ids |
| P1 | 变更记录引用不存在功能 | `docs/product/changelog/newAI-assistant-change.md` | newAI-assistant-change-20260525-a->feat-assistant-clarification | 修正 affected_feature_ids |
| P1 | 变更记录引用不存在功能 | `docs/product/changelog/newAI-assistant-change.md` | newAI-assistant-change->feat-assistant-agent | 修正 affected_feature_ids |
| P1 | 变更记录引用不存在功能 | `docs/product/changelog/newAI-assistant-change.md` | newAI-assistant-change->feat-assistant-feedback | 修正 affected_feature_ids |
| P1 | 变更记录引用不存在功能 | `docs/product/changelog/newAI-assistant-change.md` | newAI-assistant-change->feat-assistant-context | 修正 affected_feature_ids |
| P1 | 变更记录引用不存在功能 | `docs/product/changelog/newAI-assistant-change.md` | newAI-assistant-change->feat-assistant-ocr | 修正 affected_feature_ids |
| P1 | 变更记录引用不存在功能 | `docs/product/changelog/newAI-assistant-change.md` | newAI-assistant-change->feat-assistant-model | 修正 affected_feature_ids |
| P1 | 变更记录引用不存在功能 | `docs/product/changelog/newAI-assistant-change.md` | newAI-assistant-change-20260525->feat-assistant-feedback | 修正 affected_feature_ids |
| P1 | 变更记录引用不存在功能 | `docs/product/changelog/newAI-assistant-change.md` | newAI-assistant-change-20260525->feat-assistant-context | 修正 affected_feature_ids |
| P1 | 变更记录引用不存在功能 | `docs/product/changelog/newAI-assistant-change.md` | newAI-assistant-change-20260525->feat-assistant-rewrite | 修正 affected_feature_ids |
| P1 | 变更记录引用不存在功能 | `docs/product/changelog/newAI-assistant-change.md` | newAI-assistant-change-20260525-b->feat-assistant-feedback | 修正 affected_feature_ids |
| P1 | 变更记录引用不存在功能 | `docs/product/changelog/newAI-assistant-change.md` | newAI-assistant-change-20260526-b->feat-auth-register | 修正 affected_feature_ids |
| P1 | 变更记录引用不存在功能 | `docs/product/changelog/newAI-assistant-change.md` | newAI-assistant-change-20260525-c->feat-assistant-feedback | 修正 affected_feature_ids |
| P1 | 变更记录引用不存在功能 | `docs/product/changelog/newAI-assistant-change.md` | newAI-assistant-change-20260525-c->feat-assistant-rewrite | 修正 affected_feature_ids |
| P1 | 变更记录引用不存在功能 | `docs/product/changelog/newAI-assistant-change.md` | newAI-assistant-change-20260526-c->feat-auth-register | 修正 affected_feature_ids |
| P1 | 变更记录引用不存在功能 | `docs/product/changelog/newAI-assistant-change.md` | newAI-assistant-change-20260526-d->feat-assistant-rewrite | 修正 affected_feature_ids |
| P1 | 变更记录引用不存在功能 | `docs/product/changelog/newAI-assistant-change.md` | newAI-assistant-change-20260526-d->feat-assistant-session-actions | 修正 affected_feature_ids |
| P1 | 变更记录引用不存在功能 | `docs/product/changelog/newAI-assistant-change.md` | newAI-assistant-change-20260527-a->feat-auth-register | 修正 affected_feature_ids |
| P1 | 变更记录引用不存在功能 | `docs/product/changelog/newAI-assistant-change.md` | newAI-assistant-change-20260527-b->feat-auth-register | 修正 affected_feature_ids |
| P1 | 变更记录引用不存在功能 | `docs/product/changelog/newAI-assistant-change.md` | newAI-assistant-change-20260527-c->feat-auth-register | 修正 affected_feature_ids |
| P1 | 变更记录引用不存在功能 | `docs/product/changelog/newAI-knowledge-change.md` | newAI-knowledge-change->feat-knowledge-list | 修正 affected_feature_ids |
| P1 | 变更记录引用不存在功能 | `docs/product/changelog/newAI-mcp-change.md` | newAI-mcp-change->feat-mcp-test | 修正 affected_feature_ids |
| P1 | 变更记录引用不存在功能 | `docs/product/changelog/newAI-system-change.md` | newAI-system-change->feat-license-template | 修正 affected_feature_ids |
| P1 | 变更记录引用不存在功能 | `docs/product/changelog/newAI-system-change.md` | newAI-system-change->feat-license-instance | 修正 affected_feature_ids |
| P1 | 变更记录引用不存在功能 | `docs/product/changelog/newAI-system-change.md` | newAI-system-change->feat-license-account | 修正 affected_feature_ids |
| P1 | 变更记录引用不存在功能 | `docs/product/changelog/newAI-system-change.md` | newAI-system-change->feat-cocreation-list | 修正 affected_feature_ids |
| P1 | 变更记录引用不存在功能 | `docs/product/changelog/newAI-system-change.md` | newAI-system-change->feat-audit-log | 修正 affected_feature_ids |
| P1 | 变更记录引用不存在功能 | `docs/product/changelog/newAI-system-change.md` | newAI-system-change->feat-usage-analysis | 修正 affected_feature_ids |
| P1 | 变更记录引用不存在功能 | `docs/product/changelog/newAI-system-change.md` | newAI-system-change->feat-backup-snapshot | 修正 affected_feature_ids |
| P1 | 变更记录引用不存在功能 | `docs/product/changelog/newAI-system-change.md` | newAI-system-change-20260525->feat-license-template | 修正 affected_feature_ids |
| P1 | 变更记录引用不存在功能 | `docs/product/changelog/newAI-system-change.md` | newAI-system-change-20260525->feat-license-instance | 修正 affected_feature_ids |
| P1 | 变更记录引用不存在功能 | `docs/product/changelog/newAI-system-change.md` | newAI-system-change-20260525->feat-license-account | 修正 affected_feature_ids |
| P1 | 变更记录引用不存在功能 | `docs/product/changelog/newAI-system-change.md` | newAI-system-change-20260525->feat-cocreation-list | 修正 affected_feature_ids |
| P1 | 变更记录引用不存在功能 | `docs/product/changelog/newAI-system-change.md` | newAI-system-change-20260525->feat-audit-log | 修正 affected_feature_ids |
| P1 | 变更记录引用不存在功能 | `docs/product/changelog/newAI-system-change.md` | newAI-system-change-20260525->feat-usage-analysis | 修正 affected_feature_ids |
| P1 | 变更记录引用不存在功能 | `docs/product/changelog/newAI-system-change.md` | newAI-system-change-20260525->feat-backup-snapshot | 修正 affected_feature_ids |
| P1 | 变更记录引用不存在功能 | `docs/product/changelog/newAI-system-change.md` | newAI-system-change-20260525-b->feat-license-template | 修正 affected_feature_ids |
| P1 | 变更记录引用不存在功能 | `docs/product/changelog/newAI-system-change.md` | newAI-system-change-20260525-b->feat-license-instance | 修正 affected_feature_ids |
| P1 | 变更记录引用不存在功能 | `docs/product/changelog/newAI-system-change.md` | newAI-system-change-20260525-b->feat-license-account | 修正 affected_feature_ids |
| P1 | 变更记录引用不存在功能 | `docs/product/changelog/newAI-system-change.md` | newAI-system-change-20260525-c->feat-assistant-model | 修正 affected_feature_ids |
| P1 | 变更记录引用不存在功能 | `docs/product/changelog/newAI-system-change.md` | newAI-system-change-20260525-d->feat-license-template | 修正 affected_feature_ids |
| P1 | 变更记录引用不存在功能 | `docs/product/changelog/newAI-system-change.md` | newAI-system-change-20260525-d->feat-license-instance | 修正 affected_feature_ids |
| P1 | 变更记录引用不存在功能 | `docs/product/changelog/newAI-system-change.md` | newAI-system-change-20260525-d->feat-license-account | 修正 affected_feature_ids |
| P1 | 变更记录引用不存在功能 | `docs/product/changelog/newAI-system-change.md` | newAI-system-change-20260525-e->feat-license-template | 修正 affected_feature_ids |
| P1 | 变更记录引用不存在功能 | `docs/product/changelog/newAI-system-change.md` | newAI-system-change-20260525-e->feat-license-instance | 修正 affected_feature_ids |
| P1 | 变更记录引用不存在功能 | `docs/product/changelog/newAI-system-change.md` | newAI-system-change-20260525-e->feat-license-account | 修正 affected_feature_ids |
| P1 | 变更记录引用不存在功能 | `docs/product/changelog/newAI-system-change.md` | newAI-system-change-20260525-f->feat-license-template | 修正 affected_feature_ids |
| P1 | 变更记录引用不存在功能 | `docs/product/changelog/newAI-system-change.md` | newAI-system-change-20260525-f->feat-license-instance | 修正 affected_feature_ids |
| P1 | 变更记录引用不存在功能 | `docs/product/changelog/newAI-system-change.md` | newAI-system-change-20260525-f->feat-license-account | 修正 affected_feature_ids |
| P1 | 变更记录引用不存在功能 | `docs/product/changelog/newAI-system-change.md` | newAI-system-change-20260525-g->feat-license-template | 修正 affected_feature_ids |
| P1 | 变更记录引用不存在功能 | `docs/product/changelog/newAI-system-change.md` | newAI-system-change-20260525-g->feat-license-instance | 修正 affected_feature_ids |
| P1 | 变更记录引用不存在功能 | `docs/product/changelog/newAI-system-change.md` | newAI-system-change-20260525-g->feat-license-account | 修正 affected_feature_ids |
| P1 | 变更记录引用不存在功能 | `docs/product/changelog/newAI-system-change.md` | newAI-system-change-20260525-i->feat-cocreation-list | 修正 affected_feature_ids |
| P1 | 变更记录引用不存在功能 | `docs/product/changelog/newAI-system-change.md` | newAI-system-change-20260525-j->feat-usage-analysis | 修正 affected_feature_ids |
| P1 | 变更记录引用不存在功能 | `docs/product/changelog/newAI-system-change.md` | newAI-system-change-20260525-k->feat-license-instance | 修正 affected_feature_ids |
| P1 | 变更记录引用不存在功能 | `docs/product/changelog/newAI-system-change.md` | newAI-system-change-20260525-k->feat-license-account | 修正 affected_feature_ids |
| P1 | 变更记录引用不存在功能 | `docs/product/changelog/newAI-system-change.md` | newAI-system-change-20260525-l->feat-license-template | 修正 affected_feature_ids |
| P1 | 变更记录引用不存在功能 | `docs/product/changelog/newAI-system-change.md` | newAI-system-change-20260525-m->feat-license-instance | 修正 affected_feature_ids |
| P1 | 变更记录引用不存在功能 | `docs/product/changelog/newAI-system-change.md` | newAI-system-change-20260525-m->feat-audit-log | 修正 affected_feature_ids |
| P1 | 变更记录引用不存在功能 | `docs/product/changelog/newAI-system-change.md` | newAI-system-change-20260526-a->feat-license-template | 修正 affected_feature_ids |
| P1 | 变更记录引用不存在功能 | `docs/product/changelog/newAI-system-change.md` | newAI-system-change-20260526-b->feat-license-template | 修正 affected_feature_ids |
