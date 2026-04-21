import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    callId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Call",
    },
    content: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["call_note", "follow_up", "internal"],
      default: "call_note",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Note", noteSchema);
