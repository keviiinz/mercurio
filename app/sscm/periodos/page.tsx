"use client";

import { useEffect, useState } from "react";

interface Period {
  id: number;
  nombre: string;
  mes: number;
  anio: number;
  activo: boolean;
  _count: { ventas: number };
}

interface Sale {
  id: number;
  tipo: string;
  pavos_total: number;
  pavos_reales_pagados: number;
  pavos_cashback_usado: number;
  pesos_cashback_usado: number;
  cashback_generado: number;
  ganancia: number;
  fecha: string;
  notas: string | null;
  cliente: { nombre_real: string; nombre_juego: string; id: number };
}

interface PeriodDetail {
  id: number;
  nombre: string;
  activo: boolean;
  ventas: Sale[];
}

const gold = "#c9a84c";
const cardBg = "#131310";
const border = "#2a2a1a";
const textMuted = "#6a6a5a";
const textLight = "#c8c8b8";
const editText = "#16691e";

export default function PeriodsPage() {
  const [periods, setPeriods] = useState<Period[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodDetail | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ month: "", year: "", active: false });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [editForm, setEditForm] = useState({ tipo: "", pavos_total: "", pavos_cashback_usado: "", pesos_cashback_usado: "", notas: "", fecha: "" });
  const [editSaving, setEditSaving] = useState(false);
  const [editMessage, setEditMessage] = useState("");

  useEffect(() => { loadPeriods(); }, []);

  async function loadPeriods() {
    const res = await fetch("/api/sscm/periodos");
    const data = await res.json();
    setPeriods(data);
  }

  async function handleSelectPeriod(id: number) {
    if (selectedPeriod?.id === id) { setSelectedPeriod(null); return; }
    setLoadingDetail(true);
    const res = await fetch(`/api/sscm/periodos/${id}`);
    const data = await res.json();
    setSelectedPeriod(data);
    setLoadingDetail(false);
  }

  async function handleSetActive(id: number) {
    await fetch(`/api/sscm/periodos/${id}`, { method: "PUT" });
    loadPeriods();
    if (selectedPeriod?.id === id) setSelectedPeriod({ ...selectedPeriod, activo: true });
  }

  async function handleCreate() {
    if (!form.month) { setMessage("✗ Selecciona un mes."); return; }
    if (!form.year || parseInt(form.year) < 2000) { setMessage("✗ Ingresa un año válido."); return; }
    setSaving(true); setMessage("");
    try {
      const res = await fetch("/api/sscm/periodos", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month: parseInt(form.month), year: parseInt(form.year), active: form.active }),
      });
      const data = await res.json();
      if (res.ok) { setMessage("✦ Periodo creado."); setForm({ month: "", year: "", active: false }); setShowForm(false); loadPeriods(); }
      else setMessage(`✗ ${data.error}`);
    } catch { setMessage("✗ Error de conexión."); }
    finally { setSaving(false); }
  }

  function handleEditSale(venta: Sale) {
    setEditingSale(venta);
    setEditForm({ tipo: venta.tipo, pavos_total: venta.pavos_total.toString(), pavos_cashback_usado: venta.pavos_cashback_usado?.toString() ?? "0", pesos_cashback_usado: venta.pesos_cashback_usado?.toString() ?? "0", notas: venta.notas ?? "", fecha: new Date(venta.fecha).toISOString().split("T")[0] });
    setEditMessage("");
  }

  async function handleSaveEdit() {
    if (!editingSale) return;
    setEditSaving(true); setEditMessage("");
    try {
      const res = await fetch(`/api/sscm/ventas/${editingSale.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editForm) });
      const data = await res.json();
      if (res.ok) { setEditingSale(null); handleSelectPeriod(selectedPeriod!.id); }
      else setEditMessage(`✗ ${data.error}`);
    } catch { setEditMessage("✗ Error de conexión."); }
    finally { setEditSaving(false); }
  }

  async function handleDeleteSale(saleId: number) {
    if (!window.confirm("¿Seguro que quieres eliminar esta venta?")) return;
    try {
      const res = await fetch(`/api/sscm/ventas/${saleId}`, { method: "DELETE" });
      if (res.ok) { loadPeriods(); handleSelectPeriod(selectedPeriod!.id); }
    } catch { alert("Error al eliminar la venta."); }
  }

  const monthNames = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

  const periodTotals = selectedPeriod ? {
    totalVbucks: selectedPeriod.ventas.reduce((acc, v) => acc + v.pavos_reales_pagados, 0),
    totalGanancia: selectedPeriod.ventas.filter(v => v.tipo === "regalo").reduce((acc, v) => acc + v.ganancia, 0),
    totalVentas: selectedPeriod.ventas.length,
  } : null;

  const inputStyle = { width: "100%", backgroundColor: "#0f0f0f", border: `1px solid ${border}`, borderRadius: "4px", padding: "10px 14px", color: textLight, fontFamily: "'Crimson Text', serif", fontSize: "14px", outline: "none", boxSizing: "border-box" as const };
  const labelStyle = { fontFamily: "'Cinzel', serif", fontSize: "10px", color: textMuted, letterSpacing: "0.12em", textTransform: "uppercase" as const, display: "block", marginBottom: "8px" };

  return (
    <div style={{ padding: "40px", backgroundColor: "#0a0a0a", minHeight: "100vh" }}>

      <div style={{ marginBottom: "32px", borderBottom: `1px solid ${border}`, paddingBottom: "24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ height: "1px", width: "30px", background: `linear-gradient(to right, transparent, ${gold})` }} />
          <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: "22px", fontWeight: 700, color: gold, margin: 0, letterSpacing: "0.15em", textTransform: "uppercase" }}>Periodos</h1>
          <div style={{ height: "1px", width: "60px", background: `linear-gradient(to right, ${gold}, transparent)` }} />
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{ fontFamily: "'Cinzel', serif", fontSize: "11px", letterSpacing: "0.12em", backgroundColor: "#1a1a0f", color: gold, border: `1px solid ${gold}66`, borderRadius: "4px", padding: "8px 16px", cursor: "pointer" }}>
          {showForm ? "✕ CANCELAR" : "+ NUEVO PERIODO"}
        </button>
      </div>

      {showForm && (
        <div style={{ backgroundColor: cardBg, border: `1px solid ${border}`, borderRadius: "4px", padding: "24px", marginBottom: "28px", maxWidth: "480px", position: "relative" }}>
          <span style={{ position: "absolute", top: 8, left: 8, color: gold, fontSize: "8px", opacity: 0.4 }}>✦</span>
          <span style={{ position: "absolute", top: 8, right: 8, color: gold, fontSize: "8px", opacity: 0.4 }}>✦</span>
          <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: "13px", color: gold, letterSpacing: "0.12em", textTransform: "uppercase", margin: "0 0 20px" }}>Nuevo Periodo</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={labelStyle}>Mes <span style={{ color: "#c0392b" }}>*</span></label>
              <select value={form.month} onChange={(e) => setForm({ ...form, month: e.target.value })} style={{ ...inputStyle, appearance: "none" as const }}>
                <option value="">Selecciona un mes</option>
                {monthNames.map((name, i) => <option key={i + 1} value={i + 1}>{name}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Año <span style={{ color: "#c0392b" }}>*</span></label>
              <input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} placeholder="2026" style={inputStyle} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <input type="checkbox" id="active" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} style={{ width: "16px", height: "16px", accentColor: gold }} />
              <label htmlFor="active" style={{ fontFamily: "'Cinzel', serif", fontSize: "11px", color: textMuted, letterSpacing: "0.1em" }}>MARCAR COMO ACTIVO</label>
            </div>
            {message && <p style={{ color: message.startsWith("✦") ? "#4a7c59" : "#8b3a2a", fontStyle: "italic", fontSize: "13px", margin: 0 }}>{message}</p>}
            <button onClick={handleCreate} disabled={saving} style={{ fontFamily: "'Cinzel', serif", fontSize: "11px", letterSpacing: "0.12em", backgroundColor: "#1a1a0f", color: gold, border: `1px solid ${gold}66`, borderRadius: "4px", padding: "10px", cursor: "pointer", opacity: saving ? 0.5 : 1 }}>
              {saving ? "GUARDANDO..." : "CREAR PERIODO"}
            </button>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {periods.length === 0 ? (
            <p style={{ color: textMuted, fontStyle: "italic", fontSize: "13px" }}>No hay periodos registrados.</p>
          ) : periods.map((period) => (
            <div key={period.id} onClick={() => handleSelectPeriod(period.id)} style={{
              backgroundColor: cardBg, borderRadius: "4px", padding: "16px 20px", cursor: "pointer",
              border: `1px solid ${selectedPeriod?.id === period.id ? gold + "55" : border}`,
              transition: "border-color 0.2s",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  {period.activo && (
                    <span style={{ fontFamily: "'Cinzel', serif", fontSize: "9px", letterSpacing: "0.1em", backgroundColor: "#1a2a1a", color: "#4a7c59", border: "1px solid #2a4a2a", borderRadius: "2px", padding: "2px 8px" }}>ACTIVO</span>
                  )}
                  <div>
                    <p style={{ fontFamily: "'Cinzel', serif", fontSize: "13px", color: textLight, margin: "0 0 4px" }}>{period.nombre}</p>
                    <p style={{ fontSize: "12px", color: textMuted, fontStyle: "italic", margin: 0 }}>{period._count.ventas} ventas</p>
                  </div>
                </div>
                {!period.activo && (
                  <button onClick={(e) => { e.stopPropagation(); handleSetActive(period.id); }} style={{ fontFamily: "'Cinzel', serif", fontSize: "10px", letterSpacing: "0.08em", backgroundColor: "transparent", color: textMuted, border: `1px solid ${border}`, borderRadius: "4px", padding: "4px 10px", cursor: "pointer" }}>
                    MARCAR ACTIVO
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div>
          {loadingDetail ? (
            <p style={{ color: textMuted, fontStyle: "italic", fontSize: "13px" }}>Cargando...</p>
          ) : selectedPeriod ? (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                <span style={{ color: gold, fontSize: "12px" }}>📜</span>
                <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: "13px", color: gold, letterSpacing: "0.12em", textTransform: "uppercase", margin: 0 }}>{selectedPeriod.nombre}</h2>
                <div style={{ flex: 1, height: "1px", background: `linear-gradient(to right, ${border}, transparent)` }} />
              </div>

              {periodTotals && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "16px" }}>
                  {[
                    { label: "Ventas", value: String(periodTotals.totalVentas), accent: textLight },
                    { label: "Pavos", value: `${periodTotals.totalVbucks.toLocaleString()}V`, accent: "#8b6914" },
                    { label: "Ganancia", value: `$${periodTotals.totalGanancia.toFixed(2)}`, accent: "#4a7c59" },
                  ].map(({ label, value, accent }) => (
                    <div key={label} style={{ backgroundColor: cardBg, border: `1px solid ${border}`, borderRadius: "4px", padding: "12px" }}>
                      <p style={{ fontFamily: "'Cinzel', serif", fontSize: "9px", color: textMuted, letterSpacing: "0.12em", textTransform: "uppercase", margin: "0 0 6px" }}>{label}</p>
                      <p style={{ fontFamily: "'Cinzel', serif", fontSize: "16px", fontWeight: 700, color: accent, margin: 0 }}>{value}</p>
                    </div>
                  ))}
                </div>
              )}

              {selectedPeriod.ventas.length === 0 ? (
                <p style={{ color: textMuted, fontStyle: "italic", fontSize: "13px" }}>No hay ventas en este periodo.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {selectedPeriod.ventas.map((venta) => (
                    <div key={venta.id} style={{ backgroundColor: cardBg, border: `1px solid ${border}`, borderRadius: "4px", padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ fontFamily: "'Cinzel', serif", fontSize: "10px", padding: "2px 8px", borderRadius: "2px", letterSpacing: "0.08em", backgroundColor: venta.tipo === "regalo" ? "#1a2a1a" : "#1a1a2a", color: venta.tipo === "regalo" ? "#4a7c59" : "#7a6a9a", border: `1px solid ${venta.tipo === "regalo" ? "#2a4a2a" : "#2a2a4a"}` }}>
                            {venta.tipo === "regalo" ? "REGALO" : "CÓDIGO"}
                          </span>
                          <a href={`/sscm/clientes/${venta.cliente.id}`} style={{ fontFamily: "'Cinzel', serif", fontSize: "12px", color: textLight, textDecoration: "none" }}
                            onMouseEnter={e => (e.currentTarget.style.color = gold)}
                            onMouseLeave={e => (e.currentTarget.style.color = textLight)}>
                            {venta.cliente.nombre_real}
                          </a>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ fontSize: "11px", color: textMuted }}>{new Date(venta.fecha).toLocaleDateString("es-MX")}</span>
                          <button onClick={() => handleEditSale(venta)} style={{ fontFamily: "'Cinzel', serif", fontSize: "10px", backgroundColor: "transparent", color: editText, border: `1px solid #0e3612`, borderRadius: "3px", padding: "3px 8px", cursor: "pointer", letterSpacing: "0.08em" }}>EDITAR</button>
                          <button onClick={() => handleDeleteSale(venta.id)} style={{ fontFamily: "'Cinzel', serif", fontSize: "10px", backgroundColor: "transparent", color: "#8b3a2a", border: "1px solid #3a1a1a", borderRadius: "3px", padding: "3px 8px", cursor: "pointer", letterSpacing: "0.08em" }}>ELIMINAR</button>
                        </div>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                        <span style={{ color: textMuted }}>{venta.pavos_reales_pagados.toLocaleString()}V reales</span>
                        {venta.tipo === "regalo"
                          ? <span style={{ color: "#4a7c59", fontFamily: "'Cinzel', serif" }}>+${venta.ganancia.toFixed(2)}</span>
                          : <span style={{ color: "#7a6a9a", fontFamily: "'Cinzel', serif" }}>+{venta.cashback_generado.toFixed(0)}V cashback</span>
                        }
                      </div>
                      {venta.notas && <p style={{ color: textMuted, fontSize: "11px", fontStyle: "italic", margin: "8px 0 0", borderTop: `1px solid ${border}`, paddingTop: "6px" }}>{venta.notas}</p>}
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <p style={{ color: textMuted, fontStyle: "italic", fontSize: "13px" }}>Selecciona un periodo para ver sus ventas.</p>
          )}
        </div>
      </div>

      {editingSale && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
          <div style={{ backgroundColor: "#0f0f0f", border: `1px solid ${border}`, borderRadius: "4px", padding: "28px", width: "100%", maxWidth: "440px", position: "relative" }}>
            <span style={{ position: "absolute", top: 8, left: 8, color: gold, fontSize: "8px", opacity: 0.4 }}>✦</span>
            <span style={{ position: "absolute", top: 8, right: 8, color: gold, fontSize: "8px", opacity: 0.4 }}>✦</span>
            <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: "13px", color: gold, letterSpacing: "0.12em", textTransform: "uppercase", margin: "0 0 20px" }}>
              Editar Venta — {editingSale.cliente.nombre_real}
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={labelStyle}>Tipo</label>
                <div style={{ display: "flex", gap: "8px" }}>
                  {["regalo", "codigo"].map((t) => (
                    <button key={t} onClick={() => setEditForm({ ...editForm, tipo: t })} style={{ flex: 1, fontFamily: "'Cinzel', serif", fontSize: "11px", letterSpacing: "0.1em", padding: "8px", borderRadius: "4px", cursor: "pointer", border: `1px solid ${editForm.tipo === t ? gold + "66" : border}`, backgroundColor: editForm.tipo === t ? "#1a1a0f" : "transparent", color: editForm.tipo === t ? gold : textMuted }}>
                      {t === "regalo" ? "REGALO" : "CÓDIGO"}
                    </button>
                  ))}
                </div>
              </div>
              {[
                { label: "Total de Pavos", key: "pavos_total", type: "number" },
                { label: "Pavos de Bolsa Usados", key: "pavos_cashback_usado", type: "number" },
                { label: "Pesos de Bolsa Usados", key: "pesos_cashback_usado", type: "number" },
                { label: "Fecha", key: "fecha", type: "date" },
                { label: "Notas", key: "notas", type: "text" },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label style={labelStyle}>{label}</label>
                  <input type={type} value={editForm[key as keyof typeof editForm] as string} onChange={(e) => setEditForm({ ...editForm, [key]: e.target.value })} style={inputStyle} placeholder={key === "notas" ? "Opcional" : ""} />
                </div>
              ))}
              {editMessage && <p style={{ color: "#8b3a2a", fontStyle: "italic", fontSize: "13px", margin: 0 }}>{editMessage}</p>}
              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={handleSaveEdit} disabled={editSaving} style={{ flex: 1, fontFamily: "'Cinzel', serif", fontSize: "11px", letterSpacing: "0.1em", backgroundColor: "#1a1a0f", color: gold, border: `1px solid ${gold}66`, borderRadius: "4px", padding: "10px", cursor: "pointer", opacity: editSaving ? 0.5 : 1 }}>
                  {editSaving ? "GUARDANDO..." : "GUARDAR"}
                </button>
                <button onClick={() => setEditingSale(null)} style={{ flex: 1, fontFamily: "'Cinzel', serif", fontSize: "11px", letterSpacing: "0.1em", backgroundColor: "transparent", color: textMuted, border: `1px solid ${border}`, borderRadius: "4px", padding: "10px", cursor: "pointer" }}>
                  CANCELAR
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
