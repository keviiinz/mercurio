import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { COOKIE_NAME } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const { nombre, username, password } = await req.json();

  if (!nombre?.trim() || !username?.trim() || !password)
    return NextResponse.json({ error: "Todos los campos son requeridos." }, { status: 400 });

  if (password.length < 6)
    return NextResponse.json({ error: "La contraseña debe tener al menos 6 caracteres." }, { status: 400 });

  const exists = await prisma.usuario.findUnique({ where: { username } });
  if (exists)
    return NextResponse.json({ error: "El nombre de usuario ya está en uso." }, { status: 409 });

  const password_hash = await bcrypt.hash(password, 10);
  const user = await prisma.usuario.create({
    data: { nombre, username, password_hash, rol: "operador", punto_de_venta: "base", activo: true },
  });

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, user.id.toString(), {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return res;
}
