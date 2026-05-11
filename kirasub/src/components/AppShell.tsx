"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import {
  LayoutDashboard, Plus, Users, ShieldCheck, Receipt, Zap, Activity,
} from "lucide-react";

const DEMO = process.env.NEXT_PUBLIC_DEMO_MODE !== "false";

const nav = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/plans/create", icon: Plus, label: "Create Plan" },
  { href: "/merchant/subscribers", icon: Users, label: "Subscribers" },
  { href: "/subscriber", icon: ShieldCheck, label: "My Subscription" },
  { href: "/demo", icon: Zap, label: "Protected App" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { publicKey } = useWallet();

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <aside className="sidebar">
        {/* Logo */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: "linear-gradient(135deg, #06b6d4, #0891b2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 12px rgba(6,182,212,0.4)",
            }}>
              <Activity size={18} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#f1f5f9", lineHeight: 1 }}>KiraSub</div>
              <div style={{ fontSize: 10, color: "#06b6d4", fontWeight: 600, letterSpacing: "0.08em" }}>SUBSCRIPTION ENGINE</div>
            </div>
          </div>
          {/* Network + Demo badge */}
          <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
            <span className="pill pill-verified" style={{ fontSize: 9 }}>● DEVNET</span>
            {DEMO && <span className="pill pill-demo" style={{ fontSize: 9 }}>⚡ DEMO</span>}
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.1em", padding: "0 12px", marginBottom: 6 }}>
            Navigation
          </div>
          {nav.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className={`nav-item${pathname === href ? " active" : ""}`}
            >
              <Icon size={15} />
              {label}
            </Link>
          ))}
        </nav>

        {/* Wallet + footer */}
        <div style={{ marginTop: "auto" }}>
          <div className="divider" />
          <div style={{ marginBottom: 10 }}>
            <WalletMultiButton style={{
              background: "rgba(6,182,212,0.1)",
              border: "1px solid rgba(6,182,212,0.2)",
              borderRadius: 10,
              fontSize: 12,
              fontWeight: 600,
              height: 38,
              color: "#06b6d4",
              width: "100%",
              justifyContent: "center",
            }} />
          </div>
          {publicKey && (
            <div style={{ fontSize: 10, color: "#374151", textAlign: "center", fontFamily: "monospace" }}>
              {publicKey.toBase58().slice(0, 8)}…{publicKey.toBase58().slice(-6)}
            </div>
          )}
          <div style={{ textAlign: "center", marginTop: 12, fontSize: 10, color: "#374151" }}>
            Powered by KIRAPAY × Solana
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="main-content">{children}</main>
    </div>
  );
}
