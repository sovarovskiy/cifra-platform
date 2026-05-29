import type { AnswerOption } from "./script-engine";

const SECONDARY_IDS = new Set([
  "not_ogz",
  "small",
  "p10_nt",
  "later",
  "foundation",
]);

/** Да — бирюзовая с обводкой; Нет / отказ — светлая серая */
export function answerButtonClass(answer: AnswerOption): string {
  if (answer.variant === "primary") return "btn-choice btn-choice-primary";
  if (answer.variant === "secondary") return "btn-choice btn-choice-secondary";

  if (answer.endFlow || SECONDARY_IDS.has(answer.id)) {
    return "btn-choice btn-choice-secondary";
  }

  if (answer.id === "no") {
    if (answer.patch?.hasOgzInterest === false) {
      return "btn-choice btn-choice-secondary";
    }
    if (answer.label.trim() === "Нет") {
      return "btn-choice btn-choice-secondary";
    }
  }

  return "btn-choice btn-choice-primary";
}
