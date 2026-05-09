import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISocialLinks {
  instagram?: string;
  facebook?: string;
  twitter?: string;
  youtube?: string;
  reddit?: string;
  whatsapp?: string;
}

export interface ISettings extends Document {
  // Site
  siteName: string;
  logo?: string;
  banner?: string;
  favicon?: string;
  currency: string;
  // Contact
  contactEmail?: string;
  contactPhone?: string;
  contactAddress?: string;
  socialLinks: ISocialLinks;
  // Payment — Instamojo
  instaMojoApiKey?: string;
  instaMojoAuthToken?: string;
  instaMojoSalt?: string;
  // Payment — Cashfree
  cashfreeAppId?: string;
  cashfreeSecretKey?: string;
  cashfreeEnv?: "sandbox" | "production";
  // Payment — QR / UPI
  qrEnabled?: boolean;
  qrRecipientName?: string;
  qrUpiId?: string;
  qrImage?: string;
  // Payment toggles
  codEnabled: boolean;
  onlinePaymentEnabled: boolean;
  paymentGateway?: "instamojo" | "cashfree";
  // Shipping
  freeShippingAbove: number;
  shippingCharge: number;
  // Policies
  returnPolicy?: string;
  privacyPolicy?: string;
  termsConditions?: string;
  aboutText?: string;
  // Setup
  setupComplete: boolean;
}

const SettingsSchema = new Schema<ISettings>(
  {
    siteName: { type: String, default: "My Store" },
    logo: { type: String, default: null },
    banner: { type: String, default: null },
    favicon: { type: String, default: null },
    currency: { type: String, default: "INR" },
    contactEmail: { type: String, default: "" },
    contactPhone: { type: String, default: "" },
    contactAddress: { type: String, default: "" },
    socialLinks: {
      instagram: { type: String, default: "" },
      facebook: { type: String, default: "" },
      twitter: { type: String, default: "" },
      youtube: { type: String, default: "" },
      reddit: { type: String, default: "" },
      whatsapp: { type: String, default: "" },
    },
    // Instamojo
    instaMojoApiKey: { type: String, default: null },
    instaMojoAuthToken: { type: String, default: null },
    instaMojoSalt: { type: String, default: null },
    // Cashfree
    cashfreeAppId: { type: String, default: null },
    cashfreeSecretKey: { type: String, default: null },
    cashfreeEnv: { type: String, enum: ["sandbox", "production"], default: "sandbox" },
    // QR / UPI
    qrEnabled: { type: Boolean, default: false },
    qrRecipientName: { type: String, default: "" },
    qrUpiId: { type: String, default: "" },
    qrImage: { type: String, default: null },
    // Payment toggles
    codEnabled: { type: Boolean, default: true },
    onlinePaymentEnabled: { type: Boolean, default: false },
    paymentGateway: { type: String, enum: ["instamojo", "cashfree"], default: "instamojo" },
    // Shipping
    freeShippingAbove: { type: Number, default: 500 },
    shippingCharge: { type: Number, default: 50 },
    // Policies
    returnPolicy: { type: String, default: "" },
    privacyPolicy: { type: String, default: "" },
    termsConditions: { type: String, default: "" },
    aboutText: { type: String, default: "" },
    // Setup
    setupComplete: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Settings: Model<ISettings> =
  mongoose.models.Settings ?? mongoose.model<ISettings>("Settings", SettingsSchema);

export default Settings;
