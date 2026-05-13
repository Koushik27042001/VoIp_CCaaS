import mongoose from "mongoose";
import crypto from "crypto";

const encryptedPrefix = "enc:v1";

function getEncryptionKey() {
  if (!process.env.SIP_TRUNK_SECRET_KEY) return null;
  return crypto.createHash("sha256").update(process.env.SIP_TRUNK_SECRET_KEY).digest();
}

function encryptSecret(value) {
  if (!value || String(value).startsWith(`${encryptedPrefix}:`)) return value;

  const key = getEncryptionKey();
  if (!key) return value;

  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(String(value), "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return [
    encryptedPrefix,
    iv.toString("base64"),
    tag.toString("base64"),
    encrypted.toString("base64"),
  ].join(":");
}

function decryptSecret(value) {
  if (!value || !String(value).startsWith(`${encryptedPrefix}:`)) return value;

  const key = getEncryptionKey();
  if (!key) {
    throw new Error("SIP_TRUNK_SECRET_KEY is required to decrypt SIP trunk credentials");
  }

  const [, , iv, tag, encrypted] = String(value).split(":");
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, Buffer.from(iv, "base64"));
  decipher.setAuthTag(Buffer.from(tag, "base64"));

  return Buffer.concat([
    decipher.update(Buffer.from(encrypted, "base64")),
    decipher.final(),
  ]).toString("utf8");
}

const sipTrunkSchema = new mongoose.Schema(
  {
    carrierId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[a-z0-9_-]+$/, "Carrier ID can contain lowercase letters, numbers, dashes and underscores only"],
    },
    carrierName: {
      type: String,
      required: true,
      trim: true,
    },
    host: {
      type: String,
      required: true,
      trim: true,
    },
    port: {
      type: Number,
      default: 5060,
      min: 1,
      max: 65535,
    },
    username: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
      set: encryptSecret,
    },
    fromUser: {
      type: String,
      trim: true,
    },
    fromDomain: {
      type: String,
      trim: true,
    },
    protocol: {
      type: String,
      enum: ["SIP", "PJSIP"],
      default: "PJSIP",
    },
    transport: {
      type: String,
      enum: ["udp", "tcp", "tls"],
      default: "udp",
    },
    codecs: {
      type: [String],
      default: ["ulaw", "alaw"],
    },
    registrationString: String,
    outboundPrefix: {
      type: String,
      trim: true,
      default: "",
    },
    context: {
      type: String,
      default: "from-trunk",
      trim: true,
    },
    enabled: {
      type: Boolean,
      default: true,
    },
    registrationEnabled: {
      type: Boolean,
      default: true,
    },
    lastConfigGeneratedAt: Date,
    lastReloadAt: Date,
    lastReloadStatus: {
      type: String,
      enum: ["pending", "success", "failed", "skipped"],
      default: "pending",
    },
    lastReloadMessage: String,
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        delete ret.password;
        return ret;
      },
    },
  },
);

sipTrunkSchema.index({ enabled: 1, protocol: 1 });

sipTrunkSchema.methods.getDecryptedPassword = function getDecryptedPassword() {
  return decryptSecret(this.password);
};

export default mongoose.model("SipTrunk", sipTrunkSchema);
