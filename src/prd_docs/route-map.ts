export const prdRouteMap: Record<string, () => Promise<string>> = {
  '/newAI/assistant': () => import('../../docs/product/pages/newAI-assistant.md?raw').then(m => m.default),
  '/newAI/knowledge': () => import('../../docs/product/pages/newAI-knowledge.md?raw').then(m => m.default),
  '/newAI/agent': () => import('../../docs/product/pages/newAI-agent.md?raw').then(m => m.default),
  '/newAI/mcp': () => import('../../docs/product/pages/newAI-mcp.md?raw').then(m => m.default),
  '/newAI/apiKey': () => import('../../docs/product/pages/newAI-apiKey.md?raw').then(m => m.default),
  '/newAI/system': () => import('../../docs/product/pages/newAI-system.md?raw').then(m => m.default),
  '/ai-app': () => import('../../docs/product/pages/newAI-assistant.md?raw').then(m => m.default),
  '/knowledge': () => import('../../docs/product/pages/newAI-knowledge.md?raw').then(m => m.default),
  '/agents': () => import('../../docs/product/pages/newAI-agent.md?raw').then(m => m.default),
  '/mcp': () => import('../../docs/product/pages/newAI-mcp.md?raw').then(m => m.default),
  '/workbench/keys': () => import('../../docs/product/pages/newAI-apiKey.md?raw').then(m => m.default),
  '/system': () => import('../../docs/product/pages/newAI-system.md?raw').then(m => m.default),
}
