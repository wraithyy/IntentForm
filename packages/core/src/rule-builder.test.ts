import type { Rule } from "@intentform/shared";
import { describe, expect, it } from "vitest";
import { rules, when } from "./rule-builder.js";

describe("when", () => {
  it("produces a hide rule", () => {
    const rule = when("urgency", "high").hide("phone");
    const expected: Rule = {
      then: { effect: "hide", target: "phone" },
      when: { field: "urgency", value: "high" },
    };
    expect(rule).toEqual(expected);
  });

  it("produces a show rule", () => {
    const rule = when("urgency", "low").show("phone");
    const expected: Rule = {
      then: { effect: "show", target: "phone" },
      when: { field: "urgency", value: "low" },
    };
    expect(rule).toEqual(expected);
  });

  it("produces a require rule", () => {
    const rule = when("injured", true).require("severity");
    const expected: Rule = {
      then: { effect: "require", target: "severity" },
      when: { field: "injured", value: true },
    };
    expect(rule).toEqual(expected);
  });

  it("produces an unrequire rule", () => {
    const rule = when("injured", false).unrequire("severity");
    const expected: Rule = {
      then: { effect: "unrequire", target: "severity" },
      when: { field: "injured", value: false },
    };
    expect(rule).toEqual(expected);
  });

  it("accepts a numeric value", () => {
    const rule = when("score", 42).hide("bonus");
    expect(rule.when.value).toBe(42);
  });

  it("accepts a boolean false value", () => {
    const rule = when("active", false).hide("details");
    expect(rule.when.value).toBe(false);
  });
});

describe("rules", () => {
  it("returns an array containing all provided rules", () => {
    const r1 = when("urgency", "high").require("phone");
    const r2 = when("urgency", "low").hide("phone");
    const result = rules(r1, r2);
    expect(result).toEqual([r1, r2]);
  });

  it("returns an array with a single rule", () => {
    const r1 = when("injured", true).require("severity");
    expect(rules(r1)).toEqual([r1]);
  });

  it("returns an empty array when called with no arguments", () => {
    expect(rules()).toEqual([]);
  });
});
