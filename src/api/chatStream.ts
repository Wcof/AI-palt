export type StreamChatParams = {
  question: string;
  kbIds: string[];
  signal?: AbortSignal;
  onToken: (token: string) => void;
  transport?: "auto" | "fetch" | "mock";
  mode?: "standard" | "deep";
};

type NormalizedError = {
  code: string;
  message: string;
};

function normalizeError(e: unknown): NormalizedError {
  if (e instanceof DOMException && e.name === "AbortError") return { code: "TIMEOUT", message: "请求超时，请稍后重试" };
  if (e instanceof Error) return { code: "UNKNOWN", message: e.message || "请求失败" };
  return { code: "UNKNOWN", message: "请求失败" };
}

async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function streamViaFetch({ question, kbIds, signal, onToken, mode }: StreamChatParams) {
  const res = await fetch("/api/chat/stream", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, kbIds, mode }),
    signal,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  if (!res.body) throw new Error("EMPTY_BODY");

  const reader = res.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value);
    const parts = buffer.split("\n\n");
    buffer = parts.pop() ?? "";
    for (const part of parts) {
      const lines = part.split("\n");
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        if (trimmed.startsWith("data:")) {
          const data = trimmed.slice(5).trim();
          if (data === "[DONE]") return;
          onToken(data);
        }
      }
    }
  }
}

async function streamViaMock({ question, kbIds, signal, onToken, mode }: StreamChatParams) {
  const hint = mode === "deep" ? "（深度思考模式）" : "";
  const text = `你问：${question}\n\n已选知识库：${kbIds.length ? kbIds.join(", ") : "未选择"}${hint}\n\n这是一个前端 mock 流式回答示例（后续可对接真实 SSE/WS）。`;
  for (const ch of text) {
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
    onToken(ch);
    await sleep(18);
  }
}

export async function streamChatAnswer(params: StreamChatParams) {
  const maxRetries = 5;
  const baseDelay = 500;

  let attempt = 0;
  while (true) {
    try {
      const transport = params.transport ?? "auto";
      if (transport === "mock") {
        await streamViaMock(params);
        return;
      }
      if (transport === "auto" && import.meta.env.DEV) {
        await streamViaMock(params);
        return;
      }
      await streamViaFetch(params);
      return;
    } catch (e) {
      const err = normalizeError(e);
      attempt += 1;
      if (attempt >= maxRetries) throw err;
      const delay = Math.min(5000, baseDelay * Math.pow(2, attempt - 1));
      await sleep(delay);
    }
  }
}
