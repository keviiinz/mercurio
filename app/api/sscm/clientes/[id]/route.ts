import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = await prisma.cliente.findUnique({
    where: { id: parseInt(id) },
    include: { ventas: { orderBy: { fecha: "desc" } } },
  });
  if (!client) return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
  return NextResponse.json(client);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { nombre_real, nombre_juego } = await req.json();
  if (!nombre_real?.trim() || !nombre_juego?.trim())
    return NextResponse.json({ error: "Nombre real y nombre en juego son obligatorios." }, { status: 400 });
  try {
    const client = await prisma.cliente.update({
      where: { id: parseInt(id) },
      data: { nombre_real: nombre_real.trim(), nombre_juego: nombre_juego.trim() },
    });
    return NextResponse.json(client);
  } catch (e: any) {
    if (e.code === "P2002") return NextResponse.json({ error: "El nombre en juego ya existe." }, { status: 409 });
    return NextResponse.json({ error: "Error al actualizar." }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = await prisma.cliente.findUnique({
    where: { id: parseInt(id) },
    include: { _count: { select: { ventas: true } } },
  });
  if (!client) return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
  if (client._count.ventas > 0)
    return NextResponse.json({ error: `No se puede eliminar: tiene ${client._count.ventas} ventas registradas.` }, { status: 400 });
  await prisma.cliente.delete({ where: { id: parseInt(id) } });
  return NextResponse.json({ success: true });
}
