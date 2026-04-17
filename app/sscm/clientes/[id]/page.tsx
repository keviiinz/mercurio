"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

const gold = "#c9a84c", cardBg = "#131310", border = "#2a2a1a", textMuted = "#6a6a5a", textLight = "#c8c8b8", editText = "#16691e";
const inputStyle = { width: "100%", backgroundColor: "#0f0f0f", border: `1px solid #2a2a1a`, borderRadius: "4px", padding: "10px 14px", color: textLight, fontFamily: "'Crimson Text', serif", fontSize: "14px", outline: "none", boxSizing: "border-box" as const };
const labelStyle = { fontFamily: "'Cinzel', serif", fontSize: "10px", color: textMuted, letterSpacing: "0.12em", textTransform: "uppercase" as const, display: "block", marginBottom: "8px" };

export default function PerfilClientePage() {
  const { id } = useParams();
  const [cliente, setCliente] = useState<any>(null);
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState({ nombre_real: "", nombre_juego: "" });
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [editingSale, setEditingSale] = useState<any>(null);
  const [editForm, setEditForm] = useState({ tipo: "", pavos_total: "", pavos_cashback_usado: "", pesos_cashback_usado: "", notas: "", fecha: "" });
  const [editSaving, setEditSaving] = useState(false);
  const [editMessage, setEditMessage] = useState("");

  useEffect(() => { cargar(); }, []);
  async function cargar() {
    const r = await fetch(`/api/sscm/clientes/${id}`);
    const d = await r.json(); setCliente(d); setForm({ nombre_real: d.nombre_real, nombre_juego: d.nombre_juego });
  }

  async function handleEditar() {
    setGuardando(true); setMensaje("");
    const res = await fetch(`/api/sscm/clientes/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const d = await res.json();
    if (res.ok) { setEditando(false); cargar(); setMensaje("✦ Cliente actualizado."); } else setMensaje(`✗ ${d.error}`);
    setGuardando(false);
  }

  async function handleEliminar() {
    if (!window.confirm(`¿Eliminar a ${cliente?.nombre_real}?`)) return;
    const res = await fetch(`/api/sscm/clientes/${id}`, { method: "DELETE" });
    if (res.ok) window.location.href = "/sscm/clientes";
    else { const d = await res.json(); setMensaje(`✗ ${d.error}`); }
  }

  function handleEditSale(v: any) {
    setEditingSale(v);
    setEditForm({ tipo: v.tipo, pavos_total: v.pavos_total.toString(), pavos_cashback_usado: v.pavos_cashback_usado?.toString() ?? "0", pesos_cashback_usado: v.pesos_cashback_usado?.toString() ?? "0", notas: v.notas ?? "", fecha: new Date(v.fecha).toISOString().split("T")[0] });
    setEditMessage("");
  }

  async function handleSaveEdit() {
    if (!editingSale) return;
    setEditSaving(true); setEditMessage("");
    const res = await fetch(`/api/sscm/ventas/${editingSale.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editForm) });
    const d = await res.json();
    if (res.ok) { setEditingSale(null); cargar(); } else setEditMessage(`✗ ${d.error}`);
    setEditSaving(false);
  }

  async function handleDeleteSale(ventaId: number) {
    if (!window.confirm("¿Eliminar esta venta?")) return;
    const res = await fetch(`/api/sscm/ventas/${ventaId}`, { method: "DELETE" });
    if (res.ok) cargar();
  }

  if (!cliente) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", color: gold, fontFamily: "'Cinzel', serif", letterSpacing: "0.2em" }}>Cargando...</div>;

  return (
    <div style={{ padding: "40px", backgroundColor: "#0a0a0a", minHeight: "100vh" }}>
      <a href="/sscm/clientes" style={{ fontFamily: "'Cinzel', serif", fontSize: "11px", color: textMuted, textDecoration: "none", letterSpacing: "0.1em", display: "inline-flex", alignItems: "center", gap: "8px", marginBottom: "32px" }}
        onMouseEnter={e => (e.currentTarget.style.color = gold)} onMouseLeave={e => (e.currentTarget.style.color = textMuted)}>
        ← VOLVER A CLIENTES
      </a>

      <div style={{ backgroundColor: cardBg, border: `1px solid ${border}`, borderRadius: "4px", padding: "28px", marginBottom: "24px", position: "relative" }}>
        <span style={{ position: "absolute", top: 8, left: 8, color: gold, fontSize: "8px", opacity: 0.4 }}>✦</span>
        <span style={{ position: "absolute", top: 8, right: 8, color: gold, fontSize: "8px", opacity: 0.4 }}>✦</span>
        {editando ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "400px" }}>
            <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: "13px", color: gold, letterSpacing: "0.12em", textTransform: "uppercase", margin: 0 }}>Editar Cliente</h2>
            {[{ label: "Nombre Real", key: "nombre_real" }, { label: "Nombre en Fortnite", key: "nombre_juego" }].map(({ label, key }) => (
              <div key={key}><label style={labelStyle}>{label}</label><input type="text" value={form[key as keyof typeof form]} onChange={e => setForm({ ...form, [key]: e.target.value })} style={inputStyle} /></div>
            ))}
            {mensaje && <p style={{ color: mensaje.startsWith("✦") ? "#4a7c59" : "#8b3a2a", fontStyle: "italic", fontSize: "13px", margin: 0 }}>{mensaje}</p>}
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={handleEditar} disabled={guardando} style={{ fontFamily: "'Cinzel', serif", fontSize: "11px", letterSpacing: "0.1em", backgroundColor: "#1a1a0f", color: gold, border: `1px solid ${gold}66`, borderRadius: "4px", padding: "8px 16px", cursor: "pointer" }}>{guardando ? "GUARDANDO..." : "GUARDAR"}</button>
              <button onClick={() => setEditando(false)} style={{ fontFamily: "'Cinzel', serif", fontSize: "11px", letterSpacing: "0.1em", backgroundColor: "transparent", color: textMuted, border: `1px solid ${border}`, borderRadius: "4px", padding: "8px 16px", cursor: "pointer" }}>CANCELAR</button>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div>
              <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: "24px", fontWeight: 700, color: textLight, margin: "0 0 6px" }}>{cliente.nombre_real}</h1>
              <p style={{ color: textMuted, fontStyle: "italic", fontSize: "14px", margin: "0 0 8px" }}>{cliente.nombre_juego}</p>
              <p style={{ fontFamily: "'Cinzel', serif", fontSize: "10px", color: "#3a3a2a", letterSpacing: "0.1em" }}>CLIENTE DESDE {new Date(cliente.creado_en).toLocaleDateString("es-MX", { day: "2-digit", month: "long", year: "numeric" }).toUpperCase()}</p>
              {mensaje && <p style={{ color: "#8b3a2a", fontStyle: "italic", fontSize: "13px", margin: "8px 0 0" }}>{mensaje}</p>}
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={() => setEditando(true)} style={{ fontFamily: "'Cinzel', serif", fontSize: "11px", letterSpacing: "0.1em", backgroundColor: "transparent", color: editText, border: `1px solid #0e3612`, borderRadius: "4px", padding: "8px 16px", cursor: "pointer" }}>EDITAR</button>
              <button onClick={handleEliminar} style={{ fontFamily: "'Cinzel', serif", fontSize: "11px", letterSpacing: "0.1em", backgroundColor: "transparent", color: "#8b3a2a", border: "1px solid #3a1a1a", borderRadius: "4px", padding: "8px 16px", cursor: "pointer" }}>ELIMINAR</button>
            </div>
          </div>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "32px" }}>
        {[{ label: "Bolsa de Pavos", value: `${cliente.bolsa_pavos}V`, accent: "#8b6914" }, { label: "Bolsa de Pesos", value: `$${cliente.bolsa_pesos}`, accent: "#4a7c59" }].map(({ label, value, accent }) => (
          <div key={label} style={{ backgroundColor: cardBg, border: `1px solid ${border}`, borderRadius: "4px", padding: "20px", position: "relative", overflow: "hidden" }}>
            <p style={{ fontFamily: "'Cinzel', serif", fontSize: "10px", color: textMuted, letterSpacing: "0.15em", textTransform: "uppercase", margin: "0 0 10px" }}>{label}</p>
            <p style={{ fontFamily: "'Cinzel', serif", fontSize: "28px", fontWeight: 700, color: accent, margin: 0 }}>{value}</p>
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "2px", background: `linear-gradient(to right, transparent, ${accent}44, transparent)` }} />
          </div>
        ))}
      </div>

      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
          <span style={{ color: gold, fontSize: "12px" }}>≡</span>
          <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: "13px", color: gold, letterSpacing: "0.12em", textTransform: "uppercase", margin: 0 }}>Historial de Ventas</h2>
          <div style={{ flex: 1, height: "1px", background: `linear-gradient(to right, ${border}, transparent)` }} />
        </div>
        {(cliente.ventas ?? []).length === 0 ? <p style={{ color: textMuted, fontStyle: "italic", fontSize: "13px" }}>No hay ventas registradas.</p> : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {(cliente.ventas ?? []).map((v: any) => (
              <div key={v.id} style={{ backgroundColor: cardBg, border: `1px solid ${border}`, borderRadius: "4px", padding: "16px 20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <span style={{ fontFamily: "'Cinzel', serif", fontSize: "10px", padding: "3px 10px", borderRadius: "2px", letterSpacing: "0.1em", backgroundColor: v.tipo === "regalo" ? "#1a2a1a" : "#1a1a2a", color: v.tipo === "regalo" ? "#4a7c59" : "#7a6a9a", border: `1px solid ${v.tipo === "regalo" ? "#2a4a2a" : "#2a2a4a"}` }}>{v.tipo === "regalo" ? "REGALO" : "CÓDIGO"}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontFamily: "'Cinzel', serif", fontSize: "11px", color: textMuted }}>{new Date(v.fecha).toLocaleDateString("es-MX", { day: "2-digit", month: "long", year: "numeric" }).toUpperCase()}</span>
                    <button onClick={() => handleEditSale(v)} style={{ fontFamily: "'Cinzel', serif", fontSize: "10px", backgroundColor: "transparent", color: editText, border: `1px solid #16691e`, borderRadius: "3px", padding: "3px 8px", cursor: "pointer" }}>EDITAR</button>
                    <button onClick={() => handleDeleteSale(v.id)} style={{ fontFamily: "'Cinzel', serif", fontSize: "10px", backgroundColor: "transparent", color: "#8b3a2a", border: "1px solid #3a1a1a", borderRadius: "3px", padding: "3px 8px", cursor: "pointer" }}>ELIMINAR</button>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  <p style={{ color: textMuted, fontSize: "13px", margin: 0 }}>Total: <span style={{ color: textLight }}>{v.pavos_total}V</span></p>
                  <p style={{ color: textMuted, fontSize: "13px", margin: 0 }}>Reales: <span style={{ color: textLight }}>{v.pavos_reales_pagados}V</span></p>
                  <p style={{ color: textMuted, fontSize: "13px", margin: 0 }}>Cashback: <span style={{ color: "#8b6914" }}>{v.tipo === "regalo" ? `$${v.cashback_generado.toFixed(2)}` : `${v.cashback_generado.toFixed(0)}V`}</span></p>
                  {v.tipo === "regalo" && <p style={{ color: textMuted, fontSize: "13px", margin: 0 }}>Ganancia: <span style={{ color: "#4a7c59" }}>${v.ganancia.toFixed(2)}</span></p>}
                </div>
                {v.notas && <p style={{ color: textMuted, fontSize: "12px", fontStyle: "italic", margin: "10px 0 0", borderTop: `1px solid ${border}`, paddingTop: "8px" }}>{v.notas}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {editingSale && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
          <div style={{ backgroundColor: "#0f0f0f", border: `1px solid ${border}`, borderRadius: "4px", padding: "28px", width: "100%", maxWidth: "440px", position: "relative" }}>
            <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: "13px", color: gold, letterSpacing: "0.12em", textTransform: "uppercase", margin: "0 0 20px" }}>Editar Venta</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div><label style={labelStyle}>Tipo</label>
                <div style={{ display: "flex", gap: "8px" }}>
                  {["regalo", "codigo"].map(t => <button key={t} onClick={() => setEditForm({ ...editForm, tipo: t })} style={{ flex: 1, fontFamily: "'Cinzel', serif", fontSize: "11px", padding: "8px", borderRadius: "4px", cursor: "pointer", border: `1px solid ${editForm.tipo === t ? gold + "66" : border}`, backgroundColor: editForm.tipo === t ? "#1a1a0f" : "transparent", color: editForm.tipo === t ? gold : textMuted }}>{t === "regalo" ? "REGALO" : "CÓDIGO"}</button>)}
                </div>
              </div>
              {[{ label: "Total de Pavos", key: "pavos_total", type: "number" }, { label: "Pavos de Bolsa", key: "pavos_cashback_usado", type: "number" }, { label: "Pesos de Bolsa", key: "pesos_cashback_usado", type: "number" }, { label: "Fecha", key: "fecha", type: "date" }, { label: "Notas", key: "notas", type: "text" }].map(({ label, key, type }) => (
                <div key={key}><label style={labelStyle}>{label}</label><input type={type} value={editForm[key as keyof typeof editForm] as string} onChange={e => setEditForm({ ...editForm, [key]: e.target.value })} style={inputStyle} placeholder={key === "notas" ? "Opcional" : ""} /></div>
              ))}
              {editMessage && <p style={{ color: "#8b3a2a", fontStyle: "italic", fontSize: "13px", margin: 0 }}>{editMessage}</p>}
              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={handleSaveEdit} disabled={editSaving} style={{ flex: 1, fontFamily: "'Cinzel', serif", fontSize: "11px", backgroundColor: "#1a1a0f", color: gold, border: `1px solid ${gold}66`, borderRadius: "4px", padding: "10px", cursor: "pointer" }}>{editSaving ? "GUARDANDO..." : "GUARDAR"}</button>
                <button onClick={() => setEditingSale(null)} style={{ flex: 1, fontFamily: "'Cinzel', serif", fontSize: "11px", backgroundColor: "transparent", color: textMuted, border: `1px solid ${border}`, borderRadius: "4px", padding: "10px", cursor: "pointer" }}>CANCELAR</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
