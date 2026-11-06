import { useEffect, useState, useMemo } from "react";
import { ccc } from "@ckb-ccc/connector-react";
import { transferCkb, sweepAllCkb } from "./transactions.ts";
import "./App.css";

function ComposeTransactionsView() {
  const { open, disconnect, signerInfo, wallet, client } = ccc.useCcc();
  const signer = ccc.useSigner();

  const [address, setAddress] = useState<string>("");
  const [balance, setBalance] = useState<bigint>(0n);
  const [receiverAddress, setReceiverAddress] = useState<string>("");
  const [amountCkb, setAmountCkb] = useState<string>("62");
  const [feeRate, setFeeRate] = useState<string>("1000");
  const [txMode, setTxMode] = useState<"transfer" | "sweep">("transfer");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [txHash, setTxHash] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    if (!signer) {
      setAddress("");
      setBalance(0n);
      return;
    }

    Promise.all([
      signer.getRecommendedAddress().catch(() => ""),
      signer.getBalance().catch(() => 0n),
    ]).then(([addr, bal]) => {
      setAddress(addr);
      setBalance(bal);
    });
  }, [signer]);

  const handleExecute = async () => {
    if (!signer) return;
    setErrorMessage("");
    setTxHash("");

    if (!receiverAddress.trim()) {
      setErrorMessage("Please enter a valid recipient CKB address.");
      return;
    }

    const parsedFee = feeRate.trim() ? parseInt(feeRate.trim(), 10) : undefined;
    setIsProcessing(true);

    try {
      let hash = "";
      if (txMode === "transfer") {
        const parsedAmount = parseFloat(amountCkb);
        if (isNaN(parsedAmount) || parsedAmount < 61) {
          throw new Error("Minimum capacity for a CKB cell is 61 CKB (62 CKB recommended to cover fees).");
        }
        hash = await transferCkb(signer, receiverAddress.trim(), amountCkb.trim(), parsedFee);
      } else {
        hash = await sweepAllCkb(signer, receiverAddress.trim(), parsedFee);
      }

      setTxHash(hash);
      const newBal = await signer.getBalance().catch(() => 0n);
      setBalance(newBal);
    } catch (err: unknown) {
      const errObj = err as Error;
      setErrorMessage(errObj.message || "Transaction composition failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="compose-container">
      <div className="compose-header">
        <div className="title-row">
          <h2>CCC Compose Transactions</h2>
          <span className="network-pill">
            {client?.addressPrefix === "ckt" ? "Testnet (ckt)" : "Mainnet (ckb)"}
          </span>
        </div>
        <p className="description">
          Demonstrating automatic input selection, capacity checks, and fee calculation via declare → fill → fee → send.
        </p>
      </div>

      {!signerInfo ? (
        <div className="connect-card">
          <p>Connect your wallet to compose and broadcast CKB transactions.</p>
          <button className="btn btn-primary" onClick={open}>
            Connect Wallet
          </button>
        </div>
      ) : (
        <div className="dashboard-content">
          <div className="wallet-bar">
            <div className="wallet-details">
              {wallet?.icon && <img src={wallet.icon} alt="" className="wallet-avatar" />}
              <div>
                <span className="wallet-name-label">{wallet?.name ?? "Wallet"}</span>
                <span className="address-display font-mono">{address}</span>
              </div>
            </div>
            <div className="wallet-right">
              <span className="balance-badge font-mono">
                {ccc.fixedPointToString(balance)} CKB
              </span>
              <button className="btn btn-disconnect" onClick={disconnect}>
                Disconnect
              </button>
            </div>
          </div>

          <div className="mode-toggle">
            <button
              className={`mode-btn ${txMode === "transfer" ? "mode-btn-active" : ""}`}
              onClick={() => setTxMode("transfer")}
            >
              Transfer CKB
            </button>
            <button
              className={`mode-btn ${txMode === "sweep" ? "mode-btn-active" : ""}`}
              onClick={() => setTxMode("sweep")}
            >
              Transfer All CKB (Sweep)
            </button>
          </div>

          <div className="form-card">
            <div className="form-group">
              <label>Recipient Address (lock script target)</label>
              <input
                type="text"
                className="input-field font-mono"
                placeholder="ckt1qzda0cr08m85hc8jlnfp3zer7xulejywt49kt2rr0vthywaa50xwsq..."
                value={receiverAddress}
                onChange={(e) => setReceiverAddress(e.target.value)}
              />
            </div>

            {txMode === "transfer" && (
              <div className="form-group">
                <label>Amount (CKB) — minimum 61 CKB</label>
                <div className="amount-input-row">
                  <input
                    type="number"
                    step="any"
                    min="61"
                    className="input-field font-mono"
                    placeholder="62"
                    value={amountCkb}
                    onChange={(e) => setAmountCkb(e.target.value)}
                  />
                  <div className="quick-buttons">
                    <button type="button" onClick={() => setAmountCkb("62")}>62 CKB</button>
                    <button type="button" onClick={() => setAmountCkb("100")}>100 CKB</button>
                    <button type="button" onClick={() => setAmountCkb("500")}>500 CKB</button>
                  </div>
                </div>
              </div>
            )}

            {txMode === "sweep" && (
              <div className="sweep-notice">
                <span>Sweep Mode:</span> Collects all live cells owned by the signer via <code>completeInputsAll</code> and deducts the fee from output 0 via <code>completeFeeChangeToOutput</code>.
              </div>
            )}

            <div className="form-group">
              <label>Fee Rate (shannon/kB)</label>
              <input
                type="number"
                className="input-field font-mono"
                placeholder="1000"
                value={feeRate}
                onChange={(e) => setFeeRate(e.target.value)}
              />
            </div>

            {errorMessage && (
              <div className="alert-box alert-error">
                {errorMessage}
              </div>
            )}

            {txHash && (
              <div className="alert-box alert-success font-mono">
                <p>Transaction Sent Successfully!</p>
                <p className="hash-string">Hash: {txHash}</p>
                <a
                  href={`https://pudge.explorer.nervos.org/transaction/${txHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="explorer-link"
                >
                  View on CKB Testnet Explorer
                </a>
              </div>
            )}

            <button
              className="btn btn-action"
              disabled={isProcessing}
              onClick={handleExecute}
            >
              {isProcessing
                ? "Composing & Broadcasting Transaction..."
                : txMode === "transfer"
                ? "Send CKB Transfer"
                : "Execute Wallet Sweep"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const testnetClient = useMemo(() => new ccc.ClientPublicTestnet(), []);
  const mainnetClient = useMemo(() => new ccc.ClientPublicMainnet(), []);

  return (
    <ccc.Provider
      name="CKB Compose Transactions"
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
      <main className="page-wrapper">
        <ComposeTransactionsView />
      </main>
    </ccc.Provider>
  );
}

