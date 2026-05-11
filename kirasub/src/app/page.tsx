"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import {
  TrendingUp, Users, Clock, AlertTriangle, Zap, ArrowUpRight,
  Plus, RefreshCw,
} from "lucide-react";
import Link from "next/link";

interface Plan {
  id: string;
  name: string;
  priceUsdCents: number;
  periodDays: number;
  active: boolean;
  _count: { subscriptions: number };
}

interface Analytics {
  mrrUsdCents: number;
  activeSubscribers: number;
  pendingPayments: number;
  churnRisk: number;
  totalPlans: number;
  plans: Plan[];
  recentTransactions: {
    id: string; kirapayId?: string; amount?: number; status: string;
    plan?: string; subscriber?: string; date: string;
  }[];
  recentSubscriptions: {
    id: string; plan: string; wallet: string; status: string; expires?: string;
  }[];
}

function fmt(cents: number) {
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

export default function Dashboard() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/analytics");
      setData(await res.json());
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const kpis = data ? [
    { label: "Monthly Recurring Revenue", value: fmt(data.mrrUsdCents), icon: TrendingUp, color: "#10b981", delta: "+12% vs last month" },
    { label: "Active Subscribers", value: data.activeSubscribers.toString(), icon: Users, color: "#06b6d4", delta: `${data.totalPlans} active plans` },
    { label: "Pending Payments", value: data.pendingPayments.toString(), icon: Clock, color: "#f59e0b", delta: "awaiting KIRAPAY" },
    { label: "Churn Risk", value: data.churnRisk.toString(), icon: AlertTriangle, color: "#f43f5e", delta: "expiring in 7 days" },
  ] : [];

  return (
    <AppShell>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
        <div>
          <h1 className="section-title">Dashboard</h1>
          <p className="section-sub">Subscription revenue and entitlement overview</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-ghost btn-sm" onClick={load}>
            <RefreshCw size={13} /> Refresh
          </button>
          <Link href="/plans/create" className="btn btn-primary btn-sm">
            <Plus size={13} /> Create Plan
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 32 }}>
        {loading
          ? [1,2,3,4].map(i => (
              <div key={i} className="glass kpi-card" style={{ height: 100, background: "rgba(14,16,21,0.5)" }}>
                <div style={{ width: 80, height: 14, background: "rgba(255,255,255,0.06)", borderRadius: 4, marginBottom: 12 }} />
                <div style={{ width: 120, height: 28, background: "rgba(255,255,255,0.04)", borderRadius: 6 }} />
              </div>
            ))
          : kpis.map(({ label, value, icon: Icon, color, delta }) => (
              <div key={label} className="glass kpi-card glass-hover" style={{ position: "relative" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div className="kpi-label">{label}</div>
                    <div className="kpi-value" style={{ marginTop: 8 }}>{value}</div>
                    <div className="kpi-delta" style={{ color: color === "#f43f5e" ? "#f43f5e" : "#6b7280" }}>{delta}</div>
                  </div>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center",
                    border: `1px solid ${color}30`,
                  }}>
                    <Icon size={18} color={color} />
                  </div>
                </div>
              </div>
            ))
        }
      </div>

      {/* Two-column layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>

        {/* Recent Payments */}
        <div className="glass" style={{ padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div style={{ fontWeight: 700, color: "#f1f5f9", fontSize: 14 }}>Recent Payments</div>
            <Zap size={14} color="#06b6d4" />
          </div>
          {loading ? (
            <div style={{ color: "#374151", fontSize: 13, textAlign: "center", padding: 24 }}>Loading…</div>
          ) : data?.recentTransactions.length === 0 ? (
            <div style={{ color: "#374151", fontSize: 13, textAlign: "center", padding: 24 }}>No payments yet. Create a plan to get started.</div>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr><th>Plan</th><th>Amount</th><th>Status</th><th>Date</th></tr>
                </thead>
                <tbody>
                  {data?.recentTransactions.map(tx => (
                    <tr key={tx.id}>
                      <td style={{ color: "#f1f5f9" }}>{tx.plan ?? "—"}</td>
                      <td className="accent-emerald">{tx.amount ? `$${tx.amount}` : "—"}</td>
                      <td><span className={`pill pill-${tx.status === "settled" ? "settled" : "pending"}`}>{tx.status}</span></td>
                      <td style={{ color: "#4b5563" }}>{new Date(tx.date).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Your Plans Section */}
        <div className="glass" style={{ padding: 24, gridColumn: "span 2" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div style={{ fontWeight: 700, color: "#f1f5f9", fontSize: 14 }}>Your Subscription Plans</div>
            <Link href="/plans/create" className="btn btn-ghost btn-sm">
              <Plus size={13} /> New Plan
            </Link>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
            {data?.plans.map(p => (
              <div key={p.id} className="glass" style={{ padding: 16, background: "rgba(255,255,255,0.02)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div>
                    <div style={{ fontWeight: 700, color: "#f1f5f9" }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: "#6b7280" }}>${p.priceUsdCents / 100} / {p.periodDays} days</div>
                  </div>
                  <span className={`pill ${p.active ? "pill-active" : "pill-expired"}`}>{p.active ? "Active" : "Paused"}</span>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button 
                    className="btn btn-primary btn-sm" 
                    style={{ flex: 1, justifyContent: "center" }}
                    onClick={() => {
                      const url = `${window.location.origin}/checkout/${p.id}`;
                      navigator.clipboard.writeText(url);
                      alert("Checkout link copied to clipboard!");
                    }}
                  >
                    Copy Checkout Link
                  </button>
                  <Link href={`/checkout/${p.id}`} className="btn btn-ghost btn-sm">
                    <ArrowUpRight size={13} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Plans */}
        <div className="glass" style={{ padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div style={{ fontWeight: 700, color: "#f1f5f9", fontSize: 14 }}>Active Subscriptions</div>
            <Link href="/merchant/subscribers" style={{ color: "#06b6d4", fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
              View all <ArrowUpRight size={12} />
            </Link>
          </div>
          {loading ? (
            <div style={{ color: "#374151", fontSize: 13, textAlign: "center", padding: 24 }}>Loading…</div>
          ) : data?.recentSubscriptions.length === 0 ? (
            <div style={{ color: "#374151", fontSize: 13, textAlign: "center", padding: 24 }}>
              No active subscriptions yet.{" "}
              <Link href="/plans/create" style={{ color: "#06b6d4" }}>Create a plan →</Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {data?.recentSubscriptions.map(s => (
                <div key={s.id} className="glass-hover" style={{
                  padding: "12px 14px", borderRadius: 10, background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: "#f1f5f9" }}>{s.plan}</div>
                    <div className="truncate-addr">{s.wallet}</div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                    <span className="pill pill-active">active</span>
                    {s.expires && <div style={{ fontSize: 10, color: "#4b5563" }}>until {new Date(s.expires).toLocaleDateString()}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
