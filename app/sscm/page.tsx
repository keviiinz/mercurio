"use client";

import { useEffect, useState } from "react";

const gold = "#c9a84c";
const cardBg = "#131310";
const border = "#2a2a1a";
const textMuted = "#6a6a5a";
const textLight = "#c8c8b8";

export default function SscmDashboard() {
  const [stats, setStats] = useState({ ventas: 0, clientes: 0, ganancia: 0, bolsaPavos: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [vRes, cRes] = await Promise.all([
          fetch("/api/sscm/ventas"),
          fetch("/api/sscm/clientes"),
        ]);
        const [ventas, clientes] = await Promise.all([vRes.json(), cRes.json()]);
        setStats({
          ventas: ventas.length,
          clientes: clientes.length,
          ganancia: ventas.filter((v: any) => v.tipo === "regalo").reduce((acc: number, v: any) => acc + v.ganancia, 0),
          bolsaPavos: clientes.reduce((acc: number, c: any) => acc + c.bolsa_pavos, 0),
        });
      } catch {
        setError("No se pudo cargar el dashboard.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", color: gold, fontFamily: "'Cinzel', serif", letterSpacing: "0.2em" }}>
      Cargando...
    </div>
  );

  if (error) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
      <p style={{ color: "#c0392b", fontFamily: "'Cinzel', serif", fontSize: 13, border: "1px solid #3a1515", background: "rgba(192,57,43,0.06)", padding: "14px 24px" }}>✗ {error}</p>
    </div>
  );

  return (
    <div style={{ padding: 40, backgroundColor: "#0a0a0a", minHeight: "100vh" }}>
      <div style={{ marginBottom: 32, borderBottom: `1px solid ${border}`, paddingBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ height: 1, width: 30, background: `linear-gradient(to right, transparent, ${gold})` }} />
          <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: 22, fontWeight: 700, color: gold, margin: 0, letterSpacing: "0.15em", textTransform: "uppercase" }}>Dashboard</h1>
          <div style={{ height: 1, flex: 1, background: `linear-gradient(to right, ${gold}, transparent)` }} />
        </div>
        <p style={{ color: textMuted, fontSize: 13, fontStyle: "italic", margin: "8px 0 0 42px" }}>Solaire&apos;s Customer Manager</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        {[
          { label: "Ventas", value: String(stats.ventas), color: textLight },
          { label: "Clientes", value: String(stats.clientes), color: textLight },
          { label: "Ganancia", value: `$${stats.ganancia.toFixed(2)}`, color: "#4a7c59" },
          { label: "Pavos en bolsa", value: `${stats.bolsaPavos.toLocaleString()}V`, color: "#8b6914" },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 4, padding: 20, position: "relative", overflow: "hidden" }}>
            <span style={{ position: "absolute", top: 6, left: 6, color: gold, fontSize: 8, opacity: 0.3 }}>✦</span>
            <span style={{ position: "absolute", top: 6, right: 6, color: gold, fontSize: 8, opacity: 0.3 }}>✦</span>
            <p style={{ fontFamily: "'Cinzel', serif", fontSize: 10, color: textMuted, letterSpacing: "0.15em", textTransform: "uppercase", margin: "0 0 10px" }}>{label}</p>
            <p style={{ fontFamily: "'Cinzel', serif", fontSize: 22, fontWeight: 700, color, margin: 0 }}>{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
