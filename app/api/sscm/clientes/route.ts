import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const clientes = await prisma.cliente.findMany({ orderBy: { nombre_real: "asc" } });
  return NextResponse.json(clientes);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  if (!session.activo) return NextResponse.json({ error: "Suscripción vencida. Renueva para continuar." }, { status: 403 });
  const { nombre_real, nombre_juego } = await req.json();
  if (!nombre_real?.trim() || !nombre_juego?.trim())
    return NextResponse.json({ error: "Nombre real y nombre en juego son obligatorios." }, { status: 400 });
  try {
    const cliente = await prisma.cliente.create({ data: { nombre_real: nombre_real.trim(), nombre_juego: nombre_juego.trim() } });
    return NextResponse.json(cliente);
  } catch {
    return NextResponse.json({ error: "El nombre en juego ya existe." }, { status: 409 });
  }
}
