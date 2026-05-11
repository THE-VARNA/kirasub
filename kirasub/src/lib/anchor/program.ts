"use server";

import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
} from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";

const RPC = process.env.NEXT_PUBLIC_SOLANA_RPC ?? "https://api.devnet.solana.com";

function getConnection() {
  return new Connection(RPC, "confirmed");
}

function getMerchantKeypair(): Keypair {
  const raw = process.env.MERCHANT_AUTHORITY_KEYPAIR;
  if (!raw) throw new Error("MERCHANT_AUTHORITY_KEYPAIR not set");
  const bytes = JSON.parse(raw) as number[];
  return Keypair.fromSecretKey(Uint8Array.from(bytes));
}

function getProgramId(): PublicKey {
  const id = process.env.NEXT_PUBLIC_PROGRAM_ID;
  if (!id || id === "11111111111111111111111111111111") {
    throw new Error("NEXT_PUBLIC_PROGRAM_ID not set — run anchor deploy first");
  }
  return new PublicKey(id);
}

async function getProgram() {
  const connection = getConnection();
  const keypair = getMerchantKeypair();
  const wallet = new anchor.Wallet(keypair);
  const provider = new anchor.AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });
  // IDL loaded dynamically after anchor build
  const idl = await (async () => {
    try {
      return (await import("@/generated/anchor/kirasub.json")) as anchor.Idl;
    } catch {
      throw new Error("Anchor IDL not found — run: npm run anchor:build");
    }
  })();
  return new anchor.Program(idl, provider);
}

/** Derive MerchantConfig PDA */
export function getMerchantPda(authority: PublicKey, programId: PublicKey) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("merchant"), authority.toBuffer()],
    programId
  );
}

/** Derive Plan PDA */
export function getPlanPda(
  merchantPda: PublicKey,
  planId: bigint,
  programId: PublicKey
) {
  const planIdBuf = Buffer.alloc(8);
  planIdBuf.writeBigUInt64LE(planId);
  return PublicKey.findProgramAddressSync(
    [Buffer.from("plan"), merchantPda.toBuffer(), planIdBuf],
    programId
  );
}

/** Derive Entitlement PDA */
export function getEntitlementPda(
  merchantPda: PublicKey,
  planId: bigint,
  subscriber: PublicKey,
  programId: PublicKey
) {
  const planIdBuf = Buffer.alloc(8);
  planIdBuf.writeBigUInt64LE(planId);
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("entitlement"),
      merchantPda.toBuffer(),
      planIdBuf,
      subscriber.toBuffer(),
    ],
    programId
  );
}

export async function initializeMerchant(name: string): Promise<string> {
  const program = await getProgram();
  const keypair = getMerchantKeypair();
  const programId = getProgramId();
  const [merchantPda] = getMerchantPda(keypair.publicKey, programId);
  const tx = await program.methods
    .initializeMerchant(name)
    .accounts({
      merchantConfig: merchantPda,
      authority: keypair.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .rpc();
  return tx;
}

export async function createPlanOnChain(
  planId: number,
  name: string,
  priceUsdCents: number,
  periodDays: number
): Promise<{ txSig: string; planPda: string; merchantPda: string }> {
  const program = await getProgram();
  const keypair = getMerchantKeypair();
  const programId = getProgramId();
  const [merchantPda] = getMerchantPda(keypair.publicKey, programId);
  const [planPda] = getPlanPda(merchantPda, BigInt(planId), programId);
  const tx = await program.methods
    .createPlan(
      new anchor.BN(planId),
      name,
      new anchor.BN(priceUsdCents),
      periodDays
    )
    .accounts({
      merchantConfig: merchantPda,
      plan: planPda,
      authority: keypair.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .rpc();
  return { txSig: tx, planPda: planPda.toBase58(), merchantPda: merchantPda.toBase58() };
}

export async function grantEntitlement(
  planId: number,
  subscriberWallet: string,
  paymentRefHash: Uint8Array,
  amountUsdCents: number
): Promise<{ txSig: string; entitlementPda: string }> {
  const program = await getProgram();
  const keypair = getMerchantKeypair();
  const programId = getProgramId();
  const subscriber = new PublicKey(subscriberWallet);
  const [merchantPda] = getMerchantPda(keypair.publicKey, programId);
  const [planPda] = getPlanPda(merchantPda, BigInt(planId), programId);
  const [entitlementPda] = getEntitlementPda(
    merchantPda,
    BigInt(planId),
    subscriber,
    programId
  );
  const tx = await program.methods
    .grantEntitlement(
      Array.from(paymentRefHash) as number[],
      new anchor.BN(amountUsdCents)
    )
    .accounts({
      merchantConfig: merchantPda,
      plan: planPda,
      entitlement: entitlementPda,
      subscriber,
      authority: keypair.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .rpc();
  return { txSig: tx, entitlementPda: entitlementPda.toBase58() };
}

export async function revokeEntitlement(
  planId: number,
  subscriberWallet: string
): Promise<string> {
  const program = await getProgram();
  const keypair = getMerchantKeypair();
  const programId = getProgramId();
  const subscriber = new PublicKey(subscriberWallet);
  const [merchantPda] = getMerchantPda(keypair.publicKey, programId);
  const [entitlementPda] = getEntitlementPda(
    merchantPda,
    BigInt(planId),
    subscriber,
    programId
  );
  const tx = await program.methods
    .revokeEntitlement()
    .accounts({
      merchantConfig: merchantPda,
      entitlement: entitlementPda,
      authority: keypair.publicKey,
    })
    .rpc();
  return tx;
}

/** Read entitlement PDA state (client-side friendly — returns serialized data) */
export async function fetchEntitlementState(entitlementPda: string) {
  const connection = getConnection();
  const pubkey = new PublicKey(entitlementPda);
  const accountInfo = await connection.getAccountInfo(pubkey);
  return accountInfo;
}
