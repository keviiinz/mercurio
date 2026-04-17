"use client";

import { useEffect, useState } from "react";

interface Client { id: number; nombre_real: string; nombre_juego: string; bolsa_pavos: number; bolsa_pesos: number; }

const gold = "#c9a84c", cardBg = "#131310", border = "#2a2a1a", textMuted = "#6a6a5a", textLight = "#c8c8b8";

export default function ClientesPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nombre_real: "", nombre_juego: "" });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => { load(); }, []);
  async function load() { const r = await fetch("/api/sscm/clientes"); setClients(await r.json()); }

  async function handleCreate() {
    if (!form.nombre_real.trim()) { setMessage("✗ El nombre real es obligatorio."); return; }
    if (!form.nombre_juego.trim()) { setMessage("✗ El nombre en Fortnite es obligatorio."); return; }
    setSaving(true); setMessage("");
    const res = await fetch("/api/sscm/clientes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await res.json();
    if (res.ok) { setMessage("✦ Cliente registrado."); setForm({ nombre_real: "", nombre_juego: "" }); setShowForm(false); load(); }
    else setMessage(`✗ ${data.error}`);
    setSaving(false);
  }

  const filtered = clients.filter(c => c.nombre_real.toLowerCase().includes(search.toLowerCase()) || c.nombre_juego.toLowerCase().includes(search.toLowerCase()));

  const labelStyle = { fontFamily: "'Cinzel', serif", fontSize: "10px", color: textMuted, letterSpacing: "0.12em", textTransform: "uppercase" as const, display: "block", marginBottom: "8px" };
  const inputStyle = { width: "100%", backgroundColor: "#0f0f0f", border: `1px solid ${border}`, borderRadius: "4px", padding: "10px 14px", color: textLight, fontFamily: "'Crimson Text', serif", fontSize: "14px", outline: "none", boxSizing: "border-box" as const };

  return (
    <div style={{ padding: "40px", backgroundColor: "#0a0a0a", minHeight: "100vh" }}>
      <div style={{ marginBottom: "32px", borderBottom: `1px solid ${border}`, paddingBottom: "24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ height: "1px", width: "30px", background: `linear-gradient(to right, transparent, ${gold})` }} />
          <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: "22px", fontWeight: 700, color: gold, margin: 0, letterSpacing: "0.15em", textTransform: "uppercase" }}>Clientes</h1>
          <div style={{ height: "1px", width: "60px", background: `linear-gradient(to right, ${gold}, transparent)` }} />
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{ fontFamily: "'Cinzel', serif", fontSize: "11px", letterSpacing: "0.12em", backgroundColor: "#1a1a0f", color: gold, border: `1px solid ${gold}66`, borderRadius: "4px", padding: "8px 16px", cursor: "pointer" }}>
          {showForm ? "✕ CANCELAR" : "+ NUEVO CLIENTE"}
        </button>
      </div>

      {showForm && (
        <div style={{ backgroundColor: cardBg, border: `1px solid ${border}`, borderRadius: "4px", padding: "24px", marginBottom: "28px", maxWidth: "480px", position: "relative" }}>
          <span style={{ position: "absolute", top: 8, left: 8, color: gold, fontSize: "8px", opacity: 0.4 }}>✦</span>
          <span style={{ position: "absolute", top: 8, right: 8, color: gold, fontSize: "8px", opacity: 0.4 }}>✦</span>
          <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: "13px", color: gold, letterSpacing: "0.12em", textTransform: "uppercase", margin: "0 0 20px" }}>Registrar Cliente</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {[{ label: "Nombre Real", key: "nombre_real", placeholder: "Nombre completo" }, { label: "Nombre en Fortnite", key: "nombre_juego", placeholder: "Gamertag" }].map(({ label, key, placeholder }) => (
              <div key={key}>
                <label style={labelStyle}>{label} <span style={{ color: "#c0392b" }}>*</span></label>
                <input type="text" value={form[key as keyof typeof form]} onChange={e => setForm({ ...form, [key]: e.target.value })} placeholder={placeholder} style={inputStyle} />
              </div>
            ))}
            {message && <p style={{ color: message.startsWith("✦") ? "#4a7c59" : "#8b3a2a", fontStyle: "italic", fontSize: "13px", margin: 0 }}>{message}</p>}
            <button onClick={handleCreate} disabled={saving} style={{ fontFamily: "'Cinzel', serif", fontSize: "11px", letterSpacing: "0.12em", backgroundColor: "#1a1a0f", color: gold, border: `1px solid ${gold}66`, borderRadius: "4px", padding: "10px", cursor: "pointer", opacity: saving ? 0.5 : 1 }}>
              {saving ? "GUARDANDO..." : "REGISTRAR"}
            </button>
          </div>
        </div>
      )}

      <div style={{ marginBottom: "20px", maxWidth: "400px" }}>
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nombre o gamertag..." style={{ ...inputStyle, width: "100%" }} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {filtered.length === 0 ? <p style={{ color: textMuted, fontStyle: "italic", fontSize: "13px" }}>No se encontraron clientes.</p>
          : filtered.map(c => (
            <a key={c.id} href={`/sscm/clientes/${c.id}`} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: cardBg, border: `1px solid ${border}`, borderRadius: "4px", padding: "16px 20px", textDecoration: "none", transition: "border-color 0.2s" }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = gold + "55")}
              onMouseLeave={e => (e.currentTarget.style.borderColor = border)}>
              <div>
                <p style={{ fontFamily: "'Cinzel', serif", fontSize: "14px", color: textLight, margin: "0 0 4px" }}>{c.nombre_real}</p>
                <p style={{ fontSize: "12px", color: textMuted, fontStyle: "italic", margin: 0 }}>{c.nombre_juego}</p>
              </div>
              <div style={{ display: "flex", gap: "24px", textAlign: "right" }}>
                <div><p style={{ fontFamily: "'Cinzel', serif", fontSize: "10px", color: textMuted, letterSpacing: "0.1em", margin: "0 0 4px" }}>PAVOS</p><p style={{ fontFamily: "'Cinzel', serif", fontSize: "13px", color: "#8b6914", margin: 0 }}>{c.bolsa_pavos}V</p></div>
                <div><p style={{ fontFamily: "'Cinzel', serif", fontSize: "10px", color: textMuted, letterSpacing: "0.1em", margin: "0 0 4px" }}>PESOS</p><p style={{ fontFamily: "'Cinzel', serif", fontSize: "13px", color: "#4a7c59", margin: 0 }}>${c.bolsa_pesos}</p></div>
              </div>
            </a>
          ))}
      </div>
    </div>
  );
}
