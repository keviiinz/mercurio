import Sidebar from "@/app/components/Sidebar";
import { getSession } from "@/lib/auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar tipo="base" rol={session?.rol ?? "operador"} activo={session?.activo ?? true} />
      <main style={{ marginLeft: 220, flex: 1, minHeight: "100vh" }}>
        {!session?.activo && (
          <div style={{ background: "rgba(224,82,82,0.08)", borderBottom: "1px solid rgba(224,82,82,0.2)", padding: "10px 32px", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 16 }}>⚠</span>
            <p style={{ margin: 0, fontSize: 13, color: "#e05252" }}>
              Tu suscripción ha vencido. Estás en modo lectura — no puedes registrar ventas ni modificar productos.{" "}
              <strong>Contacta al administrador para renovar.</strong>
            </p>
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
