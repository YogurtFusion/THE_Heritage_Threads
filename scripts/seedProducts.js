/**
 * Run with: node scripts/seedProducts.js
 * Seeds sample products into MongoDB.
 */
const mongoose = require("mongoose");
require("dotenv").config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) { console.error("❌ MONGODB_URI not set"); process.exit(1); }

const ProductSchema = new mongoose.Schema({
  name: String, slug: { type: String, unique: true }, description: String,
  price: Number, discountPrice: Number, images: [String], category: String,
  stock: Number, isFeatured: Boolean, isTrending: Boolean,
}, { timestamps: true });

const products = [
  { name: "Peacock Motif Madhubani Keychain", slug: "peacock-motif-madhubani-keychain", description: "Hand-painted peacock motif on genuine leather using traditional Madhubani art. Each piece is unique, crafted by artisans from the Mithila region of Bihar.", price: 349, discountPrice: 299, images: ["/assets/cart/img1.png"], category: "keychains", stock: 45, isFeatured: true, isTrending: true },
  { name: "Lotus Bloom Mithila Zip Chain", slug: "lotus-bloom-mithila-zip-chain", description: "Delicate lotus motif zip chain painted with natural pigments on calfskin leather. A symbol of purity and heritage.", price: 399, images: ["/assets/cart/img2.png"], category: "zipchains", stock: 30, isFeatured: true, isTrending: false },
  { name: "Tree of Life Wooden Keychain", slug: "tree-of-life-wooden-keychain", description: "Sustainably sourced wood keychain featuring the iconic Tree of Life motif from Madhubani tradition.", price: 249, images: ["/assets/cart/img5.png"], category: "keychains", stock: 60, isFeatured: false, isTrending: true },
  { name: "Fish Pattern Madhubani Zip Pull", slug: "fish-pattern-madhubani-zip-pull", description: "Twin fish motif — a symbol of prosperity in Mithila art — hand-painted on premium leather zip pull.", price: 379, discountPrice: 329, images: ["/assets/cart/img6.png"], category: "zipchains", stock: 25, isFeatured: false, isTrending: true },
  { name: "Elephant Parade Mithila Keychain", slug: "elephant-parade-mithila-keychain", description: "Majestic elephant parade motif, a classic Madhubani design representing strength and wisdom.", price: 299, images: ["/assets/cart/img7.png"], category: "keychains", stock: 40, isFeatured: true, isTrending: false },
  { name: "Sun God Madhubani Tassel Chain", slug: "sun-god-madhubani-tassel-chain", description: "The Sun God (Surya) depicted in vibrant natural pigments with a silk tassel. A collector's piece.", price: 449, images: ["/assets/cart/img8.png"], category: "zipchains", stock: 15, isFeatured: true, isTrending: true },
  { name: "Moon Goddess Mithila Zip Chain", slug: "moon-goddess-mithila-zip-chain", description: "Chandra (Moon Goddess) motif in silver and white tones on dark leather. Elegant and mystical.", price: 429, images: ["/assets/cart/img9.png"], category: "zipchains", stock: 20, isFeatured: false, isTrending: false },
  { name: "Twin Birds Handpainted Keychain", slug: "twin-birds-handpainted-keychain", description: "Two birds facing each other — a symbol of love and union in Madhubani tradition. Hand-painted on leather.", price: 319, images: ["/assets/cart/img10.png"], category: "keychains", stock: 35, isFeatured: false, isTrending: true },
  { name: "Floral Geometry Mithila Zip Pull", slug: "floral-geometry-mithila-zip-pull", description: "Intricate geometric floral patterns inspired by traditional Mithila wall paintings.", price: 359, images: ["/assets/cart/img12.png"], category: "zipchains", stock: 28, isFeatured: true, isTrending: false },
  { name: "Dancing Deer Madhubani Keychain", slug: "dancing-deer-madhubani-keychain", description: "Playful deer in motion, a beloved motif in Madhubani art representing grace and freedom.", price: 279, discountPrice: 249, images: ["/assets/cart/img13.png"], category: "keychains", stock: 50, isFeatured: false, isTrending: true },
  { name: "Sacred Cow Mithila Zip Chain", slug: "sacred-cow-mithila-zip-chain", description: "The sacred cow (Gau Mata) depicted with traditional Mithila patterns. A symbol of abundance.", price: 389, images: ["/assets/cart/img14.png"], category: "zipchains", stock: 18, isFeatured: false, isTrending: false },
  { name: "Turtle Motif Handcrafted Keychain", slug: "turtle-motif-handcrafted-keychain", description: "The turtle (Kurma) — symbol of longevity — hand-painted in earthy tones on genuine leather.", price: 299, images: ["/assets/cart/img15.png"], category: "keychains", stock: 42, isFeatured: true, isTrending: false },
  { name: "Village Scene Madhubani Zip Pull", slug: "village-scene-madhubani-zip-pull", description: "A miniature village scene from rural Bihar, capturing daily life through Madhubani art.", price: 499, images: ["/assets/cart/img16.png"], category: "zipchains", stock: 12, isFeatured: true, isTrending: true },
  { name: "Royal Elephant Mithila Keychain", slug: "royal-elephant-mithila-keychain", description: "Decorated royal elephant with ornate Mithila patterns. A premium collector's keychain.", price: 349, images: ["/assets/cart/img17.png"], category: "keychains", stock: 33, isFeatured: false, isTrending: false },
  { name: "Blossom Branch Madhubani Zip Chain", slug: "blossom-branch-madhubani-zip-chain", description: "Cherry blossom branch motif in pink and white, blending Madhubani tradition with modern aesthetics.", price: 419, discountPrice: 369, images: ["/assets/cart/img18.png"], category: "zipchains", stock: 22, isFeatured: true, isTrending: true },
  { name: "Parrot Pair Mithila Keychain", slug: "parrot-pair-mithila-keychain", description: "Vibrant green parrots — messengers of love in Mithila folklore — hand-painted on leather.", price: 329, images: ["/assets/cart/img19.png"], category: "keychains", stock: 38, isFeatured: false, isTrending: true },
  { name: "Divine Sun Madhubani Zip Pull", slug: "divine-sun-madhubani-zip-pull", description: "Radiant sun motif with geometric rays, painted in gold and ochre natural pigments.", price: 459, images: ["/assets/cart/img20.png"], category: "zipchains", stock: 16, isFeatured: true, isTrending: false },
  { name: "Lotus Pond Handpainted Keychain", slug: "lotus-pond-handpainted-keychain", description: "A serene lotus pond scene with fish and birds, capturing the essence of Mithila village life.", price: 369, images: ["/assets/cart/img21.png"], category: "keychains", stock: 27, isFeatured: false, isTrending: false },
  { name: "Peacock Feather Mithila Zip Chain", slug: "peacock-feather-mithila-zip-chain", description: "Single peacock feather in iridescent blues and greens, a masterpiece of Madhubani miniature art.", price: 479, discountPrice: 429, images: ["/assets/cart/img22.png"], category: "zipchains", stock: 14, isFeatured: true, isTrending: true },
  { name: "Banyan Tree Madhubani Keychain", slug: "banyan-tree-madhubani-keychain", description: "The sacred banyan tree with aerial roots, symbolizing eternity and the cycle of life.", price: 309, images: ["/assets/cart/img23.png"], category: "keychains", stock: 44, isFeatured: false, isTrending: false },
  { name: "Mithila Fish Trio Zip Pull", slug: "mithila-fish-trio-zip-pull", description: "Three fish in a circular pattern — the most iconic motif in Mithila art, representing prosperity.", price: 399, images: ["/assets/cart/img24.png"], category: "zipchains", stock: 31, isFeatured: true, isTrending: true },
];

async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected to MongoDB");
  const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);
  let added = 0, skipped = 0;
  for (const p of products) {
    const exists = await Product.findOne({ slug: p.slug });
    if (exists) { skipped++; continue; }
    await Product.create(p);
    added++;
  }
  console.log(`✅ Done — ${added} products added, ${skipped} already existed`);
  await mongoose.disconnect();
}

main().catch(err => { console.error("❌", err.message); process.exit(1); });
