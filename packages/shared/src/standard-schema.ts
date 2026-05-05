// biome-ignore lint/style/noNamespace: standard-schema spec requires namespace
export declare namespace StandardSchemaV1 {
  export interface Props<Input = unknown, Output = Input> {
    readonly "~standard": InternalProps<Input, Output>;
  }
  export interface InternalProps<Input = unknown, Output = Input> {
    readonly types?: Types<Input, Output> | undefined;
    readonly validate: (
      value: unknown
    ) => Result<Output> | Promise<Result<Output>>;
    readonly vendor: string;
    readonly version: 1;
  }
  export type Result<Output> = SuccessResult<Output> | FailureResult;
  export interface SuccessResult<Output> {
    readonly issues?: undefined;
    readonly value: Output;
  }
  export interface FailureResult {
    readonly issues: readonly Issue[];
  }
  export interface Issue {
    readonly message: string;
    readonly path?: ReadonlyArray<PropertyKey | PathSegment> | undefined;
  }
  export interface PathSegment {
    readonly key: PropertyKey;
  }
  export interface Types<Input = unknown, Output = Input> {
    readonly input: Input;
    readonly output: Output;
  }
  export type InferInput<Schema extends Props> = NonNullable<
    Schema["~standard"]["types"]
  >["input"];
  export type InferOutput<Schema extends Props> = NonNullable<
    Schema["~standard"]["types"]
  >["output"];
}

export type StandardSchemaV1<
  Input = unknown,
  Output = Input,
> = StandardSchemaV1.Props<Input, Output>;

export type StandardValidateResult<T> =
  | { success: true; value: T }
  | { success: false; issues: readonly StandardSchemaV1.Issue[] };

export async function validateStandard<T>(
  schema: StandardSchemaV1<unknown, T>,
  value: unknown
): Promise<StandardValidateResult<T>> {
  const result = await schema["~standard"].validate(value);
  if (result.issues) {
    return { success: false, issues: result.issues };
  }
  return { success: true, value: result.value };
}

export function isStandardSchema(x: unknown): x is StandardSchemaV1 {
  return (
    typeof x === "object" &&
    x !== null &&
    "~standard" in x &&
    typeof (x as Record<string, unknown>)["~standard"] === "object"
  );
}
