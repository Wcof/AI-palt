import { createRouter, createWebHashHistory } from 'vue-router'
import AppShell from '../components/layout/AppShell.vue'
import AISearch from '../views/ai/search.vue'
import AIDetail from '../views/ai/detail.vue'
import SystemSettings from '../views/ai/settings/systemSettings.vue'
import ComingSoon from '../views/shared/comingSoon.vue'
import NotFound from '../views/shared/notFound.vue'
import OnlineExperience from '../views/ai/agent/index.vue'
import DomainExperience from '../views/ai/agent/domainExperience.vue'
import AIMcp from '../views/ai/mcp/index.vue'
import AIMcpDetail from '../views/ai/mcp/detail.vue'
import AIKnowledge from '../views/ai/knowladge/index.vue'

const router = createRouter({
  history: createWebHashHistory('/ai-platform-frontend/'),
  routes: [
    { path: '/', redirect: '/newAI/assistant' },
    {
      path: '/',
      component: AppShell,
      children: [
        { path: '', redirect: '/newAI/assistant' },
        { path: 'search', component: AISearch },
        { path: 'ability/:id', component: AIDetail },
        { path: 'system', redirect: '/newAI/system' },
        { path: 'agents', redirect: '/newAI/agent' },
        { path: 'ai-app', redirect: '/newAI/assistant' },
        { path: 'experience', component: OnlineExperience },
        { path: 'experience/agent', component: DomainExperience, props: { kind: 'agent' } },
        { path: 'experience/mcp', component: DomainExperience, props: { kind: 'mcp' } },
        { path: 'mcp', redirect: '/newAI/mcp' },
        { path: 'mcp/:id', component: AIMcpDetail },
        { path: 'skill/:id', component: () => import('../views/ai/mcp/skillDetail.vue') },
        { path: 'knowledge', redirect: '/newAI/knowledge' },
        { path: 'knowledge/:id', component: () => import('../views/ai/knowladge/detail.vue') },
        { path: 'developers', redirect: '/newAI/apiKey' },
        { path: 'workbench', redirect: '/newAI/apiKey' },
        { path: 'workbench/keys', redirect: '/newAI/apiKey' },
        { path: 'workbench/apps', redirect: '/newAI/system' },
        { path: 'workbench/subscriptions', redirect: '/newAI/system' },
        { path: 'workbench/stats', redirect: '/newAI/system' },
        { path: 'newAI/assistant', component: () => import('../views/dashboard/ai/index.vue') },
        { path: 'newAI/knowledge', component: () => import('../views/newAI/knowledge.vue') },
        { path: 'newAI/agent', component: () => import('../views/newAI/agent.vue') },
        { path: 'newAI/mcp', component: () => import('../views/newAI/mcp.vue') },
        { path: 'newAI/apiKey', component: () => import('../views/newAI/apiKey.vue') },
        { path: 'newAI/system', component: SystemSettings },
        { path: 'docs', component: ComingSoon, props: { title: '文档支持' } },
        { path: 'console', component: ComingSoon, props: { title: '控制台入口' } },
      ],
    },
    { path: '/:pathMatch(.*)*', component: NotFound },
  ],
})

export default router
