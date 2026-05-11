/**
 * DEMO MODE simulator — returns clearly-labelled fake responses
 * when DEMO_MODE=true in env. Live API integration stays complete.
 */

import { CreatePaymentLinkInput } from "./schemas";

export const DEMO_MODE = process.env.DEMO_MODE === "true";

let _demoCounter = 1000;

export function demoCreatePaymentLink(
  params: CreatePaymentLinkInput
): { url: string } {
  const code = `DEMO_${Date.now()}_${_demoCounter++}`;
  return {
    url: `https://checkout.kira-pay.com/demo-${code}`,
  };
}

export function demoListTransactions() {
  return [
    {
      _id: "demo_txn_001",
      status: "Success",
      hash: "demo_hash_abc123",
      price: 9.99,
      settlementAmount: 9.99,
      sender: "DemoSenderWallet1111111111111111111111111",
      recipient: process.env.MERCHANT_SOL_WALLET ?? "DemoMerchantWallet",
      createdAt: new Date().toISOString(),
    },
  ];
}

/** Simulate webhook event (call from /api/dev/simulate-webhook in demo mode) */
export function buildDemoWebhookPayload(customOrderId: string, price: number) {
  return {
    event: "transaction.succeeded" as const,
    data: {
      _id: `demo_${Date.now()}`,
      status: "Success",
      hash: `demo_hash_${Date.now()}`,
      price,
      settlementAmount: price,
      sender: "DemoUserWallet111111111111111111111111111",
      recipient: process.env.MERCHANT_SOL_WALLET ?? "DemoMerchantWallet",
      createdAt: new Date().toISOString(),
      customOrderId,
    },
  };
}
