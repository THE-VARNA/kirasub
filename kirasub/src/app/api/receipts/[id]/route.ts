import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const receipt = await prisma.receipt.findUnique({
    where: { id },
    include: { subscription: { include: { plan: { include: { merchant: true } }, subscriber: true } } },
  });
  if (!receipt) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ receipt });
}
