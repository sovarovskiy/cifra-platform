import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  addCallCompletion,
  buildCompletionFromWizard,
  type CallOutcomeType,
} from "@/lib/call-stats";
import type { NonTargetFlowId, QualificationState } from "@/lib/scoring";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as {
    state?: QualificationState;
    outcomeType?: CallOutcomeType;
    nonTargetFlow?: NonTargetFlowId;
  };

  if (!body.state || !body.outcomeType) {
    return NextResponse.json({ error: "Некорректные данные" }, { status: 400 });
  }

  if (body.outcomeType === "non_target" && !body.nonTargetFlow) {
    return NextResponse.json(
      { error: "Укажите nonTargetFlow для нецелевого исхода" },
      { status: 400 }
    );
  }

  const completion = buildCompletionFromWizard({
    userEmail: user.email,
    state: body.state,
    outcomeType: body.outcomeType,
    nonTargetFlow: body.nonTargetFlow,
  });

  await addCallCompletion(completion);
  return NextResponse.json({ ok: true, id: completion.id });
}
