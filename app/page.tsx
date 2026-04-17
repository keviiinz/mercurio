import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import Link from "next/link";

export default async function RootPage() {
  const session = await getSession();
  if (session) {
    redirect(session.punto_de_venta === "sscm" ? "/sscm" : "/dashboard");
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0a0b0f", fontFamily: "system-ui, sans-serif", overflowX: "hidden" }}>

      {/* Nav */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 48px", height: 60, backgroundColor: "rgba(10,11,15,0.85)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg, #6c63ff, #4a90e2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#fff" }}>◈</div>
          <span style={{ fontSize: 16, fontWeight: 700, color: "#e8eaf0" }}>Mercurio</span>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Link href="/login" style={{ fontSize: 13, fontWeight: 500, color: "#8b90a8", textDecoration: "none", padding: "7px 16px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.08)", transition: "all 0.2s" }}>Iniciar sesión</Link>
          <Link href="/register" style={{ fontSize: 13, fontWeight: 600, color: "#fff", textDecoration: "none", padding: "7px 16px", borderRadius: 6, background: "linear-gradient(135deg, #6c63ff, #4a90e2)", transition: "all 0.2s" }}>Registrarse</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "120px 24px 80px", position: "relative" }}>
        {/* Glow BG */}
        <div style={{ position: "absolute", top: "30%", left: "50%", transform: "translate(-50%, -50%)", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(108,99,255,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, backgroundColor: "rgba(108,99,255,0.1)", border: "1px solid rgba(108,99,255,0.25)", borderRadius: 20, padding: "5px 14px", marginBottom: 28 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#6c63ff", display: "inline-block" }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: "#8b8eff", letterSpacing: "0.06em" }}>PLATAFORMA MULTI-POS</span>
        </div>

        <h1 style={{ fontSize: "clamp(36px, 6vw, 64px)", fontWeight: 800, color: "#e8eaf0", margin: "0 0 20px", lineHeight: 1.15, maxWidth: 720 }}>
          Gestiona tus puntos de{" "}
          <span style={{ background: "linear-gradient(135deg, #6c63ff, #4a90e2)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            venta
          </span>{" "}
          desde un solo lugar
        </h1>

        <p style={{ fontSize: 17, color: "#5a5f7a", maxWidth: 520, margin: "0 0 40px", lineHeight: 1.7 }}>
          Mercurio centraliza la operación de múltiples puntos de venta. Control de clientes, inventario, ventas y reportes en una sola plataforma.
        </p>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
          <Link href="/register" style={{ fontSize: 14, fontWeight: 700, color: "#fff", textDecoration: "none", padding: "13px 28px", borderRadius: 8, background: "linear-gradient(135deg, #6c63ff, #4a90e2)", boxShadow: "0 4px 24px rgba(108,99,255,0.3)", letterSpacing: "0.02em" }}>
            Crear cuenta gratis
          </Link>
          <Link href="/login" style={{ fontSize: 14, fontWeight: 600, color: "#8b90a8", textDecoration: "none", padding: "13px 28px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", backgroundColor: "rgba(255,255,255,0.03)", letterSpacing: "0.02em" }}>
            Ya tengo cuenta →
          </Link>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: "80px 48px", maxWidth: 1100, margin: "0 auto" }}>
        <h2 style={{ fontSize: 13, fontWeight: 700, color: "#6c63ff", letterSpacing: "0.12em", textTransform: "uppercase", textAlign: "center", marginBottom: 16 }}>Todo en uno</h2>
        <p style={{ fontSize: 22, fontWeight: 700, color: "#e8eaf0", textAlign: "center", margin: "0 0 56px" }}>Cada punto de venta, su propia experiencia</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
          {[
            { icon: "◈", title: "Inventario", desc: "Control de productos y stock en tiempo real para el punto de venta base.", color: "#6c63ff" },
            { icon: "◉", title: "Clientes", desc: "Registro de clientes, historial de compras y sistema de cashback integrado.", color: "#4a90e2" },
            { icon: "≡", title: "Reportes", desc: "Análisis de ventas por periodo, desglose de ganancias y métricas clave.", color: "#4a9c6a" },
            { icon: "◎", title: "Multi-usuario", desc: "Roles de operador y admin. Cada usuario accede a su punto de venta.", color: "#c9a84c" },
          ].map(({ icon, title, desc, color }) => (
            <div key={title} style={{ backgroundColor: "#16181f", border: "1px solid #1e2130", borderRadius: 10, padding: 24, position: "relative", overflow: "hidden" }}>
              <div style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color, marginBottom: 16 }}>{icon}</div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#e8eaf0", margin: "0 0 8px" }}>{title}</h3>
              <p style={{ fontSize: 13, color: "#5a5f7a", margin: 0, lineHeight: 1.6 }}>{desc}</p>
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: `linear-gradient(to right, transparent, ${color}44, transparent)` }} />
            </div>
          ))}
        </div>
      </section>

      {/* CTA Bottom */}
      <section style={{ padding: "80px 24px", textAlign: "center" }}>
        <div style={{ maxWidth: 520, margin: "0 auto", backgroundColor: "#16181f", border: "1px solid #1e2130", borderRadius: 12, padding: "48px 32px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(to right, transparent, #6c63ff, #4a90e2, transparent)" }} />
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "#e8eaf0", margin: "0 0 10px" }}>Empieza ahora</h2>
          <p style={{ fontSize: 14, color: "#5a5f7a", margin: "0 0 28px", lineHeight: 1.6 }}>Crea tu cuenta en segundos y accede a tu punto de venta base de inmediato.</p>
          <Link href="/register" style={{ fontSize: 14, fontWeight: 700, color: "#fff", textDecoration: "none", padding: "12px 32px", borderRadius: 8, background: "linear-gradient(135deg, #6c63ff, #4a90e2)", display: "inline-block" }}>
            Registrarse →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: "24px 48px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 12, color: "#3a3f5a" }}>© 2026 Mercurio</span>
        <div style={{ display: "flex", gap: 20 }}>
          <Link href="/login" style={{ fontSize: 12, color: "#3a3f5a", textDecoration: "none" }}>Iniciar sesión</Link>
          <Link href="/register" style={{ fontSize: 12, color: "#3a3f5a", textDecoration: "none" }}>Registrarse</Link>
        </div>
      </footer>
    </div>
  );
}
