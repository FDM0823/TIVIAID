import crypto from "node:crypto";

const ENCRYPTION_PREFIX = "enc:v1:";
const ALGORITHM = "aes-256-gcm";

function getEncryptionKey() {
  const configuredKey = process.env.SENSITIVE_DATA_KEY;

  if (configuredKey) {
    return crypto.createHash("sha256").update(configuredKey).digest();
  }

  return crypto
    .createHash("sha256")
    .update(process.env.JWT_SECRET ?? "development-only-sensitive-data-key")
    .digest();
}

export function encryptSensitiveText(value: string | null | undefined) {
  if (!value) {
    return value ?? null;
  }

  if (value.startsWith(ENCRYPTION_PREFIX)) {
    return value;
  }

  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, getEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return [
    ENCRYPTION_PREFIX,
    iv.toString("base64url"),
    authTag.toString("base64url"),
    encrypted.toString("base64url"),
  ].join(".");
}

export const encryptNullable = encryptSensitiveText;

export function decryptSensitiveText(value: string | null | undefined) {
  if (!value) {
    return value ?? null;
  }

  if (!value.startsWith(ENCRYPTION_PREFIX)) {
    return value;
  }

  try {
    const [, iv, authTag, encrypted] = value.split(".");

    if (!iv || !authTag || !encrypted) {
      return null;
    }

    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      getEncryptionKey(),
      Buffer.from(iv, "base64url"),
    );

    decipher.setAuthTag(Buffer.from(authTag, "base64url"));

    return Buffer.concat([
      decipher.update(Buffer.from(encrypted, "base64url")),
      decipher.final(),
    ]).toString("utf8");
  } catch {
    return null;
  }
}

export const decryptNullable = decryptSensitiveText;
