import type { IntentFormEngine } from "@intentform/core";
import type { IntentResolution, ModelDefinition } from "@intentform/shared";
import { act, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { IntentForm } from "../intent-form.js";

const mockModel: ModelDefinition = {
  description: "Test model",
  fields: [
    { id: "name", label: "Name", required: true, type: "text" },
    { id: "age", label: "Age", type: "number" },
  ],
  id: "test",
  label: "Test",
  rules: [],
  useCases: [],
};

const mockResolution: IntentResolution = {
  confidence: 0.9,
  fieldRelevance: {},
  hiddenFields: new Set<string>(),
  modelId: "test",
  requiredFields: new Set<string>(["name"]),
  values: { age: 30, name: "Alice" },
};

function makeEngine(overrides?: Partial<IntentFormEngine>): IntentFormEngine {
  return {
    config: {
      models: [],
      provider: { generateStructured: vi.fn() },
    },
    getModels: vi.fn().mockReturnValue([mockModel]),
    getComponents: vi.fn().mockReturnValue({}),
    resolveIntent: vi.fn().mockResolvedValue(mockResolution),
    ...overrides,
  };
}

describe("IntentForm", () => {
  it("renders idle state without prompt", () => {
    const engine = makeEngine();
    render(<IntentForm engine={engine} />);
    expect(screen.getByTestId("intent-form-idle")).toBeTruthy();
  });

  it("auto-resolves on prompt prop and renders fields", async () => {
    const engine = makeEngine();
    render(<IntentForm engine={engine} prompt="I need help" />);

    expect(screen.getByTestId("intent-form-loading")).toBeTruthy();

    await waitFor(() => {
      expect(screen.getByTestId("intent-form")).toBeTruthy();
    });

    expect(screen.getByLabelText("Name")).toBeTruthy();
    expect(screen.getByLabelText("Age")).toBeTruthy();
  });

  it("hides fields in hiddenFields", async () => {
    const engine = makeEngine({
      resolveIntent: vi.fn().mockResolvedValue({
        ...mockResolution,
        hiddenFields: new Set<string>(["age"]),
      }),
    });
    render(<IntentForm engine={engine} prompt="prompt" />);

    await waitFor(() => {
      expect(screen.getByTestId("intent-form")).toBeTruthy();
    });

    expect(screen.getByLabelText("Name")).toBeTruthy();
    expect(screen.queryByLabelText("Age")).toBeNull();
  });

  it("renders error state on failure", async () => {
    const engine = makeEngine({
      resolveIntent: vi.fn().mockRejectedValue(new Error("Provider error")),
    });
    render(<IntentForm engine={engine} prompt="prompt" />);

    await waitFor(() => {
      expect(screen.getByTestId("intent-form-error")).toBeTruthy();
    });

    expect(screen.getByTestId("intent-form-error").textContent).toBe(
      "Provider error"
    );
  });

  it("calls onSubmit with current values", async () => {
    const engine = makeEngine();
    const onSubmit = vi.fn();
    render(<IntentForm engine={engine} onSubmit={onSubmit} prompt="prompt" />);

    await waitFor(() => {
      expect(screen.getByTestId("intent-form")).toBeTruthy();
    });

    await act(async () => {
      screen.getByRole("button", { name: "Submit" }).click();
    });

    expect(onSubmit).toHaveBeenCalledWith({ age: 30, name: "Alice" });
  });
});
