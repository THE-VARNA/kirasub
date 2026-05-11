import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { WebhookPayloadSchema } from "@/lib/kirapay/schemas";
import crypto from "crypto";

async function processSucceededTransaction(kirapayId: string, data: {
  hash?: string | null;
  price?: number | null;
  settlementAmount?: number | null;
  sender?: string | null;
  recipient?: string | null;
  createdAt?: string;
  customOrderId?: string | null;
}) {
  // Try to find subscription by customOrderId first, then by kirapay transaction id
  let subscription = null;

  if (data.customOrderId) {
    const link = await prisma.kirapayPaymentLink.findUnique({
      where: { customOrderId: data.customOrderId },
      include: { subscription: { include: { plan: { include: { merchant: true } }, subscriber: true } } },
    });
    subscription = link?.subscription ?? null;
  }

  if (!subscription) {
    // Fallback: find by matching pending transaction
    const tx = await prisma.kirapayTransaction.findFirst({
      where: { kirapayId: null, status: "pending" },
      include: { subscription: { include: { plan: { include: { merchant: true } }, subscriber: true } } },
      orderBy: { createdAt: "desc" },
    });
    subscription = tx?.subscription ?? null;
  }

  if (!subscription) {
    console.warn("[webhook] Could not match transaction to subscription:", kirapayId);
    return;
  }

  // Update or create kirapay transaction record
  await prisma.kirapayTransaction.upsert({
    where: { kirapayId },
    create: {
      kirapayId,
      subscriptionId: subscription.id,
      status: "settled",
      txHash: data.hash,
      price: data.price,
      settlementAmount: data.settlementAmount,
      sender: data.sender,
      recipient: data.recipient,
      kirapayCreatedAt: data.createdAt ? new Date(data.createdAt) : undefined,
    },
    update: {
      status: "settled",
      txHash: data.hash,
      price: data.price,
      settlementAmount: data.settlementAmount,
    },
  });

  // Update payment link to used
  if (data.customOrderId) {
    await prisma.kirapayPaymentLink.update({
      where: { customOrderId: data.customOrderId },
      data: { status: "used" },
    }).catch(() => {});
  }

  // Grant Solana entitlement
  const now = new Date();
  const periodEnd = new Date(now.getTime() + subscription.plan.periodDays * 86400 * 1000);

  let entitlementPda: string | undefined;
  let entitlementTxSig: string | undefined;

  try {
    const { grantEntitlement } = await import("@/lib/anchor/program");
    // SHA-256 of kirapayId as payment reference hash
    const refHash = crypto.createHash("sha256").update(kirapayId).digest();
    const result = await grantEntitlement(
      subscription.plan.anchorPlanId ?? 1,
      subscription.subscriber.walletAddress,
      refHash,
      Math.round((data.price ?? 0) * 100),
    );
    entitlementPda = result.entitlementPda;
    entitlementTxSig = result.txSig;

    await prisma.entitlementWrite.create({
      data: {
        subscriptionId: subscription.id,
        action: "grant",
        entitlementPda: result.entitlementPda,
        txSignature: result.txSig,
        status: "confirmed",
      },
    });
  } catch (err) {
    console.warn("[webhook] Anchor grant_entitlement failed:", err);
    await prisma.entitlementWrite.create({
      data: {
        subscriptionId: subscription.id,
        action: "grant",
        entitlementPda: "pending",
        status: "failed",
      },
    });
  }

  // Update subscription to active
  await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      status: "active",
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      entitlementPda,
      entitlementTxSig,
    },
  });

  // Create receipt
  await prisma.receipt.create({
    data: {
      subscriptionId: subscription.id,
      kirapayRef: kirapayId,
      solTxSig: entitlementTxSig,
      entitlementPda,
      amountUsdCents: Math.round((data.price ?? 0) * 100),
      planName: subscription.plan.name,
      merchantName: subscription.plan.merchant.name,
      subscriberWallet: subscription.subscriber.walletAddress,
    },
  });
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Store raw webhook event
  const eventRecord = await prisma.webhookEvent.create({
    data: { event: (body as Record<string, unknown>)?.event as string ?? "unknown", rawPayload: body as object },
  });

  // Parse payload defensively
  const parsed = WebhookPayloadSchema.safeParse(body);
  if (!parsed.success) {
    await prisma.webhookEvent.update({
      where: { id: eventRecord.id },
      data: { error: "Unknown payload shape", processed: false },
    });
    // Return 200 so KIRAPAY doesn't retry
    return NextResponse.json({ received: true });
  }

  const { event, data } = parsed.data;

  try {
    if (event === "transaction.succeeded") {
      await processSucceededTransaction(data._id, data);
    }
    // transaction.created: update status to detected
    if (event === "transaction.created") {
      await prisma.kirapayTransaction.updateMany({
        where: { subscriptionId: { not: undefined }, status: "pending" },
        data: { status: "detected", kirapayId: data._id },
      });
    }

    await prisma.webhookEvent.update({
      where: { id: eventRecord.id },
      data: { processed: true, processedAt: new Date() },
    });
  } catch (err) {
    console.error("[webhook] processing error:", err);
    await prisma.webhookEvent.update({
      where: { id: eventRecord.id },
      data: { error: String(err) },
    });
  }

  return NextResponse.json({ received: true });
}
