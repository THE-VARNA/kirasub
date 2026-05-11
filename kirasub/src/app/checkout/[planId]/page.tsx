"use client";

import { useEffect, useState, useCallback } from "react";
import { AppShell } from "@/components/AppShell";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useParams, useSearchParams } from "next/navigation";
import { ExternalLink, Loader2, CheckCircle, Clock, Zap, Globe } from "lucide-react";

const STEPS = ["created", "pending", "detected", "verified", "settling", "settled"] as const;
type Step = typeof STEPS[number];

interface PlanInfo { name: string; priceUsdCents: number; periodDays: number; description?: string; }
interface CheckoutStatus {
  subscriptionId: string; status: string; paymentStatus: string;
  entitlementPda?: string; entitlementTxSig?: string; checkoutUrl?: string;
  plan: PlanInfo;
}

const SUPPORTED_CHAINS = [
  { name: "Ethereum", icon: "⟠" },
  { name: "Base", icon: "🔵" },
  { name: "Arbitrum", icon: "🔷" },
  { name: "Polygon", icon: "🟣" },
  { name: "BNB Chain", icon: "🟡" },
  { name: "Avalanche", icon: "🔺" },
  { name: "Solana", icon: "◎" },
  { name: "Bitcoin", icon: "₿" },
  { name: "OP Mainnet", icon: "🔴" },
];

export default function CheckoutPage() {
  const { planId } = useParams<{ planId: string }>();
  const searchParams = useSearchParams();
  const { publicKey } = useWallet();

  const [plan, setPlan] = useState<PlanInfo | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [subscriptionId, setSubscriptionId] = useState<string | null>(searchParams.get("subscriptionId"));
  const [status, setStatus] = useState<CheckoutStatus | null>(null);
  const [initiating, setInitiating] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  // Load plan info
  useEffect(() => {
    fetch(`/api/plans?planId=${planId}`)
      .then(r => r.json())
      .then(d => { if (d.plans?.[0]) setPlan(d.plans[0]); });
  }, [planId]);

  // Poll status
  const pollStatus = useCallback(async () => {
    if (!subscriptionId) return;
    const res = await fetch(`/api/checkout/status?subscriptionId=${subscriptionId}`);
    const data: CheckoutStatus = await res.json();
    setStatus(data);
    if (data.checkoutUrl) setCheckoutUrl(data.checkoutUrl);
    return data;
  }, [subscriptionId]);

  useEffect(() => {
    if (!subscriptionId) return;
    pollStatus();
    const interval = setInterval(async () => {
      const s = await pollStatus();
      if (s?.status === "active") clearInterval(interval);
    }, 3000);
    return () => clearInterval(interval);
  }, [subscriptionId, pollStatus]);

  const initiate = async () => {
    if (!publicKey) return;
    setInitiating(true);
    setInitError(null);
    try {
      const res = await fetch("/api/checkout/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId,
          subscriberWallet: publicKey.toBase58(),
          merchantId: "demo_merchant_001",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message ?? data.error ?? "Failed to create payment link");
      setSubscriptionId(data.subscriptionId);
      setCheckoutUrl(data.checkoutUrl);
      // Open KIRAPAY checkout in a new tab
      window.open(data.checkoutUrl, "_blank", "noopener,noreferrer");
    } catch (e) {
      setInitError(e instanceof Error ? e.message : "An unexpected error occurred");
    }
    setInitiating(false);
  };

  const currentStep: Step = (status?.paymentStatus as Step) ?? "created";
  const stepIndex = STEPS.indexOf(currentStep);
  const isSettled = status?.status === "active";
  const priceDisplay = plan ? `$${(plan.priceUsdCents / 100).toFixed(2)}` : "—";

  return (
    <AppShell>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <h1 className="section-title">Checkout</h1>
        <p className="section-sub">
          Pay from any chain, any token — powered by KIRAPAY. Your Solana access is granted automatically on settlement.
        </p>

        {/* Plan card */}
        <div className="glass" style={{ padding: 24, marginBottom: 20, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, #06b6d4, #10b981)" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#f1f5f9" }}>{plan?.name ?? "Loading…"}</div>
              <div style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>
                {plan ? `${plan.periodDays}-day subscription` : ""}
              </div>
              {plan?.description && (
                <div style={{ fontSize: 12, color: "#4b5563", marginTop: 6 }}>{plan.description}</div>
              )}
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: "#06b6d4" }}>{priceDisplay}</div>
              <div style={{ fontSize: 11, color: "#4b5563" }}>per {plan?.periodDays ?? 30} days</div>
            </div>
          </div>
          <div className="divider" />
          <div style={{ display: "flex", gap: 16, fontSize: 11, color: "#4b5563", flexWrap: "wrap" }}>
            <span>⛓ Solana Devnet entitlement</span>
            <span>·</span>
            <span>⚡ Powered by KIRAPAY</span>
            <span>·</span>
            <span>🔐 On-chain access rights</span>
          </div>
        </div>

        {/* Wallet connect + initiate */}
        {!isSettled && (
          <>
            {!publicKey ? (
              <div className="glass" style={{ padding: 28, textAlign: "center", marginBottom: 20 }}>
                <div style={{ color: "#9ca3af", marginBottom: 12, fontSize: 14, fontWeight: 500 }}>
                  Connect your Solana wallet to identify yourself as the subscriber
                </div>
                <div style={{ color: "#4b5563", marginBottom: 20, fontSize: 12 }}>
                  Your access rights will be linked to this wallet address on-chain.
                </div>
                <WalletMultiButton style={{
                  margin: "0 auto",
                  background: "linear-gradient(135deg, #06b6d4, #0891b2)",
                  border: "none",
                  borderRadius: 10,
                  fontWeight: 700,
                }} />
              </div>
            ) : (
              <div className="glass" style={{ padding: 24, marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981", flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 11, color: "#6b7280" }}>Subscriber Wallet (Solana)</div>
                    <div style={{ fontFamily: "monospace", fontSize: 12, color: "#06b6d4" }}>{publicKey.toBase58()}</div>
                  </div>
                </div>

                {!subscriptionId ? (
                  <>
                    <div style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(6,182,212,0.06)", border: "1px solid rgba(6,182,212,0.1)", marginBottom: 16, fontSize: 12, color: "#6b7280" }}>
                      <Globe size={11} style={{ display: "inline", marginRight: 6 }} />
                      You can pay from <strong style={{ color: "#cbd5e1" }}>any chain or token</strong> (ETH, USDC on Base, BNB, SOL, etc). KIRAPAY handles the cross-chain bridge automatically.
                    </div>
                    <button
                      className="btn btn-primary btn-lg"
                      style={{ width: "100%", justifyContent: "center" }}
                      onClick={initiate}
                      disabled={initiating}
                    >
                      {initiating
                        ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Generating checkout link…</>
                        : <><Zap size={16} /> Pay with KIRAPAY — {priceDisplay}</>
                      }
                    </button>
                    {initError && (
                      <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 8, background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.2)", color: "#f43f5e", fontSize: 12 }}>
                        ⚠ {initError}
                      </div>
                    )}
                  </>
                ) : (
                  <div style={{ fontSize: 12, color: "#6b7280" }}>
                    Payment in progress — see tracker below.
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Status tracker */}
        {subscriptionId && (
          <div className="glass" style={{ padding: 24, marginBottom: 20 }}>
            <div style={{ fontWeight: 600, fontSize: 12, color: "#6b7280", marginBottom: 20, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Payment Status
            </div>

            {/* Step tracker */}
            <div style={{ display: "flex", alignItems: "flex-start", marginBottom: 28 }}>
              {STEPS.map((step, i) => {
                const done = i < stepIndex || isSettled;
                const active = i === stepIndex && !isSettled;
                return (
                  <div key={step} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
                    {i < STEPS.length - 1 && (
                      <div style={{
                        position: "absolute", top: 13, left: "50%", width: "100%", height: 2,
                        background: done ? "rgba(16,185,129,0.5)" : "rgba(255,255,255,0.06)",
                        transition: "background 0.5s ease",
                      }} />
                    )}
                    <div style={{
                      width: 28, height: 28, borderRadius: "50%", zIndex: 1,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 11, fontWeight: 700, border: "2px solid",
                      borderColor: done ? "#10b981" : active ? "#06b6d4" : "rgba(255,255,255,0.08)",
                      background: done ? "rgba(16,185,129,0.15)" : active ? "rgba(6,182,212,0.15)" : "rgba(255,255,255,0.03)",
                      color: done ? "#10b981" : active ? "#06b6d4" : "#374151",
                      animation: active ? "pulse-dot 1.5s ease-in-out infinite" : "none",
                      transition: "all 0.3s ease",
                    }}>
                      {done ? "✓" : i + 1}
                    </div>
                    <div style={{ fontSize: 9, marginTop: 6, color: done ? "#10b981" : active ? "#06b6d4" : "#374151", textAlign: "center", textTransform: "capitalize" }}>
                      {step}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Status detail */}
            {isSettled ? (
              <div style={{ padding: 20, borderRadius: 12, background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.2)", textAlign: "center" }}>
                <CheckCircle size={32} color="#10b981" style={{ margin: "0 auto 12px" }} />
                <div style={{ fontWeight: 800, color: "#10b981", fontSize: 16, marginBottom: 4 }}>
                  🎉 Access Granted!
                </div>
                <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 12 }}>
                  Your Solana entitlement has been written on-chain. You now have full access.
                </div>
                {status?.entitlementPda && (
                  <div style={{ padding: "8px 12px", borderRadius: 8, background: "rgba(6,182,212,0.06)", border: "1px solid rgba(6,182,212,0.1)", marginBottom: 10 }}>
                    <div style={{ fontSize: 10, color: "#4b5563", marginBottom: 4 }}>Entitlement PDA</div>
                    <div style={{ fontFamily: "monospace", fontSize: 11, color: "#06b6d4", wordBreak: "break-all" }}>{status.entitlementPda}</div>
                  </div>
                )}
                {status?.entitlementTxSig && (
                  <a
                    href={`https://explorer.solana.com/tx/${status.entitlementTxSig}?cluster=devnet`}
                    target="_blank" rel="noreferrer"
                    className="btn btn-ghost btn-sm"
                    style={{ margin: "0 auto" }}
                  >
                    Verify on Solana Explorer <ExternalLink size={11} />
                  </a>
                )}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {checkoutUrl && (
                  <a
                    href={checkoutUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-primary"
                    style={{ justifyContent: "center" }}
                  >
                    <ExternalLink size={14} /> Open KIRAPAY Checkout
                  </a>
                )}
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#4b5563", padding: "10px 14px", borderRadius: 8, background: "rgba(255,255,255,0.02)" }}>
                  <Clock size={13} style={{ animation: "spin 3s linear infinite", color: "#06b6d4", flexShrink: 0 }} />
                  Polling for KIRAPAY confirmation every 3 seconds…
                </div>
              </div>
            )}
          </div>
        )}

        {/* Supported chains */}
        <div className="glass" style={{ padding: 20 }}>
          <div style={{ fontSize: 10, color: "#374151", marginBottom: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            KIRAPAY accepts payment from any chain
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {SUPPORTED_CHAINS.map(c => (
              <span key={c.name} className="pill pill-expired" style={{ fontSize: 10, display: "flex", alignItems: "center", gap: 4 }}>
                {c.icon} {c.name}
              </span>
            ))}
          </div>
          <div style={{ marginTop: 12, fontSize: 11, color: "#374151" }}>
            Pay with USDC, ETH, SOL, BNB, AVAX and more — settlement arrives in your merchant SOL wallet automatically.
          </div>
        </div>
      </div>
    </AppShell>
  );
}
