import type { AnswerOption } from "./script-engine";

const SECONDARY_IDS = new Set([
  "not_ogz",
  "small",
  "p10_nt",
  "later",
  "foundation",
]);

function isSecondaryAnswer(answer: AnswerOption): boolean {
  if (answer.variant === "secondary") return true;
  if (answer.endFlow || SECONDARY_IDS.has(answer.id)) return true;
  if (answer.id === "no" && answer.patch?.hasOgzInterest === false) return true;
  if (answer.id === "no" && answer.label.trim() === "Нет") return true;
  return false;
}

/** Только пара «Да» + «Нет» на шагах открытия */
function isStrictYesNoStep(answers?: AnswerOption[]): boolean {
  if (!answers || answers.length !== 2) return false;
  const labels = new Set(answers.map((a) => a.label.trim()));
  return labels.has("Да") && labels.has("Нет");
}

export function answerButtonClass(
  answer: AnswerOption,
  answers?: AnswerOption[]
): string {
  if (answer.variant === "primary") return "btn-wizard";
  if (answer.variant === "secondary") return "btn-wizard btn-wizard--muted";

  if (isStrictYesNoStep(answers)) {
    return isSecondaryAnswer(answer)
      ? "btn-wizard btn-wizard--muted"
      : "btn-wizard btn-wizard--soft";
  }

  if (isSecondaryAnswer(answer)) {
    return "btn-wizard btn-wizard--muted";
  }

  return "btn-wizard";
}
