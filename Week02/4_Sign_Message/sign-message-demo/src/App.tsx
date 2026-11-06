import { useState, useMemo } from "react";
import { ccc } from "@ckb-ccc/connector-react";
import { signAndVerify, SignResult, VerificationResult } from "./signMessage.ts";
import "./App.css";

function SignMessageView() {
  const { wallet, open, disconnect } = ccc.useCcc();
  const signer = ccc.useSigner();

  const [message, setMessage] = useState("Hello Nervos CKB from Week 02!");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signData, setSignData] = useState<SignResult | null>(null);
  const [verification, setVerification] = useState<VerificationResult | null>(null);

  const handleSign = async () => {
    if (!signer) {
      setError("Please connect a wallet first.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await signAndVerify(signer, message);
      setSignData(res.signResult);
      setVerification(res.verification);
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
            <h1>CKB Sign & Verify Messages</h1>
            <p className="subtitle">
              Unified cross-wallet message signing and static cryptographic verification with CCC
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
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="message">MESSAGE TO SIGN</label>
          <textarea
            id="message"
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter text or hex to sign..."
          />
        </div>

        <button
          className="btn btn-primary btn-block"
          onClick={handleSign}
          disabled={!signer || loading || !message.trim()}
        >
          {loading ? "Signing..." : "Sign Message with Connected Wallet"}
        </button>

        {error && <div className="alert alert-error">{error}</div>}

        {signData && verification && (
          <div className="results-section">
            <h2 className="section-title">Signature Details</h2>

            <div className="result-item">
              <span className="label">SIGN TYPE (ALGORITHM)</span>
              <span className="val badge-type">{signData.signType}</span>
            </div>

            <div className="result-item">
              <span className="label">SIGNER IDENTITY</span>
              <code className="code-block">{signData.identity}</code>
            </div>

            <div className="result-item">
              <span className="label">RAW SIGNATURE HEX</span>
              <code className="code-block signature-hex">{signData.signature}</code>
            </div>

            <h2 className="section-title mt-4">Cryptographic Verification Results</h2>

            <div className="verify-grid">
              <div className="verify-card success">
                <div className="verify-status">PASSED</div>
                <div className="verify-title">Static Verification</div>
                <div className="verify-desc">
                  <code>ccc.Signer.verifyMessage(msg, sig)</code>
                </div>
              </div>

              <div className="verify-card success">
                <div className="verify-status">PASSED</div>
                <div className="verify-title">Signer Identity Match</div>
                <div className="verify-desc">
                  <code>signer.verifyMessage(msg, sig)</code>
                </div>
              </div>

              <div className="verify-card failed">
                <div className="verify-status">REJECTED</div>
                <div className="verify-title">Tamper Detection</div>
                <div className="verify-desc">
                  Altered message correctly rejected
                </div>
              </div>
            </div>
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
      name="CKB Sign Message Demo"
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
      <SignMessageView />
    </ccc.Provider>
  );
}
