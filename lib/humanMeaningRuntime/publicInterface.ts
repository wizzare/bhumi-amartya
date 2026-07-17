import { humanMeaningRuntime, type HumanMeaningRuntimeOptions } from "@/lib/humanMeaningRuntime/humanMeaningRuntime";
import { HumanMeaningInputValidationError } from "@/lib/humanMeaningRuntime/inputValidator";
import { deepFreeze } from "@/lib/humanMeaningRuntime/runtimeUtils";
import { HumanMeaningRuntimeValidationError } from "@/lib/humanMeaningRuntime/runtimeValidator";
import type { HumanMeaningRuntimeResult, RuntimeValidationIssue } from "@/lib/humanMeaningRuntime/types";

export function executeHumanMeaningRuntime(input: unknown, options: HumanMeaningRuntimeOptions = {}): HumanMeaningRuntimeResult {
  try {
    return deepFreeze({ ok: true as const, output: humanMeaningRuntime.build(input as never, options) }) as HumanMeaningRuntimeResult;
  } catch (error) {
    if (error instanceof HumanMeaningInputValidationError) {
      return failure("INVALID_INPUT", error.message, error.issues);
    }
    if (error instanceof HumanMeaningRuntimeValidationError) {
      return failure("INVALID_RUNTIME_OUTPUT", error.message, error.issues);
    }
    const message = error instanceof Error ? error.message : "Unsupported Human Meaning runtime state.";
    return failure("UNSUPPORTED_RUNTIME_STATE", message, [{ code: "UNSUPPORTED_RUNTIME_STATE", objectId: "runtime", message }]);
  }
}

function failure(
  code: "INVALID_INPUT" | "INVALID_RUNTIME_OUTPUT" | "UNSUPPORTED_RUNTIME_STATE",
  message: string,
  issues: readonly RuntimeValidationIssue[],
): HumanMeaningRuntimeResult {
  return deepFreeze({ ok: false as const, error: { code, message, issues } }) as HumanMeaningRuntimeResult;
}
