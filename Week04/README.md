# CKB Weekly Report - Week 4

**Reporting period:** November 2026  
**Participant:** Nguyen Hoang Anh  
**Repository:** [https://github.com/hoanganh15092006/CKBuilders/tree/main/Week04](https://github.com/hoanganh15092006/CKBuilders/tree/main/Week04)

## 1. Week 4 Overview

This week I looked at payment channels on CKB with Fiber Network. I installed Fiber v0.9.1 on Windows, ran two local nodes (**HOANGANH** and **DANGHIEN**) on CKB testnet, connected them, opened a 400 CKB channel between them and sent a 1 CKB payment through it.

## 2. Environment

Details are in [environment.md](./environment.md) and [setup.md](./setup.md).

- Fiber (fnn / fnn-cli): v0.9.1, testnet
- CKB RPC: `https://testnet.ckbapp.dev/`
- Node 1 (**HOANGANH**): P2P 8228, RPC 8227
  - Testnet Address: `ckt1qzda0cr08m85hc8jlnfp3zer7xulejywt49kt2rr0vthywaa50xwsq2fhwc7wngjrnx7pnrf8sxj0z6s3s606hs2mktys`
  - Pubkey: `029c70dc08fdd316b0b50780304a872038d517147e8291b1c6884ac77ec4c7ace5`
  - Peer ID: `QmYznmFUWeD3WCLWabDTXqg8899K33GVFLFrBNv8VGoYgA`
- Node 2 (**DANGHIEN**): P2P 8229, RPC 8226
  - Testnet Address: `ckt1qzda0cr08m85hc8jlnfp3zer7xulejywt49kt2rr0vthywaa50xwsqwfvnfu3mxla20h6anz9fj34lh3q85tw9gwq5zqs`
  - Pubkey: `0201963d5bfbc9c012614d2bb297b53e3fa00cb168c4c435a45d4c0b4db98032bc`
  - Peer ID: `QmSP1rSCgXEheN9qR2DZfw1MeCKVH2kk4tdnyvBpXm27YJ`

## 3. Evidence

| ID | Step | Screenshot |
|---|---|---|
| 00 | Install Fiber with the official installer | [`0_install_fiber.png`](./evidence/0_install_fiber.png) |
| 01 | Both nodes (`HOANGANH` & `DANGHIEN`) running | [`1_node_running.png`](./evidence/1_node_running.png) |
| 02 | Node 2 (`DANGHIEN`) connects to Node 1 (`HOANGANH`) | [`2_connect_peer.png`](./evidence/2_connect_peer.png) |
| 03 | `HOANGANH` opens a 400 CKB channel to `DANGHIEN` | [`3_open_channel.png`](./evidence/3_open_channel.png) |
| 04 | Funding transaction committed on testnet | [`4_funding_tx_committed.png`](./evidence/4_funding_tx_committed.png) |
| 05 | Channel is `ChannelReady` (`HOANGANH` 301 / `DANGHIEN` 0 CKB) | [`5_channel_ready.png`](./evidence/5_channel_ready.png) |
| 06 | `DANGHIEN` creates a 1 CKB invoice | [`6_create_invoice.png`](./evidence/6_create_invoice.png) |
| 07 | `HOANGANH` pays the invoice, status `Success` | [`7_send_payment_success.png`](./evidence/7_send_payment_success.png) |
| 08 | Invoice is `Paid` on `DANGHIEN`'s node | [`8_invoice_paid.png`](./evidence/8_invoice_paid.png) |
| 09 | Channel balance after payment (`HOANGANH` 300 / `DANGHIEN` 1 CKB) | [`9_balance_after_payment.png`](./evidence/9_balance_after_payment.png) |

## 4. Result

| | Before payment | After payment |
|---|---|---|
| **HOANGANH** (Node 1) | 301 CKB | 300 CKB |
| **DANGHIEN** (Node 2) | 0 CKB | 1 CKB |

- Channel ID: `0x71d29f5a716543f5ede2e9b2e11badaaa2e0888c45f7442da3acb27f55198000`
- Funding tx: `0xfbc64010a10713410e9d3a10a4a7e584f5ad2d46fc93d2757165771b4301a6be` (testnet block `23117904`, committed)
- Payment hash: `0xf41e3557cd7174abc2b0dfc42b35d94ae05fae3d637a4278ec74c9333df2e5de`, fee `0`
- Payment preimage: `0xbf509e0febf64b0653c5f6186de17df1a6b7cd9c4c1a8274062584d78a3acd60`

## 5. What I learned

- Being connected as peers is not enough to pay. The channel has to be funded on-chain, reach `ChannelReady`, and the sender needs balance on their side.
- Order of steps: connect peer, open channel, wait for the funding tx, `ChannelReady`, create invoice, pay, balances change.
- Only the funding transaction went to CKB L1. The 1 CKB payment was settled between `HOANGANH` and `DANGHIEN` inside the channel, with no on-chain transaction.
- An invoice holds the payment hash and amount. `DANGHIEN`'s node marks it `Paid` after the payment completes.
