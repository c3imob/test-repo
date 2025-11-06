import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";

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
  const { title, introduction, body: contentBody, conclusion, keywords, seo, tone, audience, length } = body;

  const parsedKeywords =
    typeof keywords === "string"
      ? Array.from(
          new Set(
            keywords
              .split(",")
              .map((keyword) => keyword.trim())
              .filter(Boolean)
          )
        )
      : Array.isArray(keywords)
        ? Array.from(
            new Set(
              keywords
                .filter((keyword): keyword is string => typeof keyword === "string")
                .map((keyword) => keyword.trim())
                .filter(Boolean)
            )
          )
        : keywords === null
          ? []
          : undefined;

  const keywordUpdate =
    parsedKeywords !== undefined
      ? parsedKeywords.length > 0
        ? {
            deleteMany: {},
            create: parsedKeywords.map((value) => ({ value }))
          }
        : { deleteMany: {} }
      : undefined;

  const updateData: Prisma.PostUpdateInput = {
    title,
    introduction,
    body: contentBody,
    conclusion,
    seo,
    tone,
    audience,
    length: length ? lengthMap[length as keyof typeof lengthMap] ?? undefined : undefined
  };

  if (keywordUpdate) {
    updateData.keywords = keywordUpdate;
  }

  try {
    const updated = await prisma.post.update({
      where: { id: params.id, userId: session.user.id },
      data: updateData
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
