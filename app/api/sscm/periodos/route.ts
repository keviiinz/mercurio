import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const monthNames = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

export async function GET() {
  const periods = await prisma.periodo.findMany({
    orderBy: [{ anio: "desc" }, { mes: "desc" }],
    include: { _count: { select: { ventas: true } } },
  });
  return NextResponse.json(periods);
}

export async function POST(req: Request) {
  const { month, year, active } = await req.json();
  const m = parseInt(month), y = parseInt(year);
  if (isNaN(m) || m < 1 || m > 12 || isNaN(y))
    return NextResponse.json({ error: "Mes o año inválido." }, { status: 400 });
  if (active) await prisma.periodo.updateMany({ data: { activo: false } });
  const period = await prisma.periodo.create({
    data: { mes: m, anio: y, nombre: `${monthNames[m - 1]} ${y}`, activo: active ?? false },
  });
  return NextResponse.json(period);
}
