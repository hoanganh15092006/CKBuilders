# Week 02 - Compose Transactions on Nervos CKB

This project implements transaction composition on Nervos CKB using CCC SDK (`@ckb-ccc/ccc` and `@ckb-ccc/connector-react`), based on the official guide at [https://docs.ckbccc.com/en/docs/guides/compose-transactions](https://docs.ckbccc.com/en/docs/guides/compose-transactions).

---

## 1. Overview & Core Pattern

CCC simplifies building CKB transactions through the **declare → fill → fee → send** pattern:

1. **Declare (`ccc.Transaction.from`)**: Define only the desired outputs (recipient lock and capacity).
2. **Fill (`completeInputsByCapacity` / `completeInputsAll`)**: CCC automatically queries live cells owned by the signer and appends them as transaction inputs.
3. **Fee (`completeFeeBy` / `completeFeeChangeToOutput`)**: Calculates the network fee and automatically manages the change output.
4. **Send (`signer.sendTransaction`)**: Signs with the connected wallet (JoyID, MetaMask, OKX, UniSat...) and broadcasts to CKB nodes.

---

## 2. Key Capabilities Implemented

### 2.1. Transfer CKB (Fixed Amount)
- Converts human-readable CKB amount to shannons via `ccc.fixedPointFrom(amount, 8)`.
- Validates the minimum Cell capacity rule: $\ge 61\text{ CKB}$ ($62\text{ CKB}$ recommended).
- Auto-completes inputs and adjusts the change cell.

### 2.2. Transfer All CKB (Wallet Sweep)
- Consolidates all live cells owned by the account using `completeInputsAll(signer)`.
- Deducts the fee directly from output index 0 using `completeFeeChangeToOutput(signer, 0)`.
- Sweeps total remaining capacity to the target destination.

### 2.3. Fee Calculation
- Automatically queries the current network median fee rate or allows fine-grained manual fee rate specification in `shannon/kB`.

---

## 3. Project Structure

```
3_Compose_Transactions/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── index.html
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── App.css
│   ├── index.css
│   └── transactions.ts   # Core transaction compose logic
└── README.md
```

---

## 4. How to Run

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open `http://localhost:5173/` in your browser.
4. Connect your wallet (Passkey / MetaMask / OKX / UniSat) and execute transfers or wallet sweep operations on CKB Testnet.

