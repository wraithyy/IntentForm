import type { AiProviderInput } from "@intentform/shared";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { openaiProvider } from "./openai-provider.js";

const mockCreate = vi.fn();

vi.mock("openai", () => ({
  default: vi.fn().mockImplementation(() => ({
    chat: { completions: { create: mockCreate } },
  })),
}));

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
  confidence: 0.9,
});

function makeCompletion(
  content: string,
  usage?: { prompt_tokens: number; completion_tokens: number }
) {
  return {
    choices: [{ message: { content } }],
    usage,
  };
}

describe("openaiProvider", () => {
  beforeEach(() => {
    mockCreate.mockReset();
  });

  it("returns parsed output with correct data and confidence on happy path", async () => {
    mockCreate.mockResolvedValue(makeCompletion(validContent));
    const provider = openaiProvider({
      apiKey: "test-key",
      dangerouslyAllowBrowser: true,
    });
    const result = await provider.generateStructured(input);
    expect(result.confidence).toBe(0.9);
    expect((result.data as { model: string }).model).toBe("claim");
    expect(result.usage).toBeUndefined();
  });

  it("includes usage when prompt_tokens and completion_tokens are present", async () => {
    mockCreate.mockResolvedValue(
      makeCompletion(validContent, {
        prompt_tokens: 100,
        completion_tokens: 50,
      })
    );
    const provider = openaiProvider({
      apiKey: "test-key",
      dangerouslyAllowBrowser: true,
    });
    const result = await provider.generateStructured(input);
    expect(result.usage).toBeDefined();
    expect(result.usage?.tokensIn).toBe(100);
    expect(result.usage?.tokensOut).toBe(50);
  });

  it("omits usage when token counts are absent", async () => {
    mockCreate.mockResolvedValue(makeCompletion(validContent));
    const provider = openaiProvider({
      apiKey: "test-key",
      dangerouslyAllowBrowser: true,
    });
    const result = await provider.generateStructured(input);
    expect(result.usage).toBeUndefined();
  });

  it("throws a wrapped error when the SDK throws", async () => {
    mockCreate.mockRejectedValue(new Error("rate limit exceeded"));
    const provider = openaiProvider({
      apiKey: "test-key",
      dangerouslyAllowBrowser: true,
    });
    await expect(provider.generateStructured(input)).rejects.toThrow(
      "OpenAI provider error: rate limit exceeded"
    );
  });

  it("throws on invalid JSON in the response content", async () => {
    mockCreate.mockResolvedValue(makeCompletion("not-valid-json"));
    const provider = openaiProvider({
      apiKey: "test-key",
      dangerouslyAllowBrowser: true,
    });
    await expect(provider.generateStructured(input)).rejects.toThrow(
      "OpenAI provider returned invalid JSON"
    );
  });

  describe("retries and timeout", () => {
    it("retries: succeeds on third attempt when create fails twice", async () => {
      mockCreate
        .mockRejectedValueOnce(new Error("rate limit"))
        .mockRejectedValueOnce(new Error("rate limit"))
        .mockResolvedValueOnce(makeCompletion(validContent));
      const provider = openaiProvider({
        apiKey: "test-key",
        dangerouslyAllowBrowser: true,
        retries: 2,
      });
      const result = await provider.generateStructured(input);
      expect(result.confidence).toBe(0.9);
      expect(mockCreate).toHaveBeenCalledTimes(3);
    });

    it("timeout: rejects with 'Request timed out' when create never resolves", async () => {
      mockCreate.mockReturnValue(
        new Promise(() => {
          /* never resolves */
        })
      );
      const provider = openaiProvider({
        apiKey: "test-key",
        dangerouslyAllowBrowser: true,
        timeoutMs: 10,
      });
      await expect(provider.generateStructured(input)).rejects.toThrow(
        "Request timed out"
      );
    });
  });
});
