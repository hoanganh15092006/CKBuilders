import { useState, useMemo, useEffect, ChangeEvent } from "react";
import { ccc } from "@ckb-ccc/connector-react";
import {
  mintSporeDob,
  transferSporeDob,
  meltSporeDob,
  createCluster,
  listSpores,
  SporeItem,
} from "./sporeService.ts";
import "./App.css";

function SporeProtocolView() {
  const { wallet, open, disconnect } = ccc.useCcc();
  const signer = ccc.useSigner();

  const [address, setAddress] = useState("");
  const [balance, setBalance] = useState(0n);
  const [activeTab, setActiveTab] = useState<
    "create" | "cluster" | "transfer" | "melt" | "list"
  >("create");

  const [dobMode, setDobMode] = useState<"image" | "text">("image");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedBytes, setSelectedBytes] = useState<Uint8Array | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [textContent, setTextContent] = useState("Hello Spore DOB on CKB!");
  const [contentType, setContentType] = useState("text/plain");
  const [clusterId, setClusterId] = useState("");

  const [clusterName, setClusterName] = useState("My Collection");
  const [clusterDesc, setClusterDesc] = useState("A collection of on-chain digital objects.");

  const [sporeIdInput, setSporeIdInput] = useState("");
  const [recipient, setRecipient] = useState("");

  const [sporesList, setSporesList] = useState<SporeItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{
    id?: string;
    txHash: string;
    action: string;
  } | null>(null);

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

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      setSelectedFile(file);
      setSelectedBytes(bytes);
      setContentType(file.type || "image/png");
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(String(err));
      }
    }
  };

  const handleAction = async () => {
    if (!signer) {
      setError("Please connect a wallet first.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccessInfo(null);

      if (activeTab === "create") {
        let contentPayload: string | Uint8Array;
        let mimeType = contentType;

        if (dobMode === "image") {
          if (!selectedBytes || !selectedFile) {
            throw new Error("Please select an image file first.");
          }
          contentPayload = selectedBytes;
          mimeType = selectedFile.type || "image/png";
        } else {
          if (!textContent.trim()) throw new Error("Content is required.");
          contentPayload = textContent;
          mimeType = contentType.trim() || "text/plain";
        }

        const res = await mintSporeDob(signer, contentPayload, mimeType, clusterId);
        setSuccessInfo({
          id: res.id,
          txHash: res.txHash,
          action: "Spore DOB Minted Successfully!",
        });
        setSporeIdInput(res.id);
      } else if (activeTab === "cluster") {
        if (!clusterName.trim()) throw new Error("Cluster name is required.");
        const res = await createCluster(signer, clusterName, clusterDesc);
        setSuccessInfo({
          id: res.clusterId,
          txHash: res.txHash,
          action: "Cluster Created Successfully!",
        });
        setClusterId(res.clusterId);
      } else if (activeTab === "transfer") {
        if (!sporeIdInput.trim()) throw new Error("Spore ID is required.");
        if (!recipient.trim()) throw new Error("Recipient address is required.");
        const txHash = await transferSporeDob(signer, sporeIdInput.trim(), recipient.trim());
        setSuccessInfo({
          id: sporeIdInput.trim(),
          txHash,
          action: "Spore Transferred Successfully!",
        });
      } else if (activeTab === "melt") {
        if (!sporeIdInput.trim()) throw new Error("Spore ID is required.");
        const txHash = await meltSporeDob(signer, sporeIdInput.trim());
        setSuccessInfo({
          id: sporeIdInput.trim(),
          txHash,
          action: "Spore Melted & Capacity Reclaimed!",
        });
      } else if (activeTab === "list") {
        const items = await listSpores(signer);
        setSporesList(items);
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
            <h1>CKB Spore Protocol (DOBs)</h1>
            <p className="subtitle">
              Create permanent on-chain image & text Digital Objects on CKB via CCC
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
            className={`tab ${activeTab === "create" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("create");
              setError(null);
            }}
          >
            Create Spore
          </button>
          <button
            className={`tab ${activeTab === "cluster" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("cluster");
              setError(null);
            }}
          >
            Create Cluster
          </button>
          <button
            className={`tab ${activeTab === "transfer" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("transfer");
              setError(null);
            }}
          >
            Transfer Spore
          </button>
          <button
            className={`tab ${activeTab === "melt" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("melt");
              setError(null);
            }}
          >
            Melt (Destroy)
          </button>
          <button
            className={`tab ${activeTab === "list" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("list");
              setError(null);
            }}
          >
            Query Spores
          </button>
        </div>

        {activeTab === "create" && (
          <>
            <div className="sub-tabs">
              <button
                className={`sub-tab ${dobMode === "image" ? "active" : ""}`}
                type="button"
                onClick={() => setDobMode("image")}
              >
                On-Chain Image DOB
              </button>
              <button
                className={`sub-tab ${dobMode === "text" ? "active" : ""}`}
                type="button"
                onClick={() => setDobMode("text")}
              >
                Text Note DOB
              </button>
            </div>

            {dobMode === "image" ? (
              <div className="form-group">
                <label htmlFor="imageFile">SELECT IMAGE FILE (STORED 100% ON-CHAIN)</label>
                <input
                  id="imageFile"
                  type="file"
                  accept="image/png, image/jpeg, image/gif, image/svg+xml, image/webp"
                  onChange={handleFileChange}
                />
                {selectedFile && previewUrl && (
                  <div className="image-preview-card">
                    <img src={previewUrl} alt="Preview" className="preview-img" />
                    <div className="preview-info">
                      <div><strong>File Name:</strong> {selectedFile.name}</div>
                      <div><strong>MIME Type:</strong> {selectedFile.type}</div>
                      <div><strong>File Size:</strong> {(selectedFile.size / 1024).toFixed(1)} KB</div>
                      <div className="capacity-estimate">
                        <strong>Est. Required Capacity:</strong> ~{(Math.ceil(selectedFile.size) + 200)} CKB
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="form-group">
                  <label htmlFor="content">SPORE CONTENT (TEXT)</label>
                  <textarea
                    id="content"
                    rows={3}
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="contentType">CONTENT TYPE (MIME)</label>
                  <input
                    id="contentType"
                    type="text"
                    value={contentType}
                    onChange={(e) => setContentType(e.target.value)}
                  />
                </div>
              </>
            )}

            <div className="form-group">
              <label htmlFor="clusterId">CLUSTER ID (OPTIONAL)</label>
              <input
                id="clusterId"
                type="text"
                value={clusterId}
                onChange={(e) => setClusterId(e.target.value)}
                placeholder="0x... (leave empty if not in cluster)"
              />
            </div>
          </>
        )}

        {activeTab === "cluster" && (
          <>
            <div className="form-group">
              <label htmlFor="cName">CLUSTER NAME</label>
              <input
                id="cName"
                type="text"
                value={clusterName}
                onChange={(e) => setClusterName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="cDesc">CLUSTER DESCRIPTION</label>
              <input
                id="cDesc"
                type="text"
                value={clusterDesc}
                onChange={(e) => setClusterDesc(e.target.value)}
              />
            </div>
          </>
        )}

        {(activeTab === "transfer" || activeTab === "melt") && (
          <div className="form-group">
            <label htmlFor="sporeId">SPORE ID (TYPE SCRIPT ARGS)</label>
            <input
              id="sporeId"
              type="text"
              value={sporeIdInput}
              onChange={(e) => setSporeIdInput(e.target.value)}
              placeholder="0x..."
            />
          </div>
        )}

        {activeTab === "transfer" && (
          <div className="form-group">
            <label htmlFor="recAddr">RECIPIENT ADDRESS</label>
            <input
              id="recAddr"
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="ckt1q..."
            />
          </div>
        )}

        {activeTab === "list" && (
          <div className="spore-list-section">
            <p className="list-desc">Query on-chain Spores owned by the connected signer.</p>
            {sporesList.length === 0 ? (
              <p className="no-items">Click the button below to fetch owned Spores from chain.</p>
            ) : (
              <div className="spore-grid">
                {sporesList.map((item, idx) => (
                  <div key={idx} className="spore-card">
                    {item.imageBlobUrl && (
                      <div className="card-media">
                        <img src={item.imageBlobUrl} alt="Spore DOB" />
                      </div>
                    )}
                    {item.textContent && (
                      <div className="card-text">
                        "{item.textContent}"
                      </div>
                    )}
                    <div className="spore-field">
                      <span>ID:</span> <code>{item.id}</code>
                    </div>
                    <div className="spore-field">
                      <span>Type:</span> <strong>{item.contentType}</strong>
                    </div>
                    <div className="spore-field">
                      <span>Capacity:</span> <strong>{item.capacity} CKB</strong>
                    </div>
                    {item.clusterId && (
                      <div className="spore-field">
                        <span>Cluster:</span> <code>{item.clusterId}</code>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <button
          className="btn btn-primary btn-block"
          onClick={handleAction}
          disabled={!signer || loading}
        >
          {loading
            ? "Broadcasting Transaction..."
            : activeTab === "create"
            ? dobMode === "image" ? "Mint On-Chain Image DOB" : "Create Spore DOB on CKB"
            : activeTab === "cluster"
            ? "Create Spore Cluster"
            : activeTab === "transfer"
            ? "Transfer Spore DOB"
            : activeTab === "melt"
            ? "Melt Spore (Destroy & Reclaim CKB)"
            : "Query Owned Spores"}
        </button>

        {error && <div className="alert alert-error">{error}</div>}

        {successInfo && (
          <div className="alert alert-success">
            <div>
              <strong>{successInfo.action}</strong>
            </div>
            {successInfo.id && (
              <div className="info-row">
                <span>ID:</span> <code>{successInfo.id}</code>
              </div>
            )}
            <div className="hash-display">
              <code>{successInfo.txHash}</code>
            </div>
            <a
              href={`https://pudge.explorer.nervos.org/transaction/${successInfo.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="explorer-link"
            >
              View on CKB Testnet Explorer →
            </a>
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
      name="CKB Spore Protocol Demo"
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
      <SporeProtocolView />
    </ccc.Provider>
  );
}
