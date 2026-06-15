# 页面变更记录

| change_id | affected_page_ids | affected_feature_ids | source_commit | 版本 | 日期 | 修改类型 | 修改内容 | 影响范围 | 是否同步 PRD | 备注 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| chg-index-init | page-index | feat-index-core | [TODO: commit] | v0.1 | 2026-05-24 | 初始化 | 创建页面变更记录 | 页面 PRD | 是 | 初版 |
| index-change-20260528-a | page-index | feat-index-core | local | v0.2 | 2026-05-28 | 全局入口新增 | 页面悬浮入口新增“功能清单”按钮，和 PRD 按钮并列展示；点击后读取 docs/product/05-实施功能清单.md 并以 Markdown 面板展示 | 页面代码、实施功能清单、全局交互规则、变更记录 | 是 | 功能清单面板用于原型验收与后续开发对齐，docs/product/02-功能清单.md 保留为 PRD traceability 索引 |
| index-change-20260528-b | page-index | feat-index-core | local | v0.3 | 2026-05-28 | 全局入口再增 | 页面悬浮入口新增“全量功能清单”按钮，点击后直接展示写死的 31 项全量功能表 | 页面代码、全量功能清单、全局交互规则、变更记录 | 是 | 全量功能清单用于展示完整实施顺序与范围 |
| index-change-20260528-c | page-index | feat-index-core | local | v0.4 | 2026-05-28 | 样式优化 | 优化“全量功能清单”面板布局，改为宽抽屉、说明区、吸顶表头、固定编号列和横向滚动表格 | 页面代码、全局交互规则、变更记录 | 是 | 提升长表格阅读和演示体验 |
