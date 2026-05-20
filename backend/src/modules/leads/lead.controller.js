import { asyncHandler } from "../../middlewares/async.middleware.js";
import { AppError } from "../../middlewares/error.middleware.js";
import Lead from "./lead.model.js";

const handleDuplicateKey = (err) => {
  if (err?.code === 11000) {
    throw new AppError("Lead with this phone already exists", 409);
  }
  throw err;
};

export const createLead = asyncHandler(async (req, res) => {
  try {
    const lead = await Lead.create(req.body);
    res.status(201).json({ lead });
  } catch (err) {
    handleDuplicateKey(err);
  }
});

export const getLeads = asyncHandler(async (req, res) => {
  const leads = await Lead.find().sort({ createdAt: -1 }).lean();
  res.json({ leads });
});

export const updateLead = asyncHandler(async (req, res) => {
  const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).lean();

  if (!lead) {
    throw new AppError("Lead not found", 404);
  }

  res.json({ lead });
});
