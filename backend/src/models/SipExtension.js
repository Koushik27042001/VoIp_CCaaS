import mongoose from "mongoose";

const sipExtensionSchema = new mongoose.Schema(
  {
    extension: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    displayName: String,
    status: {
      type: String,
      enum: ["offline", "registered", "unregistered", "failed"],
      default: "offline",
    },
    lastRegisteredAt: Date,
    contactUri: String,
  },
  { timestamps: true }
);

export default mongoose.model("SipExtension", sipExtensionSchema);
