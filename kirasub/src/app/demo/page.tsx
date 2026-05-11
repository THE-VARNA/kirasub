"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useWallet } from "@solana/wallet-adapter-react";
import { 
  Lock, 
  Unlock, 
  BarChart3, 
  PieChart, 
  LineChart, 
  ArrowUpRight, 
  ArrowDownRight,
  Zap,
  LayoutGrid,
  RefreshCw
} from "lucide-react";
import Link from "next/link";

export default function ProtectedDemoApp() {
  const { publicKey } = useWallet();
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkEntitlement() {
      if (!publicKey) {
        setIsActive(false);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/subscriptions?wallet=${publicKey.toBase58()}`);
        const data = await res.json();
        const active = data.subscriptions?.find((s: any) => s.status === "active");
        setIsActive(!!active);
      } catch (err) {
        console.error("Error checking entitlement:", err);
      } finally {
        setLoading(false);
      }
    }

    checkEntitlement();
  }, [publicKey]);

  return (
    <AppShell>
      <div style={{ marginBottom: 32 }}>
        <h1 className="section-title">Protected Analytics Demo</h1>
        <p className="section-sub">A demonstration of a premium dashboard that unlocks only when a Solana entitlement is detected.</p>
      </div>

      <div style={{ position: "relative", minHeight: "600px" }}>
        {/* Mock Analytics Content (Blurred if not active) */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(2, 1fr)", 
          gap: 24,
          filter: isActive ? "none" : "blur(12px)",
          pointerEvents: isActive ? "auto" : "none",
          opacity: loading ? 0 : 1,
          transition: "filter 0.5s ease, opacity 0.3s ease"
        }}>
          {/* Header Stats */}
          <div className="glass kpi-card" style={{ gridColumn: "span 2" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div className="kpi-label">Total Protocol Volume</div>
                <div className="kpi-value">$1,284,592,042.42</div>
                <div className="kpi-delta up">+14.2% from last epoch</div>
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <div className="pill pill-active">PREMIUM UNLOCKED</div>
                <div className="pill pill-verified">LIVE DATA</div>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="glass" style={{ padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>Staking Yield Distribution</h3>
              <PieChart size={18} color="#06b6d4" />
            </div>
            <div style={{ height: 200, display: "flex", alignItems: "flex-end", gap: 8 }}>
              {[60, 40, 80, 50, 90, 70, 45].map((h, i) => (
                <div key={i} style={{ flex: 1, background: "rgba(6,182,212,0.2)", border: "1px solid rgba(6,182,212,0.3)", height: `${h}%`, borderRadius: "4px 4px 0 0" }} />
              ))}
            </div>
          </div>

          <div className="glass" style={{ padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>Network Latency (ms)</h3>
              <LineChart size={18} color="#10b981" />
            </div>
            <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <BarChart3 size={40} color="rgba(255,255,255,0.05)" />
            </div>
          </div>

          {/* Detail List */}
          <div className="glass" style={{ gridColumn: "span 2", padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Whale Transactions (24h)</h3>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Asset</th>
                    <th>Value</th>
                    <th>Wallet</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { type: "Swap", asset: "SOL/USDC", value: "$450,000", wallet: "7u9J...m2pL", status: "confirmed" },
                    { type: "Stake", asset: "mSOL", value: "$1,200,000", wallet: "2p8A...9w0X", status: "confirmed" },
                    { type: "Bridge", asset: "Jup", value: "$320,000", wallet: "G9qB...4s5V", status: "confirmed" },
                  ].map((row, i) => (
                    <tr key={i}>
                      <td>{row.type}</td>
                      <td style={{ color: "#f1f5f9" }}>{row.asset}</td>
                      <td className="accent-emerald">{row.value}</td>
                      <td className="truncate-addr">{row.wallet}</td>
                      <td><span className="pill pill-settled">{row.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Lock Overlay */}
        {!isActive && !loading && (
          <div className="locked-overlay" style={{ 
            background: "rgba(8,9,12,0.4)",
            backdropFilter: "blur(16px)"
          }}>
            <div className="glass" style={{ 
              padding: "40px", 
              textAlign: "center", 
              maxWidth: "400px",
              boxShadow: "0 0 50px rgba(6,182,212,0.15)"
            }}>
              <div style={{ 
                width: 64, height: 64, borderRadius: "50%", 
                background: "rgba(6,182,212,0.1)", 
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 20px",
                border: "1px solid rgba(6,182,212,0.2)"
              }}>
                <Lock size={32} color="#06b6d4" />
              </div>
              <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12 }}>Premium Analytics Locked</h2>
              <p style={{ fontSize: 14, color: "#94a3b8", marginBottom: 24, lineHeight: 1.5 }}>
                This dashboard requires an active KiraSub subscription. Pay via any chain to receive your Solana-native entitlement.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <Link href="/subscriber" className="btn btn-primary" style={{ justifyContent: "center" }}>
                  <Zap size={16} /> Subscribe to Unlock
                </Link>
                <div style={{ fontSize: 11, color: "#4b5563" }}>
                  Entitlements are verified on-chain via Solana PDA
                </div>
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
              <RefreshCw size={24} className="animate-spin" color="#06b6d4" />
              <div style={{ fontSize: 12, color: "#4b5563", fontWeight: 600, letterSpacing: "0.1em" }}>VERIFYING ENTITLEMENT...</div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
