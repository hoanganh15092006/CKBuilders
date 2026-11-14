# CKB Node.js Backend Demo with CCC

Server-side automation and headless interaction with Nervos CKB using the `@ckb-ccc/shell` SDK. This package provides direct, browser-independent integration for background workers, automated indexing, transaction pipelines, and off-chain signature authentication.

---

## 1. Overview & Architecture

Unlike browser-based dApps that require DOM-injected wallet extensions (such as MetaMask or JoyID WebAuthn popups), server-side backend services require direct, headless access to the CKB blockchain. 

`@ckb-ccc/shell` allows Node.js applications to:
- Establish real-time JSON-RPC and WebSocket connections to CKB nodes via `ccc.ClientPublicTestnet` or `ccc.ClientPublicMainnet`.
- Perform read-only queries (balances, live cells, scripts) for any public address without private keys.
- Compose, balance, sign, and broadcast transactions programmatically using `ccc.SignerCkbPrivateKey`.
- Perform cryptographic message signing and verification for off-chain API authentication.

---

## 2. Project Structure

```text
nodejs-backend-demo/
├── .env.example              Configuration template
├── .env                      Active local environment variables
├── package.json              Dependencies and run scripts
├── tsconfig.json             TypeScript compiler configuration
├── index.ts                  Main demonstration entry point
├── 1_query_balance.ts        Testnet account balance query
├── 2_compose_and_send.ts     Transaction construction and broadcast
├── 3_iterate_cells.ts        Live on-chain cell iteration
└── 4_verify_signatures.ts    Cryptographic signature verification
```

---

## 3. Configuration & Environment Variables

Copy `.env.example` to `.env` to configure your local environment:

```env
CKB_ADDRESS=ckt1qrfrwcdnvssswdwpn3s9v8fp87emat306ctjwsm3nmlkjg8qyza2cqgqq8c22qavedn9hl3aztfltrxrdnfdyeyc0cy7c4up
CKB_PRIVATE_KEY=0x8c3f8a6a6847a31af93000a31629f0c674e0cbb1b7cb71bdfbf4fb9dd828a518
CKB_RECIPIENT_ADDRESS=ckt1qrfrwcdnvssswdwpn3s9v8fp87emat306ctjwsm3nmlkjg8qyza2cqgqq8c22qavedn9hl3aztfltrxrdnfdyeyc0cy7c4up
```

### Parameter Reference

- `CKB_ADDRESS`: Any valid CKB address (JoyID Passkey, Omnilock, or Secp256k1) used for balance and live cell querying. Read operations do not require private keys.
- `CKB_PRIVATE_KEY`: A 32-byte hex-encoded private key used by `SignerCkbPrivateKey` for automated signing and broadcasting.
- `CKB_RECIPIENT_ADDRESS`: The destination address to receive CKB capacity in automated transfer scripts.

---

## 4. Script Execution & Commands

| Command | File | Description |
|---|---|---|
| `npm start` | `index.ts` | Runs the full backend overview: connects to testnet, queries balance, and performs signature verification. |
| `npm run balance` | `1_query_balance.ts` | Resolves the target address to lock script and retrieves live CKB balance. |
| `npm run cells` | `3_iterate_cells.ts` | Iterates and streams live cells belonging to the target address on CKB Testnet. |
| `npm run send` | `2_compose_and_send.ts` | Composes a 62 CKB transfer, auto-fills inputs and fee, and broadcasts the transaction. |
| `npm run verify` | `4_verify_signatures.ts` | Tests cryptographic message signing and verifies authentic vs tampered messages. |

---

## 5. Technical Implementation Details

### Client Lifecycle Management
The headless client establishes a persistent connection to the CKB network. Always release the client using `dispose()` inside a `finally` block to ensure proper resource cleanup:

```typescript
const clientOwner = ccc.ClientPublicTestnet.open();
const client = clientOwner.value;
try {
  const { script } = await ccc.Address.fromString(address, client);
  const balance = await client.getBalance([script]);
} finally {
  await clientOwner.dispose();
}
```

### Read-Only Address Querying
Querying balances or live cells on CKB does not require a private key. Resolving an address string generates its corresponding `lock` script, which can be directly passed to `client.getBalance()` or `client.findCellsOnChain()`:

```typescript
const { script: lock } = await ccc.Address.fromString(address, client);
for await (const cell of client.findCellsOnChain({ script: lock, scriptType: "lock" }, "asc")) {
  console.log(cell.outPoint.txHash, cell.cellOutput.capacity);
}
```

### Autonomous Transaction Pipeline
Transactions follow the 4-step pipeline:
1. **Declare Intent**: Define recipient outputs and required capacity.
2. **Complete Inputs**: Call `tx.completeInputsByCapacity(signer)` to gather sufficient live cells.
3. **Complete Fee**: Call `tx.completeFeeBy(signer)` to calculate transaction size and fee.
4. **Sign & Broadcast**: Call `signer.sendTransaction(tx)` to push to the network mempool.
