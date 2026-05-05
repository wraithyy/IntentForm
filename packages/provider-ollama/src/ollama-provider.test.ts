import type { AiProviderInput } from "@intentform/shared";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ollamaProvider } from "./ollama-provider.js";

const input: AiProviderInput = {
  prompt: "I need to file a claim",
  models: [
    {
      id: "claim",
      label: "Claim",
      description: "Insurance claim",
      useCases: ["claim"],
      fields: [{ id: "description", label: "Description", type: "textarea" }],
      rules: [],
    },
  ],
};

const validContent = JSON.stringify({
  model: "claim",
  values: { description: "car accident" },
  fieldRelevance: { description: 0.95 },
  confidence: 0.88,
});

function makeOkResponse(body: string, status = 200): Response {
  return new Response(
    JSON.stringify({ message: { content: body }, role: "assistant" }),
    { status, headers: { "Content-Type": "application/json" } }
  );
}

function makeOkResponseWithTokens(
  body: string,
  promptEvalCount: number,
  evalCount: number
): Response {
  return new Response(
    JSON.stringify({
      message: { content: body },
      role: "assistant",
      prompt_eval_count: promptEvalCount,
      eval_count: evalCount,
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}

describe("ollamaProvider", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns parsed output with correct data and confidence on happy path", async () => {
    vi.mocked(fetch).mockResolvedValue(makeOkResponse(validContent));
    const provider = ollamaProvider({ model: "llama3" });
    const result = await provider.generateStructured(input);
    expect(result.confidence).toBe(0.88);
    expect((result.data as { model: string }).model).toBe("claim");
    expect(result.usage).toBeUndefined();
  });

  it("includes usage when prompt_eval_count and eval_count are present", async () => {
    vi.mocked(fetch).mockResolvedValue(
      makeOkResponseWithTokens(validContent, 42, 18)
    );
    const provider = ollamaProvider({ model: "llama3" });
    const result = await provider.generateStructured(input);
    expect(result.usage).toBeDefined();
    expect(result.usage?.tokensIn).toBe(42);
    expect(result.usage?.tokensOut).toBe(18);
  });

  it("omits usage when token counts are absent", async () => {
    vi.mocked(fetch).mockResolvedValue(makeOkResponse(validContent));
    const provider = ollamaProvider({ model: "llama3" });
    const result = await provider.generateStructured(input);
    expect(result.usage).toBeUndefined();
  });

  it("throws with HTTP status message on non-ok response", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response("", { status: 500 }));
    const provider = ollamaProvider({ model: "llama3" });
    await expect(provider.generateStructured(input)).rejects.toThrow(
      "Ollama provider error: HTTP 500"
    );
  });

  it("throws on network error when fetch rejects", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("ECONNREFUSED"));
    const provider = ollamaProvider({ model: "llama3" });
    await expect(provider.generateStructured(input)).rejects.toThrow(
      "Ollama provider error: ECONNREFUSED"
    );
  });

  it("throws on invalid JSON in content", async () => {
    vi.mocked(fetch).mockResolvedValue(makeOkResponse("not-valid-json"));
    const provider = ollamaProvider({ model: "llama3" });
    await expect(provider.generateStructured(input)).rejects.toThrow(
      "Ollama provider returned invalid JSON"
    );
  });

  it("uses the provided baseUrl instead of the default", async () => {
    vi.mocked(fetch).mockResolvedValue(makeOkResponse(validContent));
    const provider = ollamaProvider({
      model: "llama3",
      baseUrl: "http://custom:9999",
    });
    await provider.generateStructured(input);
    const [url] = vi.mocked(fetch).mock.calls[0] as [string, ...unknown[]];
    expect(url).toBe("http://custom:9999/api/chat");
  });

  describe("retries and timeout", () => {
    it("retries: succeeds on third attempt when fetch fails twice", async () => {
      vi.mocked(fetch)
        .mockRejectedValueOnce(new Error("network error"))
        .mockRejectedValueOnce(new Error("network error"))
        .mockResolvedValueOnce(makeOkResponse(validContent));
      const provider = ollamaProvider({ model: "llama3", retries: 2 });
      const result = await provider.generateStructured(input);
      expect(result.confidence).toBe(0.88);
      expect(vi.mocked(fetch)).toHaveBeenCalledTimes(3);
    });

    it("timeout: rejects with 'Request timed out' when fetch never resolves", async () => {
      vi.mocked(fetch).mockReturnValue(
        new Promise(() => {
          /* never resolves */
        })
      );
      const provider = ollamaProvider({ model: "llama3", timeoutMs: 10 });
      await expect(provider.generateStructured(input)).rejects.toThrow(
        "Request timed out"
      );
    });
  });
});
