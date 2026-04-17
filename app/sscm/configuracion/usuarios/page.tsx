"use client";

import { useEffect, useState } from "react";

interface Usuario { id: number; username: string; nombre: string; rol: string; punto_de_venta: string; activo: boolean; creado_en: string; }

const gold = "#c9a84c", cardBg = "#131310", border = "#2a2a1a", textMuted = "#6a6a5a", textLight = "#c8c8b8";
const inputStyle = { width: "100%", backgroundColor: "#0f0f0f", border: `1px solid #2a2a1a`, borderRadius: "4px", padding: "10px 14px", color: textLight, fontFamily: "'Crimson Text', serif", fontSize: "14px", outline: "none", boxSizing: "border-box" as const };
const labelStyle = { fontFamily: "'Cinzel', serif", fontSize: "10px", color: textMuted, letterSpacing: "0.12em", textTransform: "uppercase" as const, display: "block", marginBottom: "8px" };

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ username: "", password: "", nombre: "", rol: "operador", punto_de_venta: "base" });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => { load(); }, []);
  async function load() { const r = await fetch("/api/sscm/usuarios"); setUsuarios(await r.json()); }

  async function handleCreate() {
    setSaving(true); setMessage("");
    const res = await fetch("/api/sscm/usuarios", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await res.json();
    if (res.ok) { setMessage("✦ Usuario creado."); setForm({ username: "", password: "", nombre: "", rol: "operador", punto_de_venta: "base" }); setShowForm(false); load(); }
    else setMessage(`✗ ${data.error}`);
    setSaving(false);
  }

  async function toggleActivo(u: Usuario) {
    await fetch(`/api/sscm/usuarios/${u.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ activo: !u.activo }) });
    load();
  }

  return (
    <div style={{ padding: "40px", backgroundColor: "#0a0a0a", minHeight: "100vh" }}>
      <div style={{ marginBottom: "32px", borderBottom: `1px solid ${border}`, paddingBottom: "24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ height: "1px", width: "30px", background: `linear-gradient(to right, transparent, ${gold})` }} />
          <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: "22px", fontWeight: 700, color: gold, margin: 0, letterSpacing: "0.15em", textTransform: "uppercase" }}>Usuarios</h1>
          <div style={{ height: "1px", width: "60px", background: `linear-gradient(to right, ${gold}, transparent)` }} />
        </div>
        <button onClick={() => { setShowForm(!showForm); setMessage(""); }} style={{ fontFamily: "'Cinzel', serif", fontSize: "11px", letterSpacing: "0.12em", backgroundColor: showForm ? "transparent" : "#1a1a0f", color: gold, border: `1px solid ${gold}66`, borderRadius: "4px", padding: "8px 16px", cursor: "pointer" }}>{showForm ? "✕ CANCELAR" : "+ NUEVO USUARIO"}</button>
      </div>

      {showForm && (
        <div style={{ backgroundColor: cardBg, border: `1px solid ${border}`, borderRadius: "4px", padding: "28px", marginBottom: "28px", maxWidth: "520px", position: "relative" }}>
          <span style={{ position: "absolute", top: 8, left: 8, color: gold, fontSize: "8px", opacity: 0.4 }}>✦</span>
          <span style={{ position: "absolute", top: 8, right: 8, color: gold, fontSize: "8px", opacity: 0.4 }}>✦</span>
          <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: "13px", color: gold, letterSpacing: "0.12em", textTransform: "uppercase", margin: "0 0 24px" }}>Registrar Usuario</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div><label style={labelStyle}>Nombre completo <span style={{ color: "#c0392b" }}>*</span></label><input type="text" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} placeholder="Ej. María García" style={inputStyle} /></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div><label style={labelStyle}>Usuario <span style={{ color: "#c0392b" }}>*</span></label><input type="text" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} placeholder="Ej. mgarcia" autoComplete="off" style={inputStyle} /></div>
              <div><label style={labelStyle}>Contraseña <span style={{ color: "#c0392b" }}>*</span></label><input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="••••••••" autoComplete="new-password" style={inputStyle} /></div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div><label style={labelStyle}>Rol</label>
                <select value={form.rol} onChange={e => setForm({ ...form, rol: e.target.value })} style={{ ...inputStyle, cursor: "pointer" }}>
                  <option value="operador">Operador</option><option value="admin">Admin</option>
                </select>
              </div>
              <div><label style={labelStyle}>Punto de Venta</label>
                <select value={form.punto_de_venta} onChange={e => setForm({ ...form, punto_de_venta: e.target.value })} style={{ ...inputStyle, cursor: "pointer" }}>
                  <option value="base">Base</option><option value="sscm">SSCM</option>
                </select>
              </div>
            </div>
            {message && <p style={{ color: message.startsWith("✦") ? "#4a7c59" : "#8b3a2a", fontStyle: "italic", fontSize: "13px", margin: 0 }}>{message}</p>}
            <button onClick={handleCreate} disabled={saving || !form.username || !form.password || !form.nombre} style={{ fontFamily: "'Cinzel', serif", fontSize: "11px", letterSpacing: "0.15em", backgroundColor: "#1a1a0f", color: gold, border: `1px solid ${gold}66`, borderRadius: "4px", padding: "12px", cursor: "pointer", opacity: (saving || !form.username || !form.password || !form.nombre) ? 0.4 : 1 }}>{saving ? "GUARDANDO..." : "REGISTRAR USUARIO"}</button>
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxWidth: "700px" }}>
        {usuarios.length === 0 ? <p style={{ color: textMuted, fontStyle: "italic", fontSize: "13px" }}>No hay usuarios registrados.</p>
          : usuarios.map(u => (
            <div key={u.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: cardBg, border: `1px solid ${u.activo ? border : "#1a1010"}`, borderRadius: "4px", padding: "16px 20px", opacity: u.activo ? 1 : 0.5 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  <p style={{ fontFamily: "'Cinzel', serif", fontSize: "14px", color: textLight, margin: 0 }}>{u.nombre}</p>
                  <span style={{ fontFamily: "'Cinzel', serif", fontSize: "9px", letterSpacing: "0.1em", color: u.rol === "admin" ? gold : textMuted, backgroundColor: u.rol === "admin" ? "#1a1a0f" : "#111", border: `1px solid ${u.rol === "admin" ? gold + "44" : border}`, borderRadius: "2px", padding: "2px 7px", textTransform: "uppercase" }}>{u.rol}</span>
                  <span style={{ fontFamily: "'Cinzel', serif", fontSize: "9px", letterSpacing: "0.1em", color: u.punto_de_venta === "sscm" ? "#c9a84c" : "#5a90c8", backgroundColor: "#111", border: `1px solid ${u.punto_de_venta === "sscm" ? "#3a3010" : "#102030"}`, borderRadius: "2px", padding: "2px 7px", textTransform: "uppercase" }}>{u.punto_de_venta}</span>
                  {!u.activo && <span style={{ fontFamily: "'Cinzel', serif", fontSize: "9px", color: "#8b3a2a", backgroundColor: "#1a0f0f", border: "1px solid #3a1515", borderRadius: "2px", padding: "2px 7px", textTransform: "uppercase" }}>Inactivo</span>}
                </div>
                <p style={{ fontSize: "12px", color: textMuted, fontStyle: "italic", margin: 0 }}>@{u.username} · desde {new Date(u.creado_en).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" })}</p>
              </div>
              {u.rol !== "admin" && <button onClick={() => toggleActivo(u)} style={{ fontFamily: "'Cinzel', serif", fontSize: "10px", backgroundColor: "transparent", color: u.activo ? "#8b3a2a" : "#4a7c59", border: `1px solid ${u.activo ? "#3a1515" : "#2a4a2a"}`, borderRadius: "4px", padding: "6px 12px", cursor: "pointer", textTransform: "uppercase" }}>{u.activo ? "Desactivar" : "Activar"}</button>}
            </div>
          ))}
      </div>
    </div>
  );
}
