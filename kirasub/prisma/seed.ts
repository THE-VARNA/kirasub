import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // 1. Create a Merchant
  const merchant = await prisma.merchant.upsert({
    where: { id: "demo_merchant_001" },
    update: {},
    create: {
      id: "demo_merchant_001",
      name: "KiraSub Premium",
      solWallet: "c6dcTyGAuiKh6vxBVbMf7ndTwiMPW4AESdRQEYxpNtz", // Generated previously
      anchorPda: "G9qB...4s5V", // Mock or real PDA if available
    },
  });

  // 2. Create Plans
  const plans = [
    {
      name: "Starter Plan",
      description: "Perfect for hobbyists and small projects.",
      priceUsdCents: 999,
      periodDays: 30,
      features: ["Up to 100 users", "Basic analytics", "Discord support"],
      anchorPlanId: 1,
    },
    {
      name: "Pro Access",
      description: "Full suite for growing applications.",
      priceUsdCents: 2999,
      periodDays: 30,
      features: ["Unlimited users", "Advanced analytics", "Priority support", "Custom branding"],
      anchorPlanId: 2,
    },
    {
      name: "Annual Elite",
      description: "Best value for long-term partners.",
      priceUsdCents: 24900,
      periodDays: 365,
      features: ["Everything in Pro", "White-label reports", "Personal account manager"],
      anchorPlanId: 3,
    },
  ];

  for (const planData of plans) {
    await prisma.plan.create({
      data: {
        ...planData,
        merchantId: merchant.id,
      },
    });
  }

  console.log("✅ Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
