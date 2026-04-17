"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

interface SidebarProps {
  tipo: "base" | "sscm";
  rol?: string;
}

const baseNav = [
  { href: "/dashboard", icon: "⌂", label: "Dashboard" },
  { href: "/dashboard/productos", icon: "◈", label: "Productos" },
  { href: "/dashboard/ventas", icon: "+", label: "Nueva Venta" },
  { href: "/dashboard/historial", icon: "≡", label: "Historial" },
  { href: "/dashboard/usuarios", icon: "◎", label: "Usuarios" },
];

const sscmNav = [
  { href: "/sscm", icon: "⌂", label: "Dashboard" },
  { href: "/sscm/ventas", icon: "+", label: "Nueva Venta" },
  { href: "/sscm/clientes", icon: "◉", label: "Clientes" },
  { href: "/sscm/cuentas", icon: "◈", label: "Cuentas" },
  { href: "/sscm/periodos", icon: "◷", label: "Periodos" },
  { href: "/sscm/reportes", icon: "≡", label: "Reportes" },
  { href: "/sscm/configuracion", icon: "⚙", label: "Configuración" },
];

export default function Sidebar({ tipo, rol }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const nav = (tipo === "sscm" ? sscmNav : baseNav).filter(
    item => item.href !== "/dashboard/usuarios" || rol === "admin"
  );
  const isSscm = tipo === "sscm";

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <aside style={{
      width: 220, minHeight: "100vh", position: "fixed", left: 0, top: 0,
      background: isSscm ? "#0f0f0f" : "#16181f",
      borderRight: isSscm ? "1px solid #2a2a1a" : "1px solid #1e2130",
      display: "flex", flexDirection: "column",
    }}>
      {/* Logo */}
      <div style={{ padding: "24px 20px", borderBottom: isSscm ? "1px solid #2a2a1a" : "1px solid #1e2130", textAlign: "center" }}>
        {isSscm ? (
          <>
            <span style={{ fontSize: 26, color: "#c9a84c", display: "block", marginBottom: 8 }}>☀</span>
            <p style={{ fontFamily: "'Cinzel', serif", fontSize: 13, fontWeight: 700, color: "#c9a84c", letterSpacing: "0.15em", textTransform: "uppercase", margin: 0 }}>Solaire&apos;s</p>
            <p style={{ fontSize: 11, color: "#5a5a4a", margin: "4px 0 0", fontStyle: "italic" }}>Customer Manager</p>
          </>
        ) : (
          <>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #6c63ff, #4a90e2)", margin: "0 auto 10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#fff" }}>◈</div>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#e8eaf0", margin: 0 }}>Mercurio</p>
            <p style={{ fontSize: 11, color: "#5a5f7a", margin: "3px 0 0" }}>Punto de Venta</p>
          </>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "12px 10px", display: "flex", flexDirection: "column", gap: 2 }}>
        {nav.map(({ href, icon, label }) => {
          const isActive = pathname === href;
          return (
            <Link key={href} href={href} title={label} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "9px 12px",
              borderRadius: isSscm ? 4 : 6,
              color: isActive ? (isSscm ? "#c9a84c" : "#6c63ff") : (isSscm ? "#8a8a7a" : "#8b90a8"),
              textDecoration: "none", fontSize: 13,
              letterSpacing: isSscm ? "0.05em" : "0.02em",
              fontFamily: isSscm ? "'Cinzel', serif" : "system-ui, sans-serif",
              fontWeight: isActive ? 600 : 400,
              background: isActive ? (isSscm ? "#1a1a0f" : "#1e1a3a") : "transparent",
              border: isActive ? (isSscm ? "1px solid #3a3a1a" : "1px solid #2a2650") : "1px solid transparent",
            }}>
              <span style={{ fontSize: 14, width: 18, textAlign: "center" }}>{icon}</span>
              {label}
            </Link>
          );
        })}

        <button onClick={handleLogout} title="Cerrar Sesión" style={{
          display: "flex", alignItems: "center", gap: 10, padding: "9px 12px",
          borderRadius: isSscm ? 0 : 6,
          color: isSscm ? "#8a8a7a" : "#8b90a8",
          background: "transparent", border: "none",
          borderTop: isSscm ? "1px solid #2a2a1a" : "1px solid #1e2130",
          cursor: "pointer", width: "100%", textAlign: "left",
          fontSize: 13, fontFamily: isSscm ? "'Cinzel', serif" : "system-ui, sans-serif",
          letterSpacing: isSscm ? "0.05em" : "0.02em",
          marginTop: 8, transition: "color 0.2s",
        }}
          onMouseEnter={e => { e.currentTarget.style.color = "#e05252"; }}
          onMouseLeave={e => { e.currentTarget.style.color = isSscm ? "#8a8a7a" : "#8b90a8"; }}
        >
          <span style={{ fontSize: 14, width: 18, textAlign: "center" }}>⏻</span>
          Cerrar Sesión
        </button>
      </nav>
    </aside>
  );
}
