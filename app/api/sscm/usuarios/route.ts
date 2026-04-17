import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const usuarios = await prisma.usuario.findMany({
    select: { id: true, username: true, nombre: true, rol: true, punto_de_venta: true, activo: true, creado_en: true },
    orderBy: { creado_en: "asc" },
  });
  return NextResponse.json(usuarios);
}

export async function POST(req: NextRequest) {
  const { username, password, nombre, rol, punto_de_venta } = await req.json();
  if (!username || !password || !nombre)
    return NextResponse.json({ error: "username, password y nombre son requeridos." }, { status: 400 });
  const pdv = punto_de_venta ?? "base";
  const rolFinal = rol ?? "operador";
  if (pdv === "sscm" && rolFinal === "admin")
    return NextResponse.json({ error: "El punto de venta SSCM no puede tener rol de admin." }, { status: 400 });
  const exists = await prisma.usuario.findUnique({ where: { username } });
  if (exists) return NextResponse.json({ error: "El nombre de usuario ya existe." }, { status: 409 });
  const password_hash = await bcrypt.hash(password, 10);
  const usuario = await prisma.usuario.create({
    data: { username, password_hash, nombre, rol: rolFinal, punto_de_venta: pdv },
    select: { id: true, username: true, nombre: true, rol: true, punto_de_venta: true, activo: true, creado_en: true },
  });
  return NextResponse.json(usuario, { status: 201 });
}
