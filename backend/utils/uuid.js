import bcrypt from "bcrypt";

export async function generateUID(length = 10) {
  const salt = await bcrypt.genSalt(5);
  const hash = await bcrypt.hash(Date.now().toString(), salt);

  return hash
    .replace(/[^a-zA-Z0-9]/g, "")
    .substring(0, length);
}
