import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hash = (p: string) => bcrypt.hash(p, 10);

  await prisma.usuario.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      password_hash: await hash("admin123"),
      nombre: "Administrador",
      punto_de_venta: "base",
      rol: "admin",
    },
  });

  await prisma.usuario.upsert({
    where: { username: "solaire" },
    update: {},
    create: {
      username: "solaire",
      password_hash: await hash("praiseTheSun"),
      nombre: "Solaire",
      punto_de_venta: "sscm",
      rol: "admin",
    },
  });

  console.log("✓ Usuarios creados: admin / solaire");
}

main().catch(console.error).finally(() => prisma.$disconnect());
