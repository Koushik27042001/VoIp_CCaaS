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
      enum: [
        "initiated",
        "ringing",
        "connected",
        "ended",
        "failed",
        "transferred",
        "hold",
        "note_added",
      ],
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

callEventSchema.index({ callId: 1, timestamp: -1 });
callEventSchema.index({ eventType: 1, timestamp: -1 });

export default mongoose.model("CallEvent", callEventSchema);
