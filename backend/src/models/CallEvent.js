import mongoose from "mongoose";

const callEventSchema = new mongoose.Schema(
  {
    callId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Call",
      required: true,
    },
    eventType: {
      type: String,
      enum: ["ringing", "connected", "ended", "transferred", "hold"],
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    metadata: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

export default mongoose.model("CallEvent", callEventSchema);
