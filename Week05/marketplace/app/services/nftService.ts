import fs from "node:fs/promises";
import path from "node:path";
import { getPool } from "@/app/lib/pool";

export type NftStatus = "owned" | "listed" | "selling";

export type Nft = {
  id: number;
  sporeId: string;
  name: string;
  contentType: string;
  owner: string;
  price: string | null;
  status: NftStatus;
  mintTx: string;
  saleTx: string | null;
};

type Row = {
  id: number;
  spore_id: string;
  name: string;
  content_type: string;
  owner: string;
  price: string | null;
  status: NftStatus;
  mint_tx: string;
  sale_tx: string | null;
};

type LocalStoreData = {
  nextId: number;
  nfts: Nft[];
};

const COLUMNS =
  "id, spore_id, name, content_type, owner, price, status, mint_tx, sale_tx";

const toNft = (r: Row): Nft => ({
  id: r.id,
  sporeId: r.spore_id,
  name: r.name,
  contentType: r.content_type,
  owner: r.owner,
  price: r.price,
  status: r.status,
  mintTx: r.mint_tx,
  saleTx: r.sale_tx,
});

function hasPostgresConfig(): boolean {
  return Boolean(process.env.DB_URL && process.env.DB_URL.trim().length > 0);
}

const DATA_DIR = path.join(process.cwd(), "data");
const FILES_DIR = path.join(DATA_DIR, "files");
const JSON_PATH = path.join(DATA_DIR, "nfts.json");

const globalForMutex = globalThis as unknown as { dbMutex?: Promise<void> };

async function withMutex<T>(fn: () => Promise<T>): Promise<T> {
  const prev = globalForMutex.dbMutex ?? Promise.resolve();
  let release!: () => void;
  globalForMutex.dbMutex = new Promise<void>((res) => {
    release = res;
  });
  await prev;
  try {
    return await fn();
  } finally {
    release();
  }
}

async function readLocalStore(): Promise<LocalStoreData> {
  await fs.mkdir(FILES_DIR, { recursive: true });
  try {
    const raw = await fs.readFile(JSON_PATH, "utf8");
    return JSON.parse(raw) as LocalStoreData;
  } catch {
    return { nextId: 1, nfts: [] };
  }
}

async function writeLocalStore(store: LocalStoreData): Promise<void> {
  await fs.mkdir(FILES_DIR, { recursive: true });
  await fs.writeFile(JSON_PATH, JSON.stringify(store, null, 2), "utf8");
}

let schemaReady: Promise<unknown> | null = null;
function ensureSchema() {
  const pool = getPool();
  schemaReady ??= pool.query(`
    CREATE TABLE IF NOT EXISTS nfts (
      id           SERIAL PRIMARY KEY,
      spore_id     TEXT UNIQUE NOT NULL,
      name         TEXT NOT NULL,
      content_type TEXT NOT NULL,
      content      BYTEA NOT NULL,
      owner        TEXT NOT NULL,
      price        BIGINT,
      status       TEXT NOT NULL DEFAULT 'owned',
      mint_tx      TEXT NOT NULL,
      sale_tx      TEXT UNIQUE,
      created_at   TIMESTAMPTZ DEFAULT now()
    )
  `);
  return schemaReady;
}

export async function createNft(input: {
  sporeId: string;
  name: string;
  contentType: string;
  content: Buffer;
  owner: string;
  mintTx: string;
}): Promise<Nft> {
  if (!hasPostgresConfig()) {
    return withMutex(async () => {
      const store = await readLocalStore();
      if (store.nfts.some((n) => n.sporeId === input.sporeId)) {
        throw new Error("Spore already registered in marketplace");
      }
      const id = store.nextId++;
      const nft: Nft = {
        id,
        sporeId: input.sporeId,
        name: input.name,
        contentType: input.contentType,
        owner: input.owner,
        price: null,
        status: "owned",
        mintTx: input.mintTx,
        saleTx: null,
      };
      await fs.writeFile(path.join(FILES_DIR, `${id}.bin`), input.content);
      store.nfts.push(nft);
      await writeLocalStore(store);
      return nft;
    });
  }

  await ensureSchema();
  const { rows } = await getPool().query<Row>(
    `INSERT INTO nfts (spore_id, name, content_type, content, owner, mint_tx)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING ${COLUMNS}`,
    [
      input.sporeId,
      input.name,
      input.contentType,
      input.content,
      input.owner,
      input.mintTx,
    ]
  );
  return toNft(rows[0]);
}

export async function getNft(id: number): Promise<Nft | null> {
  if (!hasPostgresConfig()) {
    const store = await readLocalStore();
    return store.nfts.find((n) => n.id === id) ?? null;
  }

  await ensureSchema();
  const { rows } = await getPool().query<Row>(
    `SELECT ${COLUMNS} FROM nfts WHERE id = $1`,
    [id]
  );
  return rows[0] ? toNft(rows[0]) : null;
}

export async function getNftFile(
  id: number
): Promise<{ contentType: string; content: Buffer } | null> {
  if (!hasPostgresConfig()) {
    const store = await readLocalStore();
    const nft = store.nfts.find((n) => n.id === id);
    if (!nft) return null;
    try {
      const content = await fs.readFile(path.join(FILES_DIR, `${id}.bin`));
      return { contentType: nft.contentType, content };
    } catch {
      return null;
    }
  }

  await ensureSchema();
  const { rows } = await getPool().query(
    "SELECT content_type, content FROM nfts WHERE id = $1",
    [id]
  );
  return rows[0]
    ? { contentType: rows[0].content_type, content: rows[0].content }
    : null;
}

export async function listNfts(filter: {
  status?: NftStatus;
  owner?: string;
}): Promise<Nft[]> {
  if (!hasPostgresConfig()) {
    const store = await readLocalStore();
    return store.nfts
      .filter((n) => {
        if (filter.status && n.status !== filter.status) return false;
        if (filter.owner && n.owner !== filter.owner) return false;
        return true;
      })
      .sort((a, b) => b.id - a.id);
  }

  await ensureSchema();
  const where: string[] = [];
  const params: string[] = [];
  if (filter.status) {
    params.push(filter.status);
    where.push(`status = $${params.length}`);
  }
  if (filter.owner) {
    params.push(filter.owner);
    where.push(`owner = $${params.length}`);
  }
  const { rows } = await getPool().query<Row>(
    `SELECT ${COLUMNS} FROM nfts
     ${where.length ? "WHERE " + where.join(" AND ") : ""}
     ORDER BY id DESC`,
    params
  );
  return rows.map(toNft);
}

export async function claimStatus(
  id: number,
  from: NftStatus,
  to: NftStatus
): Promise<Nft | null> {
  if (!hasPostgresConfig()) {
    return withMutex(async () => {
      const store = await readLocalStore();
      const target = store.nfts.find((n) => n.id === id && n.status === from);
      if (!target) return null;
      target.status = to;
      await writeLocalStore(store);
      return { ...target };
    });
  }

  await ensureSchema();
  const { rows } = await getPool().query<Row>(
    `UPDATE nfts SET status = $3 WHERE id = $1 AND status = $2
     RETURNING ${COLUMNS}`,
    [id, from, to]
  );
  return rows[0] ? toNft(rows[0]) : null;
}

export async function markListed(id: number, priceShannons: bigint) {
  if (!hasPostgresConfig()) {
    await withMutex(async () => {
      const store = await readLocalStore();
      const target = store.nfts.find((n) => n.id === id);
      if (target) {
        target.status = "listed";
        target.price = priceShannons.toString();
        await writeLocalStore(store);
      }
    });
    return;
  }

  await ensureSchema();
  await getPool().query(
    "UPDATE nfts SET status = 'listed', price = $2 WHERE id = $1",
    [id, priceShannons.toString()]
  );
}

export async function markOwned(
  id: number,
  owner: string,
  saleTx: string | null
) {
  if (!hasPostgresConfig()) {
    await withMutex(async () => {
      const store = await readLocalStore();
      const target = store.nfts.find((n) => n.id === id);
      if (target) {
        target.status = "owned";
        target.price = null;
        target.owner = owner;
        target.saleTx = saleTx;
        await writeLocalStore(store);
      }
    });
    return;
  }

  await ensureSchema();
  await getPool().query(
    `UPDATE nfts SET status = 'owned', price = NULL, owner = $2, sale_tx = $3
     WHERE id = $1`,
    [id, owner, saleTx]
  );
}
