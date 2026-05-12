# Project Architecture

KiraSub’s architecture is designed for speed, security, and composability. It is divided into three main pillars:

## 1. The On-Chain Access Engine (Solana / Anchor)
The core source of truth for user access resides on the Solana blockchain, managed by our custom Anchor program (`kirasub`).
* **MerchantConfig & Plan PDAs**: Merchants and their subscription tiers are initialized on-chain. This stores immutable details like pricing, billing periods, and authority.
* **Entitlement PDAs**: When a user subscribes, a unique Entitlement PDA is minted to their Solana wallet. This PDA stores their access status (`active`), start date, and expiration timestamp.
* **Composability**: Any dApp, frontend, or smart contract can query this PDA directly from the ledger to instantly verify if a user has premium access, without relying on a centralized API or database lookup.

## 2. The Off-Chain Application (Next.js & Postgres)
A high-performance web application handles the merchant dashboard, checkout generation, and analytics.
* **Frontend**: Built with Next.js 15 (App Router) and styled with Tailwind CSS. It features a premium glassmorphic UI, real-time merchant dashboards, and an interactive payment visualization.
* **Database**: A Serverless PostgreSQL database (via Neon) managed by Prisma ORM. It acts as the fast-retrieval cache for UI analytics.
  * *Key Models*: `Merchant`, `Plan`, `Subscriber`, `Subscription`, `KirapayTransaction`, and `EntitlementWrite`.
* **Security**: Backend API routes securely hold the Merchant Authority keypair used to sign transactions that modify Solana PDAs, ensuring only verified payments can grant access.

## 3. The Cross-Chain Payment Bridge (KIRAPAY)
KiraSub utilizes **KIRAPAY** to handle the complexities of multi-chain payments.
* **Flow**: Merchant creates a plan -> User connects Solana wallet -> Backend generates a KIRAPAY checkout link -> User pays on any chain (e.g., Ethereum, Base) -> KIRAPAY webhook fires -> Backend verifies payment -> Backend instructs Solana program to mint the Entitlement PDA.

## Tech Stack Summary
* **Frontend**: Next.js 15, Tailwind CSS v4, Lucide Icons
* **Backend**: Next.js API Routes, Prisma Client v6, PostgreSQL (Neon)
* **Blockchain**: Solana Devnet, Rust, Anchor Framework v0.31.1, `@solana/web3.js`
* **Payments**: KIRAPAY API & SDK
