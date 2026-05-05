export type IntentFormErrorCode =
  | "CONFIG"
  | "PARSE"
  | "PROVIDER"
  | "UNKNOWN_MODEL"
  | "VALIDATION";

export class IntentFormError extends Error {
  readonly code: IntentFormErrorCode;

  constructor(
    code: IntentFormErrorCode,
    message: string,
    options?: ErrorOptions
  ) {
    super(message, options);
    this.name = "IntentFormError";
    this.code = code;
  }
}
