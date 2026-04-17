import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const cuentas = await prisma.cuenta.findMany({
    orderBy: { nombre: "asc" },
    include: { _count: { select: { ventas: true, recargas: true } } },
  });
  return NextResponse.json(cuentas);
}

export async function POST(req: Request) {
  const { nombre } = await req.json();
  if (!nombre?.trim()) return NextResponse.json({ error: "El nombre es obligatorio." }, { status: 400 });
  const cuenta = await prisma.cuenta.create({ data: { nombre: nombre.trim() } });
  return NextResponse.json(cuenta);
}
