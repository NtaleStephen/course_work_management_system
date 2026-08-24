import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { randomBytes } from "node:crypto";
import type { createAdminClient } from "@/lib/auth/admin-client";
import type { prisma } from "@/lib/db/client";
import type { Role } from "@/lib/generated/prisma/client";

// lib/db/client and lib/auth/admin-client both read process.env at module-load
// time (constructing a pg.Pool / Supabase client). Static imports of them would
// be hoisted above the dotenv.config() call above, so they're dynamically
// imported inside main() instead, after the env is actually loaded.

type AdminClient = ReturnType<typeof createAdminClient>;
type Prisma = typeof prisma;

type Fixture = { email: string; name: string; role: Role };

const FIXTURES: Fixture[] = [
  { email: "admin@classwork.test", name: "Test Admin", role: "ADMIN" },
  {
    email: "lecturer@classwork.test",
    name: "Test Lecturer",
    role: "LECTURER",
  },
  {
    email: "leader@classwork.test",
    name: "Test Group Leader",
    role: "GROUP_LEADER",
  },
];

function generatePassword(): string {
  return randomBytes(9).toString("base64url");
}

async function findAuthUserByEmail(admin: AdminClient, email: string) {
  let page = 1;
  for (;;) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage: 200,
    });
    if (error) throw error;
    const match = data.users.find((u) => u.email === email);
    if (match) return match;
    if (data.users.length < 200) return null;
    page += 1;
  }
}

async function ensureUser(
  admin: AdminClient,
  db: Prisma,
  fixture: Fixture
): Promise<{ email: string; role: Role; password: string | null }> {
  const password = generatePassword();

  const { data, error } = await admin.auth.admin.createUser({
    email: fixture.email,
    password,
    email_confirm: true,
  });

  let authUserId: string;
  let reportedPassword: string | null = password;

  if (error) {
    if (error.code !== "email_exists") throw error;

    const existing = await findAuthUserByEmail(admin, fixture.email);
    if (!existing) {
      throw new Error(`email_exists but not found: ${fixture.email}`);
    }
    authUserId = existing.id;
    reportedPassword = null; // pre-existing account -- password unchanged
  } else {
    authUserId = data.user.id;
  }

  await db.user.upsert({
    where: { id: authUserId },
    update: { email: fixture.email, name: fixture.name, role: fixture.role },
    create: {
      id: authUserId,
      email: fixture.email,
      name: fixture.name,
      role: fixture.role,
      active: true,
    },
  });

  return {
    email: fixture.email,
    role: fixture.role,
    password: reportedPassword,
  };
}

async function main() {
  const { createAdminClient } = await import("@/lib/auth/admin-client");
  const { prisma } = await import("@/lib/db/client");

  const admin = createAdminClient();
  const results = [];

  for (const fixture of FIXTURES) {
    results.push(await ensureUser(admin, prisma, fixture));
  }

  console.log("\nSeeded accounts:\n");
  for (const r of results) {
    console.log(
      r.password
        ? `  ${r.role.padEnd(12)} ${r.email}  password: ${r.password}`
        : `  ${r.role.padEnd(12)} ${r.email}  (already existed, password unchanged)`
    );
  }
  console.log("");

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
