/**
 * Migrate all data from MongoDB to SQLite (./ht.db)
 * Run: node scripts/mongoToSqlite.js
 */
const mongoose = require("mongoose");
const Database = require("better-sqlite3");
const crypto = require("crypto");
require("dotenv").config({ path: ".env.local" });

const SQLITE_PATH = "./ht.db";

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL, role TEXT DEFAULT 'user', avatar TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, slug TEXT UNIQUE NOT NULL,
  description TEXT DEFAULT '', price REAL NOT NULL, discount_price REAL,
  images TEXT DEFAULT '[]', category TEXT NOT NULL, stock INTEGER DEFAULT 0,
  is_featured INTEGER DEFAULT 0, is_trending INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY, user_id TEXT NOT NULL, items TEXT NOT NULL,
  total_amount REAL NOT NULL, status TEXT DEFAULT 'pending', payment_id TEXT,
  payment_status TEXT DEFAULT 'pending', payment_method TEXT DEFAULT 'cod',
  payment_screenshot TEXT, shipping_address TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS contacts (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL,
  message TEXT NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS settings (
  id TEXT PRIMARY KEY DEFAULT 'main', site_name TEXT DEFAULT 'My Store',
  logo TEXT, banner TEXT, favicon TEXT, currency TEXT DEFAULT 'INR',
  contact_email TEXT DEFAULT '', contact_phone TEXT DEFAULT '',
  contact_address TEXT DEFAULT '', social_links TEXT DEFAULT '{}',
  instamojo_api_key TEXT, instamojo_auth_token TEXT, instamojo_salt TEXT,
  cashfree_app_id TEXT, cashfree_secret_key TEXT, cashfree_env TEXT DEFAULT 'sandbox',
  qr_enabled INTEGER DEFAULT 0, qr_recipient_name TEXT DEFAULT '',
  qr_upi_id TEXT DEFAULT '', qr_image TEXT,
  cod_enabled INTEGER DEFAULT 1, online_payment_enabled INTEGER DEFAULT 0,
  payment_gateway TEXT DEFAULT 'instamojo',
  free_shipping_above REAL DEFAULT 500, shipping_charge REAL DEFAULT 50,
  return_policy TEXT DEFAULT '', privacy_policy TEXT DEFAULT '',
  terms_conditions TEXT DEFAULT '', about_text TEXT DEFAULT '',
  setup_complete INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY, type TEXT NOT NULL, title TEXT NOT NULL,
  message TEXT NOT NULL, link TEXT, read INTEGER DEFAULT 0,
  data TEXT DEFAULT '{}', created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
INSERT OR IGNORE INTO settings (id) VALUES ('main');
`;

// Dummy products for testing
const DUMMY_PRODUCTS = [
  { name: "Peacock Motif Madhubani Keychain", slug: "peacock-motif-madhubani-keychain", description: "Hand-painted peacock motif on genuine leather using traditional Madhubani art.", price: 349, discountPrice: 299, images: JSON.stringify(["/assets/cart/img1.png"]), category: "keychains", stock: 45, isFeatured: true, isTrending: true },
  { name: "Lotus Bloom Mithila Zip Chain", slug: "lotus-bloom-mithila-zip-chain", description: "Delicate lotus motif zip chain painted with natural pigments on calfskin leather.", price: 399, discountPrice: null, images: JSON.stringify(["/assets/cart/img2.png"]), category: "zipchains", stock: 30, isFeatured: true, isTrending: false },
  { name: "Tree of Life Wooden Keychain", slug: "tree-of-life-wooden-keychain", description: "Sustainably sourced wood keychain featuring the iconic Tree of Life motif.", price: 249, discountPrice: null, images: JSON.stringify(["/assets/cart/img5.png"]), category: "keychains", stock: 60, isFeatured: false, isTrending: true },
  { name: "Fish Pattern Madhubani Zip Pull", slug: "fish-pattern-madhubani-zip-pull", description: "Twin fish motif — a symbol of prosperity in Mithila art.", price: 379, discountPrice: 329, images: JSON.stringify(["/assets/cart/img6.png"]), category: "zipchains", stock: 25, isFeatured: false, isTrending: true },
  { name: "Elephant Parade Mithila Keychain", slug: "elephant-parade-mithila-keychain", description: "Majestic elephant parade motif representing strength and wisdom.", price: 299, discountPrice: null, images: JSON.stringify(["/assets/cart/img7.png"]), category: "keychains", stock: 40, isFeatured: true, isTrending: false },
  { name: "Sun God Madhubani Tassel Chain", slug: "sun-god-madhubani-tassel-chain", description: "The Sun God depicted in vibrant natural pigments with a silk tassel.", price: 449, discountPrice: null, images: JSON.stringify(["/assets/cart/img8.png"]), category: "zipchains", stock: 15, isFeatured: true, isTrending: true },
  { name: "Moon Goddess Mithila Zip Chain", slug: "moon-goddess-mithila-zip-chain", description: "Chandra (Moon Goddess) motif in silver and white tones on dark leather.", price: 429, discountPrice: null, images: JSON.stringify(["/assets/cart/img9.png"]), category: "zipchains", stock: 20, isFeatured: false, isTrending: false },
  { name: "Twin Birds Handpainted Keychain", slug: "twin-birds-handpainted-keychain", description: "Two birds facing each other — a symbol of love and union in Madhubani tradition.", price: 319, discountPrice: null, images: JSON.stringify(["/assets/cart/img10.png"]), category: "keychains", stock: 35, isFeatured: false, isTrending: true },
  { name: "Dancing Deer Madhubani Keychain", slug: "dancing-deer-madhubani-keychain", description: "Playful deer in motion representing grace and freedom.", price: 279, discountPrice: 249, images: JSON.stringify(["/assets/cart/img13.png"]), category: "keychains", stock: 50, isFeatured: false, isTrending: true },
  { name: "Village Scene Madhubani Zip Pull", slug: "village-scene-madhubani-zip-pull", description: "A miniature village scene from rural Bihar, capturing daily life.", price: 499, discountPrice: null, images: JSON.stringify(["/assets/cart/img16.png"]), category: "zipchains", stock: 12, isFeatured: true, isTrending: true },
];

async function main() {
  console.log("🔄 Connecting to MongoDB...");
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("✅ MongoDB connected");

  const db = new Database(SQLITE_PATH);
  db.pragma("journal_mode = WAL");
  db.exec(SCHEMA);
  console.log(`✅ SQLite database created: ${SQLITE_PATH}`);

  // ── Migrate Settings ──────────────────────────────────────────────────────
  const mongoSettings = await mongoose.connection.collection("settings").findOne({});
  if (mongoSettings) {
    const sl = mongoSettings.socialLinks || {};
    db.prepare(`
      UPDATE settings SET
        site_name = ?, logo = ?, banner = ?, favicon = ?, currency = ?,
        contact_email = ?, contact_phone = ?, contact_address = ?,
        social_links = ?, instamojo_api_key = ?, instamojo_auth_token = ?,
        instamojo_salt = ?, qr_enabled = ?, qr_recipient_name = ?,
        qr_upi_id = ?, qr_image = ?, cod_enabled = ?,
        online_payment_enabled = ?, payment_gateway = ?,
        free_shipping_above = ?, shipping_charge = ?,
        return_policy = ?, privacy_policy = ?, terms_conditions = ?,
        about_text = ?, setup_complete = ?
      WHERE id = 'main'
    `).run(
      mongoSettings.siteName || "Heritage Threads",
      mongoSettings.logo || null,
      mongoSettings.banner || null,
      mongoSettings.favicon || null,
      mongoSettings.currency || "INR",
      mongoSettings.contactEmail || "",
      mongoSettings.contactPhone || "",
      mongoSettings.contactAddress || "",
      JSON.stringify({
        instagram: sl.instagram || "",
        facebook: sl.facebook || "",
        twitter: sl.twitter || "",
        youtube: sl.youtube || "",
        reddit: sl.reddit || "",
        whatsapp: sl.whatsapp || "",
      }),
      mongoSettings.instaMojoApiKey || null,
      mongoSettings.instaMojoAuthToken || null,
      mongoSettings.instaMojoSalt || null,
      mongoSettings.qrEnabled ? 1 : 0,
      mongoSettings.qrRecipientName || "",
      mongoSettings.qrUpiId || "",
      mongoSettings.qrImage || null,
      mongoSettings.codEnabled !== false ? 1 : 0,
      mongoSettings.onlinePaymentEnabled ? 1 : 0,
      mongoSettings.paymentGateway || "instamojo",
      mongoSettings.freeShippingAbove || 500,
      mongoSettings.shippingCharge || 50,
      mongoSettings.returnPolicy || "",
      mongoSettings.privacyPolicy || "",
      mongoSettings.termsConditions || "",
      mongoSettings.aboutText || "",
      mongoSettings.setupComplete ? 1 : 0
    );
    console.log("✅ Settings migrated");
  }

  // ── Migrate Users ─────────────────────────────────────────────────────────
  const mongoUsers = await mongoose.connection.collection("users").find({}).toArray();
  const insertUser = db.prepare(`
    INSERT OR REPLACE INTO users (id, name, email, password, role, avatar, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  let userCount = 0;
  for (const u of mongoUsers) {
    insertUser.run(
      u._id.toString(), u.name, u.email, u.password,
      u.role || "user", u.avatar || null,
      u.createdAt ? new Date(u.createdAt).toISOString() : new Date().toISOString(),
      u.updatedAt ? new Date(u.updatedAt).toISOString() : new Date().toISOString()
    );
    userCount++;
  }
  console.log(`✅ ${userCount} users migrated`);

  // ── Migrate Products (MongoDB first, then dummy data) ─────────────────────
  const mongoProducts = await mongoose.connection.collection("products").find({}).toArray();
  const insertProduct = db.prepare(`
    INSERT OR REPLACE INTO products (id, name, slug, description, price, discount_price, images, category, stock, is_featured, is_trending, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  let productCount = 0;
  for (const p of mongoProducts) {
    insertProduct.run(
      p._id.toString(), p.name, p.slug, p.description || "",
      p.price, p.discountPrice || null,
      JSON.stringify(p.images || []),
      p.category, p.stock || 0,
      p.isFeatured ? 1 : 0, p.isTrending ? 1 : 0,
      p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString(),
      p.updatedAt ? new Date(p.updatedAt).toISOString() : new Date().toISOString()
    );
    productCount++;
  }

  // Add dummy products if none exist
  if (productCount === 0) {
    console.log("  No MongoDB products found — inserting dummy data...");
    for (const p of DUMMY_PRODUCTS) {
      insertProduct.run(
        crypto.randomUUID(), p.name, p.slug, p.description,
        p.price, p.discountPrice,
        p.images, p.category, p.stock,
        p.isFeatured ? 1 : 0, p.isTrending ? 1 : 0,
        new Date().toISOString(), new Date().toISOString()
      );
      productCount++;
    }
  }
  console.log(`✅ ${productCount} products migrated`);

  // ── Migrate Orders ────────────────────────────────────────────────────────
  const mongoOrders = await mongoose.connection.collection("orders").find({}).toArray();
  const insertOrder = db.prepare(`
    INSERT OR REPLACE INTO orders (id, user_id, items, total_amount, status, payment_id, payment_status, payment_method, payment_screenshot, shipping_address, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  let orderCount = 0;
  for (const o of mongoOrders) {
    insertOrder.run(
      o._id.toString(), o.userId?.toString() || "",
      JSON.stringify(o.items || []),
      o.totalAmount, o.status || "pending",
      o.paymentId || null, o.paymentStatus || "pending",
      o.paymentMethod || "cod", o.paymentScreenshot || null,
      JSON.stringify(o.shippingAddress || {}),
      o.createdAt ? new Date(o.createdAt).toISOString() : new Date().toISOString(),
      o.updatedAt ? new Date(o.updatedAt).toISOString() : new Date().toISOString()
    );
    orderCount++;
  }
  console.log(`✅ ${orderCount} orders migrated`);

  // ── Migrate Contacts ──────────────────────────────────────────────────────
  const mongoContacts = await mongoose.connection.collection("contacts").find({}).toArray();
  const insertContact = db.prepare(`
    INSERT OR REPLACE INTO contacts (id, name, email, message, created_at)
    VALUES (?, ?, ?, ?, ?)
  `);
  let contactCount = 0;
  for (const c of mongoContacts) {
    insertContact.run(
      c._id.toString(), c.name, c.email, c.message,
      c.createdAt ? new Date(c.createdAt).toISOString() : new Date().toISOString()
    );
    contactCount++;
  }
  console.log(`✅ ${contactCount} contacts migrated`);

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log("\n📊 Migration Summary:");
  console.log(`   Settings: 1`);
  console.log(`   Users:    ${userCount}`);
  console.log(`   Products: ${productCount}`);
  console.log(`   Orders:   ${orderCount}`);
  console.log(`   Contacts: ${contactCount}`);
  console.log(`\n✅ All data migrated to ${SQLITE_PATH}`);
  console.log("\n📝 To use SQLite, update .env.local:");
  console.log(`   MONGODB_URI=file:${SQLITE_PATH}`);

  db.close();
  await mongoose.disconnect();
}

main().catch((e) => { console.error("❌ Migration failed:", e.message); process.exit(1); });
