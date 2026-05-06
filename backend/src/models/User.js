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

export default mongoose.model("User", userSchema);
