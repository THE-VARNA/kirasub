"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { ShieldCheck, Lock, Unlock, ExternalLink, RefreshCw } from "lucide-react";
import Link from "next/link";

interface SubInfo {
  id: string; status: string; plan: { name: string; priceUsdCents: number; periodDays: number };
  currentPeriodEnd?: string; entitlementPda?: string; entitlementTxSig?: string;
  paymentStatus: string;
}

export default function SubscriberPortal() {
  const { publicKey } = useWallet();
  const [sub, setSub] = useState<SubInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [receipts, setReceipts] = useState<{ id: string; planName: string; amountUsdCents: number; createdAt: string }[]>([]);

  const load = async () => {
    if (!publicKey) return;
    setLoading(true);
    const res = await fetch(`/api/subscriptions?wallet=${publicKey.toBase58()}`);
    const data = await res.json();
    const active = data.subscriptions?.find((s: SubInfo) => s.status === "active") ?? data.subscriptions?.[0] ?? null;
    setSub(active);
    setLoading(false);
  };

  useEffect(() => { load(); }, [publicKey]);

  const isActive = sub?.status === "active" && sub?.currentPeriodEnd && new Date(sub.currentPeriodEnd) > new Date();

  return (
    <AppShell>
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        <h1 className="section-title">My Subscription</h1>
        <p className="section-sub">Your current plan, entitlement status, and payment history.</p>

        {!publicKey ? (
          <div className="glass" style={{ padding: 40, textAlign: "center" }}>
            <ShieldCheck size={40} color="#374151" style={{ margin: "0 auto 16px" }} />
            <div style={{ color: "#6b7280", marginBottom: 20 }}>Connect wallet to view your subscription</div>
            <WalletMultiButton style={{ margin: "0 auto", borderRadius: 10, background: "linear-gradient(135deg,#06b6d4,#0891b2)", border: "none", fontWeight: 700 }} />
          </div>
        ) : loading ? (
          <div className="glass" style={{ padding: 40, textAlign: "center", color: "#374151" }}>Loading…</div>
        ) : !sub ? (
          <div className="glass" style={{ padding: 40, textAlign: "center" }}>
            <Lock size={40} color="#374151" style={{ margin: "0 auto 16px" }} />
            <div style={{ color: "#6b7280", marginBottom: 20 }}>No active subscription found</div>
            <Link href="/plans/create" className="btn btn-primary" style={{ display: "inline-flex" }}>Browse Plans</Link>
          </div>
        ) : (
          <>
            {/* Status card */}
            <div className="glass" style={{ padding: 24, marginBottom: 20, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2,
                background: isActive ? "linear-gradient(90deg, #10b981, #06b6d4)" : "linear-gradient(90deg, #f43f5e, #f59e0b)" }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: "#f1f5f9" }}>{sub.plan.name}</div>
                  <div style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>
                    ${(sub.plan.priceUsdCents / 100).toFixed(2)} / {sub.plan.periodDays} days
                  </div>
                </div>
                <span className={`pill ${isActive ? "pill-active" : "pill-expired"}`}>
                  {isActive ? "● Active" : "○ Inactive"}
                </span>
              </div>

              {sub.currentPeriodEnd && (
                <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 12 }}>
                  {isActive ? "Renews" : "Expired"}: {new Date(sub.currentPeriodEnd).toLocaleDateString("en-US", { dateStyle: "long" })}
                </div>
              )}

              {/* Entitlement info */}
              {sub.entitlementPda && (
                <div style={{ padding: "10px 12px", borderRadius: 8, background: "rgba(6,182,212,0.06)", border: "1px solid rgba(6,182,212,0.12)", marginBottom: 12 }}>
                  <div style={{ fontSize: 10, color: "#06b6d4", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
                    ⛓ Solana Entitlement PDA
                  </div>
                  <div style={{ fontSize: 11, fontFamily: "monospace", color: "#94a3b8", wordBreak: "break-all" }}>{sub.entitlementPda}</div>
                  {sub.entitlementTxSig && (
                    <a href={`https://explorer.solana.com/tx/${sub.entitlementTxSig}?cluster=devnet`}
                      target="_blank" rel="noreferrer"
                      style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 6, fontSize: 11, color: "#06b6d4" }}>
                      Verify on Explorer <ExternalLink size={10} />
                    </a>
                  )}
                </div>
              )}

              <div style={{ display: "flex", gap: 10 }}>
                <button className="btn btn-ghost btn-sm" onClick={load}><RefreshCw size={12} /> Refresh</button>
                <Link href={`/checkout/${sub.plan && "planId"}`} className="btn btn-primary btn-sm">Renew via KIRAPAY</Link>
              </div>
            </div>

            {/* Protected feature preview */}
            <div style={{ position: "relative", marginBottom: 20 }}>
              <div className="glass" style={{ padding: 24, filter: isActive ? "none" : "blur(2px)", pointerEvents: isActive ? "auto" : "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                  <Unlock size={15} color="#10b981" />
                  <span style={{ fontWeight: 700, color: "#f1f5f9", fontSize: 14 }}>Premium Features</span>
                  <span className="pill pill-active" style={{ fontSize: 9 }}>UNLOCKED</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                  {["API Analytics", "Priority Support", "Advanced Reports", "Custom Webhooks", "SLA Guarantee", "Export Data"].map(f => (
                    <div key={f} style={{ padding: "12px 14px", borderRadius: 8, background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.1)", fontSize: 12, color: "#10b981", textAlign: "center" }}>
                      ✓ {f}
                    </div>
                  ))}
                </div>
              </div>
              {!isActive && (
                <div className="locked-overlay">
                  <Lock size={28} color="#374151" />
                  <div style={{ fontSize: 14, color: "#6b7280" }}>Subscribe to unlock premium features</div>
                  <Link href="/plans/create" className="btn btn-primary btn-sm">Subscribe Now</Link>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
