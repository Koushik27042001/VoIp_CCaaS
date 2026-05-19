import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: {
      type: String,
      unique: true,
      required: true,
    },
    passwordHash: String,
    role: {
      type: String,
      enum: ["agent", "admin"],
      default: "agent",
    },
    status: {
      type: String,
      enum: ["available", "on_call", "offline"],
      default: "available",
    },
  },
  { timestamps: true }
);

userSchema.index({ status: 1, updatedAt: -1 });
userSchema.index({ role: 1, status: 1 });

export default mongoose.model("User", userSchema);
