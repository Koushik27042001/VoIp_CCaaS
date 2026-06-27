import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../../middlewares/async.middleware.js";
import { AppError } from "../../middlewares/error.middleware.js";
import * as userRepo from "../../repositories/user.repository.js";

const signToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  status: user.status,
});

export const setupFirstAdmin = asyncHandler(async (req, res) => {
  const count = await userRepo.countUsers();

  if (count > 0) {
    throw new AppError("Setup already completed. Use admin login.", 403);
  }

  const { name, email, password } = req.body;
  const passwordHash = await bcrypt.hash(password, 10);

  const user = await userRepo.createUser({
    name,
    email,
    passwordHash,
    role: "admin",
  });

  const token = signToken(user);

  res.status(201).json({
    message: "Admin account created",
    token,
    user: publicUser(user),
  });
});

export const getSetupStatus = asyncHandler(async (_req, res) => {
  const count = await userRepo.countUsers();
  res.json({
    setupCompleted: count > 0,
    canSetup: count === 0,
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await userRepo.findUserByEmail(email);
  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new AppError("Invalid email or password", 401);
  }

  const token = signToken(user);

  res.json({
    token,
    user: publicUser(user),
  });
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await userRepo.findUserById(req.user.id);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  res.json({ user: publicUser(user) });
});
