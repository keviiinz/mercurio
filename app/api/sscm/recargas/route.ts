import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  if (!session.activo) return NextResponse.json({ error: "Suscripción vencida. Renueva para continuar." }, { status: 403 });
  const body = await req.json();
  const cuentaId = parseInt(body.cuenta_id);
  const pavos = parseInt(body.pavos);
  const costo = parseFloat(body.costo);
  const notas = body.notas || null;
  const fecha = body.fecha ? new Date(body.fecha + "T12:00:00") : new Date();

  if (!cuentaId || isNaN(pavos) || pavos <= 0)
    return NextResponse.json({ error: "Los pavos deben ser mayores a cero." }, { status: 400 });
  if (isNaN(costo) || costo < 0)
    return NextResponse.json({ error: "No se permiten cantidades negativas en el costo." }, { status: 400 });

  const result = await prisma.$transaction(async (tx) => {
    const recarga = await tx.recarga.create({ data: { cuenta_id: cuentaId, pavos, costo, notas, fecha } });
    await tx.cuenta.update({ where: { id: cuentaId }, data: { pavos: { increment: pavos } } });
    return recarga;
  });
  return NextResponse.json(result);
}
