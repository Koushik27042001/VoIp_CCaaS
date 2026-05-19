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
      trim: true,
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
      enum: ["waiting", "ringing", "connected", "active", "ended", "failed"],
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
      default: undefined,
    },
    disposition: {
      type: String,
      enum: ["completed", "missed", "failed"],
      default: "",
    },
    provider: {
      type: String,
      enum: ["twilio", "asterisk", ""],
      default: "",
    },
    externalId: String,
  },
  { timestamps: true }
);

callSchema.index({ phone: 1 });
callSchema.index({ status: 1, createdAt: -1 });
callSchema.index({ agentId: 1, createdAt: -1 });
callSchema.index({ startTime: -1 });
callSchema.index({ customerId: 1, createdAt: -1 });

export default mongoose.model("Call", callSchema);
