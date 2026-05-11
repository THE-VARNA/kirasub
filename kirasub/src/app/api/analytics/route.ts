import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const merchantId = req.nextUrl.searchParams.get("merchantId") ?? "default";
  const [
    activeCount,
    pendingCount,
    totalPlans,
    recentTransactions,
    recentSubscriptions,
  ] = await Promise.all([
    prisma.subscription.count({ where: { status: "active" } }),
    prisma.subscription.count({ where: { status: "pending_payment" } }),
    prisma.plan.count({ where: { active: true } }),
    prisma.kirapayTransaction.findMany({
      where: { status: "settled" },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { subscription: { include: { plan: true, subscriber: true } } },
    }),
    prisma.subscription.findMany({
      where: { status: "active" },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { plan: true, subscriber: true },
    }),
  ]);

  // MRR: sum of active subscription plan prices
  const activeSubs = await prisma.subscription.findMany({
    where: { status: "active" },
    include: { plan: true },
  });
  const mrrCents = activeSubs.reduce((acc, s) => {
    const monthly = (s.plan.priceUsdCents * 30) / s.plan.periodDays;
    return acc + monthly;
  }, 0);

  // Churn risk: subscriptions expiring in 7 days
  const churnRisk = await prisma.subscription.count({
    where: {
      status: "active",
      currentPeriodEnd: {
        lte: new Date(Date.now() + 7 * 86400 * 1000),
        gte: new Date(),
      },
    },
  });

  return NextResponse.json({
    mrrUsdCents: Math.round(mrrCents),
    activeSubscribers: activeCount,
    pendingPayments: pendingCount,
    churnRisk,
    totalPlans,
    recentTransactions: recentTransactions.map((tx) => ({
      id: tx.id,
      kirapayId: tx.kirapayId,
      amount: tx.price,
      status: tx.status,
      plan: tx.subscription?.plan?.name,
      subscriber: tx.subscription?.subscriber?.walletAddress?.slice(0, 8) + "...",
      date: tx.createdAt,
    })),
    recentSubscriptions: recentSubscriptions.map((s) => ({
      id: s.id,
      plan: s.plan.name,
      wallet: s.subscriber.walletAddress,
      status: s.status,
      expires: s.currentPeriodEnd,
    })),
  });
}
