/**
 * Run with: node scripts/createAdmin.js
 * Creates an admin user in MongoDB.
 * Set MONGODB_URI in .env.local first.
 */

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI not set in .env.local");
  process.exit(1);
}

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, lowercase: true },
  password: String,
  role: { type: String, default: "user" },
  avatar: String,
}, { timestamps: true });

async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected to MongoDB");

  const User = mongoose.models.User || mongoose.model("User", UserSchema);

  const email = "admin@heritagethreads.com";
  const password = "admin123";
  const name = "Admin";

  const existing = await User.findOne({ email });
  if (existing) {
    // Upgrade to admin if already exists
    await User.updateOne({ email }, { $set: { role: "admin" } });
    console.log(`✅ User ${email} updated to admin role`);
  } else {
    const hashed = await bcrypt.hash(password, 12);
    await User.create({ name, email, password: hashed, role: "admin" });
    console.log(`✅ Admin user created:`);
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
  }

  await mongoose.disconnect();
  console.log("✅ Done");
}

main().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
