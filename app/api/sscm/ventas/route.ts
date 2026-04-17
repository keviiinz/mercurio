import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

function roundTo100(v: number) { return Math.round(v / 100) * 100; }

export async function GET() {
  const sales = await prisma.ventaSscm.findMany({
    orderBy: { fecha: "desc" }, include: { cliente: true, periodo: true },
  });
  return NextResponse.json(sales);
}

export async function POST(req: Request) {
  const body = await req.json();

  const config = await prisma.configuracionSscm.findFirst({ orderBy: { vigente_desde: "desc" } });
  if (!config) return NextResponse.json({ error: "No hay configuración. Configúrala primero." }, { status: 400 });

  const totalVbucks = parseInt(body.total_vbucks);
  const vbucksCashbackUsed = parseInt(body.vbucks_cashback_used) || 0;
  const pesosCashbackUsed = parseFloat(body.pesos_cashback_used) || 0;
  const type = body.type;
  const esSorteo = body.es_sorteo === true;
  const clientId = parseInt(body.client_id);
  const fecha = body.fecha ? new Date(body.fecha + "T12:00:00") : new Date();

  if (!type || isNaN(totalVbucks) || isNaN(clientId))
    return NextResponse.json({ error: "Faltan campos requeridos." }, { status: 400 });

  const month = fecha.getMonth() + 1, year = fecha.getFullYear();
  const period = await prisma.periodo.findFirst({ where: { mes: month, anio: year } });
  if (!period) return NextResponse.json({ error: `No existe un periodo para ${month}/${year}. Créalo primero.` }, { status: 400 });

  const client = await prisma.cliente.findUnique({ where: { id: clientId }, select: { bolsa_pavos: true, bolsa_pesos: true } });
  if (!client) return NextResponse.json({ error: "Cliente no encontrado." }, { status: 404 });
  if (vbucksCashbackUsed > client.bolsa_pavos) return NextResponse.json({ error: `Solo tiene ${client.bolsa_pavos}V disponibles.` }, { status: 400 });
  if (pesosCashbackUsed > client.bolsa_pesos) return NextResponse.json({ error: `Solo tiene $${client.bolsa_pesos} disponibles.` }, { status: 400 });

  const vbucksFromPesoConversion = roundTo100((pesosCashbackUsed / config.precio_por_100v) * 100);
  const realVbucksPaid = totalVbucks - vbucksCashbackUsed - vbucksFromPesoConversion;
  if (realVbucksPaid < 0) return NextResponse.json({ error: "El cashback no puede exceder el total." }, { status: 400 });

  let cashbackGenerated = 0, cost = 0, revenue = 0, profit = 0;
  if (!esSorteo) {
    if (type === "regalo") {
      cashbackGenerated = (realVbucksPaid / 1000) * config.cashback_regalo;
      cost = (realVbucksPaid / 100) * config.costo_por_100v;
      revenue = (realVbucksPaid / 100) * config.precio_por_100v;
      profit = revenue - cost - cashbackGenerated;
    } else if (type === "codigo") {
      cashbackGenerated = (realVbucksPaid / 1000) * config.cashback_codigo;
    }
  }

  const result = await prisma.$transaction(async (tx) => {
    const sale = await tx.ventaSscm.create({
      data: {
        cliente_id: clientId, periodo_id: period.id, configuracion_id: config.id,
        cuenta_id: body.cuenta_id ? parseInt(body.cuenta_id) : null,
        usuario_id: 1,
        tipo: type, pavos_total: totalVbucks, pavos_cashback_usado: vbucksCashbackUsed,
        pesos_cashback_usado: pesosCashbackUsed, pavos_por_conversion: vbucksFromPesoConversion,
        pavos_reales_pagados: realVbucksPaid, cashback_generado: cashbackGenerated,
        costo: cost, ingreso: revenue, ganancia: profit, es_sorteo: esSorteo,
        notas: body.notes || null, fecha,
      },
    });

    if (type === "regalo" && body.cuenta_id) {
      const cuenta = await tx.cuenta.findUnique({ where: { id: parseInt(body.cuenta_id) }, select: { pavos: true } });
      if (cuenta && cuenta.pavos < totalVbucks) throw new Error(`La cuenta no tiene suficientes pavos. Tiene ${cuenta.pavos}V.`);
      await tx.cuenta.update({ where: { id: parseInt(body.cuenta_id) }, data: { pavos: { decrement: totalVbucks } } });
    }

    let bp = client.bolsa_pavos - vbucksCashbackUsed;
    let bpe = client.bolsa_pesos - pesosCashbackUsed;
    if (!esSorteo) { if (type === "regalo") bpe += cashbackGenerated; else bp += cashbackGenerated; }
    await tx.cliente.update({ where: { id: clientId }, data: { bolsa_pavos: bp, bolsa_pesos: bpe } });
    return sale;
  });

  return NextResponse.json(result);
}
