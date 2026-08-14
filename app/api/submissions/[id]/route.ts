import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdminEmail } from "@/lib/admin";

// PATCH /api/submissions/:id
// Lets the passenger who created a submission attach feedback to it
// afterwards (the "Enviar feedback" step, which is a separate,
// optional action from the star rating itself). Only the original
// submitter (matched by Google "sub") can do this, only while the
// feedback field is still empty, and only within 15 minutes of
// creation — this is a courtesy window, not an editable-forever record.
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const googleSub: string | undefined = session?.user?.sub;
  if (!googleSub) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { id } = await params;
  let body: { feedback?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }

  const feedback =
    typeof body.feedback === "string" ? body.feedback.trim().slice(0, 4000) : "";
  if (!feedback) {
    return NextResponse.json(
      { error: "Escreva algo antes de enviar o feedback." },
      { status: 400 }
    );
  }

  const submission = await prisma.submission.findUnique({ where: { id } });
  if (!submission || submission.googleSub !== googleSub) {
    return NextResponse.json(
      { error: "Avaliação não encontrada." },
      { status: 404 }
    );
  }
  if (submission.feedback) {
    return NextResponse.json(
      { error: "Esta avaliação já possui feedback." },
      { status: 409 }
    );
  }
  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60_000);
  if (submission.createdAt < fifteenMinutesAgo) {
    return NextResponse.json(
      { error: "O prazo para adicionar feedback a esta avaliação expirou." },
      { status: 410 }
    );
  }

  await prisma.submission.update({ where: { id }, data: { feedback } });
  return NextResponse.json({ ok: true });
}

// GET /api/submissions/:id — admin-only full detail (includes feedback text).
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!isAdminEmail(session?.user?.email)) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  }

  const { id } = await params;
  const submission = await prisma.submission.findUnique({ where: { id } });

  if (!submission) {
    return NextResponse.json(
      { error: "Avaliação não encontrada." },
      { status: 404 }
    );
  }

  return NextResponse.json({
    id: submission.id,
    displayName: submission.displayName,
    rating: submission.rating,
    feedback: submission.feedback,
    createdAt: submission.createdAt,
  });
}
