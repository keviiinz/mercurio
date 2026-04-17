import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const productos = await prisma.producto.findMany({
    where: { usuario_id: session.id, activo: true },
    orderBy: { nombre: "asc" },
  });
  return NextResponse.json(productos);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { nombre, precio, stock } = await req.json();
  if (!nombre?.trim() || precio == null || precio <= 0)
    return NextResponse.json({ error: "Nombre y precio válido son obligatorios." }, { status: 400 });
  const producto = await prisma.producto.create({
    data: { usuario_id: session.id, nombre: nombre.trim(), precio: parseFloat(precio), stock: parseInt(stock) || 0 },
  });
  return NextResponse.json(producto);
}
