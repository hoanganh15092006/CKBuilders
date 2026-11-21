# Week 4 - Environment Assessment

| Item | Value |
|---|---|
| OS | Windows 10/11 (x86_64) |
| Shell | PowerShell |
| Node.js | v22.20.0 |
| ckb-cli | 1.12.0 (commit `278c7be 2024-09-20`) |
| Fiber (fnn / fnn-cli) | **0.9.1** (commit `9a561b3 2026-09-10`) |
| Network | CKB **testnet** (`chain_hash 0x10639e0895502b5688a6be8cf69460d76541bfa4821629d86d62ba0aae3f9606`) |
| CKB RPC | `https://testnet.ckbapp.dev/` (public node, no local CKB node needed) |

## Notes

- Fiber runs directly against the **public CKB Testnet** (`https://testnet.ckbapp.dev/`), so a local OffCKB devnet node is not required.
- Both Fiber binaries (`fnn.exe`, `fnn-cli.exe`) and `ckb-cli.exe` were installed into `$HOME\.fiber` (see [setup.md](./setup.md)).
