import { fireEvent, render, screen } from "@testing-library/react";
import { describe, it } from "vitest";
import { IntentFormDebugPanel } from "./debug-panel.js";

const TOGGLE_BUTTON = /IntentForm Debug/i;

describe("IntentFormDebugPanel", () => {
  it("renders without crashing when no props are provided", () => {
    render(<IntentFormDebugPanel />);
    screen.getByRole("button", { name: TOGGLE_BUTTON });
  });

  it("shows the status badge with the provided status", () => {
    render(<IntentFormDebugPanel status="resolved" />);
    screen.getByText("resolved");
  });

  it("defaults status badge to idle when status prop is omitted", () => {
    render(<IntentFormDebugPanel />);
    screen.getByText("idle");
  });

  it("shows model id in the header after toggling panel open", () => {
    render(<IntentFormDebugPanel modelId="claim" status="resolved" />);
    screen.getByText("claim");
  });

  it("shows confidence percentage in the header after passing resolution", () => {
    const resolution = {
      confidence: 0.85,
      fieldRelevance: {},
      hiddenFields: new Set<string>(),
      modelId: "claim",
      requiredFields: new Set<string>(),
      values: {},
    };
    render(<IntentFormDebugPanel resolution={resolution} />);
    screen.getByText("85% conf");
  });

  it("shows error message inside the expanded panel when error prop is provided", () => {
    render(
      <IntentFormDebugPanel error="Provider unavailable" status="error" />
    );
    fireEvent.click(screen.getByRole("button", { name: TOGGLE_BUTTON }));
    screen.getByText("Provider unavailable");
  });
});
