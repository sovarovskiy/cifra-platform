import type { AnswerOption } from "./script-engine";

const SECONDARY_IDS = new Set([
  "no",
  "not_ogz",
  "small",
  "p10_nt",
  "later",
  "foundation",
]);

/** Primary = матовая #1A535C, Secondary = #E5ECEC */
export function answerButtonClass(answer: AnswerOption, stepId: string): string {
  if (answer.variant === "primary") return "btn-choice btn-choice-primary";
  if (answer.variant === "secondary") return "btn-choice btn-choice-secondary";

  if (SECONDARY_IDS.has(answer.id) || answer.endFlow) {
    return "btn-choice btn-choice-secondary";
  }

  if (answer.id === "yes") return "btn-choice btn-choice-primary";

  if (stepId === "budget_main") return "btn-choice btn-choice-primary";

  const twoChoiceNo =
    answer.id === "no" ||
    answer.id === "na" ||
    answer.label.toLowerCase().startsWith("нет");

  if (twoChoiceNo) return "btn-choice btn-choice-secondary";

  return "btn-choice btn-choice-primary";
}
