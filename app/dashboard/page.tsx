"use client";

import { useEffect, useState, useCallback } from "react";

const accent = "#6c63ff";
const cardBg = "#16181f";
const border = "#1e2130";
const textMuted = "#5a5f7a";
const textLight = "#e8eaf0";

export default function DashboardPage() {
  const [productos, setProductos] = useState(0);
  const [ventas, setVentas] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const [pRes, vRes] = await Promise.all([
        fetch("/api/base/productos"),
        fetch("/api/base/ventas"),
      ]);
      const [p, v] = await Promise.all([pRes.json(), vRes.json()]);
      setProductos(Array.isArray(p) ? p.length : 0);
      setVentas(Array.isArray(v) ? v.length : 0);
      setTotal(Array.isArray(v) ? v.reduce((acc: number, s: any) => acc + s.total, 0) : 0);
    } catch {
      setError("No se pudo cargar el dashboard.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", color: textMuted, fontSize: 13 }}>
      Cargando...
    </div>
  );

  if (error) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", flexDirection: "column", gap: 12 }}>
      <p style={{ color: "#e05252", fontSize: 13, background: "rgba(224,82,82,0.08)", border: "1px solid rgba(224,82,82,0.2)", borderRadius: 4, padding: "10px 18px" }}>✗ {error}</p>
      <button onClick={load} style={{ fontSize: 12, fontWeight: 600, color: "#8b90a8", backgroundColor: "transparent", border: "1px solid #1e2130", borderRadius: 6, padding: "7px 16px", cursor: "pointer" }}>Reintentar</button>
    </div>
  );

  return (
    <div style={{ padding: 40, minHeight: "100vh", background: "#0f1117" }}>
      <div style={{ marginBottom: 32, borderBottom: `1px solid ${border}`, paddingBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: textLight, margin: 0 }}>Dashboard</h1>
        <p style={{ fontSize: 13, color: textMuted, margin: "4px 0 0" }}>Resumen del punto de venta</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 }}>
        {[
          { label: "Productos activos", value: String(productos), color: accent },
          { label: "Ventas registradas", value: String(ventas), color: "#4a90e2" },
          { label: "Ingresos totales", value: `$${total.toFixed(2)}`, color: "#4a9c6a" },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 8, padding: 20 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: textMuted, letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 10px" }}>{label}</p>
            <p style={{ fontSize: 26, fontWeight: 700, color, margin: 0 }}>{value}</p>
          </div>
        ))}
      </div>

      <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 8, padding: 24 }}>
        <p style={{ fontSize: 13, color: textMuted, margin: 0, textAlign: "center" }}>
          Usa el menú lateral para gestionar productos y registrar ventas.
        </p>
      </div>
    </div>
  );
}
