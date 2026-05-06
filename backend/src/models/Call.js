import mongoose from "mongoose";

const callSchema = new mongoose.Schema(
  {
    callId: {
      type: String,
      unique: true,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
    },
    status: {
      type: String,
      enum: ["ringing", "connected", "ended"],
      default: "ringing",
    },
    duration: {
      type: Number,
      default: 0,
    },
    startTime: {
      type: Date,
      default: Date.now,
    },
    endTime: Date,
    notes: {
      type: String,
      default: "",
    },
    disposition: {
      type: String,
      enum: ["completed", "missed", "failed"],
      default: "",
    },
  },
  { timestamps: true }
);

callSchema.index({ phone: 1 });
callSchema.index({ agentId: 1 });
callSchema.index({ startTime: -1 });

export default mongoose.model("Call", callSchema);
