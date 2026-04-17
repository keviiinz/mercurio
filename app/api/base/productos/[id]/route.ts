import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;
  const data = await req.json();
  const producto = await prisma.producto.updateMany({
    where: { id: parseInt(id), usuario_id: session.id },
    data,
  });
  return NextResponse.json(producto);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;
  await prisma.producto.updateMany({
    where: { id: parseInt(id), usuario_id: session.id },
    data: { activo: false },
  });
  return NextResponse.json({ ok: true });
}
