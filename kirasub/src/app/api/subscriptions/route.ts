import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const wallet = req.nextUrl.searchParams.get("wallet");
  const merchantId = req.nextUrl.searchParams.get("merchantId");
  const search = req.nextUrl.searchParams.get("search");

  const subscriptions = await prisma.subscription.findMany({
    where: {
      ...(merchantId ? { plan: { merchantId } } : {}),
      ...(wallet ? { subscriber: { walletAddress: { contains: wallet } } } : {}),
      ...(search ? {
        OR: [
          { subscriber: { walletAddress: { contains: search, mode: "insensitive" } } },
          { plan: { name: { contains: search, mode: "insensitive" } } },
        ],
      } : {}),
    },
    include: {
      plan: true,
      subscriber: true,
      transactions: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json({ subscriptions });
}
