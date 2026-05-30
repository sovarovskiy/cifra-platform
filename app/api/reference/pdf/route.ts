import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { fetchReferencePdfBuffer } from "@/lib/google-reference";
import { REFERENCE_SETUP_HINT } from "@/lib/reference-sheet";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pdf = await fetchReferencePdfBuffer();
  if (!pdf) {
    return NextResponse.json(
      { error: `Не удалось скачать PDF. ${REFERENCE_SETUP_HINT}` },
      { status: 502 }
    );
  }

  return new NextResponse(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="referens-ogz.pdf"',
      "Cache-Control": "no-store",
    },
  });
}
