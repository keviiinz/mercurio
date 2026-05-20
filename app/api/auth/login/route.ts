import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { COOKIE_NAME } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const username = body.username?.toLowerCase();
  const password = body.password;

  if (!username || !password)
    return NextResponse.json({ error: "Campos requeridos" }, { status: 400 });

  const user = await prisma.usuario.findUnique({ where: { username } });
  if (!user)
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 401 });

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid)
    return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 });

  const res = NextResponse.json({ ok: true, punto_de_venta: user.punto_de_venta, activo: user.activo });
  res.cookies.set(COOKIE_NAME, user.id.toString(), {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return res;
}
