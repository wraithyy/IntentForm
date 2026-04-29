import type { ModelDefinition } from "@intentform/shared";
import { describe, expect, it } from "vitest";
import { ModelRegistry } from "./model-registry.js";

const fixture: ModelDefinition = {
  id: "accidentReport",
  label: "Accident Report",
  description: "Report a vehicle accident",
  useCases: ["vehicle accident"],
  fields: [
    { id: "accidentType", label: "Type", type: "select", required: true },
    { id: "location", label: "Location", type: "text" },
    { id: "otherVehiclePlate", label: "Other Vehicle Plate", type: "text" },
  ],
  rules: [],
};

const secondFixture: ModelDefinition = {
  id: "travelClaim",
  label: "Travel Claim",
  description: "Submit a travel expense claim",
  useCases: ["travel expenses"],
  fields: [
    { id: "destination", label: "Destination", type: "text", required: true },
  ],
  rules: [],
};

describe("ModelRegistry", () => {
  it("register stores models by id", () => {
    const registry = new ModelRegistry();
    registry.register([fixture]);
    expect(registry.get("accidentReport")).toEqual(fixture);
  });

  it("get returns model by id", () => {
    const registry = new ModelRegistry();
    registry.register([fixture]);
    expect(registry.get("accidentReport")).toBe(registry.get("accidentReport"));
  });

  it("get returns undefined for unknown id", () => {
    const registry = new ModelRegistry();
    expect(registry.get("nonexistent")).toBeUndefined();
  });

  it("getAll returns all registered models", () => {
    const registry = new ModelRegistry();
    registry.register([fixture, secondFixture]);
    const all = registry.getAll();
    expect(all).toHaveLength(2);
    expect(all).toContainEqual(fixture);
    expect(all).toContainEqual(secondFixture);
  });

  it("has returns true for registered model", () => {
    const registry = new ModelRegistry();
    registry.register([fixture]);
    expect(registry.has("accidentReport")).toBe(true);
  });

  it("has returns false for unregistered model", () => {
    const registry = new ModelRegistry();
    expect(registry.has("accidentReport")).toBe(false);
  });

  it("size reflects count of registered models", () => {
    const registry = new ModelRegistry();
    expect(registry.size()).toBe(0);
    registry.register([fixture]);
    expect(registry.size()).toBe(1);
    registry.register([secondFixture]);
    expect(registry.size()).toBe(2);
  });

  it("multiple registries are independent — no global state", () => {
    const registryA = new ModelRegistry();
    const registryB = new ModelRegistry();
    registryA.register([fixture]);
    expect(registryB.has("accidentReport")).toBe(false);
    expect(registryB.size()).toBe(0);
  });

  it("registering again overwrites existing model", () => {
    const registry = new ModelRegistry();
    registry.register([fixture]);
    const updated = { ...fixture, label: "Updated Label" };
    registry.register([updated]);
    expect(registry.get("accidentReport")?.label).toBe("Updated Label");
    expect(registry.size()).toBe(1);
  });
});
