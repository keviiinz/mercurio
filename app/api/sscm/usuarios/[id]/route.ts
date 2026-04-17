import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { activo } = await req.json();
  if (activo === false) {
    const target = await prisma.usuario.findUnique({ where: { id: parseInt(id) }, select: { rol: true } });
    if (target?.rol === "admin")
      return NextResponse.json({ error: "No se puede deshabilitar una cuenta de admin." }, { status: 400 });
  }
  const usuario = await prisma.usuario.update({
    where: { id: parseInt(id) },
    data: { activo },
    select: { id: true, activo: true },
  });
  return NextResponse.json(usuario);
}
