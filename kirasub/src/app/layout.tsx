import type { Metadata } from "next";
import "./globals.css";
import { WalletProviders } from "@/components/WalletProviders";

export const metadata: Metadata = {
  title: "KiraSub — Solana Subscription Billing powered by KIRAPAY",
  description:
    "On-chain subscription access control for Solana apps. Pay from any chain via KIRAPAY, receive Solana-native entitlements.",
  keywords: ["Solana", "subscription", "KIRAPAY", "Web3", "DeFi"],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <WalletProviders>{children}</WalletProviders>
      </body>
    </html>
  );
}
