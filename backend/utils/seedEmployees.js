import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

// ✅ UID generator (same as your create page)
export async function generateUID(length = 10) {
  const salt = await bcrypt.genSalt(5);
  const hash = await bcrypt.hash(Date.now().toString(), salt);

  return hash.replace(/[^a-zA-Z0-9]/g, "").substring(0, length);
}

async function main() {
  const employees = [];

  for (let i = 1; i <= 5000; i++) {
    const uid = await generateUID(10); // generate unique uid

    employees.push({
      uid,
      fullName: `Employee ${i}`,
      email: `employee${i}@example.com`,
      phone: `8801${String(10000000 + i).slice(-8)}`,
      designationId: 1,
      departmentId: 1,
      status: "active",
    });
  }

  const result = await prisma.employee.createMany({
    data: employees,
    skipDuplicates: true, // duplicate email বা phone থাকলে skip করবে
  });

  console.log(`${result.count} employees inserted`);
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
