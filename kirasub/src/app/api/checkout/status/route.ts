import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const subscriptionId = req.nextUrl.searchParams.get("subscriptionId");
  if (!subscriptionId) {
    return NextResponse.json({ error: "subscriptionId required" }, { status: 400 });
  }

  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
    include: {
      plan: true,
      transactions: { orderBy: { createdAt: "desc" }, take: 1 },
      paymentLinks: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  if (!subscription) {
    return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
  }

  const tx = subscription.transactions[0];
  const link = subscription.paymentLinks[0];

  return NextResponse.json({
    subscriptionId,
    status: subscription.status,
    paymentStatus: tx?.status ?? "pending",
    entitlementPda: subscription.entitlementPda,
    entitlementTxSig: subscription.entitlementTxSig,
    checkoutUrl: link?.kirapayUrl,
    currentPeriodEnd: subscription.currentPeriodEnd,
    plan: {
      name: subscription.plan.name,
      priceUsdCents: subscription.plan.priceUsdCents,
      periodDays: subscription.plan.periodDays,
    },
  });
}
