const mongoose = require("mongoose");
require("dotenv").config({ path: ".env.local" });

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("✅ Connected");

  const result = await mongoose.connection.collection("settings").updateMany(
    {},
    {
      $set: {
        qrEnabled: false,
        qrRecipientName: "",
        qrUpiId: "",
        qrImage: null,
        paymentGateway: "instamojo",
        cashfreeAppId: null,
        cashfreeSecretKey: null,
        cashfreeEnv: "sandbox",
      },
    }
  );

  console.log(`✅ Updated ${result.modifiedCount} settings document(s)`);
  await mongoose.disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
