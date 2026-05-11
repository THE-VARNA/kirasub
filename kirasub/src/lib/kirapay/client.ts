/**
 * Server-only KIRAPAY API wrapper — LIVE MODE.
 * Docs: https://docs.kira-pay.com
 * Auth: x-api-key header
 */

import { CreatePaymentLinkInput, KirapayTransaction, WebhookPayload, WebhookPayloadSchema } from "./schemas";

const BASE_URL = "https://api.kira-pay.com/api";

function getKey(): string {
  const key = process.env.KIRAPAY_API_KEY;
  if (!key || key.startsWith("your_")) throw new Error("KIRAPAY_API_KEY is not configured");
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

  let json: unknown;
  try {
    json = await res.json();
  } catch {
    throw new Error(`KIRAPAY API returned non-JSON response (status ${res.status})`);
  }

  if (!res.ok) {
    const j = json as Record<string, unknown>;
    const msg = (j?.message ?? j?.error ?? JSON.stringify(j)) as string;
    throw new Error(`KIRAPAY API ${res.status}: ${msg}`);
  }

  // Handle both { url } and { data: { url } } response shapes
  return ((json as Record<string, unknown>)?.data ?? json) as T;
}

/**
 * POST /api/link/generate
 * Creates a hosted KIRAPAY checkout link that accepts payment from any chain.
 * The `receiver` should be your Solana wallet address for SOL settlement.
 */
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
    return WebhookPayloadSchema.parse(body);
  } catch {
    return null;
  }
}
