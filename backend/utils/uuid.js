import bcrypt from "bcrypt";

export async function generateUID(length = 10) {
  const salt = await bcrypt.genSalt(5);
  const hash = await bcrypt.hash(Date.now().toString(), salt);

  return hash
    .replace(/[^a-zA-Z0-9]/g, "")
    .substring(0, length);
}
export function generateAssetUID(createdAt = new Date()) {
  const year = createdAt.getFullYear(); // 2026
  const month = String(createdAt.getMonth() + 1).padStart(2, "0"); // 02

  // 6 digit random number
  const randomNumber = Math.floor(100000 + Math.random() * 900000);

  return `MT-${year}-${month}-${randomNumber}`;
}
