import prisma from "../config/prisma";
import { hashPassword } from "../utils/password";
import { ProductType } from "@prisma/client";

async function main() {
  console.log("🌱 Seeding Started...");

  // ==========================
  // Branch
  // ==========================
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

  // ==========================
  // Roles
  // ==========================
  const adminRole = await prisma.role.upsert({
    where: {
      name: "ADMIN",
    },
    update: {},
    create: {
      name: "ADMIN",
      description: "System Administrator",
    },
  });

  await prisma.role.upsert({
    where: {
      name: "HR",
    },
    update: {},
    create: {
      name: "HR",
      description: "Human Resource",
    },
  });

  await prisma.role.upsert({
    where: {
      name: "TEAM_LEADER",
    },
    update: {},
    create: {
      name: "TEAM_LEADER",
      description: "Team Leader",
    },
  });

  await prisma.role.upsert({
    where: {
      name: "EMPLOYEE",
    },
    update: {},
    create: {
      name: "EMPLOYEE",
      description: "Employee",
    },
  });

  console.log("✅ Roles Created");

  // ==========================
  // Admin User
  // ==========================
  const password = await hashPassword("Admin@123");

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
      roleId: adminRole.id,

      status: "ACTIVE",
      isActive: true,
    },
  });

  console.log("✅ Admin Created");

  // ==========================
  // Lead Status
  // ==========================
  const leadStatuses = [
    "NEW",
    "INTERESTED",
    "FOLLOW_UP",
    "CALL_BACK",
    "NOT_INTERESTED",
    "CONVERTED",
    "LOST",
  ];

  for (const status of leadStatuses) {
    await prisma.leadStatus.upsert({
      where: {
        name: status,
      },
      update: {},
      create: {
        name: status,
        isActive: true,
      },
    });
  }

  console.log("✅ Lead Status Seeded");

  // ==========================
  // Lead Sources
  // ==========================
  const leadSources = [
    "Facebook",
    "Instagram",
    "Google",
    "Website",
    "Reference",
    "WhatsApp",
    "Manual",
  ];

  for (const source of leadSources) {
    await prisma.leadSource.upsert({
      where: {
        name: source,
      },
      update: {},
      create: {
        name: source,
        isActive: true,
      },
    });
  }

  console.log("✅ Lead Sources Seeded");

  // ==========================
  // Products
  // ==========================
  const products = [
    {
      productCode: "PRD00001",
      name: "Platinum Research",
      type: ProductType.RESEARCH,
      description: "Premium Research Service",
      price: 25000,
      gst: 18,
      durationDays: 90,
      isTrialAvailable: true,
    },
    {
      productCode: "PRD00002",
      name: "Pre IPO",
      type: ProductType.PRE_IPO,
      description: "Pre IPO Investment",
      price: 50000,
      gst: 18,
      durationDays: 180,
      isTrialAvailable: true,
    },
    {
      productCode: "PRD00003",
      name: "SIP",
      type: ProductType.SIP,
      description: "Systematic Investment Plan",
      price: 0,
      gst: 18,
      durationDays: null,
      isTrialAvailable: false,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: {
        productCode: product.productCode,
      },
      update: {},
      create: {
        productCode: product.productCode,
        name: product.name,
        type: product.type,
        description: product.description,
        price: product.price,
        gst: product.gst,
        durationDays: product.durationDays,
        isTrialAvailable: product.isTrialAvailable,
        isActive: true,
      },
    });
  }

  console.log("✅ Products Seeded");

  console.log("🎉 Database Seed Completed Successfully");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });