"use client";

import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Plus, Minus, Eye, Loader2, Check } from "lucide-react";
import { useRouter } from "next/navigation";

const DEMO_MERCHANT_ID = "demo_merchant_001";

export default function CreatePlan() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [features, setFeatures] = useState<string[]>(["Full API access", "Priority support"]);
  const [newFeature, setNewFeature] = useState("");

  const [form, setForm] = useState<{
    name: string;
    description: string;
    priceUsdCents: number | "";
    periodDays: number;
    trialDays: number | "";
  }>({
    name: "",
    description: "",
    priceUsdCents: 999,
    periodDays: 30,
    trialDays: 0,
  });

  const periods = [
    { label: "Monthly", days: 30 },
    { label: "Quarterly", days: 90 },
    { label: "Annual", days: 365 },
  ];

  const addFeature = () => {
    if (newFeature.trim()) {
      setFeatures([...features, newFeature.trim()]);
      setNewFeature("");
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      // Ensure merchant exists
      await fetch("/api/merchant/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Demo Merchant", solWallet: process.env.NEXT_PUBLIC_MERCHANT_SOL_WALLET ?? "c6dcTyGAuiKh6vxBVbMf7ndTwiMPW4AESdRQEYxpNtz" }),
      });

      const res = await fetch("/api/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merchantId: DEMO_MERCHANT_ID,
          ...form,
          priceUsdCents: Number(form.priceUsdCents),
          trialDays: Number(form.trialDays),
          features,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(JSON.stringify(data.error));
      setSuccess(true);
      setTimeout(() => router.push("/"), 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create plan");
    }
    setLoading(false);
  };

  const priceDisplay = `$${((Number(form.priceUsdCents) || 0) / 100).toFixed(2)}`;

  return (
    <AppShell>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <h1 className="section-title">Create Subscription Plan</h1>
        <p className="section-sub">Configure pricing, billing period, and features. Plan is created in DB and on Solana.</p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 24, alignItems: "start" }}>
          {/* Form */}
          <form onSubmit={submit}>
            <div className="glass" style={{ padding: 28 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div>
                  <label className="label">Plan Name</label>
                  <input className="input" placeholder="e.g. Pro Access" value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })} required maxLength={64} />
                </div>
                <div>
                  <label className="label">Description</label>
                  <textarea className="input" placeholder="What does this plan include?" value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })} rows={2} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div>
                    <label className="label">Price (USD cents)</label>
                    <input className="input" type="number" min={1} value={form.priceUsdCents}
                      onChange={e => setForm({ ...form, priceUsdCents: e.target.value === "" ? "" : parseInt(e.target.value) })} required />
                    <div style={{ fontSize: 11, color: "#4b5563", marginTop: 4 }}>= {priceDisplay} USD</div>
                  </div>
                  <div>
                    <label className="label">Trial Days</label>
                    <input className="input" type="number" min={0} value={form.trialDays}
                      onChange={e => setForm({ ...form, trialDays: e.target.value === "" ? "" : parseInt(e.target.value) })} />
                  </div>
                </div>
                <div>
                  <label className="label">Billing Period</label>
                  <div style={{ display: "flex", gap: 10 }}>
                    {periods.map(p => (
                      <button key={p.days} type="button"
                        onClick={() => setForm({ ...form, periodDays: p.days })}
                        className={`btn btn-sm ${form.periodDays === p.days ? "btn-primary" : "btn-ghost"}`}>
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="label">Features</label>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
                    {features.map((f, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Check size={13} color="#10b981" />
                        <span style={{ fontSize: 13, color: "#cbd5e1", flex: 1 }}>{f}</span>
                        <button type="button" onClick={() => setFeatures(features.filter((_, j) => j !== i))}
                          style={{ background: "none", border: "none", cursor: "pointer", color: "#4b5563" }}>
                          <Minus size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input className="input" placeholder="Add a feature…" value={newFeature}
                      onChange={e => setNewFeature(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addFeature())} />
                    <button type="button" className="btn btn-ghost btn-sm" onClick={addFeature}><Plus size={13} /></button>
                  </div>
                </div>
              </div>

              {error && (
                <div style={{ marginTop: 16, padding: "10px 14px", borderRadius: 8, background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.2)", color: "#f43f5e", fontSize: 13 }}>
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading || success} className="btn btn-primary" style={{ width: "100%", marginTop: 24, justifyContent: "center" }}>
                {loading ? <><Loader2 size={15} className="animate-spin" /> Creating…</>
                  : success ? <><Check size={15} /> Plan Created!</>
                  : <><Plus size={15} /> Create Plan</>}
              </button>
            </div>
          </form>

          {/* Live Preview */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
              <Eye size={12} /> Live Preview
            </div>
            <div className="glass" style={{ padding: 24, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, #06b6d4, #10b981)" }} />
              <div style={{ fontSize: 18, fontWeight: 800, color: "#f1f5f9", marginBottom: 4 }}>
                {form.name || "Plan Name"}
              </div>
              {form.description && <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 16 }}>{form.description}</div>}
              <div style={{ marginBottom: 16 }}>
                <span style={{ fontSize: 36, fontWeight: 800, color: "#06b6d4" }}>{priceDisplay}</span>
                <span style={{ fontSize: 13, color: "#6b7280" }}>/{periods.find(p => p.days === form.periodDays)?.label.toLowerCase()}</span>
              </div>
              {Number(form.trialDays) > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <span className="pill pill-gold">⚡ {form.trialDays}-day free trial</span>
                </div>
              )}
              <div className="divider" />
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {features.map((f, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#cbd5e1" }}>
                    <Check size={13} color="#10b981" /> {f}
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 20, padding: "10px 14px", borderRadius: 8, background: "rgba(6,182,212,0.06)", border: "1px solid rgba(6,182,212,0.12)", fontSize: 11, color: "#06b6d4" }}>
                ⛓ Solana entitlement granted on payment · Powered by KIRAPAY
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
