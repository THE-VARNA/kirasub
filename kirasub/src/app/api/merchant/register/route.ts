import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { RegisterMerchantSchema } from "@/lib/kirapay/schemas";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = RegisterMerchantSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const { name, solWallet } = parsed.data;

    // Check if merchant already exists for this wallet
    const existing = await prisma.merchant.findFirst({ where: { solWallet } });
    if (existing) {
      return NextResponse.json({ merchant: existing });
    }

    const merchant = await prisma.merchant.create({
      data: { name, solWallet },
    });

    // Try to initialize on-chain (non-blocking — may fail if program not deployed)
    try {
      const { initializeMerchant } = await import("@/lib/anchor/program");
      const txSig = await initializeMerchant(name);
      // Derive PDA
      const { PublicKey } = await import("@solana/web3.js");
      const { getMerchantPda } = await import("@/lib/anchor/program");
      const keypair = JSON.parse(process.env.MERCHANT_AUTHORITY_KEYPAIR ?? "[]");
      const { Keypair } = await import("@solana/web3.js");
      const authority = Keypair.fromSecretKey(Uint8Array.from(keypair)).publicKey;
      const programId = new PublicKey(process.env.NEXT_PUBLIC_PROGRAM_ID ?? "11111111111111111111111111111111");
      const [pda] = getMerchantPda(authority, programId);
      await prisma.merchant.update({
        where: { id: merchant.id },
        data: { anchorPda: pda.toBase58() },
      });
    } catch (anchorErr) {
      console.warn("Anchor initialize skipped:", anchorErr);
    }

    return NextResponse.json({ merchant }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  const merchants = await prisma.merchant.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ merchants });
}
