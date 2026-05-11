import { NextRequest, NextResponse } from "next/server";
import { DEMO_MODE, buildDemoWebhookPayload } from "@/lib/kirapay/demo";

/** Dev-only: simulate a KIRAPAY webhook in demo mode */
export async function POST(req: NextRequest) {
  const { customOrderId, price } = await req.json();
  const payload = buildDemoWebhookPayload(customOrderId, price ?? 9.99);

  // Call our own webhook endpoint
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const res = await fetch(`${appUrl}/api/webhook/kirapay`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return NextResponse.json({ triggered: true, status: res.status, payload });
}
