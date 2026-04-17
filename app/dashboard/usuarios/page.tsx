import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import UsuariosClient from "./UsuariosClient";

export default async function UsuariosPage() {
  const session = await getSession();
  if (!session || session.rol !== "admin") redirect("/dashboard");
  return <UsuariosClient />;
}
