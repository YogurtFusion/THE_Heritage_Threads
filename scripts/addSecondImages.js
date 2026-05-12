/**
 * Add second (hover) images to all products in both MongoDB and SQLite.
 * Run: node scripts/addSecondImages.js
 */
const mongoose = require("mongoose");
require("dotenv").config({ path: ".env.local" });

// Map slug → second image path
const SECOND_IMAGES = {
  "peacock-motif-madhubani-keychain":  "/assets/cart/img2.png",
  "lotus-bloom-mithila-zip-chain":     "/assets/cart/img1.png",
  "tree-of-life-wooden-keychain":      "/assets/cart/img6.png",
  "fish-pattern-madhubani-zip-pull":   "/assets/cart/img5.png",
  "elephant-parade-mithila-keychain":  "/assets/cart/img8.png",
  "sun-god-madhubani-tassel-chain":    "/assets/cart/img7.png",
  "moon-goddess-mithila-zip-chain":    "/assets/cart/img9.png",
  "twin-birds-handpainted-keychain":   "/assets/cart/img10.png",
  "floral-geometry-mithila-zip-pull":  "/assets/cart/img12.png",
  "dancing-deer-madhubani-keychain":   "/assets/cart/img13.png",
  "sacred-cow-mithila-zip-chain":      "/assets/cart/img14.png",
  "turtle-motif-handcrafted-keychain": "/assets/cart/img15.png",
  "village-scene-madhubani-zip-pull":  "/assets/cart/img16.png",
  "royal-elephant-mithila-keychain":   "/assets/cart/img17.png",
  "blossom-branch-madhubani-zip-chain":"/assets/cart/img18.png",
  "parrot-pair-mithila-keychain":      "/assets/cart/img19.png",
  "divine-sun-madhubani-zip-pull":     "/assets/cart/img20.png",
  "lotus-pond-handpainted-keychain":   "/assets/cart/img21.png",
  "peacock-feather-mithila-zip-chain": "/assets/cart/img22.png",
  "banyan-tree-madhubani-keychain":    "/assets/cart/img23.png",
  "mithila-fish-trio-zip-pull":        "/assets/cart/img24.png",
};

async function updateMongoDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri || uri.startsWith("file:")) {
    console.log("  Skipping MongoDB (not configured or using SQLite)");
    return 0;
  }
  await mongoose.connect(uri);
  const col = mongoose.connection.collection("products");
  let count = 0;
  for (const [slug, secondImg] of Object.entries(SECOND_IMAGES)) {
    const product = await col.findOne({ slug });
    if (!product) continue;
    const images = product.images || [];
    if (images.length >= 2) { count++; continue; } // already has 2+
    const updated = [images[0] || `/assets/cart/img1.png`, secondImg];
    await col.updateOne({ slug }, { $set: { images: updated } });
    count++;
  }
  await mongoose.disconnect();
  return count;
}

async function updateSQLite() {
  const uri = process.env.MONGODB_URI;
  if (!uri || !uri.startsWith("file:")) {
    console.log("  Skipping SQLite (not configured)");
    return 0;
  }
  const Database = require("better-sqlite3");
  const filePath = uri.replace(/^file:/, "");
  const db = new Database(filePath);
  let count = 0;
  for (const [slug, secondImg] of Object.entries(SECOND_IMAGES)) {
    const row = db.prepare("SELECT id, images FROM products WHERE slug = ?").get(slug);
    if (!row) continue;
    const images = JSON.parse(row.images || "[]");
    if (images.length >= 2) { count++; continue; }
    const updated = [images[0] || `/assets/cart/img1.png`, secondImg];
    db.prepare("UPDATE products SET images = ? WHERE slug = ?").run(JSON.stringify(updated), slug);
    count++;
  }
  db.close();
  return count;
}

async function main() {
  console.log("Adding second (hover) images to products...");
  const mongoCount = await updateMongoDB();
  const sqliteCount = await updateSQLite();
  console.log(`✅ MongoDB: ${mongoCount} products updated`);
  console.log(`✅ SQLite:  ${sqliteCount} products updated`);
}

main().catch((e) => { console.error("❌", e.message); process.exit(1); });
