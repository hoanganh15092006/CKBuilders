# CKB Weekly Report - Week 5

**Reporting period:** November 2026  
**Participant:** Nguyen Hoang Anh  
**Repository:** [https://github.com/hoanganh15092006/CKBuilders/tree/main/Week05](https://github.com/hoanganh15092006/CKBuilders/tree/main/Week05)

## 1. Week 5 Overview

This week I built a basic DOB (Digital Object) marketplace on CKB Testnet. A user can connect a wallet (such as JoyID Passkey), create a DOB (Spore) from an uploaded image, list it for sale at a chosen CKB price, cancel a listing, and purchase listed DOBs from other sellers. Marketplace metadata and binary image assets are persisted via PostgreSQL (`pg` when `DB_URL` is set) or an automatic local store (`marketplace/data/`) so the marketplace page serves listings and on-chain verified media seamlessly.

The marketplace application is located at [`marketplace/`](./marketplace/). It is a Next.js App Router project utilizing `@ckb-ccc/connector-react` in the browser and `@ckb-ccc/shell` on the server.

## 2. Environment

- **Network:** CKB Testnet (`ClientPublicTestnet`)
- **Frontend / Full-stack Framework:** Next.js 16.4.6 (App Router), React 19, Tailwind CSS v4, TypeScript 5
- **CKB SDKs:** `@ckb-ccc/connector-react` ^2.2.2, `@ckb-ccc/shell` ^1.3.15 (includes Spore SDK)
- **Database Layer:** PostgreSQL (`pg`) with automatic local JSON + binary fallback (`marketplace/data/`)
- **Wallets:** JoyID Passkey (`ckt1qrfrwcdnvssswdwpn3s9v8fp87emat306ctjwsm3nmlkjg8qyza2cqgqq8c22qavedn9hl3aztfltrxrdnfdyeyc0cy7c4up`) connected through CCC + Server Escrow Signer (`SignerCkbPrivateKey`)

## 3. Evidence

| ID | Step | Screenshot |
|---|---|---|
| 01 | Run the marketplace app (`http://localhost:3000`) | [`01_run_marketplace.png`](./evidence/01_run_marketplace.png) |
| 02 | Connect JoyID Passkey wallet (`237,780.96 CKB`) | [`02_connect_wallet_success.png`](./evidence/02_connect_wallet_success.png) |
| 03 | Create DOB **`HAA`** on-chain from uploaded image | [`03_DOB_created.png`](./evidence/03_DOB_created.png) |
| 04 | List DOB **`HAA`** for sale at `150 CKB` | [`04_DOB_listed.png`](./evidence/04_DOB_listed.png) |
| 05 | Buy listed DOB **`Fiber Pass`** for `100 CKB` | [`05_buy_DOB.png`](./evidence/05_buy_DOB.png) |
| 06 | Purchased DOB **`Fiber Pass`** claimed into **My DOBs** | [`06_DOB_claimed.png`](./evidence/06_DOB_claimed.png) |
| 07 | Purchased DOB (`#0xa482f6...`, `827 CKBytes`) shown in JoyID Testnet wallet | [`07_DOB_on_wallet.png`](./evidence/07_DOB_on_wallet.png) |

## 4. How it works

### Project structure

| Layer | Files | Role |
|---|---|---|
| Components | `connectButton.tsx`, `createDOB.tsx`, `sellDOB.tsx`, `buyDOB.tsx`, `nftList.tsx`, `marketplace.tsx` | Browser UI and client-side transaction signing via CCC |
| API routes | `app/api/nfts/...`, `app/api/market/route.ts` | Handle image uploads, serve DOB metadata & image bytes, and process list / buy / cancel requests |
| Services | `nftService.ts`, `chainService.ts` | `nftService` manages database persistence & atomic state transitions; `chainService` verifies committed on-chain transactions and signs escrow transfers |

### End-to-End Flow & On-Chain Verification

1. **Connect wallet:** The user connects their JoyID Passkey wallet via CCC (`@ckb-ccc/connector-react`), displaying their CKB Testnet address (`ckt1qrfrwcdnvssswdwpn3s9v8fp87emat3...`) and live balance (`237,780.96764423 CKB`).
2. **Create DOB:** The user enters the DOB name **`HAA`**, selects an image (`Screenshot 2026-11-14 020754.png`), and signs a `ccc.spore.createSpore` transaction storing the image bytes on-chain. Once committed (`0x1de764a96b1cc47d7c157ee77187d66448266729a447863d859a013086261af9`), `POST /api/nfts` verifies on-chain via `ccc.spore.findSpore` that Spore `0xb166c61f290d7a8a806cd156997a626da6abe3282206558d1a8223fd24915ee8` exists, is locked by the creator's lock script, and its raw bytes match the uploaded file before saving to the database.
3. **Sell (List):** The seller enters `150` CKB on **`HAA`**, transfers the Spore DOB to the market escrow wallet (`ccc.spore.transferSpore`), and calls `POST /api/nfts/[id]/list`. The server verifies the transaction is committed, signed by the owner, and that the Spore now sits under the escrow lock before setting `status = 'listed'` and recording the price (`150 CKB`).
4. **Buy:** The buyer clicks **`Buy 100 CKB`** on **`Fiber Pass`** (Spore ID `0xa482f6bb5529261db74b992f9c7be376c4f597fbccdb298728226e44cf25559d`), sending `100 CKB` directly to the seller (`0x1304b68a213d593a1a1ee03b95d50a6f519bde73ff0bd6548f433b2f8898a997`) and calling `POST /api/nfts/2/buy`. The server atomically locks the status (`listed` -> `selling`), verifies that the buyer signed the payment input (`txSpentBy`) and paid at least the asking price to the seller (`amountPaidTo`), and transfers the Spore DOB from the escrow wallet to the buyer's JoyID address.
5. **Cancel listing:** Calling `POST /api/nfts/[id]/cancel` instructs the escrow wallet to transfer the Spore DOB back to its original seller and resets its status to `owned`.

### On-Chain Testnet Records

- **User Wallet (JoyID Passkey):** `ckt1qrfrwcdnvssswdwpn3s9v8fp87emat306ctjwsm3nmlkjg8qyza2cqgqq8c22qavedn9hl3aztfltrxrdnfdyeyc0cy7c4up`
- **Market Escrow Wallet:** `ckt1qzda0cr08m85hc8jlnfp3zer7xulejywt49kt2rr0vthywaa50xwsq2prryvze6fhufxkgjx35psh7w70k3hz7c3mtl4d`
- **Created & Listed DOB (`HAA`):**
  - Spore ID: `0xb166c61f290d7a8a806cd156997a626da6abe3282206558d1a8223fd24915ee8`
  - Mint Tx: `0x1de764a96b1cc47d7c157ee77187d66448266729a447863d859a013086261af9`
  - Listed Price: `150 CKB`
- **Purchased & Claimed DOB (`Fiber Pass`):**
  - Spore ID: `0xa482f6bb5529261db74b992f9c7be376c4f597fbccdb298728226e44cf25559d` (`827 CKBytes` occupied capacity in JoyID wallet)
  - Mint Tx: `0x80078b7acaa3e1c267eea3e40acf3b26f41817019f1eb41cfc99c1d53ebf76bb`
  - Buyer Payment Tx (`100 CKB`): `0x1304b68a213d593a1a1ee03b95d50a6f519bde73ff0bd6548f433b2f8898a997`
- **Active Marketplace Listing (`Cyber DOB X`):**
  - Spore ID: `0x5a394e67633a8cdf2d70af20020beebb2c7dc7b52e9ab5aea093faf9eddf30a7`
  - Mint Tx: `0x616b4255bed39efba362e0f9a1de3f8b6dd222792f13174a8b70cce3902d27d5`
  - Listed Price: `110 CKB`

## 5. What I learned

- Spore stores raw content directly inside cell data on CKB L1 (1 byte = 1 CKB occupied capacity, e.g. `Fiber Pass` occupies `827 CKBytes` in JoyID), so keeping image payloads compact significantly reduces minting capacity requirements.
- Using `@ckb-ccc/connector-react` in client components and `@ckb-ccc/shell` in Next.js Route Handlers cleanly separates interactive user signing (such as JoyID Passkey popups) from headless backend verification and escrow transfers.
- Because an escrow-based purchase splits payment and delivery into two separate transactions, atomic database state locking (`claimStatus(id, "listed", "selling")`) and input-ownership verification (`txSpentBy`) are essential to prevent race conditions and transaction-hash replay attacks.
- Enforcing a minimum listing price of `61 CKB` guarantees that the buyer's payment output satisfies CKB's minimum cell capacity rule for a standard secp256k1 lock cell.

## 6. Limitations

- Listed DOBs are held by a server-controlled escrow wallet (`MARKET_PRIVATE_KEY`). Users must trust the server operator, and compromising that key would put escrowed DOBs at risk.
- Payment and DOB delivery happen in two separate transactions rather than a single atomic L1 swap.
- Cancelling a listing currently relies on the caller body rather than verifying a cryptographic signature from the seller.

## 7. Next week

Next week I plan to replace the server escrow wallet with an **on-chain smart contract (DEX lock script)** so listed DOBs are locked directly by contract rules on CKB L1. That enables trustless, single-transaction atomic swaps between buyer and seller without keeping any private key on the server.
