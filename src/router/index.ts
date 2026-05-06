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
    { path: '/', redirect: '/ai-app' },
    {
      path: '/',
      component: AppShell,
      children: [
        { path: 'search', component: AISearch },
        { path: 'ability/:id', component: AIDetail },
        { path: 'system', component: SystemSettings },
        { path: 'agents', component: OnlineExperience },
        { path: 'ai-app', component: () => import('../views/dashboard/ai/index.vue') },
        { path: 'experience', component: OnlineExperience },
        { path: 'experience/agent', component: DomainExperience, props: { kind: 'agent' } },
        { path: 'experience/mcp', component: DomainExperience, props: { kind: 'mcp' } },
        { path: 'mcp', component: AIMcp },
        { path: 'mcp/:id', component: AIMcpDetail },
        { path: 'skill/:id', component: () => import('../views/ai/mcp/skillDetail.vue') },
        { path: 'knowledge', component: AIKnowledge },
        { path: 'knowledge/:id', component: () => import('../views/ai/knowladge/detail.vue') },
        { path: 'developers', redirect: '/workbench/keys' },
        {
          path: 'workbench',
          component: () => import('../views/dashboard/workbench/layout.vue'),
          children: [
            { path: '', redirect: 'keys' },
            { path: 'subscriptions', component: () => import('../views/dashboard/workbench/subscriptions.vue') },
            { path: 'apps', component: () => import('../views/dashboard/workbench/apps.vue') },
            { path: 'keys', component: () => import('../views/dashboard/workbench/keys.vue') },
            { path: 'stats', component: () => import('../views/dashboard/workbench/stats.vue') },
          ],
        },
        { path: 'docs', component: ComingSoon, props: { title: '文档支持' } },
        { path: 'console', component: ComingSoon, props: { title: '控制台入口' } },
      ],
    },
    { path: '/:pathMatch(.*)*', component: NotFound },
  ],
})

export default router