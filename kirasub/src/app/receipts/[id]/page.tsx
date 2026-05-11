"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useParams } from "next/navigation";
import { 
  Receipt as ReceiptIcon, 
  Download, 
  ExternalLink, 
  Printer, 
  CheckCircle2,
  Calendar,
  Wallet,
  Hash
} from "lucide-react";

interface ReceiptData {
  id: string;
  kirapayRef: string;
  solTxSig: string;
  entitlementPda: string;
  amountUsdCents: number;
  planName: string;
  merchantName: string;
  subscriberWallet: string;
  createdAt: string;
}

export default function ReceiptPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<ReceiptData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/receipts/${id}`)
      .then(r => r.json())
      .then(d => {
        setData(d.receipt);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <AppShell><div style={{ textAlign: "center", padding: 100 }}>Loading receipt...</div></AppShell>;
  if (!data) return <AppShell><div style={{ textAlign: "center", padding: 100 }}>Receipt not found</div></AppShell>;

  const amount = `$${(data.amountUsdCents / 100).toFixed(2)}`;

  return (
    <AppShell>
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32 }}>
          <div>
            <h1 className="section-title">Payment Receipt</h1>
            <p className="section-sub">Subscription confirmed and entitlement granted.</p>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => window.print()}>
              <Printer size={14} /> Print
            </button>
            <button className="btn btn-ghost btn-sm">
              <Download size={14} /> PDF
            </button>
          </div>
        </div>

        <div className="glass" style={{ padding: 40, position: "relative" }}>
          {/* Success Banner */}
          <div style={{ 
            textAlign: "center", 
            marginBottom: 40,
            padding: "24px",
            background: "rgba(16,185,129,0.05)",
            border: "1px solid rgba(16,185,129,0.1)",
            borderRadius: "16px"
          }}>
            <CheckCircle2 size={48} color="#10b981" style={{ margin: "0 auto 16px" }} />
            <h2 style={{ fontSize: 24, fontWeight: 800, color: "#f1f5f9" }}>Payment Successful</h2>
            <div style={{ color: "#10b981", fontWeight: 600, marginTop: 4 }}>Entitlement Granted on Solana</div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
            {/* Left Side: Merchant & Plan */}
            <div>
              <div style={{ marginBottom: 24 }}>
                <label className="label">Merchant</label>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{data.merchantName}</div>
              </div>
              <div style={{ marginBottom: 24 }}>
                <label className="label">Subscription Plan</label>
                <div style={{ fontSize: 16, fontWeight: 600, color: "#06b6d4" }}>{data.planName}</div>
              </div>
              <div>
                <label className="label">Amount Paid</label>
                <div style={{ fontSize: 32, fontWeight: 800 }}>{amount}</div>
                <div style={{ fontSize: 12, color: "#6b7280" }}>via KIRAPAY cross-chain</div>
              </div>
            </div>

            {/* Right Side: Details */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ display: "flex", gap: 12 }}>
                <Calendar size={16} color="#4b5563" />
                <div>
                  <div className="label" style={{ marginBottom: 2 }}>Date</div>
                  <div style={{ fontSize: 13 }}>{new Date(data.createdAt).toLocaleDateString("en-US", { dateStyle: "medium", timeStyle: "short" })}</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <Wallet size={16} color="#4b5563" />
                <div>
                  <div className="label" style={{ marginBottom: 2 }}>Subscriber Wallet</div>
                  <div className="truncate-addr" style={{ fontSize: 13 }}>{data.subscriberWallet}</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <Hash size={16} color="#4b5563" />
                <div>
                  <div className="label" style={{ marginBottom: 2 }}>Receipt ID</div>
                  <div style={{ fontSize: 13, color: "#94a3b8" }}>{data.id}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="divider" style={{ margin: "40px 0" }} />

          {/* On-chain Verification */}
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "#f1f5f9", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              ⛓ On-chain Verification
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div className="glass" style={{ padding: "16px", background: "rgba(255,255,255,0.02)" }}>
                <div className="label" style={{ fontSize: 10 }}>Entitlement PDA</div>
                <div style={{ fontSize: 12, fontFamily: "monospace", color: "#94a3b8", wordBreak: "break-all" }}>{data.entitlementPda}</div>
              </div>
              <div className="glass" style={{ padding: "16px", background: "rgba(255,255,255,0.02)" }}>
                <div className="label" style={{ fontSize: 10 }}>KIRAPAY Reference</div>
                <div style={{ fontSize: 12, fontFamily: "monospace", color: "#94a3b8" }}>{data.kirapayRef}</div>
              </div>
              <a 
                href={`https://explorer.solana.com/tx/${data.solTxSig}?cluster=devnet`}
                target="_blank" 
                rel="noreferrer"
                className="btn btn-ghost"
                style={{ width: "100%", justifyContent: "center", gap: 10 }}
              >
                <ExternalLink size={14} /> View Transaction on Solana Explorer
              </a>
            </div>
          </div>

          <div style={{ marginTop: 40, textAlign: "center", color: "#4b5563", fontSize: 11 }}>
            KiraSub Subscription Engine · powered by KIRAPAY × Solana
          </div>
        </div>
      </div>
    </AppShell>
  );
}
