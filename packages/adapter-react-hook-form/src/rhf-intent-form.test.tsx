import type { IntentFormEngine } from "@intentform/core";
import type { IntentResolution, ModelDefinition } from "@intentform/shared";
import { act, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { RHFIntentForm } from "./rhf-intent-form.js";

const mockModel: ModelDefinition = {
  id: "claim",
  label: "Claim",
  description: "Insurance claim",
  useCases: ["claim"],
  fields: [
    { id: "name", label: "Full Name", type: "text" },
    { id: "email", label: "Email", type: "text" },
    { id: "description", label: "Description", type: "textarea" },
  ],
  rules: [],
};

const mockResolution: IntentResolution = {
  confidence: 0.9,
  fieldRelevance: { name: 1, email: 0.8, description: 0.9 },
  hiddenFields: new Set<string>(),
  modelId: "claim",
  requiredFields: new Set<string>(["name"]),
  values: { name: "Jane Doe", email: "jane@example.com", description: "" },
};

function makeEngine(overrides?: Partial<IntentFormEngine>): IntentFormEngine {
  return {
    config: {
      models: [mockModel],
      provider: { generateStructured: vi.fn() },
    },
    getModels: vi.fn().mockReturnValue([mockModel]),
    getComponents: vi.fn().mockReturnValue({}),
    resolveIntent: vi.fn().mockResolvedValue(mockResolution),
    ...overrides,
  };
}

describe("RHFIntentForm", () => {
  it("renders idle state when no prompt prop is given", () => {
    const engine = makeEngine();
    render(<RHFIntentForm engine={engine} />);
    screen.getByTestId("rhf-intent-form-idle");
  });

  it("renders form after resolving a prompt", async () => {
    const engine = makeEngine();
    render(<RHFIntentForm engine={engine} prompt="I need to file a claim" />);
    await waitFor(() => screen.getByTestId("rhf-intent-form"));
  });

  it("prefills input values from resolution.values", async () => {
    const engine = makeEngine();
    render(<RHFIntentForm engine={engine} prompt="I need to file a claim" />);
    await waitFor(() => screen.getByTestId("rhf-intent-form"));
    const nameInput = screen.getByLabelText("Full Name") as HTMLInputElement;
    expect(nameInput.value).toBe("Jane Doe");
  });

  it("does not render hidden fields", async () => {
    const resolution: IntentResolution = {
      ...mockResolution,
      hiddenFields: new Set<string>(["email"]),
    };
    const engine = makeEngine({
      resolveIntent: vi.fn().mockResolvedValue(resolution),
    });
    render(<RHFIntentForm engine={engine} prompt="I need to file a claim" />);
    await waitFor(() => screen.getByTestId("rhf-intent-form"));
    expect(screen.queryByLabelText("Email")).toBeNull();
  });

  it("renders error state when resolveIntent rejects", async () => {
    const engine = makeEngine({
      resolveIntent: vi
        .fn()
        .mockRejectedValue(new Error("Provider unavailable")),
    });
    render(<RHFIntentForm engine={engine} prompt="I need to file a claim" />);
    await waitFor(() => screen.getByTestId("rhf-intent-form-error"));
  });

  it("calls onSubmit with form values when the form is submitted", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const engine = makeEngine();
    render(
      <RHFIntentForm
        engine={engine}
        onSubmit={onSubmit}
        prompt="I need to file a claim"
      />
    );
    await waitFor(() => screen.getByTestId("rhf-intent-form"));
    await act(async () => {
      screen.getByRole("button", { name: "Submit" }).click();
    });
    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
  });
});
