import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CreatePlanSchema } from "@/lib/kirapay/schemas";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = CreatePlanSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const data = parsed.data;

    // Verify merchant exists
    const merchant = await prisma.merchant.findUnique({ where: { id: data.merchantId } });
    if (!merchant) return NextResponse.json({ error: "Merchant not found" }, { status: 404 });

    // Generate plan_id (use count + 1)
    const planCount = await prisma.plan.count({ where: { merchantId: data.merchantId } });
    const planId = planCount + 1;

    const plan = await prisma.plan.create({
      data: {
        merchantId: data.merchantId,
        name: data.name,
        description: data.description,
        priceUsdCents: data.priceUsdCents,
        periodDays: data.periodDays,
        features: data.features,
        trialDays: data.trialDays,
        anchorPlanId: planId,
      },
    });

    // Try to create plan on-chain
    try {
      const { createPlanOnChain } = await import("@/lib/anchor/program");
      const result = await createPlanOnChain(
        planId,
        data.name,
        data.priceUsdCents,
        data.periodDays,
      );
      await prisma.plan.update({
        where: { id: plan.id },
        data: { anchorPda: result.planPda },
      });
    } catch (err) {
      console.warn("Anchor create_plan skipped:", err);
    }

    return NextResponse.json({ plan }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const merchantId = req.nextUrl.searchParams.get("merchantId");
  const plans = await prisma.plan.findMany({
    where: merchantId ? { merchantId } : {},
    include: { merchant: true, _count: { select: { subscriptions: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ plans });
}
