import { NextResponse } from "next/server";

import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const lengthMap = {
  short: "SHORT",
  medium: "MEDIUM",
  long: "LONG"
} as const;

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerAuthSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { introduction, body: contentBody, conclusion, keywords, seo, tone, audience, length } = body;

  try {
    const updated = await prisma.post.update({
      where: { id: params.id, userId: session.user.id },
      data: {
        introduction,
        body: contentBody,
        conclusion,
        keywords,
        seo,
        tone,
        audience,
        length: length ? lengthMap[length as keyof typeof lengthMap] ?? undefined : undefined
      }
    });

    return NextResponse.json({ success: true, updatedAt: updated.updatedAt });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to update post" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerAuthSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await prisma.post.delete({
      where: { id: params.id, userId: session.user.id }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to delete post" }, { status: 500 });
  }
}
