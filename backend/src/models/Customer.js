import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    email: String,
    company: String,

    tags: {
      type: [String], // ["hot", "warm", "cold"]
      default: [],
    },

    notes: {
      type: String,
      default: "",
    },

    assignedAgent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

// 🔥 IMPORTANT INDEXES (very important for performance)
customerSchema.index({ createdAt: -1 });
customerSchema.index({ assignedAgent: 1, createdAt: -1 });
customerSchema.index({ name: "text" });

export default mongoose.model("Customer", customerSchema);
