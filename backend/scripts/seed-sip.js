/**
 * Seed SIP extensions for agents.
 * Usage: node scripts/seed-sip.js
 * Requires MONGO_URI in .env
 */
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import User from "../src/models/User.js";
import SipExtension from "../src/models/SipExtension.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

const seeds = [
  { email: "agent1@ccaas.local", extension: "1001", password: "agent1001pass" },
  { email: "agent2@ccaas.local", extension: "1002", password: "agent1002pass" },
];

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  for (const seed of seeds) {
    const user = await User.findOne({ email: seed.email });

    if (!user) {
      console.warn(`Skip ${seed.extension}: user ${seed.email} not found`);
      continue;
    }

    await SipExtension.findOneAndUpdate(
      { userId: user._id },
      {
        extension: seed.extension,
        password: seed.password,
        displayName: user.name || seed.extension,
        status: "offline",
      },
      { upsert: true, new: true }
    );

    console.log(`✅ Extension ${seed.extension} → ${seed.email}`);
  }

  await mongoose.disconnect();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
