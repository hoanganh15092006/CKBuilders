import { useState, useMemo, useEffect } from "react";
import { ccc } from "@ckb-ccc/connector-react";
import { getUdt, mintUdt, transferUdt, fetchUdtMetadata, UdtMetadata } from "./udt.ts";
import "./App.css";

function UdtTokensView() {
  const { wallet, open, disconnect } = ccc.useCcc();
  const signer = ccc.useSigner();

  const [address, setAddress] = useState("");
  const [balance, setBalance] = useState(0n);
  const [activeTab, setActiveTab] = useState<"mint" | "transfer" | "inspect">("mint");
  const [tokenArgs, setTokenArgs] = useState("");
  const [receiver, setReceiver] = useState("");
  const [amount, setAmount] = useState("100");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<UdtMetadata | null>(null);

  useEffect(() => {
    if (!signer) {
      setAddress("");
      setBalance(0n);
      setTokenArgs("");
      return;
    }

    Promise.all([
      signer.getRecommendedAddress().catch(() => ""),
      signer.getBalance().catch(() => 0n),
    ]).then(([addr, bal]) => {
      setAddress(addr);
      setBalance(bal);
      if (addr) {
        setReceiver(addr);
        ccc.Address.fromString(addr, signer.client)
          .then((a) => {
            setTokenArgs(a.script.hash());
          })
          .catch(() => {});
      }
    });
  }, [signer]);

  const fillMyLockHash = async () => {
    if (!signer || !address) return;
    try {
      const a = await ccc.Address.fromString(address, signer.client);
      setTokenArgs(a.script.hash());
      setError(null);
    } catch (err: unknown) {
      console.error(err);
    }
  };

  const handleAction = async () => {
    if (!signer) {
      setError("Please connect a wallet first.");
      return;
    }

    const cleanArgs = tokenArgs.trim();
    if (!cleanArgs) {
      setError("Token Args (issuer lock hash) is required.");
      return;
    }

    if (!cleanArgs.startsWith("0x") || cleanArgs.length < 66) {
      setError("Token Args must be a valid 32-byte hash (66 characters starting with 0x). Click 'Set My Lock Hash' to use your wallet's lock hash.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setTxHash(null);

      const udt = await getUdt(signer, cleanArgs);

      if (activeTab === "mint") {
        if (!receiver.trim()) throw new Error("Recipient address is required.");
        const hash = await mintUdt(signer, udt, receiver.trim(), amount);
        setTxHash(hash);
      } else if (activeTab === "transfer") {
        if (!receiver.trim()) throw new Error("Recipient address is required.");
        const hash = await transferUdt(signer, udt, receiver.trim(), amount);
        setTxHash(hash);
      } else if (activeTab === "inspect") {
        const meta = await fetchUdtMetadata(udt);
        setMetadata(meta);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(String(err));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <div className="header">
          <div>
            <h1>CKB User Defined Tokens (UDT / xUDT)</h1>
            <p className="subtitle">
              Issue, transfer, and inspect fungible tokens on Nervos CKB using CCC SDK
            </p>
          </div>
          <span className="badge">TESTNET (CKT)</span>
        </div>

        <div className="wallet-section">
          {!wallet ? (
            <button className="btn btn-primary" onClick={open}>
              Connect Wallet
            </button>
          ) : (
            <div className="wallet-info">
              <div className="wallet-row">
                <div className="wallet-name">
                  <span className="dot"></span>
                  <strong>{wallet.name}</strong>
                </div>
                <button className="btn btn-disconnect" onClick={disconnect}>
                  Disconnect
                </button>
              </div>
              {address && (
                <div className="address-display">
                  <span className="address-label">Address:</span>
                  <code>{address}</code>
                </div>
              )}
              <div className="balance-display">
                <span>Capacity:</span>
                <strong>{ccc.fixedPointToString(balance)} CKB</strong>
              </div>
            </div>
          )}
        </div>

        <div className="tabs">
          <button
            className={`tab ${activeTab === "mint" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("mint");
              setError(null);
            }}
          >
            Mint UDT
          </button>
          <button
            className={`tab ${activeTab === "transfer" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("transfer");
              setError(null);
            }}
          >
            Transfer UDT
          </button>
          <button
            className={`tab ${activeTab === "inspect" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("inspect");
              setError(null);
            }}
          >
            Inspect Metadata
          </button>
        </div>

        <div className="form-group">
          <div className="label-row">
            <label htmlFor="tokenArgs">UDT TYPE SCRIPT ARGS (ISSUER LOCK HASH)</label>
            {address && (
              <button type="button" className="btn-link" onClick={fillMyLockHash}>
                Set My Lock Hash
              </button>
            )}
          </div>
          <input
            id="tokenArgs"
            type="text"
            value={tokenArgs}
            onChange={(e) => setTokenArgs(e.target.value)}
            placeholder="0x..."
          />
        </div>

        {activeTab !== "inspect" && (
          <>
            <div className="form-group">
              <label htmlFor="receiver">RECIPIENT ADDRESS</label>
              <input
                id="receiver"
                type="text"
                value={receiver}
                onChange={(e) => setReceiver(e.target.value)}
                placeholder="ckt1q..."
              />
            </div>

            <div className="form-group">
              <label htmlFor="amount">TOKEN AMOUNT</label>
              <input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="1"
              />
            </div>
          </>
        )}

        <button
          className="btn btn-primary btn-block"
          onClick={handleAction}
          disabled={!signer || loading}
        >
          {loading
            ? "Processing..."
            : activeTab === "mint"
            ? "Mint Tokens (Owner Mode)"
            : activeTab === "transfer"
            ? "Transfer Tokens"
            : "Fetch On-Chain Metadata"}
        </button>

        {error && <div className="alert alert-error">{error}</div>}

        {txHash && (
          <div className="alert alert-success">
            <div>
              <strong>Transaction Broadcasted Successfully!</strong>
            </div>
            <div className="hash-display">
              <code>{txHash}</code>
            </div>
            <a
              href={`https://pudge.explorer.nervos.org/transaction/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="explorer-link"
            >
              View on CKB Testnet Explorer →
            </a>
          </div>
        )}

        {metadata && activeTab === "inspect" && (
          <div className="metadata-card">
            <h3>SSRI Token Metadata</h3>
            <div className="meta-row">
              <span>Name:</span> <strong>{metadata.name ?? "N/A (Legacy xUDT)"}</strong>
            </div>
            <div className="meta-row">
              <span>Symbol:</span> <strong>{metadata.symbol ?? "N/A"}</strong>
            </div>
            <div className="meta-row">
              <span>Decimals:</span> <strong>{metadata.decimals ?? "N/A"}</strong>
            </div>
            {metadata.icon && (
              <div className="meta-row">
                <span>Icon URI:</span> <code>{metadata.icon}</code>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const testnetClient = useMemo(() => new ccc.ClientPublicTestnet(), []);
  const mainnetClient = useMemo(() => new ccc.ClientPublicMainnet(), []);

  return (
    <ccc.Provider
      name="CKB UDT Tokens Demo"
      defaultClient={testnetClient}
      clientOptions={[
        {
          name: "CKB Testnet",
          client: testnetClient,
        },
        {
          name: "CKB Mainnet",
          client: mainnetClient,
        },
      ]}
    >
      <UdtTokensView />
    </ccc.Provider>
  );
}
