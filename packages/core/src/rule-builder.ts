import type { Rule, RuleEffect } from "@intentform/shared";

export interface RuleThen {
  hide(target: string): Rule;
  require(target: string): Rule;
  show(target: string): Rule;
  unrequire(target: string): Rule;
}

function makeRule(
  field: string,
  value: unknown,
  effect: RuleEffect,
  target: string
): Rule {
  return {
    then: { effect, target },
    when: { field, value },
  };
}

export function when(field: string, value: unknown): RuleThen {
  return {
    hide: (target: string) => makeRule(field, value, "hide", target),
    require: (target: string) => makeRule(field, value, "require", target),
    show: (target: string) => makeRule(field, value, "show", target),
    unrequire: (target: string) => makeRule(field, value, "unrequire", target),
  };
}

export function rules(...r: Rule[]): Rule[] {
  return r;
}
