import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const leadAssignmentSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["new", "contacted", "interested", "closed"],
      default: "new",
    },
    notes: {
      type: [noteSchema],
      default: [],
    },
  },
  { timestamps: true }
);

leadAssignmentSchema.index({ assignedTo: 1, status: 1, createdAt: -1 });
leadAssignmentSchema.index({ customerId: 1 }, { unique: true });

export default mongoose.model("LeadAssignment", leadAssignmentSchema);
