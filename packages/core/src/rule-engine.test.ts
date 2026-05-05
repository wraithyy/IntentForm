import type { FieldDefinition, Rule } from "@intentform/shared";
import { describe, expect, it } from "vitest";
import { evaluateRules } from "./rule-engine.js";

const fields: FieldDefinition[] = [
  {
    id: "accidentType",
    label: "Accident Type",
    type: "select",
    required: true,
  },
  { id: "otherVehiclePlate", label: "Other Vehicle Plate", type: "text" },
  { id: "damageDescription", label: "Damage Description", type: "textarea" },
];

const hideOtherPlateRule: Rule = {
  when: { field: "accidentType", value: "animal" },
  then: { effect: "hide", target: "otherVehiclePlate" },
};

describe("evaluateRules", () => {
  it("hides target field when rule condition matches", () => {
    const result = evaluateRules([hideOtherPlateRule], fields, {
      accidentType: "animal",
    });
    expect(result.hiddenFields.has("otherVehiclePlate")).toBe(true);
  });

  it("does not hide field when rule condition does not match", () => {
    const result = evaluateRules([hideOtherPlateRule], fields, {
      accidentType: "collision",
    });
    expect(result.hiddenFields.has("otherVehiclePlate")).toBe(false);
  });

  it("show rule removes a previously hidden field", () => {
    const rules: Rule[] = [
      {
        when: { field: "accidentType", value: "animal" },
        then: { effect: "hide", target: "otherVehiclePlate" },
      },
      {
        when: { field: "accidentType", value: "animal" },
        then: { effect: "show", target: "otherVehiclePlate" },
      },
    ];
    const result = evaluateRules(rules, fields, { accidentType: "animal" });
    expect(result.hiddenFields.has("otherVehiclePlate")).toBe(false);
  });

  it("require rule adds field to requiredFields", () => {
    const rules: Rule[] = [
      {
        when: { field: "accidentType", value: "collision" },
        then: { effect: "require", target: "otherVehiclePlate" },
      },
    ];
    const result = evaluateRules(rules, fields, { accidentType: "collision" });
    expect(result.requiredFields.has("otherVehiclePlate")).toBe(true);
  });

  it("unrequire rule removes field from requiredFields", () => {
    const rules: Rule[] = [
      {
        when: { field: "accidentType", value: "animal" },
        then: { effect: "unrequire", target: "accidentType" },
      },
    ];
    const result = evaluateRules(rules, fields, { accidentType: "animal" });
    expect(result.requiredFields.has("accidentType")).toBe(false);
  });

  it("fields with required: true start in requiredFields", () => {
    const result = evaluateRules([], fields, {});
    expect(result.requiredFields.has("accidentType")).toBe(true);
  });

  it("fields without required: true do not start in requiredFields", () => {
    const result = evaluateRules([], fields, {});
    expect(result.requiredFields.has("otherVehiclePlate")).toBe(false);
    expect(result.requiredFields.has("damageDescription")).toBe(false);
  });

  it("hidden required fields get auto-unrequired", () => {
    const rules: Rule[] = [
      {
        when: { field: "otherVehiclePlate", value: "ABC123" },
        then: { effect: "hide", target: "accidentType" },
      },
    ];
    const result = evaluateRules(rules, fields, {
      otherVehiclePlate: "ABC123",
    });
    expect(result.hiddenFields.has("accidentType")).toBe(true);
    expect(result.requiredFields.has("accidentType")).toBe(false);
  });

  it("empty rules returns only schema-defined required fields", () => {
    const result = evaluateRules([], fields, { accidentType: "animal" });
    expect(result.hiddenFields.size).toBe(0);
    expect(result.requiredFields).toEqual(new Set(["accidentType"]));
  });

  it("unmatched rules do not affect state", () => {
    const result = evaluateRules([hideOtherPlateRule], fields, {
      accidentType: "collision",
    });
    expect(result.hiddenFields.size).toBe(0);
    expect(result.requiredFields.has("accidentType")).toBe(true);
  });
});
