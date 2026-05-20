import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const period = await prisma.periodo.findUnique({
    where: { id: parseInt(id) },
    include: { ventas: { orderBy: { fecha: "desc" }, include: { cliente: true } } },
  });
  if (!period) return NextResponse.json({ error: "Periodo no encontrado" }, { status: 404 });
  return NextResponse.json(period);
}

export async function PUT(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  if (!session.activo) return NextResponse.json({ error: "Suscripción vencida. Renueva para continuar." }, { status: 403 });
  const { id } = await params;
  await prisma.periodo.updateMany({ data: { activo: false } });
  const period = await prisma.periodo.update({ where: { id: parseInt(id) }, data: { activo: true } });
  return NextResponse.json(period);
}
