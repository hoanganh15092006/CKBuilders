# CKB Weekly Report - Week 1

**Reporting period:** October 2026  
**Publication date:** October 2026  
**Participant:** [Your Name]  
**Repository:** `D:\CKBuilders\Week01`

---

## 1. Week 1 Overview

The goal of Week 1 was to set up the local development environment for Nervos CKB, become familiar with foundational CKB concepts (such as the Cell Model and on-chain scripting), and complete all beginner hands-on exercises.

The completed exercises for Week 1 are:

- **Exercise 00:** Getting Started & Environment Setup
- **Exercise 01:** Transfer CKB
- **Exercise 02:** Store Data on Cell
- **Exercise 03:** Create Fungible Token (xUDT)
- **Exercise 04:** Create DOB (Spore Protocol)
- **Exercise 05:** Simple Lock Contract

---

## 2. Development Environment

- **OS:** Windows 10/11 Pro (NT 10.0)
- **Node.js:** v22.20.0
- **npm:** 10.9.3
- **OffCKB:** 0.4.13
- **Repository Path:** `D:\CKBuilders\Week01`
- **Devnet RPC:** `http://127.0.0.1:8114`
- **Devnet RPC Proxy:** `http://127.0.0.1:28114`

---

## 3. Evidence & Directory Index

| ID | Exercise | Directory & Report | Evidence Screenshots |
|---|---|---|---|
| **00** | Getting Started | [`1_setup/setup.md`](./1_setup/setup.md) | `1_install_offckb_cli.png`, `2_CKB_devnet_running.png`, `3_offckb_accounts.png` |
| **01** | Transfer CKB | [`2_TransferCKB/Transfer.md`](./2_TransferCKB/Transfer.md) | `1_Dapp_running.png`, `2_Tranfer_Success.png`, `3_Transfer_by_cly.png` |
| **02** | Store Data on Cell | [`3_Store_Data_On_Cell/Store_Data_On_Cell.md`](./3_Store_Data_On_Cell/Store_Data_On_Cell.md) | `1_Dapp_running.png`, `2_Write_data_on_cell_success.png`, `3_Read_massage.png` |
| **03** | Create Fungible Token | [`4_Create_a_Fungible_Token/Create_a_Fungible_Token.md`](./4_Create_a_Fungible_Token/Create_a_Fungible_Token.md) | `1_Dapp_running.png`, `2_Issue_Custom_Token_success.png`, `3_View_Custom_Token.png`, `4_Transfer_Custom_Token.png` |
| **04** | Create DOB | [`5_Create_DBO/Create_DBO.md`](./5_Create_DBO/Create_DBO.md) | `1_Dapp_running.png`, `2_Create_on_chain_DBO_success.png`, `3_Check_spore_content.png` |
| **05** | Simple Lock | [`6_Build_Simple_Lock/Build_Simple_Lock.md`](./6_Build_Simple_Lock/Build_Simple_Lock.md) | `1_Build_Contract_Success.png`, `2_Dapp_running.png`, `3_Spend_From_The_Hash_Lock.png` |

*All evidence screenshots are stored in their respective exercise directories.*

---

## 4. CKB Fundamentals

### Cell Model
The Cell Model is the fundamental state model of CKB. It generalizes Bitcoin's UTXO model into programmable state cells. A cell contains four fields: `capacity`, `data`, `lock`, and `type`. Blockchain state changes occur when transactions consume existing cells and produce new output cells.

### Capacity
Capacity represents the amount of CKBytes held by a cell ($1 \text{ CKB} = 1 \text{ Byte} = 10^8 \text{ Shannons}$). A cell must hold sufficient capacity to cover the byte size of its scripts and data.

> [!IMPORTANT]
> A single Cell requires at least 61 bytes of storage, equivalent to [61 CKBytes (CKB)](https://docs.nervos.org/docs/tech-explanation/capacity#capacity-mini). Allocating 62 CKB is recommended to cover additional fees in practice.

### Transaction
A transaction consumes existing input cells and creates new output cells, representing an atomic state transition on the CKB blockchain.

### Input / Output
Inputs reference live cells (outpoints) that will be consumed and destroyed by a transaction. Outputs define the newly created live cells with specified capacity, lock scripts, type scripts, and data.

### Lock Script
A Lock Script defines the conditions required to unlock and consume a cell. It is commonly used to enforce ownership, authentication, and authorization (such as secp256k1 signature verification).

### Type Script
A Type Script is an optional script executed during transaction validation to enforce customized business rules and state transitions (e.g., token minting constraints, supply caps).

### Data
The `data` field stores application-specific state or binary content (e.g., UDT token balance, stored messages, or complete on-chain NFT/DOB media files).

### RPC
The RPC interface provides standard JSON-RPC endpoints for applications and development tools to query blockchain state, fetch live cells, and broadcast transactions to nodes.

---

## 5. Exercise 00 - Getting Started

### Objective
Install the required tooling, launch a local CKB Devnet node, and inspect local test accounts.

### Procedure
- Installed the OffCKB CLI globally:
  ```bash
  npm install -g @offckb/cli
  ```
- Started the local CKB node:
  ```bash
  offckb node
  ```
- Verified the Devnet node status and listed pre-funded development accounts:
  ```bash
  offckb accounts
  ```

### Result
- Local Devnet RPC initialized at `http://127.0.0.1:8114`.
- Devnet RPC Proxy running at `http://127.0.0.1:28114`.
- 20 pre-funded development accounts (each holding 42,000,000 CKB) became available for local testing.

### What I Learned
I learned how to configure OffCKB, run an isolated local CKB node for rapid iteration, and inspect pre-allocated accounts for testing without needing public faucet tokens.

### Evidence
See [`1_setup/setup.md`](./1_setup/setup.md).

---

## 6. Exercise 01 - Transfer CKB

### Objective
Understand transaction mechanics and transfer CKB between development accounts on the local CKB Devnet using both the CLI and a frontend dApp.

### Environment
- **Network:** Local CKB Devnet (`http://127.0.0.1:28114`)
- **Sender:** Devnet Account #0
- **Receiver:** Devnet Account #19

### Procedure
1. **CLI Transfer:** Executed a transfer from Account #0 to Account #19 using `offckb transfer --privkey`.
2. **Simple Transfer dApp:** Launched the frontend dApp (`http://localhost:1234`), connected to the Devnet proxy, and executed a 62 CKB transfer.

### Result
- Giao dịch chuyển tiền được xác nhận thành công trên Devnet.
- Số dư và thay đổi dung lượng (Change Cell) được cập nhật chính xác.

### What I Learned
I learned how transactions consume whole input cells and produce new output cells, including change cells returned to the sender. I also saw in practice why transferring CKB requires at least 61 bytes of capacity per output cell (recommended 62 CKB to cover fees).

### Evidence
See [`2_TransferCKB/Transfer.md`](./2_TransferCKB/Transfer.md).

---

## 7. Exercise 02 - Store Data on Cell

### Objective
Demonstrate how arbitrary application data is written into and read back from a CKB cell's `data` field.

### Procedure
- Ran the "Store Data on Cell" dApp locally at `http://localhost:1234`.
- Connected to `devnet · http://127.0.0.1:28114`.
- Wrote a message string into a cell using Account #0.
- Read back the stored string directly from the on-chain cell data.

### Result
- Transaction submitted and committed to Devnet.
- The stored message was verified and decoded accurately from the cell's `data` field.

### What I Learned
I learned how CKB allows developers to store arbitrary data directly on-chain within cell capacity, eliminating the need for external IPFS or centralized storage for small state payloads.

### Evidence
See [`3_Store_Data_On_Cell/Store_Data_On_Cell.md`](./3_Store_Data_On_Cell/Store_Data_On_Cell.md).

---

## 8. Exercise 03 - Create Fungible Token (xUDT)

### Objective
Issue a custom fungible token (xUDT) on the local Devnet, query token holdings, and transfer tokens to another address.

### Procedure
- Ran the xUDT frontend dApp at `http://localhost:1234`.
- Minted custom tokens with a specified amount using Devnet Account #0.
- Queried live cells by Type Script args to confirm token balance.
- Transferred tokens to a recipient address.

### Result
- The token issue transaction was committed on-chain.
- The unique token identifier (`Type Script args`) was verified.
- The token transfer succeeded and updated recipient token cell balance.

### What I Learned
I learned how the xUDT standard models fungible tokens on CKB using Type Scripts, how script args define the unique token asset, and how token balances are stored in the first 16 bytes (LE uint128) of cell data.

### Evidence
See [`4_Create_a_Fungible_Token/Create_a_Fungible_Token.md`](./4_Create_a_Fungible_Token/Create_a_Fungible_Token.md).

---

## 9. Exercise 04 - Create DOB (Spore Protocol)

### Objective
Create a Digital Object (DOB) by embedding media data directly into a CKB cell using the Spore protocol.

### Procedure
- Ran the Create DOB dApp configured for local Devnet.
- Uploaded an image asset into the dApp.
- Constructed and broadcast the Spore minting transaction.
- Verified on-chain render via the "Check Spore Content" function.

### Result
- The DOB creation transaction committed successfully.
- The on-chain image rendered directly from the cell data.

### What I Learned
I learned how the Spore protocol implements true on-chain digital ownership without external hosting dependencies, and how capacity scales directly with asset file size.

### Evidence
See [`5_Create_DBO/Create_DBO.md`](./5_Create_DBO/Create_DBO.md).

---

## 10. Exercise 05 - Simple Lock

### Objective
Build, deploy, and interact with a custom hash-lock smart contract script on CKB Devnet.

### Procedure
- Built the hash-lock contract script:
  ```bash
  pnpm run deploy -- --network devnet
  ```
- Deployed the compiled script binary to Devnet.
- Ran the Next.js frontend at `http://localhost:3000`.
- Generated a hash-lock address with the preimage `Hello World`.
- Deposited CKB to the lock address.
- Successfully spent and unlocked the cell by revealing the correct preimage `Hello World`.

### Result
- Contract successfully deployed (`DEVNET · READY`).
- Deposit confirmed to the hash-lock cell.
- Preimage reveal transaction committed and capacity unlocked.

### What I Learned
I learned how CKB executes custom Lock Scripts on the CKB-VM, how preimage verification functions via script args and witnesses, and the lifecycle of contract compilation, deployment, and execution.

### Evidence
See [`6_Build_Simple_Lock/Build_Simple_Lock.md`](./6_Build_Simple_Lock/Build_Simple_Lock.md).

---

## 11. Week 1 Development Log

| Date | Activity | Result | Evidence |
|---|---|---|---|
| Oct 2026 | OffCKB CLI installation and local Devnet node setup | Completed | [Exercise 00 evidence](./1_setup/setup.md) |
| Oct 2026 | Transfer CKB via CLI and Simple Transfer dApp | Completed | [Exercise 01 evidence](./2_TransferCKB/Transfer.md) |
| Oct 2026 | Write and read message data on-chain | Completed | [Exercise 02 evidence](./3_Store_Data_On_Cell/Store_Data_On_Cell.md) |
| Oct 2026 | Issue, view, and transfer custom xUDT fungible token | Completed | [Exercise 03 evidence](./4_Create_a_Fungible_Token/Create_a_Fungible_Token.md) |
| Oct 2026 | Mint Spore Digital Object (DOB) with on-chain media | Completed | [Exercise 04 evidence](./5_Create_DBO/Create_DBO.md) |
| Oct 2026 | Build, deploy, deposit, and unlock Simple Hash Lock contract | Completed | [Exercise 05 evidence](./6_Build_Simple_Lock/Build_Simple_Lock.md) |

---

## 12. Challenges & Solutions

- **Windows Build Script Compatibility:** Build scripts invoking relative Unix paths like `./node_modules/.bin/esbuild` fail on Windows `cmd.exe`. Solved by standardizing path resolution with Node.js `path.join`.
- **ESM Entry-Point Path Checking:** On Windows, `process.argv[1]` uses backslashes (`\`) while `import.meta.url` uses file URIs (`file:///...`). Resolved by converting paths using Node's `url.pathToFileURL()`.
- **Minimal Capacity Calculation:** Transactions transferring small amounts failed with capacity errors. Understood and applied the minimal 61 CKB (recommended 62 CKB) capacity rule for secp256k1 cells.
- **Network Environment Alignment:** Mismatch between Devnet private keys and public Testnet RPC configs caused "Not enough capacity" errors. Ensured all dApp configurations explicitly point to `http://127.0.0.1:28114`.

---

## 13. Final Reflection

Week 1 provided an intensive, practical foundation in Nervos CKB development. By building and testing transactions across all 6 core modules, I gained a comprehensive understanding of the Cell Model, on-chain state storage, tokenization, digital objects, and CKB-VM script execution.

---

## 14. Week 2 Goals - Building Applications on CKB

1. **Application Development with CCC (Common Chain Connector):**
   - Deep dive into CCC API and transaction builder.
   - Build TypeScript application flows interacting with wallets and cells.
2. **Introduction to Rust and CKB Scripts:**
   - Set up the Rust development environment for CKB contracts.
   - Explore the CKB Rust SDK and write custom verification scripts.
3. **Developer Tooling:**
   - Master CKB Debugger, CKB-CLI, and Testnet Faucet workflows.

---

## 15. Official References & Learning Resources

- [Nervos Developer Training - Lab Exercise Setup](https://nervos.gitbook.io/developer-training-course/lab-exercise-setup)
- [CKB Documentation - Transfer CKB](https://docs.nervos.org/docs/dapp/transfer-ckb)
- [CKB Documentation - Store Data on Cell](https://docs.nervos.org/docs/dapp/store-data-on-cell)
- [CKB Documentation - Create DOB](https://docs.nervos.org/docs/dapp/create-dob)
- [CKB Documentation - Build Simple Lock](https://docs.nervos.org/docs/dapp/simple-lock)
- [CKB Academy Courses](https://academy.ckb.dev/courses)
- [CKB Tech Explanation - Minimum Capacity](https://docs.nervos.org/docs/tech-explanation/capacity#capacity-mini)

