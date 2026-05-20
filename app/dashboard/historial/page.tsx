"use client";

import { useEffect, useState } from "react";

interface ItemVenta { id: number; cantidad: number; precio_unit: number; producto: { nombre: string }; }
interface Venta { id: number; total: number; fecha: string; notas: string | null; items: ItemVenta[]; }

const cardBg = "#16181f";
const border = "#1e2130";
const textMuted = "#5a5f7a";
const textLight = "#e8eaf0";
const PAGE_SIZE = 10;

export default function HistorialPage() {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetch("/api/base/ventas").then(r => r.json()).then(data => { setVentas(data); setLoading(false); });
  }, []);

  const filtered = ventas.filter(v => {
    const fecha = new Date(v.fecha);
    if (desde && fecha < new Date(desde + "T00:00:00")) return false;
    if (hasta && fecha > new Date(hasta + "T23:59:59")) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalFiltrado = filtered.reduce((acc, v) => acc + v.total, 0);

  function resetFiltros() { setDesde(""); setHasta(""); setPage(1); }

  const inputStyle = {
    background: "#0f1117", border: `1px solid ${border}`, borderRadius: 6,
    padding: "7px 10px", color: textLight, fontSize: 13, outline: "none",
  };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "80vh", color: textMuted, fontSize: 13 }}>
      Cargando historial...
    </div>
  );

  return (
    <div style={{ padding: 40, backgroundColor: "#0f1117", minHeight: "100vh" }}>

      {/* Header */}
      <div style={{ marginBottom: 24, borderBottom: `1px solid ${border}`, paddingBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: textLight, margin: 0 }}>Historial de Ventas</h1>
          <p style={{ fontSize: 13, color: textMuted, margin: "4px 0 0" }}>
            {filtered.length === ventas.length
              ? `${ventas.length} ventas registradas`
              : `${filtered.length} de ${ventas.length} ventas`}
          </p>
        </div>
        {filtered.length > 0 && (
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: textMuted, letterSpacing: "0.06em", textTransform: "uppercase", margin: "0 0 4px" }}>
              {desde || hasta ? "Total filtrado" : "Total acumulado"}
            </p>
            <p style={{ fontSize: 22, fontWeight: 700, color: "#4a9c6a", margin: 0 }}>${totalFiltrado.toFixed(2)}</p>
          </div>
        )}
      </div>

      {/* Filtros de fecha */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        <span style={{ fontSize: 12, color: textMuted, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>Filtrar por fecha</span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <label style={{ fontSize: 12, color: textMuted }}>Desde</label>
          <input
            type="date"
            value={desde}
            onChange={e => { setDesde(e.target.value); setPage(1); }}
            style={inputStyle}
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <label style={{ fontSize: 12, color: textMuted }}>Hasta</label>
          <input
            type="date"
            value={hasta}
            onChange={e => { setHasta(e.target.value); setPage(1); }}
            style={inputStyle}
          />
        </div>
        {(desde || hasta) && (
          <button
            onClick={resetFiltros}
            style={{ background: "transparent", border: `1px solid ${border}`, borderRadius: 6, padding: "7px 14px", color: textMuted, fontSize: 12, cursor: "pointer" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#e05252"; e.currentTarget.style.color = "#e05252"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = border; e.currentTarget.style.color = textMuted; }}
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Lista */}
      {filtered.length === 0
        ? <p style={{ color: textMuted, fontSize: 13, fontStyle: "italic" }}>
            {ventas.length === 0 ? "No hay ventas registradas aún." : "No hay ventas en el rango de fechas seleccionado."}
          </p>
        : <>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 700 }}>
              {paginated.map((venta, idx) => {
                const globalIdx = filtered.length - (page - 1) * PAGE_SIZE - idx;
                return (
                  <div key={venta.id} style={{ backgroundColor: cardBg, border: `1px solid ${border}`, borderRadius: 8, overflow: "hidden" }}>
                    <div
                      onClick={() => setExpanded(expanded === venta.id ? null : venta.id)}
                      style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", cursor: "pointer" }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#1c1e28")}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: textMuted, minWidth: 28 }}>#{globalIdx}</span>
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 600, color: textLight, margin: "0 0 3px" }}>
                            {venta.items.map(i => i.producto.nombre).join(", ")}
                          </p>
                          <p style={{ fontSize: 11, color: textMuted, margin: 0 }}>
                            {new Date(venta.fecha).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                            {venta.notas && ` · ${venta.notas}`}
                          </p>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <span style={{ fontSize: 15, fontWeight: 700, color: "#4a9c6a" }}>${venta.total.toFixed(2)}</span>
                        <span style={{ fontSize: 12, color: textMuted, transform: expanded === venta.id ? "rotate(180deg)" : "none", transition: "transform 0.2s", display: "inline-block" }}>▾</span>
                      </div>
                    </div>

                    {expanded === venta.id && (
                      <div style={{ borderTop: `1px solid ${border}`, padding: "12px 20px 16px" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                          <thead>
                            <tr>
                              {["Producto", "Cant.", "Precio", "Subtotal"].map(h => (
                                <th key={h} style={{ fontSize: 10, fontWeight: 600, color: textMuted, letterSpacing: "0.06em", textTransform: "uppercase", textAlign: h === "Producto" ? "left" : "right", paddingBottom: 8, borderBottom: `1px solid ${border}` }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {venta.items.map(item => (
                              <tr key={item.id}>
                                <td style={{ fontSize: 13, color: textLight, padding: "8px 0", borderBottom: `1px solid ${border}` }}>{item.producto.nombre}</td>
                                <td style={{ fontSize: 13, color: textMuted, textAlign: "right", padding: "8px 0", borderBottom: `1px solid ${border}` }}>×{item.cantidad}</td>
                                <td style={{ fontSize: 13, color: textMuted, textAlign: "right", padding: "8px 0", borderBottom: `1px solid ${border}` }}>${item.precio_unit.toFixed(2)}</td>
                                <td style={{ fontSize: 13, fontWeight: 600, color: textLight, textAlign: "right", padding: "8px 0", borderBottom: `1px solid ${border}` }}>${(item.cantidad * item.precio_unit).toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr>
                              <td colSpan={3} style={{ fontSize: 12, fontWeight: 600, color: textMuted, textTransform: "uppercase", letterSpacing: "0.06em", paddingTop: 10, textAlign: "right", paddingRight: 8 }}>Total</td>
                              <td style={{ fontSize: 16, fontWeight: 700, color: "#4a9c6a", textAlign: "right", paddingTop: 10 }}>${venta.total.toFixed(2)}</td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 24, maxWidth: 700 }}>
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 6, padding: "7px 14px", color: page === 1 ? textMuted : textLight, fontSize: 13, cursor: page === 1 ? "not-allowed" : "pointer", opacity: page === 1 ? 0.4 : 1 }}
                >
                  ← Anterior
                </button>
                <span style={{ fontSize: 13, color: textMuted, padding: "0 8px" }}>
                  Página {page} de {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 6, padding: "7px 14px", color: page === totalPages ? textMuted : textLight, fontSize: 13, cursor: page === totalPages ? "not-allowed" : "pointer", opacity: page === totalPages ? 0.4 : 1 }}
                >
                  Siguiente →
                </button>
              </div>
            )}
          </>
      }
    </div>
  );
}
