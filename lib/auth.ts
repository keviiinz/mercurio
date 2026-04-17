import { cookies } from "next/headers";
import { prisma } from "./prisma";

export const COOKIE_NAME = "mercurio_session";

export async function getSession() {
  const store = await cookies();
  const userId = store.get(COOKIE_NAME)?.value;
  if (!userId) return null;
  const user = await prisma.usuario.findUnique({
    where: { id: parseInt(userId) },
    select: { id: true, username: true, nombre: true, punto_de_venta: true, rol: true, activo: true },
  });
  if (!user || !user.activo) return null;
  return user;
}
