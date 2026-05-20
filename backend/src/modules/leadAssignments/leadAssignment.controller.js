import { asyncHandler } from "../../middlewares/async.middleware.js";
import { AppError } from "../../middlewares/error.middleware.js";
import User from "../../models/User.js";
import Lead from "../leads/lead.model.js";
import LeadAssignment from "./leadAssignment.model.js";

const populateAssignment = (query) =>
  query
    .populate("customerId")
    .populate("assignedTo", "name email role status")
    .populate("assignedBy", "name email role status");

const handleDuplicateKey = (err) => {
  if (err?.code === 11000) {
    throw new AppError("This lead is already assigned", 409);
  }
  throw err;
};

export const assignLead = asyncHandler(async (req, res) => {
  const { customerId, assignedTo } = req.body;

  const [lead, agent] = await Promise.all([
    Lead.findById(customerId),
    User.findById(assignedTo).lean(),
  ]);

  if (!lead) throw new AppError("Lead not found", 404);
  if (!agent || agent.role !== "agent") {
    throw new AppError("Assigned user must be an agent", 400);
  }

  try {
    const assignment = await LeadAssignment.create({
      customerId,
      assignedTo,
      assignedBy: req.user.id,
      status: lead.status || "new",
    });

    const populated = await populateAssignment(LeadAssignment.findById(assignment._id)).lean();
    res.status(201).json({ assignment: populated });
  } catch (err) {
    handleDuplicateKey(err);
  }
});

export const getAssignments = asyncHandler(async (req, res) => {
  const assignments = await populateAssignment(
    LeadAssignment.find().sort({ createdAt: -1 })
  ).lean();
  res.json({ assignments });
});

export const getMyLeads = asyncHandler(async (req, res) => {
  const assignments = await populateAssignment(
    LeadAssignment.find({ assignedTo: req.user.id }).sort({ updatedAt: -1 })
  ).lean();
  res.json({ assignments });
});

export const updateAssignmentStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const assignment = await LeadAssignment.findById(id);

  if (!assignment) throw new AppError("Lead assignment not found", 404);

  const isOwner = String(assignment.assignedTo) === req.user.id;
  const isAdmin = req.user.role === "admin";

  if (!isOwner && !isAdmin) {
    throw new AppError("Forbidden", 403);
  }

  assignment.status = status;
  await assignment.save();
  await Lead.findByIdAndUpdate(assignment.customerId, { status });

  const populated = await populateAssignment(LeadAssignment.findById(id)).lean();
  res.json({ assignment: populated });
});

export const addAssignmentNote = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { note } = req.body;
  const assignment = await LeadAssignment.findById(id);

  if (!assignment) throw new AppError("Lead assignment not found", 404);

  const isOwner = String(assignment.assignedTo) === req.user.id;
  const isAdmin = req.user.role === "admin";

  if (!isOwner && !isAdmin) {
    throw new AppError("Forbidden", 403);
  }

  assignment.notes.push({ text: note, createdBy: req.user.id });
  await assignment.save();

  const populated = await populateAssignment(LeadAssignment.findById(id)).lean();
  res.status(201).json({ assignment: populated });
});
