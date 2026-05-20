import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET() {
  const cuentas = await prisma.cuenta.findMany({
    orderBy: { nombre: "asc" },
    include: { _count: { select: { ventas: true, recargas: true } } },
  });
  return NextResponse.json(cuentas);
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  if (!session.activo) return NextResponse.json({ error: "Suscripción vencida. Renueva para continuar." }, { status: 403 });
  const { nombre } = await req.json();
  if (!nombre?.trim()) return NextResponse.json({ error: "El nombre es obligatorio." }, { status: 400 });
  const cuenta = await prisma.cuenta.create({ data: { nombre: nombre.trim() } });
  return NextResponse.json(cuenta);
}
