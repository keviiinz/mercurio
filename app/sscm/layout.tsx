import Sidebar from "@/app/components/Sidebar";
import { getSession } from "@/lib/auth";

export default async function SscmLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0a0a0a" }}>
      <Sidebar tipo="sscm" rol={session?.rol ?? "operador"} activo={session?.activo ?? true} />
      <main style={{ marginLeft: 220, flex: 1, minHeight: "100vh" }}>
        {!session?.activo && (
          <div style={{ background: "rgba(180,40,40,0.1)", borderBottom: "1px solid rgba(180,40,40,0.3)", padding: "10px 32px", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 16, color: "#c96060" }}>⚠</span>
            <p style={{ margin: 0, fontSize: 13, color: "#c96060", fontFamily: "'Crimson Text', serif", fontStyle: "italic" }}>
              Suscripción vencida. Estás en modo lectura — no puedes registrar ventas ni modificar datos.{" "}
              <strong style={{ fontStyle: "normal" }}>Contacta al administrador para renovar.</strong>
            </p>
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
