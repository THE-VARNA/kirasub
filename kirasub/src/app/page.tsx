"use client";

import Link from "next/link";
import { 
  Zap, ShieldCheck, Globe, CreditCard, Layers, 
  ArrowRight, Activity, CheckCircle2, ChevronRight 
} from "lucide-react";
import { useEffect, useState } from "react";

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#08090c", position: "relative" }}>
      {/* Navbar */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        padding: "16px 0",
        transition: "all 0.3s ease",
        background: scrolled ? "rgba(8,9,12,0.8)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "none",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: "linear-gradient(135deg, #06b6d4, #0891b2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 12px rgba(6,182,212,0.4)",
            }}>
              <Activity size={16} color="#fff" />
            </div>
            <span style={{ fontSize: 18, fontWeight: 800, color: "#f1f5f9", letterSpacing: "-0.01em" }}>KiraSub</span>
          </Link>
          
          <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
            <div style={{ display: "flex", gap: 24 }}>
              <a href="#features" style={{ fontSize: 13, fontWeight: 500, color: "#94a3b8", textDecoration: "none" }} className="nav-link">Features</a>
              <a href="#how-it-works" style={{ fontSize: 13, fontWeight: 500, color: "#94a3b8", textDecoration: "none" }} className="nav-link">How it works</a>
              <Link href="/demo" style={{ fontSize: 13, fontWeight: 500, color: "#94a3b8", textDecoration: "none" }} className="nav-link">Demo App</Link>
            </div>
            <Link href="/dashboard" className="btn btn-primary btn-sm">
              Launch App <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ 
        padding: "160px 24px 100px", 
        display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center",
        position: "relative", overflow: "hidden"
      }}>
        {/* Glowing background elements */}
        <div style={{
          position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)",
          width: 600, height: 600, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)",
          filter: "blur(60px)", pointerEvents: "none", zIndex: 0
        }} />

        <div style={{ 
          background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.2)",
          padding: "6px 12px", borderRadius: 999, fontSize: 11, fontWeight: 700, 
          color: "#22d3ee", textTransform: "uppercase", letterSpacing: "0.1em",
          marginBottom: 24, display: "flex", alignItems: "center", gap: 8,
          position: "relative", zIndex: 1
        }}>
          <Zap size={12} /> Powered by KIRAPAY × Solana
        </div>

        <h1 style={{ 
          fontSize: "clamp(40px, 8vw, 72px)", fontWeight: 800, color: "#f1f5f9", 
          lineHeight: 1.1, maxWidth: 900, marginBottom: 24, letterSpacing: "-0.03em",
          position: "relative", zIndex: 1
        }}>
          The <span style={{ 
            background: "linear-gradient(135deg, #06b6d4, #22d3ee)", 
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
          }}>Cross-Chain</span> Subscription Engine.
        </h1>

        <p style={{ 
          fontSize: 18, color: "#94a3b8", maxWidth: 600, marginBottom: 40, lineHeight: 1.6,
          position: "relative", zIndex: 1
        }}>
          Bridge the gap between Web2 payments and Web3 entitlements. Accept any token on any chain and grant instant on-chain access on Solana.
        </p>

        <div style={{ display: "flex", gap: 16, position: "relative", zIndex: 1 }}>
          <Link href="/dashboard" className="btn btn-primary btn-lg" style={{ padding: "14px 32px" }}>
            Get Started for Free <ChevronRight size={18} />
          </Link>
          <a href="https://www.loom.com/share/cd440d8383244a63b28dd2c960cfbee7" target="_blank" rel="noreferrer" className="btn btn-ghost btn-lg" style={{ padding: "14px 32px" }}>
            Watch Demo
          </a>
        </div>

        {/* Interactive Entitlement Hub Visualization */}
        <div style={{ 
          marginTop: 80, width: "100%", maxWidth: 1000, 
          padding: "40px 20px", borderRadius: 32, 
          background: "rgba(255,255,255,0.01)",
          border: "1px solid rgba(255,255,255,0.05)",
          position: "relative", zIndex: 1,
          overflow: "hidden"
        }}>
          {/* Animated Background Pulse */}
          <div style={{
            position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
            width: "120%", height: "120%",
            background: "radial-gradient(circle, rgba(6,182,212,0.05) 0%, transparent 60%)",
            animation: "pulse-bg 8s infinite ease-in-out", pointerEvents: "none"
          }} />

          <div style={{ 
            display: "flex", justifyContent: "space-around", alignItems: "center", 
            gap: 20, position: "relative", zIndex: 2, flexWrap: "wrap" 
          }}>
            
            {/* Step 1: Global Payment */}
            <div className="glass" style={{ 
              padding: 24, width: 240, textAlign: "left",
              border: "1px solid rgba(255,255,255,0.1)",
              animation: "float 6s infinite ease-in-out"
            }}>
              <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#f43f5e" }} />
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#f59e0b" }} />
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#10b981" }} />
              </div>
              <div style={{ fontSize: 12, color: "#6b7280", fontWeight: 600, marginBottom: 8, textTransform: "uppercase" }}>Checkout Session</div>
              <div style={{ height: 12, width: "80%", background: "rgba(255,255,255,0.05)", borderRadius: 4, marginBottom: 8 }} />
              <div style={{ height: 12, width: "60%", background: "rgba(255,255,255,0.05)", borderRadius: 4, marginBottom: 20 }} />
              
              <div style={{ 
                background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.2)",
                padding: 10, borderRadius: 8, display: "flex", alignItems: "center", gap: 10
              }}>
                <Globe size={14} color="#06b6d4" />
                <span style={{ fontSize: 11, fontWeight: 700, color: "#06b6d4" }}>ANY TOKEN / ANY CHAIN</span>
              </div>
            </div>

            {/* Connection Arrow 1 */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <div className="pulse-line" style={{ width: 60, height: 2, background: "linear-gradient(90deg, #06b6d4, transparent)" }} />
              <Zap size={16} color="#06b6d4" className="spin-slow" />
            </div>

            {/* Step 2: Verification Engine */}
            <div style={{ position: "relative" }}>
              <div style={{
                width: 120, height: 120, borderRadius: "50%",
                background: "rgba(6,182,212,0.1)", border: "2px dashed rgba(6,182,212,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
                animation: "rotate-slow 15s linear infinite"
              }}>
                <Activity size={40} color="#06b6d4" />
              </div>
              <div style={{ 
                position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
                textAlign: "center", width: 200
              }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: "#fff", textTransform: "uppercase", letterSpacing: "0.2em", marginTop: 140 }}>Verification Engine</div>
              </div>
            </div>

            {/* Connection Arrow 2 */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <div className="pulse-line" style={{ width: 60, height: 2, background: "linear-gradient(90deg, transparent, #10b981)" }} />
              <CheckCircle2 size={16} color="#10b981" />
            </div>

            {/* Step 3: Solana Entitlement */}
            <div className="glass" style={{ 
              padding: 24, width: 240, textAlign: "left",
              border: "1px solid rgba(16,185,129,0.2)",
              background: "rgba(16,185,129,0.03)",
              animation: "float 7s infinite ease-in-out reverse"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <ShieldCheck size={20} color="#10b981" />
                <div style={{ fontSize: 9, fontWeight: 700, color: "#10b981", background: "rgba(16,185,129,0.1)", padding: "2px 6px", borderRadius: 4 }}>SOLANA PDA</div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#f1f5f9", marginBottom: 4 }}>Access Verified</div>
              <div style={{ fontSize: 10, color: "#4b5563", fontFamily: "monospace", marginBottom: 16 }}>8x2f...9a3e</div>
              
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ height: 6, width: "100%", background: "#10b98133", borderRadius: 3 }} />
                <div style={{ height: 6, width: "70%", background: "#10b98133", borderRadius: 3 }} />
              </div>

              <div style={{ 
                marginTop: 20, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.05)",
                display: "flex", justifyContent: "space-between", alignItems: "center"
              }}>
                <div style={{ fontSize: 9, color: "#6b7280" }}>EXPIRES IN 30 DAYS</div>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 10px #10b981" }} />
              </div>
            </div>

          </div>

          {/* Bottom Feature Tags */}
          <div style={{ 
            marginTop: 40, display: "flex", justifyContent: "center", gap: 12, 
            position: "relative", zIndex: 2 
          }}>
            {["Real-time Webhooks", "Zero-Latency Verification", "Native Solana State"].map((tag, i) => (
              <div key={i} style={{
                fontSize: 10, fontWeight: 700, color: "#94a3b8",
                background: "rgba(255,255,255,0.03)", padding: "6px 12px", borderRadius: 99,
                border: "1px solid rgba(255,255,255,0.05)"
              }}>
                {tag}
              </div>
            ))}
          </div>
        </div>

      </section>

      {/* Features Grid */}
      <section id="features" style={{ padding: "100px 24px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: "#f1f5f9", marginBottom: 16 }}>Everything you need to scale.</h2>
          <p style={{ color: "#94a3b8", fontSize: 16 }}>Built for performance, privacy, and the global economy.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
          {[
            { icon: Globe, title: "Pay from Any Chain", desc: "Ethereum, Base, Arbitrum, or Solana. Your users pay with whatever they have." },
            { icon: ShieldCheck, title: "On-Chain Entitlements", desc: "Verified access rights stored as PDAs on Solana. Trustless and composable." },
            { icon: Layers, title: "Automated Lifecycles", desc: "Webhooks handle everything—granting, renewing, and revoking access automatically." },
            { icon: CreditCard, title: "Card & Fiat Support", desc: "Allow users to subscribe with traditional payment methods through KIRAPAY." },
            { icon: Activity, title: "Real-time Analytics", desc: "Track your MRR, active subscribers, and churn risk in a premium dashboard." },
            { icon: Zap, title: "Developer First", desc: "Integration takes minutes with our SDK and pre-built checkout UI." },
          ].map((f, i) => (
            <div key={i} className="glass glass-hover" style={{ padding: 32 }}>
              <div style={{ 
                width: 48, height: 48, borderRadius: 12, background: "rgba(6,182,212,0.1)",
                display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20,
                border: "1px solid rgba(6,182,212,0.2)"
              }}>
                <f.icon size={24} color="#06b6d4" />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: "#f1f5f9", marginBottom: 12 }}>{f.title}</h3>
              <p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" style={{ padding: "100px 24px", background: "rgba(255,255,255,0.01)", borderTop: "1px solid rgba(255,255,255,0.03)" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: "#f1f5f9", marginBottom: 16 }}>From Payment to Access in Seconds.</h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
            {[
              { step: "01", title: "Create your Plans", desc: "Define pricing, duration, and access tiers in the KiraSub merchant dashboard." },
              { step: "02", title: "User Pays with Token", desc: "Users pay via a hosted checkout link using any supported token or chain." },
              { step: "03", title: "Real-time Webhook", desc: "KIRAPAY confirms the transaction and triggers our secure automation." },
              { step: "04", title: "On-Chain Entitlement", desc: "The KiraSub program mints an entitlement PDA on Solana, granting instant access." },
            ].map((s, i) => (
              <div key={i} style={{ display: "flex", gap: 32, alignItems: "flex-start" }}>
                <div style={{ 
                  fontSize: 48, fontWeight: 900, color: "rgba(6,182,212,0.1)", 
                  lineHeight: 1, flexShrink: 0, width: 80 
                }}>{s.step}</div>
                <div>
                  <h3 style={{ fontSize: 20, fontWeight: 700, color: "#f1f5f9", marginBottom: 8 }}>{s.title}</h3>
                  <p style={{ color: "#94a3b8", fontSize: 16 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof / CTA */}
      <section style={{ padding: "120px 24px", textAlign: "center" }}>
        <div style={{ 
          maxWidth: 800, margin: "0 auto", padding: "60px 40px", 
          background: "linear-gradient(135deg, rgba(6,182,212,0.1), rgba(8,145,178,0.05))",
          borderRadius: 32, border: "1px solid rgba(6,182,212,0.2)",
          position: "relative", overflow: "hidden"
        }}>
          <h2 style={{ fontSize: 36, fontWeight: 800, color: "#f1f5f9", marginBottom: 20 }}>Ready to scale your recurring revenue?</h2>
          <p style={{ color: "#94a3b8", fontSize: 18, marginBottom: 40 }}>Join the next generation of Solana applications building on KiraSub.</p>
          <Link href="/dashboard" className="btn btn-primary btn-lg">
            Get Started Now
          </Link>
          
          {/* Decorative glow */}
          <div style={{
            position: "absolute", bottom: -50, right: -50, width: 200, height: 200,
            background: "rgba(6,182,212,0.2)", filter: "blur(60px)", borderRadius: "50%"
          }} />
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: "60px 24px 40px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <Activity size={18} color="#06b6d4" />
              <span style={{ fontSize: 18, fontWeight: 800, color: "#f1f5f9" }}>KiraSub</span>
            </div>
            <p style={{ color: "#4b5563", fontSize: 13 }}>Built for the KIRAPAY × Solana Hackathon.</p>
          </div>
          <div style={{ display: "flex", gap: 24 }}>
            <a href="#" style={{ color: "#4b5563", textDecoration: "none", fontSize: 13 }}>Twitter</a>
            <a href="#" style={{ color: "#4b5563", textDecoration: "none", fontSize: 13 }}>GitHub</a>
            <a href="#" style={{ color: "#4b5563", textDecoration: "none", fontSize: 13 }}>Docs</a>
          </div>
        </div>
        <div style={{ textAlign: "center", marginTop: 40, color: "#374151", fontSize: 11 }}>
          © 2026 KiraSub. All rights reserved.
        </div>
      </footer>

      <style jsx>{`
        .nav-link:hover {
          color: #f1f5f9 !important;
        }
      `}</style>
    </div>
  );
}
