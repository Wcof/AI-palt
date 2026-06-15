# 页面变更记录

| change_id | affected_page_ids | affected_feature_ids | source_commit | 版本 | 日期 | 修改类型 | 修改内容 | 影响范围 | 是否同步 PRD | 备注 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| newAI-assistant-change-20260526-a | page-newAI-assistant | feat-assistant-agent | local | v0.2 | 2026-05-26 | 交互修复 | 左侧“新会话”改为默认创建通用助手会话，不再继承上一条会话的 Agent 类型，避免误入会议纪要工作台 | 页面代码、页面 PRD、交互规则 | 是 | 修复 persisted Agent 状态导致的新会话默认页错误 |
| newAI-assistant-change-20260525-a | page-newAI-assistant | feat-assistant-clarification | local | v0.2 | 2026-05-25 | 交互新增 | AI 助手新增 mock 反问机制：用户发问后先进入反问补充流程，底部上推 3 个建议选项和“其他补充信息”输入框，补充后再生成正式回答 | 页面代码、页面 PRD、功能清单、交互规则 | 是 | 按最新评审意见补齐反问交互 |
| chg-newAI-assistant-init | page-newAI-assistant | feat-newAI-assistant-core | 699e024 | v0.1 | 2026-05-24 | 初始化 | 自动补齐变更链路 | 页面 PRD | 是 | 自动补齐 |
| newAI-assistant-change | page-newAI-assistant | feat-assistant-agent,feat-assistant-feedback,feat-assistant-context,feat-assistant-ocr,feat-assistant-model | 699e024 | v0.1 | 2026-05-24 | 初始化 | 自动补齐变更链路 | 页面 PRD | 是 | 自动补齐 |
| newAI-assistant-change-20260525 | page-newAI-assistant | feat-assistant-feedback,feat-assistant-context,feat-assistant-rewrite | local | v0.2 | 2026-05-25 | 交互调整 | 用户问题新增复制/修改重问；AI 回复固定显示复制/重新生成/点赞/点踩；点赞点踩进入专家共创；上下文打包移至顶部入口 | 页面代码、页面 PRD、功能清单、交互规则 | 是 | 按最新评审意见调整 |
| newAI-assistant-change-20260525-b | page-newAI-assistant | feat-assistant-feedback | local | v0.2 | 2026-05-25 | 交互微调 | AI 回复操作从回答气泡内部移到气泡下方，并改为纯 icon 展示，位置与网页版 GPT 对齐 | 页面代码、页面 PRD、交互规则 | 是 | 视觉与操作密度调整 |
| newAI-assistant-change-20260526-a | page-newAI-assistant | feat-newAI-assistant-core | local | v0.3 | 2026-05-26 | 反问补充面板调整 | “请先补充信息”改为覆盖式弹层；建议项改为单列；面板出现时遮住原输入框与发送区，避免出现两个输入入口 | 页面代码、页面 PRD、交互规则 | 是 | 按最新交互要求优化 |
| newAI-assistant-change-20260526-b | page-newAI-assistant | feat-newAI-assistant-core | local | v0.4 | 2026-05-26 | 左侧菜单重组 | 左侧主菜单调整为智能问答、隐患识别、智能文书和更多；知识库、智能体、技能、API 密钥收进更多；会议纪要和文档编写作为更多内的智能文书折叠项 | 页面代码、页面 PRD、交互规则 | 是 | 按最新导航要求调整 |
| newAI-assistant-change-20260525-c | page-newAI-assistant | feat-assistant-feedback,feat-assistant-rewrite | local | v0.3 | 2026-05-25 | 反馈更新 | 用户问题复制/修改改为 icon 展示；点踩对单条回复改为覆盖更新并支持回显上次反馈内容 | 页面代码、页面 PRD、功能清单、交互规则 | 是 | 对齐最新交互要求 |
| newAI-assistant-change-20260526-b | page-newAI-assistant | feat-auth-register | local | v0.4 | 2026-05-26 | 认证交互新增 | 登录弹窗新增“立即注册”流程，支持个人注册和企业注册两种模式，注册成功后本地 mock 自动登录；补齐字段校验和协议勾选 | 页面代码、页面 PRD、功能清单、交互规则 | 是 | 不新增注册路由，保持弹窗内闭环 |
| newAI-assistant-change-20260526-c | page-newAI-assistant | feat-auth-register | local | v0.5 | 2026-05-26 | 注册优化 | 注册弹窗优化为固定头部和内容滚动布局，个人/企业表单按信息域分组，并新增手机验证码 mock 校验和 60 秒倒计时 | 页面代码、页面 PRD、功能清单、交互规则 | 是 | 验证码固定为原型值 123456，不接短信服务 |
| newAI-assistant-change-20260526-d | page-newAI-assistant | feat-assistant-rewrite,feat-assistant-session-actions | local | v0.6 | 2026-05-26 | 会话交互优化 | 历史问题修改态输入框改为更宽的蓝色渐变文本域；左侧近期会话新增三点更多菜单，支持重命名、导出和删除 | 页面代码、页面 PRD、功能清单、交互规则 | 是 | 会话导出为本地 JSON |
| newAI-assistant-change-20260526-e | page-newAI-assistant | feat-newAI-assistant-core | local | v0.7 | 2026-05-26 | 导航优化 | 左侧“更多”从内嵌折叠改为侧向浮层面板，按卡片展示 AI 智能体、AI 技能、AI 知识库和开发工作台入口 | 页面代码、页面 PRD、交互规则 | 是 | 对齐截图中的更多功能面板样式 |
| newAI-assistant-change-20260526-f | page-newAI-assistant | feat-newAI-assistant-core | local | v0.7 | 2026-05-26 | 缺陷修复 | 修复左侧“更多”点击后浮层被工作区覆盖或裁剪导致不可见的问题，为侧栏提升层级并允许浮层溢出显示 | 页面代码、变更记录 | 是 | 不改变 PRD 主体规则 |
| newAI-assistant-change-20260527-a | page-newAI-assistant | feat-auth-register | local | v0.8 | 2026-05-27 | 登录注册调整 | 登录弹窗调整为密码登录和二维码登录；注册改为扫码注册，移除手机验证码；扫码后要求按个人或企业补全基础信息后进入登录态 | 页面代码、页面 PRD、功能清单、交互规则 | 是 | 二维码为本地 mock，不接真实扫码服务 |
| newAI-assistant-change-20260527-b | page-newAI-assistant | feat-auth-register | local | v0.9 | 2026-05-27 | 登录注册精简 | 去除顶部登录/注册切换，仅保留密码登录和快捷登录；快捷登录扫码后补全个人或企业基础信息，并要求设置密码和确认密码 | 页面代码、页面 PRD、功能清单、交互规则 | 是 | 密码仅做前端校验，不持久化 |
| newAI-assistant-change-20260527-c | page-newAI-assistant | feat-auth-register | local | v0.9 | 2026-05-27 | 登录注册细化 | 密码登录确认按钮下方新增“没有账号？扫码登录”入口；企业用户补全增加手机号；个人和企业的密码与确认密码改为上下两行展示 | 页面代码、页面 PRD、交互规则 | 是 | 按最新评审意见调整 |
