# Week 4 - Fiber Network Installation & Setup

Reference: [Run a Native Node](https://www.fiber.world/docs/quick-start/run-a-node/rust)

## 1. Installation method

Precompiled native release **Fiber v0.9.1 (windows-x86_64)** installed into `$HOME\.fiber`.

```powershell
$env:INSTALL_REF = "v0.9.1"
$env:FNN_VERSION = "0.9.1"
$env:NETWORK     = "testnet"
$env:INSTALL_DIR = "$HOME\.fiber"
irm https://raw.githubusercontent.com/nervosnetwork/fiber/v0.9.1/tools/install/install.ps1 | iex
```

Evidence: [`0_install_fiber.png`](./evidence/0_install_fiber.png)

## 2. Configuration (testnet)

- Fiber chain: `testnet`
- CKB RPC: `https://testnet.ckbapp.dev/`
- Bootnodes (pre-configured):
  - `/ip4/54.179.226.154/tcp/8228/p2p/Qmes1EBD4yNo9Ywkfe6eRw9tG1nVNGLDmMud1xJMsoYFKy`
  - `/ip4/16.163.7.105/tcp/8228/p2p/QmdyQWjPtbK4NWWsvy8s69NGJaQULwgeQDT5ZpNDrTNaeV`
- On-chain scripts: FundingLock / CommitmentLock deployed on testnet, RUSD UDT whitelist.

## 3. Two-node topology

| | Node 1 (HOANGANH) | Node 2 (DANGHIEN) |
|---|---|---|
| Node Name | `HOANGANH` | `DANGHIEN` |
| Base dir | `C:\Users\Admin\.fiber` | `Week04\node2` |
| P2P | `0.0.0.0:8228` | `0.0.0.0:8229` |
| RPC | `127.0.0.1:8227` | `127.0.0.1:8226` |
| Peer ID | `QmYznmFUWeD3WCLWabDTXqg8899K33GVFLFrBNv8VGoYgA` | `QmSP1rSCgXEheN9qR2DZfw1MeCKVH2kk4tdnyvBpXm27YJ` |
| Pubkey | `029c70dc08fdd316b0b50780304a872038d517147e8291b1c6884ac77ec4c7ace5` | `0201963d5bfbc9c012614d2bb297b53e3fa00cb168c4c435a45d4c0b4db98032bc` |
| Funding lock_arg | `0x49bbb1e74d121ccde0cc693c0d278b508c34fd5e` | `0xc964d3c8ecdfea9f7d76622a651afef101e8b715` |
| Testnet address | `ckt1qzda0cr08m85hc8jlnfp3zer7xulejywt49kt2rr0vthywaa50xwsq2fhwc7wngjrnx7pnrf8sxj0z6s3s606hs2mktys` | `ckt1qzda0cr08m85hc8jlnfp3zer7xulejywt49kt2rr0vthywaa50xwsqwfvnfu3mxla20h6anz9fj34lh3q85tw9gwq5zqs` |

`Week04\node2\ckb\key` and the node database are git-ignored (see `Week04/.gitignore`).

## 4. Running the nodes

Node 1 (HOANGANH):
```powershell
cd $HOME\.fiber
.\start-node.ps1
```

Node 2 (DANGHIEN):
```powershell
cd D:\CKBuilders\Week04
$env:FIBER_SECRET_KEY_PASSWORD = "fiber-password-2026"
$env:RUST_LOG = "info"
& "$HOME\.fiber\fnn.exe" -c node2\config.yml -d node2
```

Query:
```powershell
cd $HOME\.fiber
.\fnn-cli.exe info
.\fnn-cli.exe -u http://127.0.0.1:8226 info
```

## 5. Channel lifecycle commands used

```powershell
.\fnn-cli.exe -u http://127.0.0.1:8226 peer connect_peer --address /ip4/127.0.0.1/tcp/8228/p2p/QmYznmFUWeD3WCLWabDTXqg8899K33GVFLFrBNv8VGoYgA

.\fnn-cli.exe channel open_channel --pubkey 0201963d5bfbc9c012614d2bb297b53e3fa00cb168c4c435a45d4c0b4db98032bc --funding-amount 40000000000

.\fnn-cli.exe -u http://127.0.0.1:8226 invoice new_invoice --amount 100000000 --currency Fibt --description "Week04 1 CKB payment"

.\fnn-cli.exe payment send_payment --invoice <invoice_address>
.\fnn-cli.exe payment get_payment --payment-hash <payment_hash>

.\fnn-cli.exe -u http://127.0.0.1:8226 invoice get_invoice --payment-hash <payment_hash>
.\fnn-cli.exe channel list_channels
```
