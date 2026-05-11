"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Search, Download, UserX, UserCheck, ExternalLink } from "lucide-react";

interface Sub {
  id: string; status: string;
  plan: { name: string; priceUsdCents: number };
  subscriber: { walletAddress: string };
  currentPeriodEnd?: string; entitlementPda?: string; entitlementTxSig?: string;
  transactions: { id: string; status: string; price?: number }[];
}

export default function MerchantSubscribers() {
  const [subs, setSubs] = useState<Sub[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState<string | null>(null);

  const load = async (q?: string) => {
    setLoading(true);
    const url = `/api/subscriptions${q ? `?search=${encodeURIComponent(q)}` : ""}`;
    const res = await fetch(url);
    const data = await res.json();
    setSubs(data.subscriptions ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const revoke = async (id: string) => {
    if (!confirm("Revoke this entitlement? This will deactivate access on Solana.")) return;
    setRevoking(id);
    await fetch(`/api/subscriptions/${id}/revoke`, { method: "POST" });
    await load(search);
    setRevoking(null);
  };

  const exportCSV = () => {
    const rows = [
      ["ID", "Wallet", "Plan", "Status", "Expires", "Entitlement PDA", "Tx Sig"],
      ...subs.map(s => [
        s.id, s.subscriber.walletAddress, s.plan.name, s.status,
        s.currentPeriodEnd ?? "", s.entitlementPda ?? "", s.entitlementTxSig ?? "",
      ]),
    ];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "kirasub_subscribers.csv"; a.click();
  };

  return (
    <AppShell>
      <div style={{ marginBottom: 28, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 className="section-title">Subscribers</h1>
          <p className="section-sub">{subs.length} total · manage entitlements and view payment history</p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={exportCSV}>
          <Download size={13} /> Export CSV
        </button>
      </div>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: 20 }}>
        <Search size={14} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#4b5563" }} />
        <input className="input" style={{ paddingLeft: 38 }} placeholder="Search by wallet or plan…"
          value={search} onChange={e => { setSearch(e.target.value); load(e.target.value); }} />
      </div>

      {/* Table */}
      <div className="glass">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Subscriber</th><th>Plan</th><th>Status</th>
                <th>Expires</th><th>Last Payment</th><th>Entitlement</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign: "center", padding: 32, color: "#374151" }}>Loading…</td></tr>
              ) : subs.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: "center", padding: 32, color: "#374151" }}>No subscribers yet.</td></tr>
              ) : subs.map(s => (
                <tr key={s.id}>
                  <td>
                    <div className="truncate-addr" style={{ maxWidth: 140 }}>
                      {s.subscriber.walletAddress.slice(0, 8)}…{s.subscriber.walletAddress.slice(-6)}
                    </div>
                  </td>
                  <td style={{ color: "#f1f5f9", fontWeight: 500 }}>{s.plan.name}</td>
                  <td>
                    <span className={`pill pill-${s.status === "active" ? "active" : s.status === "pending_payment" ? "pending" : "expired"}`}>
                      {s.status}
                    </span>
                  </td>
                  <td style={{ color: "#6b7280", fontSize: 12 }}>
                    {s.currentPeriodEnd ? new Date(s.currentPeriodEnd).toLocaleDateString() : "—"}
                  </td>
                  <td className="accent-emerald" style={{ fontSize: 12 }}>
                    {s.transactions[0]?.price ? `$${s.transactions[0].price}` : "—"}
                  </td>
                  <td>
                    {s.entitlementPda ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 10, fontFamily: "monospace", color: "#06b6d4" }}>
                          {s.entitlementPda.slice(0, 8)}…
                        </span>
                        {s.entitlementTxSig && (
                          <a href={`https://explorer.solana.com/tx/${s.entitlementTxSig}?cluster=devnet`}
                            target="_blank" rel="noreferrer" style={{ color: "#06b6d4" }}>
                            <ExternalLink size={10} />
                          </a>
                        )}
                      </div>
                    ) : <span style={{ color: "#374151", fontSize: 11 }}>—</span>}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      {s.status === "active" ? (
                        <button className="btn btn-danger btn-sm" onClick={() => revoke(s.id)} disabled={revoking === s.id}>
                          <UserX size={11} /> {revoking === s.id ? "…" : "Revoke"}
                        </button>
                      ) : (
                        <span className="btn btn-ghost btn-sm" style={{ opacity: 0.4, cursor: "not-allowed" }}>
                          <UserCheck size={11} /> Inactive
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
