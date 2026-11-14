# CKB Weekly Report - Week 3

**Reporting period:** November 2026  
**Publication date:** November 2026  
**Participant:** Nguyen Hoang Anh  
**Repository:** [https://github.com/hoanganh15092006/CKBuilders/tree/main/Week03](https://github.com/hoanganh15092006/CKBuilders/tree/main/Week03)

---

## 1. Week 3 Overview

The goal of Week 3 was to master advanced asset protocols and server-side automation on Nervos CKB using the **Common Chains Connector (CCC)** ecosystem. This week focused on issuing and transferring fungible User Defined Tokens (UDT/xUDT), creating permanent on-chain Digital Objects (DOBs) and Cluster collections using the Spore protocol, and building autonomous server-side backend scripts using `@ckb-ccc/shell`.

The completed modules for Week 3 are:

- **Exercise 01:** User Defined Tokens (UDT / xUDT)
- **Exercise 02:** Spore Protocol (Digital Objects & Clusters)
- **Exercise 03:** Node.js Backend Development with CCC

---

## 2. Development Environment

- **OS:** Windows 10/11 Pro (NT 10.0)
- **Node.js:** v22.20.0
- **npm:** 10.9.3
- **TypeScript:** 5.7.2
- **Vite:** 6.0.3 / 6.4.6
- **React:** 19.0.0
- **CCC SDK:**
  - `@ckb-ccc/ccc`: ^1.3.6
  - `@ckb-ccc/connector-react`: ^2.2.2
  - `@ckb-ccc/spore`: ^1.6.15
  - `@ckb-ccc/shell`: ^1.3.15
- **Network:** CKB Testnet (Mirana / Pudge - CKT)
- **Testnet Explorer:** `https://pudge.explorer.nervos.org`

---

## 3. Evidence & Directory Index

| ID | Exercise | Directory & Report | Evidence Screenshots |
|---|---|---|---|
| **01** | UDT Tokens | [`1_UDT_Tokens/UDT_Tokens.md`](./1_UDT_Tokens/UDT_Tokens.md) | `1_Dev_Server_Running.png`<br>`2_Configure_Mint_UDT_Token.png`<br>`3_Mint_UDT_Success_TxHash.png`<br>`4_Mint_Verified_On_CKB_Explorer.png`<br>`5_Configure_Transfer_UDT.png`<br>`6_Transfer_UDT_Success_TxHash.png`<br>`7_Transfer_Verified_On_CKB_Explorer.png` |
| **02** | Spore Protocol | [`2_Spore_Protocol/Spore_Protocol.md`](./2_Spore_Protocol/Spore_Protocol.md) | `1_Configure_Mint_OnChain_Image_DOB.png`<br>`2_Mint_Image_Spore_Success_TxHash.png`<br>`3_Spore_Mint_Verified_On_CKB_Explorer.png`<br>`4_Rendered_In_JoyID_Wallet_DOBs.png`<br>`5_Create_Spore_Cluster_Success.png`<br>`6_Cluster_Verified_On_CKB_Explorer.png`<br>`7_Spore_Cluster_Cell_Type_Script.png`<br>`8_Mint_Image_Spore_Inside_Cluster.png`<br>`9_Spore_Minted_In_Cluster_Success_TxHash.png`<br>`10_Mint_Second_Image_Spore_In_Cluster.png`<br>`11_Cluster_Collection_In_JoyID_Wallet.png`<br>`12_Configure_Transfer_Spore_DOB.png`<br>`13_Spore_Transferred_Success_TxHash.png`<br>`14_Spore_Transfer_Verified_On_CKB_Explorer.png`<br>`15_Recipient_Wallet_Received_Spore_DOB.png` |
| **03** | Node.js Backend | [`3_Nodejs_Backend/Nodejs_Backend.md`](./3_Nodejs_Backend/Nodejs_Backend.md)<br>([Project README](./3_Nodejs_Backend/nodejs-backend-demo/README.md)) | `1_Query_Account_Balance.png`<br>`2_Iterate_OnChain_Live_Cells.png`<br>`3_Compose_And_Send_Transaction.png`<br>`4_Verify_Signatures.png`<br>`5_Demo_Overview_Execution.png` |

---

## 4. Advanced CKB & Asset Protocol Fundamentals

### User Defined Tokens (UDT / xUDT)
- **sUDT (RFC 25):** The original minimal fungible token standard on CKB where token balances are stored in the first 16 bytes (LE uint128) of cell data.
- **xUDT (RFC 52):** The extensible token standard supporting owner-mode minting rules, transfer allowances, and regulatory compliance extensions.
- **SSRI Execution:** Smart Contract Scripts Runtime Interface allows dApps to query token metadata (name, symbol, decimals, icon) directly via on-chain contract evaluation without relying on centralized token registries.

### Spore Protocol (DOBs)
- **Spore:** A unique cell binding content (text, image, JSON, 3D models) with an immutable Type Script ID. Content is stored 100% on-chain without IPFS or external hosting.
- **Cluster:** A collection cell defining group identity and metadata (name, description) referenced by individual Spores.
- **Melt Mechanism:** Unlike traditional burned NFTs, a Spore can be permanently destroyed to release and refund the underlying locked CKB capacity to the owner.

### Server-Side CCC (`@ckb-ccc/shell`)
- Zero DOM or browser dependencies, designed for Node.js backends, bots, schedulers, and indexing daemons.
- Direct connectivity with `ClientPublicTestnet.open()` / `ClientPublicMainnet.open()` utilizing automatic WebSockets and HTTP fallbacks.
- Autonomous signing via `SignerCkbPrivateKey` for automated payrolls, airdrops, and off-chain signature verifications.

---

## 5. Exercise 01 - User Defined Tokens (UDT / xUDT)

### Objective
Build a frontend dApp and automated scripts to construct `ccc.udt.Udt` instances, mint custom fungible tokens, execute token transfers with automated input balancing, and inspect SSRI metadata.

### Procedure
- Initialized `ckb-udt-tokens-demo` using React 19, TypeScript, and CCC connector.
- Implemented `getUdt()` resolving the on-chain xUDT OutPoint and cell deps.
- Built token minting workflow enforcing owner-mode authority and automated capacity balancing.
- Built token transfer workflow utilizing `udt.completeBy(tx, signer)` to select token inputs and generate change cells.
- Implemented SSRI metadata query handlers (`udt.name()`, `udt.symbol()`, `udt.decimals()`).

### Result
- UDT instance resolved and executed successfully against CKB Testnet.
- Token mint and transfer transactions build with precise capacity allocation.
- CLI verification script (`cli_udt.ts`) confirmed on-chain cell dependency resolution.

### Evidence
See [`1_UDT_Tokens/UDT_Tokens.md`](./1_UDT_Tokens/UDT_Tokens.md).

---

## 6. Exercise 02 - Spore Protocol (DOBs)

### Objective
Integrate the `@ckb-ccc/spore` SDK to create permanent on-chain Digital Objects (DOBs), organize them into Cluster collections, transfer ownership, and execute cell melting.

### Procedure
- Initialized `ckb-spore-protocol-demo` with `@ckb-ccc/spore` integration.
- Implemented `mintSporeDob()` encoding arbitrary text/media into Spore cells with type script IDs.
- Implemented `createCluster()` to mint collection headers.
- Built transfer and irreversible melt workflows reclaiming cell capacity.
- Implemented asynchronous stream querying with `findSporesBySigner()` to enumerate owned DOBs.

### Result
- Digital objects successfully composed and verified on CKB Testnet.
- Cluster association verified via `lockProxy` mode.
- Asynchronous generator query successfully streams live cells from network.

### Evidence
See [`2_Spore_Protocol/Spore_Protocol.md`](./2_Spore_Protocol/Spore_Protocol.md).

---

## 7. Exercise 03 - Node.js Backend Development with CCC

### Objective
Develop server-side CKB scripts using `@ckb-ccc/shell` and `SignerCkbPrivateKey` for autonomous transaction execution, live cell iteration, and cryptographic signature verification.

### Procedure
- Initialized `nodejs-backend-demo` configuring ESM and `@ckb-ccc/shell`.
- Built `1_query_balance.ts` to inspect accounts and retrieve testnet balances via `client.getBalance()`.
- Built `2_compose_and_send.ts` composing transactions following declare → fill → fee → send pattern.
- Built `3_iterate_cells.ts` scanning an address's live cells on-chain via `client.findCellsOnChain()`.
- Built `4_verify_signatures.ts` performing static off-chain signature authentication via `ccc.Signer.verifyMessage()`.
- Executed end-to-end backend tests (`npm start`, `npm run cells`, `npm run send`).

### Result
- Successfully queried live CKB Testnet balance via headless Node.js CLI.
- Scanned live cells on CKB Testnet and inspected outpoints and capacities.
- Composed, signed, and broadcasted transfer transaction directly from Node.js backend to JoyID recipient address (`ckt1qrfr...`) on CKB Testnet.
- Cryptographic verification test executed and confirmed `PASSED`.

### Evidence
See [`3_Nodejs_Backend/Nodejs_Backend.md`](./3_Nodejs_Backend/Nodejs_Backend.md).

---

## 8. Week 3 Development Log

| Date | Activity | Result | Evidence |
|---|---|---|---|
| Nov 2026 | UDT / xUDT token minting, transferring, and SSRI metadata inspection | Completed | [Exercise 01 evidence](./1_UDT_Tokens/UDT_Tokens.md) |
| Nov 2026 | Spore protocol DOB creation, cluster collections, and capacity melting | Completed | [Exercise 02 evidence](./2_Spore_Protocol/Spore_Protocol.md) |
| Nov 2026 | Headless Node.js backend client, live cell iteration, and signature verification | Completed | [Exercise 03 evidence](./3_Nodejs_Backend/Nodejs_Backend.md) |

---

## 9. Challenges & Solutions

- **xUDT Type Script Args Encoding:** Constructing UDT type scripts requires the exact issuer lock script hash. Implemented automatic address-to-lock parsing using `ccc.Address.fromString()`.
- **Spore Cluster Mode Selection:** Used `clusterMode: "lockProxy"` to minimize transaction size and capacity requirements when minting Spores inside user-owned clusters.
- **Headless Client Lifecycle Management:** Unlike browser singletons, server-side Node.js clients open persistent WebSocket connections. Structured all scripts with `try ... finally { await clientOwner.dispose(); }` to ensure clean process termination.
- **Strict Byte Capacity Constraints for Spores:** Because Spores store content directly in the cell data, capacity requirements scale with file size. Configured automatic fee and capacity filling using `completeInputsByCapacity`.

---

## 10. Final Reflection

Week 3 demonstrated the full expressive power of Nervos CKB's Cell Model. From fungible token issuance and extensible smart contract interfaces (SSRI) to 100% on-chain permanent digital objects (Spore DOBs) and headless server-side automation, the CCC ecosystem provides developers with a cohesive, production-grade toolkit for Web3 applications.

---

## 11. Official References & Learning Resources

- [CCC Guide: UDT Tokens](https://docs.ckbccc.com/en/docs/guides/udt-tokens)
- [CCC Guide: Spore Protocol](https://docs.ckbccc.com/en/docs/guides/spore-protocol)
- [CCC Guide: Node.js Backend](https://docs.ckbccc.com/en/docs/guides/node-js-backend)
- [CKB RFC 25: Simple UDT](https://github.com/nervosnetwork/rfcs/blob/master/rfcs/0025-simple-udt/0025-simple-udt.md)
- [CKB RFC 52: Extensible UDT](https://github.com/nervosnetwork/rfcs/blob/master/rfcs/0052-extensible-udt/0052-extensible-udt.md)
- [Spore Protocol Official Documentation](https://spore.pro)
- [CKB Testnet Explorer](https://pudge.explorer.nervos.org)
