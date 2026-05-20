import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { validatePassword } from "@/lib/validations";
import bcrypt from "bcryptjs";

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  if (!session.activo) return NextResponse.json({ error: "Suscripción vencida. Renueva para continuar." }, { status: 403 });

  const { actual, nueva, confirmar } = await req.json();

  if (!actual || !nueva || !confirmar)
    return NextResponse.json({ error: "Todos los campos son requeridos." }, { status: 400 });
  if (nueva !== confirmar)
    return NextResponse.json({ error: "Las contraseñas no coinciden." }, { status: 400 });
  const passwordErr = validatePassword(nueva);
  if (passwordErr) return NextResponse.json({ error: passwordErr }, { status: 400 });

  const user = await prisma.usuario.findUnique({ where: { id: session.id } });
  if (!user) return NextResponse.json({ error: "Usuario no encontrado." }, { status: 404 });

  const valid = await bcrypt.compare(actual, user.password_hash);
  if (!valid) return NextResponse.json({ error: "La contraseña actual es incorrecta." }, { status: 401 });

  const password_hash = await bcrypt.hash(nueva, 10);
  await prisma.usuario.update({ where: { id: session.id }, data: { password_hash } });

  return NextResponse.json({ ok: true });
}
