# KIRAPAY Integration

KiraSub leverages the **KIRAPAY** engine as the core payment infrastructure, completely abstracting the complexities of cross-chain liquidity and fiat on-ramps away from the Solana access layer.

## How We Use KIRAPAY

Our integration is deep, fully automated, and designed for zero-friction subscriptions:

### 1. Dynamic Checkout Sessions
When a user decides to subscribe to a merchant's plan, the KiraSub backend utilizes the `kirapay-merchant-sdk` to generate a dynamic, unique checkout session. 
* **Multi-Chain Support**: The user is presented with a KIRAPAY-hosted payment UI where they can seamlessly pay using their preferred token and chain (e.g., USDC on Base, ETH on Ethereum, or traditional fiat cards).
* **Order Tracking**: We pass a `customOrderId` (linked to our internal `Subscription` record) to KIRAPAY to accurately track the session lifecycle.

### 2. Automated Webhook Reconciliation
KiraSub listens to real-time events from the KIRAPAY network.
* **Instant Confirmation**: Once the payment is settled on the source chain, KIRAPAY fires a secure `transaction.succeeded` webhook to our Next.js backend.
* **Signature Verification**: Our API route strictly validates the payload signature using the KIRAPAY webhook secret, ensuring all state changes are authentic and secure.

### 3. Real-Time Entitlement Provisioning
The webhook acts as the trigger for our Solana integration.
* **Bridging Web2 to Web3**: Upon successful webhook verification, the KiraSub backend automatically constructs, signs, and submits a transaction to the Solana network.
* **Access Granted**: This transaction calls our Anchor program to mint (or renew) the user's `Entitlement` PDA. 

### 4. Zero-Friction Renewals
For recurring payments, the workflow remains entirely automated. Subsequent billing cycles processed by KIRAPAY fire new webhooks, which trigger the `renew_entitlement` instruction on Solana. The user's access is seamlessly extended without any manual intervention or need to sign recurring on-chain transactions.
