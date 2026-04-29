import type {
  FieldDefinition,
  Rule,
  RuleEngineResult,
} from "@intentform/shared";

export function evaluateRules(
  rules: Rule[],
  fields: FieldDefinition[],
  values: Record<string, unknown>
): RuleEngineResult {
  const hidden = new Set<string>();
  const required = new Set<string>();

  // Initialize required from field definitions
  for (const field of fields) {
    if (field.required) {
      required.add(field.id);
    }
  }

  for (const rule of rules) {
    if (values[rule.when.field] === rule.when.value) {
      switch (rule.then.effect) {
        case "hide":
          hidden.add(rule.then.target);
          required.delete(rule.then.target);
          break;
        case "show":
          hidden.delete(rule.then.target);
          break;
        case "require":
          required.add(rule.then.target);
          break;
        case "unrequire":
          required.delete(rule.then.target);
          break;
        default:
          break;
      }
    }
  }

  return {
    hiddenFields: hidden,
    requiredFields: required,
  };
}
