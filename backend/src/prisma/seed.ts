import prisma from "../config/prisma";
import { hashPassword } from "../utils/password";

async function main() {
  console.log("🌱 Seeding Started...");

  // Branch
  const branch = await prisma.branch.upsert({
    where: {
      branchCode: "HO001",
    },
    update: {},
    create: {
      branchCode: "HO001",
      name: "Head Office",
      city: "Indore",
      state: "Madhya Pradesh",
      isActive: true,
    },
  });

  console.log("✅ Branch Created");

  // Role
  const role = await prisma.role.upsert({
    where: {
      name: "ADMIN",
    },
    update: {},
    create: {
      name: "ADMIN",
      description: "System Administrator",
    },
  });

  console.log("✅ Role Created");

  // Password
  const password = await hashPassword("Admin@123");

  // Admin Employee
  await prisma.employee.upsert({
    where: {
      employeeCode: "ADMIN001",
    },
    update: {},
    create: {
      employeeCode: "ADMIN001",
      name: "System Administrator",
      mobile: "9999999999",
      email: "admin@mfscrm.com",
      password,

      branchId: branch.id,
      roleId: role.id,

      status: "ACTIVE",
      isActive: true,
    },
  });

  console.log("✅ Admin Created");
}

main()
  .then(async () => {
    console.log("🎉 Seed Completed");
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });