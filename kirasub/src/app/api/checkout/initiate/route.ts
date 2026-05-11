import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { InitiateCheckoutSchema } from "@/lib/kirapay/schemas";
import { DEMO_MODE, demoCreatePaymentLink } from "@/lib/kirapay/demo";
import { createPaymentLink, extractLinkCode } from "@/lib/kirapay/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = InitiateCheckoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const { planId, subscriberWallet, merchantId } = parsed.data;

    const plan = await prisma.plan.findUnique({
      where: { id: planId },
      include: { merchant: true },
    });
    if (!plan) return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    if (!plan.active) return NextResponse.json({ error: "Plan is inactive" }, { status: 400 });

    // Find or create subscriber
    let subscriber = await prisma.subscriber.findUnique({
      where: { merchantId_walletAddress: { merchantId, walletAddress: subscriberWallet } },
    });
    if (!subscriber) {
      subscriber = await prisma.subscriber.create({
        data: { merchantId, walletAddress: subscriberWallet },
      });
    }

    // Create pending subscription
    const subscription = await prisma.subscription.create({
      data: {
        subscriberId: subscriber.id,
        planId,
        status: "pending_payment",
      },
    });

    const customOrderId = subscription.id;
    const priceUsd = plan.priceUsdCents / 100;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const redirectUrl = `${appUrl}/checkout/${planId}?subscriptionId=${subscription.id}&status=success`;

    // Generate KIRAPAY payment link
    const merchant = plan.merchant;
    let linkResult: { url: string };

    if (DEMO_MODE) {
      linkResult = demoCreatePaymentLink({
        tokenOut: { chainId: "sol", address: "SOL" },
        receiver: merchant.solWallet,
        originalPrice: priceUsd,
        name: `KiraSub: ${plan.name}`,
        customOrderId,
        redirectUrl,
        type: "single_use",
      });
    } else {
      linkResult = await createPaymentLink({
        tokenOut: { chainId: "sol", address: "SOL" },
        receiver: merchant.solWallet,
        originalPrice: priceUsd,
        name: `KiraSub: ${plan.name}`,
        customOrderId,
        redirectUrl,
        type: "single_use",
      });
    }

    const linkCode = extractLinkCode(linkResult.url);

    // Store payment link
    await prisma.kirapayPaymentLink.create({
      data: {
        planId,
        subscriptionId: subscription.id,
        kirapayUrl: linkResult.url,
        linkCode,
        customOrderId,
        status: "pending",
      },
    });

    // Create pending transaction record
    await prisma.kirapayTransaction.create({
      data: {
        subscriptionId: subscription.id,
        status: "pending",
      },
    });

    return NextResponse.json({
      subscriptionId: subscription.id,
      checkoutUrl: linkResult.url,
      isDemo: DEMO_MODE,
    }, { status: 201 });
  } catch (err) {
    console.error("[checkout/initiate]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
