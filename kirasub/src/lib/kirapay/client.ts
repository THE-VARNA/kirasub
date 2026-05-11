/**
 * Server-only KIRAPAY API wrapper.
 * Base URL: https://api.kira-pay.com/api (official docs)
 * Auth: x-api-key header
 */

import { CreatePaymentLinkInput, KirapayTransaction, WebhookPayload } from "./schemas";

const BASE_URL = "https://api.kira-pay.com/api";

function getKey(): string {
  const key = process.env.KIRAPAY_API_KEY;
  if (!key) throw new Error("KIRAPAY_API_KEY is not set");
  return key;
}

async function kfetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "x-api-key": getKey(),
      ...init?.headers,
    },
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(
      `KIRAPAY API error ${res.status}: ${json?.message ?? JSON.stringify(json)}`
    );
  }
  // Handle both { url } and { data: { url } } response shapes
  return (json?.data ?? json) as T;
}

/** POST /api/link/generate — create hosted checkout link */
export async function createPaymentLink(
  params: CreatePaymentLinkInput
): Promise<{ url: string }> {
  return kfetch<{ url: string }>("/link/generate", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

/** GET /api/link — list all payment links */
export async function listPaymentLinks(): Promise<unknown[]> {
  return kfetch<unknown[]>("/link");
}

/** GET /api/link/{code} — get single link details */
export async function getLinkByCode(code: string): Promise<unknown> {
  return kfetch<unknown>(`/link/${code}`);
}

/** GET /api/wallet/transactions — list wallet transactions */
export async function listTransactions(): Promise<KirapayTransaction[]> {
  return kfetch<KirapayTransaction[]>("/wallet/transactions");
}

/** GET /api/wallet/transactions/{id} */
export async function getTransactionById(id: string): Promise<KirapayTransaction> {
  return kfetch<KirapayTransaction>(`/wallet/transactions/${id}`);
}

/** GET /api/wallet/transactions/status/{hash} */
export async function getTransactionByHash(hash: string): Promise<KirapayTransaction> {
  return kfetch<KirapayTransaction>(`/wallet/transactions/status/${hash}`);
}

/** POST /api/webhooks — register webhook endpoint */
export async function registerWebhook(url: string): Promise<void> {
  await kfetch<unknown>("/webhooks", {
    method: "POST",
    body: JSON.stringify({ url }),
  });
}

/** POST /api/wallet/transactions/refund */
export async function createRefund(transactionId: string): Promise<void> {
  await kfetch<unknown>("/wallet/transactions/refund", {
    method: "POST",
    body: JSON.stringify({ transactionId }),
  });
}

/** Extract link code slug from KIRAPAY checkout URL */
export function extractLinkCode(url: string): string | null {
  try {
    const parts = new URL(url).pathname.split("/").filter(Boolean);
    return parts[parts.length - 1] ?? null;
  } catch {
    return null;
  }
}

/** Parse defensive webhook — returns null if payload is unrecognised */
export function parseWebhookPayload(body: unknown): WebhookPayload | null {
  try {
    const { WebhookPayloadSchema } = require("./schemas");
    return WebhookPayloadSchema.parse(body);
  } catch {
    return null;
  }
}
