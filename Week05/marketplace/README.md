# CKB DOB Marketplace (Week 05)

Basic Digital Object (Spore DOB) Marketplace built on **CKB Testnet** with **Next.js**, **React 19**, **Tailwind CSS v4**, `@ckb-ccc/connector-react`, and `@ckb-ccc/shell`.

## Environment Configuration

Copy `.env.example` to `.env`:

```env
MARKET_PRIVATE_KEY=0x_escrow_wallet_private_key_
DB_URL=
```

- `MARKET_PRIVATE_KEY`: 32-byte hex private key for the market escrow wallet on CKB Testnet (must hold CKB to cover transfer fees when sending DOBs to buyers or returning cancelled listings).
- `DB_URL`: Optional PostgreSQL connection string (e.g., Neon). When left empty, the server automatically persists listings and binary image files in `data/` (`data/nfts.json` and `data/files/`).

## Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
