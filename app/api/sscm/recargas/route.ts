import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const cuentaId = parseInt(body.cuenta_id);
  const pavos = parseInt(body.pavos);
  const costo = parseFloat(body.costo);
  const notas = body.notas || null;
  const fecha = body.fecha ? new Date(body.fecha + "T12:00:00") : new Date();

  if (!cuentaId || !pavos || !costo)
    return NextResponse.json({ error: "Faltan campos requeridos." }, { status: 400 });

  const result = await prisma.$transaction(async (tx) => {
    const recarga = await tx.recarga.create({ data: { cuenta_id: cuentaId, pavos, costo, notas, fecha } });
    await tx.cuenta.update({ where: { id: cuentaId }, data: { pavos: { increment: pavos } } });
    return recarga;
  });
  return NextResponse.json(result);
}
