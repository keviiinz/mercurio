import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const configs = await prisma.configuracionSscm.findMany({ orderBy: { vigente_desde: "desc" } });
  return NextResponse.json(configs);
}

export async function POST(req: Request) {
  const { costo_por_100v, precio_por_100v, cashback_regalo, cashback_codigo } = await req.json();
  const vals = [costo_por_100v, precio_por_100v, cashback_regalo, cashback_codigo].map(parseFloat);
  if (vals.some(isNaN)) return NextResponse.json({ error: "Todos los campos son requeridos." }, { status: 400 });
  if (vals[0] <= 0 || vals[1] <= 0) return NextResponse.json({ error: "El costo y precio por 100V deben ser mayores a cero." }, { status: 400 });
  if (vals[2] < 0 || vals[3] < 0) return NextResponse.json({ error: "No se pueden poner cantidades negativas en el cashback." }, { status: 400 });
  const config = await prisma.configuracionSscm.create({
    data: { costo_por_100v: vals[0], precio_por_100v: vals[1], cashback_regalo: vals[2], cashback_codigo: vals[3] },
  });
  return NextResponse.json(config);
}
