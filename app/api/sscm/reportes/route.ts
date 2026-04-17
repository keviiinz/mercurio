import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const periodId = searchParams.get("period_id");
  const where = periodId ? { periodo_id: parseInt(periodId) } : {};

  const sales = await prisma.ventaSscm.findMany({
    where, include: { cliente: true }, orderBy: { fecha: "desc" },
  });

  const giftSales = sales.filter(s => s.tipo === "regalo");
  const codeSales = sales.filter(s => s.tipo === "codigo");

  const clientMap: Record<number, any> = {};
  for (const s of sales) {
    const cid = s.cliente_id;
    if (!clientMap[cid]) clientMap[cid] = { id: cid, nombre_real: s.cliente.nombre_real, nombre_juego: s.cliente.nombre_juego, totalVbucks: 0, totalRevenue: 0, totalProfit: 0, totalSales: 0, cashbackPesos: 0, cashbackPavos: 0 };
    clientMap[cid].totalVbucks += s.pavos_reales_pagados;
    clientMap[cid].totalSales += 1;
    if (s.tipo === "regalo") { clientMap[cid].totalRevenue += s.ingreso; clientMap[cid].totalProfit += s.ganancia; clientMap[cid].cashbackPesos += s.cashback_generado; }
    else { clientMap[cid].cashbackPavos += s.cashback_generado; }
  }

  return NextResponse.json({
    summary: {
      totalSales: sales.length, giftSales: giftSales.length, codeSales: codeSales.length,
      totalVbucks: sales.reduce((a, s) => a + s.pavos_reales_pagados, 0),
      totalRevenue: giftSales.reduce((a, s) => a + s.ingreso, 0),
      totalCost: giftSales.reduce((a, s) => a + s.costo, 0),
      totalProfit: giftSales.reduce((a, s) => a + s.ganancia, 0),
      totalCashbackPesos: giftSales.reduce((a, s) => a + s.cashback_generado, 0),
      totalCashbackPavos: codeSales.reduce((a, s) => a + s.cashback_generado, 0),
    },
    clientSummary: Object.values(clientMap).sort((a, b) => b.totalVbucks - a.totalVbucks),
  });
}
