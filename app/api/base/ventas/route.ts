import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const ventas = await prisma.ventaBase.findMany({
    where: { usuario_id: session.id },
    include: { items: { include: { producto: true } } },
    orderBy: { fecha: "desc" },
  });
  return NextResponse.json(ventas);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { items, notas } = await req.json();
  if (!items?.length)
    return NextResponse.json({ error: "La venta debe tener al menos un producto." }, { status: 400 });

  const total = items.reduce((acc: number, i: any) => acc + i.cantidad * i.precio_unit, 0);

  const venta = await prisma.$transaction(async (tx) => {
    const nuevaVenta = await tx.ventaBase.create({
      data: {
        usuario_id: session.id,
        total,
        notas: notas || null,
        items: {
          create: items.map((i: any) => ({
            producto_id: i.producto_id,
            cantidad: i.cantidad,
            precio_unit: i.precio_unit,
          })),
        },
      },
      include: { items: { include: { producto: true } } },
    });

    for (const i of items) {
      await tx.producto.update({
        where: { id: i.producto_id },
        data: { stock: { decrement: i.cantidad } },
      });
    }

    return nuevaVenta;
  });

  return NextResponse.json(venta);
}
