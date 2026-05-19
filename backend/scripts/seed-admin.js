/**
 * Create first admin user.
 * Usage: node scripts/seed-admin.js
 */
import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import path from "path";
import { fileURLToPath } from "url";
import User from "../src/models/User.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

const email = process.env.SEED_ADMIN_EMAIL || "admin@ccaas.local";
const password = process.env.SEED_ADMIN_PASSWORD || "admin12345";
const name = process.env.SEED_ADMIN_NAME || "System Admin";

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const existing = await User.findOne({ email });
  if (existing) {
    console.log(`Admin already exists: ${email}`);
    await mongoose.disconnect();
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await User.create({ name, email, passwordHash, role: "admin" });

  console.log(`✅ Admin created: ${email} / ${password}`);
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
