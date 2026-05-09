import mongoose, { Schema, Document, Model } from "mongoose";

export interface IContact extends Document {
  name: string;
  email: string;
  message: string;
  createdAt: Date;
}

const ContactSchema = new Schema<IContact>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      maxlength: [2000, "Message cannot exceed 2000 characters"],
    },
  },
  { timestamps: true }
);

const Contact: Model<IContact> =
  mongoose.models.Contact ?? mongoose.model<IContact>("Contact", ContactSchema);

export default Contact;
