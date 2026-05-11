import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const subscription = await prisma.subscription.findUnique({
    where: { id },
    include: { plan: true, subscriber: true },
  });
  if (!subscription) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const { revokeEntitlement } = await import("@/lib/anchor/program");
    const txSig = await revokeEntitlement(
      subscription.plan.anchorPlanId ?? 1,
      subscription.subscriber.walletAddress,
    );
    await prisma.entitlementWrite.create({
      data: {
        subscriptionId: id,
        action: "revoke",
        entitlementPda: subscription.entitlementPda ?? "unknown",
        txSignature: txSig,
        status: "confirmed",
      },
    });
  } catch (err) {
    console.warn("Anchor revoke skipped (demo):", err);
  }

  await prisma.subscription.update({
    where: { id },
    data: { status: "cancelled", currentPeriodEnd: new Date() },
  });

  return NextResponse.json({ success: true });
}
