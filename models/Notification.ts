import mongoose, { Schema, Document, Model } from "mongoose";

export interface INotification extends Document {
  type: "new_order" | "order_updated" | "new_contact" | "low_stock" | "new_user" | "payment_receipt";
  title: string;
  message: string;
  link?: string;
  read: boolean;
  data?: Record<string, unknown>;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    type: {
      type: String,
      enum: ["new_order", "order_updated", "new_contact", "low_stock", "new_user", "payment_receipt"],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String, default: null },
    read: { type: Boolean, default: false },
    data: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

const Notification: Model<INotification> =
  mongoose.models.Notification ??
  mongoose.model<INotification>("Notification", NotificationSchema);

export default Notification;
