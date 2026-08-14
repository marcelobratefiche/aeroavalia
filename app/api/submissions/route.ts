import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdminEmail } from "@/lib/admin";

// POST /api/submissions
// Creates a new rating (+ optional feedback) for the signed-in passenger.
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      { error: "É preciso entrar com sua conta Google para enviar uma avaliação." },
      { status: 401 }
    );
  }

  const googleSub: string | undefined = session.user.sub;
  const displayName = session.user.name;

  if (!googleSub || !displayName) {
    return NextResponse.json(
      { error: "Não foi possível identificar sua conta. Tente entrar novamente." },
      { status: 400 }
    );
  }

  let body: { rating?: number; feedback?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }

  const rating = Number(body.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json(
      { error: "Selecione uma nota entre 1 e 5 estrelas." },
      { status: 400 }
    );
  }

  const feedback =
    typeof body.feedback === "string" && body.feedback.trim().length > 0
      ? body.feedback.trim().slice(0, 4000)
      : null;

  // Basic anti-double-submit guard: block if this Google account submitted
  // in the last 30 seconds (covers accidental double-clicks / double taps).
  const recent = await prisma.submission.findFirst({
    where: {
      googleSub,
      createdAt: { gte: new Date(Date.now() - 30_000) },
    },
  });
  if (recent) {
    return NextResponse.json(
      { error: "Você já enviou uma avaliação há poucos instantes. Obrigado!" },
      { status: 429 }
    );
  }

  const submission = await prisma.submission.create({
    data: { displayName, googleSub, rating, feedback },
  });

  return NextResponse.json(
    { id: submission.id, createdAt: submission.createdAt },
    { status: 201 }
  );
}

// GET /api/submissions?cursor=<id>&take=20
// Admin-only paginated list of COMPACT summaries (name + rating only).
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!isAdminEmail(session?.user?.email)) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor") ?? undefined;
  const take = Math.min(Number(searchParams.get("take") ?? 20), 50);

  const items = await prisma.submission.findMany({
    take: take + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      displayName: true,
      rating: true,
      createdAt: true,
      feedback: true, // only used to compute hasFeedback, stripped below
    },
  });

  const hasMore = items.length > take;
  const page = items.slice(0, take).map((s: (typeof items)[number]) => ({
    id: s.id,
    displayName: s.displayName,
    rating: s.rating,
    createdAt: s.createdAt,
    hasFeedback: !!s.feedback,
  }));

  const total = await prisma.submission.count();

  return NextResponse.json({
    items: page,
    nextCursor: hasMore ? page[page.length - 1].id : null,
    total,
  });
}
