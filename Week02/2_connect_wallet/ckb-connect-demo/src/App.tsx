import { useEffect, useState, useMemo } from "react";
import { ccc } from "@ckb-ccc/connector-react";
import "./App.css";

function WalletConnect() {
  const { open, disconnect, signerInfo, wallet, client } = ccc.useCcc();
  const signer = ccc.useSigner();

  const [address, setAddress] = useState<string>("");
  const [balance, setBalance] = useState<bigint>(0n);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [messageToSign, setMessageToSign] = useState<string>("Hello Nervos CKB");
  const [signature, setSignature] = useState<string>("");
  const [isSigning, setIsSigning] = useState<boolean>(false);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  useEffect(() => {
    if (!signer) {
      setAddress("");
      setBalance(0n);
      setSignature("");
      return;
    }

    setIsLoading(true);
    Promise.all([
      signer.getRecommendedAddress().catch(() => ""),
      signer.getBalance().catch(() => 0n),
    ])
      .then(([addr, bal]) => {
        setAddress(addr);
        setBalance(bal);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [signer]);

  const handleCopy = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleSignMessage = async () => {
    if (!signer || !messageToSign.trim()) return;
    setIsSigning(true);
    setSignature("");
    try {
      const sig = await signer.signMessage(messageToSign);
      setSignature(typeof sig === "string" ? sig : JSON.stringify(sig));
    } catch (err: unknown) {
      const errObj = err as Error;
      setSignature(`Error: ${errObj.message || "Signing failed"}`);
    } finally {
      setIsSigning(false);
    }
  };

  const hasEthereum = typeof window !== "undefined" && Boolean((window as unknown as { ethereum?: unknown }).ethereum);
  const hasOkx = typeof window !== "undefined" && Boolean((window as unknown as { okxwallet?: unknown }).okxwallet);
  const hasUnisat = typeof window !== "undefined" && Boolean((window as unknown as { unisat?: unknown }).unisat);

  return (
    <div className="card-container">
      <div className="card-header">
        <div className="header-title-row">
          <h2>CKB Multi-Chain Wallet Connect</h2>
          <span className="badge network-badge">
            {client?.addressPrefix === "ckt" ? "Testnet (ckt)" : "Mainnet (ckb)"}
          </span>
        </div>
        <p className="subtitle">
          Connect browser extension wallets (MetaMask, OKX, UniSat, JoyID, UTXO Global, REI) to Nervos CKB via CCC.
        </p>
      </div>

      <div className="extensions-detected-bar">
        <span className="extensions-title">Detected Extensions:</span>
        <span className={`pill ${hasEthereum ? "pill-active" : "pill-muted"}`}>
          EVM / MetaMask: {hasEthereum ? "Detected" : "Not Found"}
        </span>
        <span className={`pill ${hasOkx ? "pill-active" : "pill-muted"}`}>
          OKX Wallet: {hasOkx ? "Detected" : "Not Found"}
        </span>
        <span className={`pill ${hasUnisat ? "pill-active" : "pill-muted"}`}>
          UniSat: {hasUnisat ? "Detected" : "Not Found"}
        </span>
      </div>

      {!signerInfo ? (
        <div className="connect-prompt-box">
          <p className="prompt-text">
            No wallet connected. Open the modal to connect your browser extension or Passkey.
          </p>
          <button className="btn btn-primary" onClick={open}>
            Connect Wallet
          </button>
        </div>
      ) : (
        <div className="connected-box">
          <div className="connected-header">
            <div className="wallet-identity">
              {wallet?.icon && (
                <img src={wallet.icon} alt={wallet.name} className="wallet-icon" />
              )}
              <div>
                <span className="wallet-name">{wallet?.name ?? "Connected Wallet"}</span>
                <span className="signer-type">{signerInfo.name}</span>
              </div>
            </div>
            <button className="btn btn-danger" onClick={disconnect}>
              Disconnect
            </button>
          </div>

          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">CKB Recommended Address</span>
              <div className="address-row">
                <span className="address-value font-mono">
                  {isLoading ? "Fetching address..." : address || "None"}
                </span>
                {address && (
                  <button className="btn-copy" onClick={handleCopy}>
                    {copySuccess ? "Copied" : "Copy"}
                  </button>
                )}
              </div>
            </div>

            <div className="info-item">
              <span className="info-label">Account Balance</span>
              <span className="balance-value font-mono">
                {isLoading ? "Fetching balance..." : `${ccc.fixedPointToString(balance)} CKB`}
              </span>
            </div>
          </div>

          <div className="signing-panel">
            <span className="info-label">Verify Extension Signature</span>
            <div className="sign-input-row">
              <input
                type="text"
                className="input-text font-mono"
                value={messageToSign}
                onChange={(e) => setMessageToSign(e.target.value)}
                placeholder="Message to sign"
              />
              <button
                className="btn btn-secondary"
                disabled={isSigning || !messageToSign.trim()}
                onClick={handleSignMessage}
              >
                {isSigning ? "Signing in Extension..." : "Sign Message"}
              </button>
            </div>

            {signature && (
              <div className="signature-result font-mono">
                <span className="signature-label">Signature Output:</span>
                <p className="signature-text">{signature}</p>
              </div>
            )}
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
      name="CKB Wallet Connect Demo"
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
      <main className="main-wrapper">
        <WalletConnect />
      </main>
    </ccc.Provider>
  );
}
