# KiraSub — Subscription Billing & Access Control for Solana

KiraSub is a production-ready subscription engine for Solana applications, powered by the **KIRAPAY** payment engine. It allows users to pay for subscriptions using any token on any supported chain (Ethereum, Base, Arbitrum, etc.) while receiving native Solana access rights (entitlements) managed by an Anchor program.

## 🚀 Key Features

- **Cross-Chain Payments**: Powered by KIRAPAY, users can pay from any chain.
- **On-Chain Entitlements**: Access rights are written as PDAs on Solana Devnet.
- **Merchant Dashboard**: Plan creation, subscriber management, and revenue analytics.
- **Premium Glassmorphism UI**: High-end dark mode design for a professional feel.
- **Automated Webhooks**: Real-time reconciliation from payment to access grant.

## 🛠 Tech Stack

- **Frontend**: Next.js 15 (App Router), Tailwind CSS v4, Lucide Icons.
- **Backend**: Next.js API Routes, Prisma ORM, PostgreSQL (Neon).
- **Blockchain**: Anchor (Solana), @solana/web3.js.
- **Payments**: KIRAPAY API & SDK.

## 📦 Installation

Follow the [Installation Guide](file:///home/varna/.gemini/antigravity/brain/23d0d879-2c82-408d-89d9-d62775942677/installation_guide.md) for step-by-step setup.

### Quick Start

1. **Scaffold & Install**:
   ```bash
   npm install
   ```

2. **Setup Env**:
   Copy `.env.example` to `.env` and fill in your Neon DB URL and KIRAPAY API Key.

3. **Deploy Anchor**:
   ```bash
   npm run anchor:build
   npm run anchor:deploy
   ```

4. **Initialize DB**:
   ```bash
   npm run db:push
   npm run db:seed
   ```

5. **Run**:
   ```bash
   npm run dev
   ```

## 🏗 Architecture

### 1. Payment Flow
Merchant creates a plan → User initiates checkout → Backend generates KIRAPAY link → User pays (any chain) → KIRAPAY sends webhook → Backend verifies and calls Anchor program.

### 2. Access Control
The Anchor program stores `Entitlement` PDAs. The frontend (or any protected app) reads these PDAs directly from the Solana ledger to grant/deny access.

## 🔒 Security
- KIRAPAY API keys are stored strictly on the server-side.
- Entitlement grants are signed by the Merchant Authority keypair on the backend.
- Database URLs and secrets are never committed to the repository.

---
Built for the **KIRAPAY × Solana Hackathon**.
