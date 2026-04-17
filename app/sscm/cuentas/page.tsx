"use client";

import { useEffect, useState } from "react";

interface Cuenta { id: number; nombre: string; pavos: number; creado_en: string; _count: { ventas: number; recargas: number }; }

const gold = "#c9a84c", cardBg = "#131310", border = "#2a2a1a", textMuted = "#6a6a5a", textLight = "#c8c8b8";
const inputStyle = { width: "100%", backgroundColor: "#0f0f0f", border: `1px solid #2a2a1a`, borderRadius: "4px", padding: "10px 14px", color: textLight, fontFamily: "'Crimson Text', serif", fontSize: "14px", outline: "none", boxSizing: "border-box" as const };
const labelStyle = { fontFamily: "'Cinzel', serif", fontSize: "10px", color: textMuted, letterSpacing: "0.12em", textTransform: "uppercase" as const, display: "block", marginBottom: "8px" };

export default function CuentasPage() {
  const [cuentas, setCuentas] = useState<Cuenta[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [nombre, setNombre] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [showRecarga, setShowRecarga] = useState<number | null>(null);
  const [recargaForm, setRecargaForm] = useState({ pavos: "", costo: "", notas: "", fecha: "" });
  const [recargaSaving, setRecargaSaving] = useState(false);
  const [recargaMessage, setRecargaMessage] = useState("");

  useEffect(() => { load(); }, []);
  async function load() { const r = await fetch("/api/sscm/cuentas"); setCuentas(await r.json()); }

  async function handleCreate() {
    if (!nombre.trim()) return;
    setSaving(true); setMessage("");
    const res = await fetch("/api/sscm/cuentas", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nombre }) });
    const data = await res.json();
    if (res.ok) { setMessage("✦ Cuenta creada."); setNombre(""); setShowForm(false); load(); } else setMessage(`✗ ${data.error}`);
    setSaving(false);
  }

  async function handleRecarga(cuentaId: number) {
    setRecargaSaving(true); setRecargaMessage("");
    const res = await fetch("/api/sscm/recargas", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ cuenta_id: cuentaId, ...recargaForm }) });
    const data = await res.json();
    if (res.ok) { setRecargaMessage("✦ Recarga registrada."); setRecargaForm({ pavos: "", costo: "", notas: "", fecha: "" }); setShowRecarga(null); load(); } else setRecargaMessage(`✗ ${data.error}`);
    setRecargaSaving(false);
  }

  return (
    <div style={{ padding: "40px", backgroundColor: "#0a0a0a", minHeight: "100vh" }}>
      <div style={{ marginBottom: "32px", borderBottom: `1px solid ${border}`, paddingBottom: "24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ height: "1px", width: "30px", background: `linear-gradient(to right, transparent, ${gold})` }} />
          <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: "22px", fontWeight: 700, color: gold, margin: 0, letterSpacing: "0.15em", textTransform: "uppercase" }}>Cuentas</h1>
          <div style={{ height: "1px", width: "60px", background: `linear-gradient(to right, ${gold}, transparent)` }} />
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{ fontFamily: "'Cinzel', serif", fontSize: "11px", letterSpacing: "0.12em", backgroundColor: "#1a1a0f", color: gold, border: `1px solid ${gold}66`, borderRadius: "4px", padding: "8px 16px", cursor: "pointer" }}>{showForm ? "✕ CANCELAR" : "+ NUEVA CUENTA"}</button>
      </div>

      {showForm && (
        <div style={{ backgroundColor: cardBg, border: `1px solid ${border}`, borderRadius: "4px", padding: "24px", marginBottom: "28px", maxWidth: "400px", position: "relative" }}>
          <span style={{ position: "absolute", top: 8, left: 8, color: gold, fontSize: "8px", opacity: 0.4 }}>✦</span>
          <span style={{ position: "absolute", top: 8, right: 8, color: gold, fontSize: "8px", opacity: 0.4 }}>✦</span>
          <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: "13px", color: gold, letterSpacing: "0.12em", textTransform: "uppercase", margin: "0 0 20px" }}>Nueva Cuenta</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div><label style={labelStyle}>Nombre de la cuenta <span style={{ color: "#c0392b" }}>*</span></label><input type="text" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej: Cuenta Principal" style={inputStyle} /></div>
            {message && <p style={{ color: message.startsWith("✦") ? "#4a7c59" : "#8b3a2a", fontStyle: "italic", fontSize: "13px", margin: 0 }}>{message}</p>}
            <button onClick={handleCreate} disabled={saving} style={{ fontFamily: "'Cinzel', serif", fontSize: "11px", letterSpacing: "0.12em", backgroundColor: "#1a1a0f", color: gold, border: `1px solid ${gold}66`, borderRadius: "4px", padding: "10px", cursor: "pointer", opacity: saving ? 0.5 : 1 }}>{saving ? "GUARDANDO..." : "CREAR CUENTA"}</button>
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {cuentas.length === 0 ? <p style={{ color: textMuted, fontStyle: "italic", fontSize: "13px" }}>No hay cuentas registradas.</p>
          : cuentas.map(cuenta => (
            <div key={cuenta.id} style={{ backgroundColor: cardBg, border: `1px solid ${border}`, borderRadius: "4px", padding: "20px 24px", position: "relative" }}>
              <span style={{ position: "absolute", top: 6, left: 6, color: gold, fontSize: "8px", opacity: 0.3 }}>✦</span>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: showRecarga === cuenta.id ? "20px" : "0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
                  <div>
                    <p style={{ fontFamily: "'Cinzel', serif", fontSize: "15px", color: textLight, margin: "0 0 4px" }}>{cuenta.nombre}</p>
                    <p style={{ fontSize: "12px", color: textMuted, fontStyle: "italic", margin: 0 }}>{cuenta._count.ventas} ventas · {cuenta._count.recargas} recargas</p>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <p style={{ fontFamily: "'Cinzel', serif", fontSize: "10px", color: textMuted, letterSpacing: "0.12em", margin: "0 0 4px" }}>PAVOS DISPONIBLES</p>
                    <p style={{ fontFamily: "'Cinzel', serif", fontSize: "22px", fontWeight: 700, color: cuenta.pavos < 1000 ? "#8b3a2a" : "#8b6914", margin: 0 }}>{cuenta.pavos.toLocaleString()}V</p>
                  </div>
                </div>
                <button onClick={() => { setShowRecarga(showRecarga === cuenta.id ? null : cuenta.id); setRecargaMessage(""); setRecargaForm({ pavos: "", costo: "", notas: "", fecha: "" }); }} style={{ fontFamily: "'Cinzel', serif", fontSize: "11px", letterSpacing: "0.1em", backgroundColor: "#1a1a0f", color: gold, border: `1px solid ${gold}66`, borderRadius: "4px", padding: "8px 14px", cursor: "pointer" }}>+ RECARGAR</button>
              </div>
              {showRecarga === cuenta.id && (
                <div style={{ borderTop: `1px solid ${border}`, paddingTop: "20px" }}>
                  <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: "11px", color: gold, letterSpacing: "0.12em", textTransform: "uppercase", margin: "0 0 16px" }}>Registrar Recarga</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "12px", alignItems: "end" }}>
                    {[{ label: "Pavos", key: "pavos", placeholder: "10000" }, { label: "Costo ($)", key: "costo", placeholder: "0.00" }, { label: "Fecha", key: "fecha", placeholder: "" }, { label: "Notas", key: "notas", placeholder: "Opcional" }].map(({ label, key, placeholder }) => (
                      <div key={key}><label style={labelStyle}>{label}</label><input type={key === "fecha" ? "date" : key === "notas" ? "text" : "number"} value={recargaForm[key as keyof typeof recargaForm]} onChange={e => setRecargaForm({ ...recargaForm, [key]: e.target.value })} placeholder={placeholder} style={inputStyle} /></div>
                    ))}
                  </div>
                  {recargaMessage && <p style={{ color: recargaMessage.startsWith("✦") ? "#4a7c59" : "#8b3a2a", fontStyle: "italic", fontSize: "13px", margin: "12px 0 0" }}>{recargaMessage}</p>}
                  <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
                    <button onClick={() => handleRecarga(cuenta.id)} disabled={recargaSaving || !recargaForm.pavos || !recargaForm.costo} style={{ fontFamily: "'Cinzel', serif", fontSize: "11px", backgroundColor: "#1a1a0f", color: gold, border: `1px solid ${gold}66`, borderRadius: "4px", padding: "8px 20px", cursor: "pointer", opacity: (!recargaForm.pavos || !recargaForm.costo) ? 0.4 : 1 }}>{recargaSaving ? "GUARDANDO..." : "GUARDAR RECARGA"}</button>
                    <button onClick={() => setShowRecarga(null)} style={{ fontFamily: "'Cinzel', serif", fontSize: "11px", backgroundColor: "transparent", color: textMuted, border: `1px solid ${border}`, borderRadius: "4px", padding: "8px 20px", cursor: "pointer" }}>CANCELAR</button>
                  </div>
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}
