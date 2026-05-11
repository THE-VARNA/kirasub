import { z } from "zod";

// ─── KIRAPAY Request Schemas ─────────────────────────────────────────────

export const TokenOutSchema = z.object({
  chainId: z.string(), // "sol" | "btc" | EVM chain id e.g. "8453"
  address: z.string().optional(), // required for EVM; "SOL" for Solana native
});

export const CreatePaymentLinkSchema = z.object({
  tokenOut: TokenOutSchema,
  receiver: z.string(),
  price: z.number().min(0),
  name: z.string().optional(),
  customOrderId: z.string().optional(),
  redirectUrl: z.string().url().optional(),
  type: z.enum(["single_use", "unlimited"]).optional(),
});

export type CreatePaymentLinkInput = z.infer<typeof CreatePaymentLinkSchema>;

// ─── KIRAPAY Response Schemas ────────────────────────────────────────────

export const KirapaySuccessResponseSchema = z.object({
  message: z.string().optional(),
  code: z.number().optional(),
  data: z.any().optional(),
  url: z.string().optional(), // some endpoints return url at root
});

export const PaymentLinkResponseSchema = z.object({
  url: z.string(),
});

export const KirapayTransactionSchema = z.object({
  _id: z.string(),
  status: z.string(), // Success | Pending | Failed etc.
  hash: z.string().optional().nullable(),
  price: z.number().optional().nullable(),
  settlementAmount: z.number().optional().nullable(),
  sender: z.string().optional().nullable(),
  recipient: z.string().optional().nullable(),
  createdAt: z.string().optional(),
  customOrderId: z.string().optional().nullable(),
});

export type KirapayTransaction = z.infer<typeof KirapayTransactionSchema>;

// ─── Webhook Schemas ─────────────────────────────────────────────────────

export const WebhookPayloadSchema = z.object({
  event: z.enum([
    "transaction.created",
    "transaction.succeeded",
    "transaction.refund",
  ]),
  data: z.object({
    _id: z.string(),
    status: z.string(),
    hash: z.string().optional().nullable(),
    price: z.number().optional().nullable(),
    settlementAmount: z.number().optional().nullable(),
    sender: z.string().optional().nullable(),
    recipient: z.string().optional().nullable(),
    createdAt: z.string().optional(),
    customOrderId: z.string().optional().nullable(),
  }),
});

export type WebhookPayload = z.infer<typeof WebhookPayloadSchema>;

// ─── Internal API Schemas ────────────────────────────────────────────────

export const CreatePlanSchema = z.object({
  merchantId: z.string(),
  name: z.string().min(1).max(64),
  description: z.string().optional(),
  priceUsdCents: z.number().int().min(1),
  periodDays: z.number().int().min(1),
  features: z.array(z.string()).default([]),
  trialDays: z.number().int().min(0).default(0),
});

export const InitiateCheckoutSchema = z.object({
  planId: z.string(),
  subscriberWallet: z.string(),
  merchantId: z.string(),
});

export const RegisterMerchantSchema = z.object({
  name: z.string().min(1).max(64),
  solWallet: z.string().min(32).max(44),
});
