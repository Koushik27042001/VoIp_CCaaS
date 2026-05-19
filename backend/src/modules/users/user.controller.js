import bcrypt from "bcrypt";
import { asyncHandler } from "../../middlewares/async.middleware.js";
import { AppError } from "../../middlewares/error.middleware.js";
import * as userRepo from "../../repositories/user.repository.js";

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  status: user.status,
  createdAt: user.createdAt,
});

const handleDuplicateKey = (err) => {
  if (err?.code === 11000) {
    throw new AppError("User with this email already exists", 409);
  }
  throw err;
};

/** Admin creates a new agent (or another admin). */
export const createAgent = asyncHandler(async (req, res) => {
  const { name, email, password, role, status } = req.body;

  if (role === "admin" && req.user.role !== "admin") {
    throw new AppError("Only admins can create admin accounts", 403);
  }

  const existing = await userRepo.findUserByEmail(email);
  if (existing) {
    throw new AppError("User with this email already exists", 409);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  try {
    const user = await userRepo.createUser({
      name,
      email,
      passwordHash,
      role: role || "agent",
      status: status || "offline",
    });

    res.status(201).json({
      message: "Agent created",
      user: publicUser(user),
    });
  } catch (err) {
    handleDuplicateKey(err);
  }
});

export const listAgents = asyncHandler(async (req, res) => {
  const { role } = req.query;
  const filter = role ? { role } : {};
  const users = await userRepo.listUsers(filter);
  res.json({ users: users.map(publicUser) });
});

export const updateAgentStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const isSelf = req.user.id === id;
  const isAdmin = req.user.role === "admin";

  if (!isSelf && !isAdmin) {
    throw new AppError("Forbidden", 403);
  }

  const updated = await userRepo.updateUser(id, { status });

  if (!updated) {
    throw new AppError("User not found", 404);
  }

  res.json({ user: publicUser(updated) });
});

export const deleteAgent = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (req.user.id === id) {
    throw new AppError("Cannot delete your own account", 400);
  }

  const user = await userRepo.findUserById(id);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  await userRepo.deleteUser(id);

  res.json({ message: "Agent removed" });
});
