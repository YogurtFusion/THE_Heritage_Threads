/**
 * Universal database connector — MongoDB, SQLite, MySQL.
 * Reads URI fresh on every call to respect .env.local changes after restart.
 */
import mongoose from "mongoose";

function getDbUri(): string {
  return process.env.MONGODB_URI ?? process.env.DATABASE_URL ?? "";
}

function detectDbType(uri: string): "mongodb" | "sqlite" | "mysql" | "none" {
  if (!uri) return "none";
  if (uri.startsWith("mongodb")) return "mongodb";
  if (uri.startsWith("file:") || uri.endsWith(".db") || uri.endsWith(".sqlite")) return "sqlite";
  if (uri.startsWith("mysql://") || uri.startsWith("mysql2://")) return "mysql";
  return "mongodb";
}

// ─── MongoDB ──────────────────────────────────────────────────────────────────
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  uri: string; // track which URI was used so we can reset on change
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const mongoCache: MongooseCache = global.mongooseCache ?? { conn: null, promise: null, uri: "" };
global.mongooseCache = mongoCache;

async function connectMongoDB(): Promise<void> {
  const uri = getDbUri();
  if (!uri) throw new Error("MONGODB_URI is not set in .env.local");

  // If URI changed (e.g. after env update + restart), reset cache
  if (mongoCache.uri && mongoCache.uri !== uri) {
    mongoCache.conn = null;
    mongoCache.promise = null;
  }

  if (mongoCache.conn) return;

  if (!mongoCache.promise) {
    mongoCache.uri = uri;
    mongoCache.promise = mongoose.connect(uri, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });
  }

  try {
    mongoCache.conn = await mongoCache.promise;
  } catch (err) {
    // Reset on failure so next request retries
    mongoCache.promise = null;
    mongoCache.conn = null;
    throw err;
  }
}

// ─── SQLite ───────────────────────────────────────────────────────────────────
let sqliteDb: import("better-sqlite3").Database | null = null;

const SQLITE_SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  avatar TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT DEFAULT '',
  price REAL NOT NULL,
  discount_price REAL,
  images TEXT DEFAULT '[]',
  category TEXT NOT NULL,
  stock INTEGER DEFAULT 0,
  is_featured INTEGER DEFAULT 0,
  is_trending INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  items TEXT NOT NULL,
  total_amount REAL NOT NULL,
  status TEXT DEFAULT 'pending',
  payment_id TEXT,
  payment_status TEXT DEFAULT 'pending',
  payment_method TEXT DEFAULT 'cod',
  payment_screenshot TEXT,
  shipping_address TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS contacts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS settings (
  id TEXT PRIMARY KEY DEFAULT 'main',
  site_name TEXT DEFAULT 'My Store',
  logo TEXT,
  banner TEXT,
  favicon TEXT,
  currency TEXT DEFAULT 'INR',
  contact_email TEXT DEFAULT '',
  contact_phone TEXT DEFAULT '',
  contact_address TEXT DEFAULT '',
  social_links TEXT DEFAULT '{}',
  instamojo_api_key TEXT,
  instamojo_auth_token TEXT,
  instamojo_salt TEXT,
  cashfree_app_id TEXT,
  cashfree_secret_key TEXT,
  cashfree_env TEXT DEFAULT 'sandbox',
  qr_enabled INTEGER DEFAULT 0,
  qr_recipient_name TEXT DEFAULT '',
  qr_upi_id TEXT DEFAULT '',
  qr_image TEXT,
  cod_enabled INTEGER DEFAULT 1,
  online_payment_enabled INTEGER DEFAULT 0,
  payment_gateway TEXT DEFAULT 'instamojo',
  free_shipping_above REAL DEFAULT 500,
  shipping_charge REAL DEFAULT 50,
  return_policy TEXT DEFAULT '',
  privacy_policy TEXT DEFAULT '',
  terms_conditions TEXT DEFAULT '',
  about_text TEXT DEFAULT '',
  media_storage TEXT DEFAULT 'local',
  backblaze_bucket_name TEXT,
  backblaze_region TEXT,
  backblaze_access_key_id TEXT,
  backblaze_secret_key TEXT,
  backblaze_public_url TEXT,
  r2_bucket_name TEXT,
  r2_access_key_id TEXT,
  r2_secret_access_key TEXT,
  r2_endpoint TEXT,
  r2_public_url TEXT,
  setup_complete INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  read INTEGER DEFAULT 0,
  data TEXT DEFAULT '{}',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
INSERT OR IGNORE INTO settings (id) VALUES ('main');
`;

async function connectSQLite(): Promise<void> {
  if (sqliteDb) return;
  const uri = getDbUri();
  try {
    const Database = (await import("better-sqlite3")).default;
    const filePath = uri.replace(/^file:/, "");
    sqliteDb = new Database(filePath, { timeout: 5000 }); // 5s timeout for lock
    sqliteDb.pragma("journal_mode = WAL"); // WAL allows concurrent reads
    sqliteDb.pragma("busy_timeout = 5000"); // wait up to 5s if locked
    sqliteDb.exec(SQLITE_SCHEMA);
    console.log("✅ SQLite connected:", filePath);
  } catch (err) {
    const msg = (err as Error).message;
    if (msg.includes("locked") || msg.includes("SQLITE_BUSY")) {
      throw new Error(`SQLite file is locked by another process (e.g. DB Browser). Close it and restart the server.`);
    }
    throw new Error(`SQLite connection failed: ${msg}`);
  }
}

// ─── MySQL ────────────────────────────────────────────────────────────────────
let mysqlPool: import("mysql2/promise").Pool | null = null;

const MYSQL_SCHEMA = [
  `CREATE TABLE IF NOT EXISTS users (id VARCHAR(36) PRIMARY KEY, name VARCHAR(255) NOT NULL, email VARCHAR(255) UNIQUE NOT NULL, password VARCHAR(255) NOT NULL, role ENUM('admin','user') DEFAULT 'user', avatar TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS products (id VARCHAR(36) PRIMARY KEY, name VARCHAR(255) NOT NULL, slug VARCHAR(255) UNIQUE NOT NULL, description TEXT, price DECIMAL(10,2) NOT NULL, discount_price DECIMAL(10,2), images JSON, category VARCHAR(100) NOT NULL, stock INT DEFAULT 0, is_featured TINYINT(1) DEFAULT 0, is_trending TINYINT(1) DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS orders (id VARCHAR(36) PRIMARY KEY, user_id VARCHAR(36) NOT NULL, items JSON NOT NULL, total_amount DECIMAL(10,2) NOT NULL, status VARCHAR(50) DEFAULT 'pending', payment_id VARCHAR(255), payment_status VARCHAR(50) DEFAULT 'pending', payment_method VARCHAR(50) DEFAULT 'cod', payment_screenshot TEXT, shipping_address JSON NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS contacts (id VARCHAR(36) PRIMARY KEY, name VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL, message TEXT NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS settings (id VARCHAR(36) PRIMARY KEY, site_name VARCHAR(255) DEFAULT 'My Store', logo TEXT, banner TEXT, favicon TEXT, currency VARCHAR(10) DEFAULT 'INR', contact_email VARCHAR(255) DEFAULT '', contact_phone VARCHAR(50) DEFAULT '', contact_address TEXT DEFAULT '', social_links JSON, instamojo_api_key TEXT, instamojo_auth_token TEXT, instamojo_salt TEXT, cashfree_app_id TEXT, cashfree_secret_key TEXT, cashfree_env VARCHAR(20) DEFAULT 'sandbox', qr_enabled TINYINT(1) DEFAULT 0, qr_recipient_name VARCHAR(255) DEFAULT '', qr_upi_id VARCHAR(255) DEFAULT '', qr_image TEXT, cod_enabled TINYINT(1) DEFAULT 1, online_payment_enabled TINYINT(1) DEFAULT 0, payment_gateway VARCHAR(50) DEFAULT 'instamojo', free_shipping_above DECIMAL(10,2) DEFAULT 500, shipping_charge DECIMAL(10,2) DEFAULT 50, return_policy TEXT DEFAULT '', privacy_policy TEXT DEFAULT '', terms_conditions TEXT DEFAULT '', about_text TEXT DEFAULT '', media_storage VARCHAR(20) DEFAULT 'local', setup_complete TINYINT(1) DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS notifications (id VARCHAR(36) PRIMARY KEY, type VARCHAR(50) NOT NULL, title VARCHAR(255) NOT NULL, message TEXT NOT NULL, link VARCHAR(500), read_status TINYINT(1) DEFAULT 0, data JSON, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`,
  `INSERT IGNORE INTO settings (id) VALUES ('main')`,
];

async function connectMySQL(): Promise<void> {
  if (mysqlPool) return;
  const uri = getDbUri();
  try {
    const mysql = await import("mysql2/promise");
    const url = new URL(uri.replace("mysql2://", "mysql://"));
    mysqlPool = mysql.createPool({
      host: url.hostname,
      port: parseInt(url.port || "3306"),
      user: url.username,
      password: decodeURIComponent(url.password),
      database: url.pathname.slice(1),
      waitForConnections: true,
      connectionLimit: 10,
      charset: "utf8mb4",
    });

    // Create all tables on first connect
    const conn = await mysqlPool.getConnection();
    try {
      for (const sql of MYSQL_SCHEMA) {
        await conn.execute(sql);
      }
      console.log("✅ MySQL connected:", url.hostname, "— all tables ready");
    } finally {
      conn.release();
    }
  } catch (err) {
    mysqlPool = null;
    throw new Error(`MySQL connection failed: ${(err as Error).message}. Make sure mysql2 is installed: npm install mysql2`);
  }
}

// ─── Main export ──────────────────────────────────────────────────────────────
async function dbConnect(): Promise<void> {
  const uri = getDbUri();
  const dbType = detectDbType(uri);

  switch (dbType) {
    case "mongodb":  return connectMongoDB();
    case "sqlite":   return connectSQLite();
    case "mysql":    return connectMySQL();
    default:
      throw new Error("No database configured. Set MONGODB_URI in .env.local");
  }
}

export default dbConnect;
export { detectDbType, getDbUri, sqliteDb, mysqlPool };
