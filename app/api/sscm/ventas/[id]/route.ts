import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

function roundTo100(v: number) { return Math.round(v / 100) * 100; }

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const saleId = parseInt(id);
  const totalVbucks = parseInt(body.pavos_total);
  const vbucksCashbackUsed = parseInt(body.pavos_cashback_usado) || 0;
  const pesosCashbackUsed = parseFloat(body.pesos_cashback_usado) || 0;
  const type = body.tipo;
  const fecha = body.fecha ? new Date(body.fecha) : undefined;

  const originalSale = await prisma.ventaSscm.findUnique({
    where: { id: saleId }, include: { configuracion: true },
  });
  if (!originalSale) return NextResponse.json({ error: "Venta no encontrada" }, { status: 404 });

  const config = originalSale.configuracion;
  const vbucksFromPesoConversion = roundTo100((pesosCashbackUsed / config.precio_por_100v) * 100);
  const realVbucksPaid = totalVbucks - vbucksCashbackUsed - vbucksFromPesoConversion;
  if (realVbucksPaid < 0) return NextResponse.json({ error: "El cashback no puede exceder el total." }, { status: 400 });

  let cashbackGenerated = 0, cost = 0, revenue = 0, profit = 0;
  if (type === "regalo") {
    cashbackGenerated = (realVbucksPaid / 1000) * config.cashback_regalo;
    cost = (realVbucksPaid / 100) * config.costo_por_100v;
    revenue = (realVbucksPaid / 100) * config.precio_por_100v;
    profit = revenue - cost - cashbackGenerated;
  } else if (type === "codigo") {
    cashbackGenerated = (realVbucksPaid / 1000) * config.cashback_codigo;
  }

  const result = await prisma.$transaction(async (tx) => {
    const client = await tx.cliente.findUnique({ where: { id: originalSale.cliente_id }, select: { bolsa_pavos: true, bolsa_pesos: true } });
    let bp = client!.bolsa_pavos + originalSale.pavos_cashback_usado - (originalSale.tipo === "regalo" ? 0 : originalSale.cashback_generado);
    let bpe = client!.bolsa_pesos + originalSale.pesos_cashback_usado - (originalSale.tipo === "regalo" ? originalSale.cashback_generado : 0);
    bp -= vbucksCashbackUsed; bpe -= pesosCashbackUsed;
    if (type === "regalo") bpe += cashbackGenerated; else bp += cashbackGenerated;
    await tx.cliente.update({ where: { id: originalSale.cliente_id }, data: { bolsa_pavos: bp, bolsa_pesos: bpe } });
    return tx.ventaSscm.update({
      where: { id: saleId },
      data: { tipo: type, pavos_total: totalVbucks, pavos_cashback_usado: vbucksCashbackUsed, pesos_cashback_usado: pesosCashbackUsed, pavos_por_conversion: vbucksFromPesoConversion, pavos_reales_pagados: realVbucksPaid, cashback_generado: cashbackGenerated, costo: cost, ingreso: revenue, ganancia: profit, notas: body.notas || null, ...(fecha && { fecha }) },
    });
  });
  return NextResponse.json(result);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sale = await prisma.ventaSscm.findUnique({ where: { id: parseInt(id) } });
  if (!sale) return NextResponse.json({ error: "Venta no encontrada" }, { status: 404 });
  await prisma.$transaction(async (tx) => {
    const client = await tx.cliente.findUnique({ where: { id: sale.cliente_id }, select: { bolsa_pavos: true, bolsa_pesos: true } });
    let bp = client!.bolsa_pavos + sale.pavos_cashback_usado;
    let bpe = client!.bolsa_pesos + sale.pesos_cashback_usado;
    if (sale.tipo === "regalo") bpe -= sale.cashback_generado; else bp -= sale.cashback_generado;
    await tx.cliente.update({ where: { id: sale.cliente_id }, data: { bolsa_pavos: bp, bolsa_pesos: bpe } });
    await tx.ventaSscm.delete({ where: { id: parseInt(id) } });
  });
  return NextResponse.json({ success: true });
}
