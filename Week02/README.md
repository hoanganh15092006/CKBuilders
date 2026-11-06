# CKB Weekly Report - Week 2

**Reporting period:** November 2026
**Publication date:** November 2026
**Participant:** Nguyen Hoang Anh
**Repository:** [https://github.com/hoanganh15092006/CKBuilders/tree/main/Week02](https://github.com/hoanganh15092006/CKBuilders/tree/main/Week02)

---

## 1. Week 2 Overview

The goal of Week 2 was to master client-side application development on Nervos CKB using **Common Chains Connector (CCC)**, the modern JavaScript/TypeScript SDK for the CKB ecosystem. This week focused on integrating multi-chain browser and passkey wallets, composing on-chain transactions with automatic cell selection and fee estimation, and implementing cryptographic message signing and off-chain verification.

The completed modules for Week 2 are:

- **Exercise 01:** Introduction to CCC (SDK & Core Patterns)
- **Exercise 02:** Connect Wallets with CCC (Passkeys & Browser Extensions)
- **Exercise 03:** Compose Transactions on CKB (Declare → Fill → Fee → Send)
- **Exercise 04:** Sign and Verify Messages (Cryptographic Verification & Tamper Detection)

---

## 2. Development Environment

- **OS:** Windows 10/11 Pro (NT 10.0)
- **Node.js:** v22.20.0
- **npm:** 10.9.3
- **TypeScript:** 5.7.2
- **Vite:** 6.0.3 / 6.4.5
- **React:** 19.0.0
- **CCC SDK:**
  - `@ckb-ccc/ccc`: ^1.3.6
  - `@ckb-ccc/connector-react`: ^2.2.2
- **Network:** CKB Testnet (Mirana / Pudge - CKT)
- **Testnet Explorer:** `https://pudge.explorer.nervos.org`
- **Supported Wallets:** JoyID Passkey (WebAuthn), MetaMask, OKX Wallet, UniSat, UTXO Global

---

## 3. Evidence & Directory Index

| ID           | Exercise               | Directory & Report                                                                                    | Evidence Screenshots                                                                                                                                                                                                       |
| ------------ | ---------------------- | ----------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **01** | Introduction to CCC    | [`1_CCC/CCC.md`](./1_CCC/CCC.md)                                                                     | `1_Transfer_CKB_Basic_Setup_And_Initial_Output.png2_Complete_Inputs_And_Fee_Calculation.png``3_Spore_Protocol_Initialization.png4_Spore_Inputs_And_Fee_Completion.png``5_Query_OnChain_Data_Tip_Address_Balance.png` |
| **02** | Connect Wallets        | [`2_connect_wallet/connect_wallet.md`](./2_connect_wallet/connect_wallet.md)                         | `1_Create_Vite_React_TS_Project.png2_Install_CCC_SDK_And_Run_Dev.png``3_Connected_Wallet_JoyID_Address_And_Balance.png`                                                                                                |
| **03** | Compose Transactions   | [`3_Compose_Transactions/Compose_Transactions.md`](./3_Compose_Transactions/Compose_Transactions.md) | `1_Dev_Server_Running.png2_Compose_Transfer_500_CKB.png``3_Transaction_Success_Hash.png4_Receiver_Wallet_Received_500_CKB.png`                                                                                         |
| **04** | Sign & Verify Messages | [`4_Sign_Message/Sign_Message.md`](./4_Sign_Message/Sign_Message.md)                                 | `1_Dev_Server_Running.png2_Connected_Wallet_Sign_Message.png``3_Signature_Details_And_Verification_Passed.png`                                                                                                         |

---

## 4. CCC & CKB Application Fundamentals

### Common Chains Connector (CCC)

CCC provides a unified abstraction layer connecting decentralized applications to Nervos CKB. Instead of writing custom bindings for each wallet or signature scheme, developers interact with standardized `Client` and `Signer` interfaces.

### Client vs. Signer

- **`Client`**: Communicates with CKB nodes via JSON-RPC. It fetches live cells, queries header information, estimates fees, and broadcasts transactions (e.g., `ClientPublicTestnet`, `ClientPublicMainnet`).
- **`Signer`**: Represents an authenticated identity capable of signing messages and approving on-chain transactions (e.g., JoyID, MetaMask, OKX, or raw private keys).

### Transaction Lifecycle: Declare → Fill → Fee → Send

Unlike account-based blockchains, CKB transactions require explicit input selection and change handling:

1. **Declare:** Define the intended outputs (e.g. transfer 500 CKB to recipient).
2. **Fill (`completeInputsByCapacity`):** Search the signer's live cells and add sufficient inputs to cover output capacity.
3. **Fee (`completeFeeBy`):** Calculate transaction serialization size, compute miner fee, and adjust or generate change cells.
4. **Send (`sendTransaction`):** Sign the transaction witness with the user's wallet and broadcast to CKB nodes.

### Minimum Cell Capacity (61 CKB Rule)

Every live cell on CKB must hold enough CKBytes to occupy its physical byte footprint:

$$
\text{Capacity (CKB)} \ge \text{Byte Size of (Capacity + Lock Script + Type Script + Data)}
$$

A standard secp256k1 lock cell requires at least 61 CKB (6,100,000,000 Shannons). Any output constructed below 61 CKB is rejected by node consensus.

### Multi-Chain Signatures & Scheme Dispatch

CCC supports cross-chain verification through the `Signature` object:

- `signature`: Raw cryptographic signature bytes.
- `identity`: Address or public key of the signer.
- `signType`: Algorithm indicator (`CkbSecp256k1`, `JoyId`, `EvmPersonal`, `BtcEcdsa`).
  Static verification (`ccc.Signer.verifyMessage`) automatically dispatches to the corresponding cryptographic curve without requiring the verifier to know the wallet type in advance.

---

## 5. Exercise 01 - Introduction to CCC

### Objective

Explore the fundamental building blocks of the CCC SDK: constructing transactions, completing inputs by capacity, configuring Spore protocol parameters, and querying on-chain network data.

### Procedure

- Initialized CKB client connection targeting Testnet.
- Constructed standard output cells and completed input selection by capacity.
- Demonstrated fee calculation using default and custom fee rates.
- Tested Spore DOB transaction initialization and inputs preparation.
- Queried on-chain tip block header, recommended address format, and account balance.

### Result

- Output cells and change cells were correctly assembled.
- Verified live capacity calculations and transaction fee deduction.
- On-chain queries accurately reported testnet tip height and wallet balance.

### Evidence

See [`1_CCC/CCC.md`](./1_CCC/CCC.md).

---

## 6. Exercise 02 - Connect Wallets with CCC

### Objective

Create a modern React application utilizing `@ckb-ccc/connector-react` to support multi-chain wallet connections, including WebAuthn/Passkey authentication (JoyID) and browser extensions (MetaMask, OKX, UniSat).

### Procedure

- Initialized a Vite + React + TypeScript application:
  ```bash
  npm create vite@latest ckb-connect-demo --template react-ts
  ```
- Installed CCC connector packages:
  ```bash
  npm install @ckb-ccc/connector-react @ckb-ccc/ccc
  ```
- Configured `<ccc.Provider>` with Testnet client options.
- Built wallet modal triggers, connection state handlers, address displays, and balance hooks.
- Connected via JoyID Passkey and verified address generation (`ckt1...`).

### Result

- Seamless connection established via JoyID Passkey on CKB Testnet.
- Real-time address and CKT balance rendering.
- Extension availability detection configured for browser wallets.

### Evidence

See [`2_connect_wallet/connect_wallet.md`](./2_connect_wallet/connect_wallet.md).

---

## 7. Exercise 03 - Compose Transactions

### Objective

Implement end-to-end CKB transaction composition and broadcasting from the browser UI, enforcing capacity limits, automated input collection, and fee estimation.

### Procedure

- Built the `transferCkb` helper utilizing CCC transaction methods:
  ```typescript
  const tx = ccc.Transaction.from({
    outputs: [{ capacity: ccc.fixedPointFrom(amountInCkb), lock }],
  });
  await tx.completeInputsByCapacity(signer);
  await tx.completeFeeBy(signer, feeRate);
  const txHash = await signer.sendTransaction(tx);
  ```
- Added UI inputs for recipient address, transfer amount (with minimum 61 CKB validation), and fee rate.
- Executed an on-chain transfer of 500 CKB to a recipient testnet wallet.
- Broadcast the transaction through JoyID signature authorization.

### Result

- Transaction successfully confirmed on-chain with hash:
  `0xde885ff41e954a3f2207a8f75be03301307fcc8fb0c8899f4a044429387fa801`
- Sender account deducted 500 CKB + fee.
- Recipient wallet confirmed receipt of +500 CKB on CKB Testnet.

### Evidence

See [`3_Compose_Transactions/Compose_Transactions.md`](./3_Compose_Transactions/Compose_Transactions.md).

---

## 8. Exercise 04 - Sign & Verify Messages

### Objective

Demonstrate off-chain cryptographic message signing and verification across different wallet schemes, validating authenticity and proving anti-tamper security.

### Procedure

- Created message input interface accepting arbitrary strings or hex data.
- Invoked `signer.signMessage(message)` with connected JoyID Passkey.
- Extracted `Signature` object containing signature hex, signer identity, and `signType: JoyId`.
- Verified signature statically via `ccc.Signer.verifyMessage(message, signature)`.
- Verified signer identity match via `signer.verifyMessage(message, signature)`.
- Conducted tamper detection test by altering message payload.

### Result

- **Static Verification:** PASSED (`true`).
- **Signer Identity Match:** PASSED (`true`).
- **Tamper Detection:** REJECTED (`false`), successfully detecting unauthorized payload modification.

### Evidence

See [`4_Sign_Message/Sign_Message.md`](./4_Sign_Message/Sign_Message.md).

---

## 9. Week 2 Development Log

| Date     | Activity                                                              | Result    | Evidence                                                                |
| -------- | --------------------------------------------------------------------- | --------- | ----------------------------------------------------------------------- |
| Nov 2026 | CCC SDK initialization, transaction builder tests, on-chain queries   | Completed | [Exercise 01 evidence](./1_CCC/CCC.md)                                   |
| Nov 2026 | Multi-chain wallet connector dApp with JoyID Passkey & extensions     | Completed | [Exercise 02 evidence](./2_connect_wallet/connect_wallet.md)             |
| Nov 2026 | Compose & broadcast 500 CKB transfer with automated input/fee filling | Completed | [Exercise 03 evidence](./3_Compose_Transactions/Compose_Transactions.md) |
| Nov 2026 | Cryptographic message signing, static verification & tamper proofing  | Completed | [Exercise 04 evidence](./4_Sign_Message/Sign_Message.md)                 |

---

## 10. Challenges & Solutions

- **React 19 & CCC Typing Alignment:** Type mismatches occurred when mixing `@ckb-ccc/ccc` and `@ckb-ccc/connector-react` across nested submodules. Resolved by standardizing imports through `@ckb-ccc/connector-react` and syncing peer dependency versions.
- **Passkey WebAuthn Origin Requirements:** JoyID passkeys require valid origins (`localhost` or HTTPS). Configured Vite dev servers with fixed port bindings and tested origin recognition across local browsers.
- **Strict Capacity Enforcements:** Sending transactions without sufficient balance to cover the 61 CKB minimum output plus change cell causes transaction build errors. Added client-side form validations ensuring all output allocations respect cell footprint rules.
- **Tamper Verification Interpretation:** Confirmed that `verifyMessage` returning `false` on modified text proves cryptographic security and integrity enforcement rather than application failure.

---

## 11. Final Reflection

Week 2 bridged low-level CKB protocol concepts into production-ready frontend applications. By leveraging CCC (Common Chains Connector), developing on CKB is unified across EVM, Bitcoin, and native Passkey wallets without complex boilerplate. Transaction composition following the **declare → fill → fee → send** pattern provides granular control over on-chain UTXO state while offering a frictionless user experience.

---

## 12. Next Steps

1. **User Defined Tokens (UDT / xUDT):**
   - Issuing and transferring fungible tokens via `ccc.udt.Udt`.
   - Querying SSRI on-chain metadata (name, symbol, decimals).
2. **Spore Protocol (Digital Objects - DOBs):**
   - Minting permanent on-chain media DOBs.
   - Cluster collections, ownership transfers, and cell melting to reclaim CKB capacity.

---

## 13. Official References & Learning Resources

- [CCC Documentation Home](https://docs.ckbccc.com)
- [CCC Guide: Connect Wallets](https://docs.ckbccc.com/en/docs/guides/connect-wallets)
- [CCC Guide: Compose Transactions](https://docs.ckbccc.com/en/docs/guides/compose-transactions)
- [CCC Guide: Sign Messages](https://docs.ckbccc.com/en/docs/guides/sign-message)
- [CCC Guide: UDT Tokens](https://docs.ckbccc.com/en/docs/guides/udt-tokens)
- [CCC Guide: Spore Protocol](https://docs.ckbccc.com/en/docs/guides/spore-protocol)
- [CKB Testnet Explorer](https://pudge.explorer.nervos.org)
- [JoyID Developer Portal](https://joy.id)
