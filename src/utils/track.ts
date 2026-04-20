declare global {
  interface Window {
    _hmt?: any[];
  }
}

export function trackEvent(category: string, action: string, label?: string) {
  try {
    window._hmt?.push(["_trackEvent", category, action, label ?? ""]);
  } catch {
    return;
  }
}

