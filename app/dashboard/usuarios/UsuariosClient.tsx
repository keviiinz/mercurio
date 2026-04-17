"use client";

import { useEffect, useState } from "react";

interface Usuario { id: number; username: string; nombre: string; rol: string; punto_de_venta: string; activo: boolean; creado_en: string; }

const accent = "#6c63ff";
const cardBg = "#16181f";
const border = "#1e2130";
const textMuted = "#5a5f7a";
const textLight = "#e8eaf0";

const inputStyle = { width: "100%", backgroundColor: "#0f1117", border: `1px solid ${border}`, borderRadius: "6px", padding: "10px 14px", color: textLight, fontFamily: "system-ui, sans-serif", fontSize: "14px", outline: "none", boxSizing: "border-box" as const };
const labelStyle = { fontFamily: "system-ui, sans-serif", fontSize: "11px", fontWeight: 600, color: textMuted, letterSpacing: "0.06em", textTransform: "uppercase" as const, display: "block", marginBottom: "6px" };

export default function UsuariosClient() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ username: "", password: "", nombre: "", rol: "operador", punto_de_venta: "base" });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => { load(); }, []);
  async function load() { const r = await fetch("/api/sscm/usuarios"); setUsuarios(await r.json()); }

  async function handleCreate() {
    if (!form.nombre.trim()) { setMessage("✗ El nombre es obligatorio."); return; }
    if (!form.username.trim()) { setMessage("✗ El usuario es obligatorio."); return; }
    if (!form.password) { setMessage("✗ La contraseña es obligatoria."); return; }
    setSaving(true); setMessage("");
    const res = await fetch("/api/sscm/usuarios", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await res.json();
    if (res.ok) { setMessage("✓ Usuario creado."); setForm({ username: "", password: "", nombre: "", rol: "operador", punto_de_venta: "base" }); setShowForm(false); load(); }
    else setMessage(`✗ ${data.error}`);
    setSaving(false);
  }

  async function toggleActivo(u: Usuario) {
    await fetch(`/api/sscm/usuarios/${u.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ activo: !u.activo }) });
    load();
  }

  const pvLabel = (pv: string) => pv === "sscm" ? "SSCM" : "Base";
  const pvColor = (pv: string) => pv === "sscm" ? "#c9a84c" : "#4a90e2";
  const pvBg = (pv: string) => pv === "sscm" ? "rgba(201,168,76,0.08)" : "rgba(74,144,226,0.08)";
  const pvBorder = (pv: string) => pv === "sscm" ? "rgba(201,168,76,0.2)" : "rgba(74,144,226,0.2)";

  return (
    <div style={{ padding: 40, backgroundColor: "#0f1117", minHeight: "100vh" }}>
      <div style={{ marginBottom: 32, borderBottom: `1px solid ${border}`, paddingBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: textLight, margin: 0 }}>Usuarios</h1>
          <p style={{ fontSize: 13, color: textMuted, margin: "4px 0 0" }}>Gestión de accesos al sistema</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setMessage(""); }} style={{ fontSize: 13, fontWeight: 600, backgroundColor: showForm ? "transparent" : accent, color: showForm ? textMuted : "#fff", border: `1px solid ${showForm ? border : accent}`, borderRadius: 6, padding: "8px 18px", cursor: "pointer" }}>
          {showForm ? "✕ Cancelar" : "+ Nuevo Usuario"}
        </button>
      </div>

      {showForm && (
        <div style={{ backgroundColor: cardBg, border: `1px solid ${border}`, borderRadius: 8, padding: 28, marginBottom: 28, maxWidth: 520 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: textLight, margin: "0 0 20px" }}>Registrar Usuario</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div><label style={labelStyle}>Nombre completo <span style={{ color: "#e05252" }}>*</span></label><input type="text" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} placeholder="Ej. María García" style={inputStyle} /></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div><label style={labelStyle}>Usuario <span style={{ color: "#e05252" }}>*</span></label><input type="text" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} placeholder="Ej. mgarcia" autoComplete="off" style={inputStyle} /></div>
              <div><label style={labelStyle}>Contraseña <span style={{ color: "#e05252" }}>*</span></label><input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="••••••••" autoComplete="new-password" style={inputStyle} /></div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
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
            {message && <p style={{ color: message.startsWith("✓") ? "#4a9c6a" : "#e05252", fontSize: 13, margin: 0 }}>{message}</p>}
            <button onClick={handleCreate} disabled={saving || !form.username || !form.password || !form.nombre} style={{ fontSize: 13, fontWeight: 600, backgroundColor: accent, color: "#fff", border: "none", borderRadius: 6, padding: 12, cursor: "pointer", opacity: (saving || !form.username || !form.password || !form.nombre) ? 0.4 : 1 }}>{saving ? "Guardando..." : "Registrar Usuario"}</button>
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 700 }}>
        {usuarios.length === 0
          ? <p style={{ color: textMuted, fontSize: 13, fontStyle: "italic" }}>No hay usuarios registrados.</p>
          : usuarios.map(u => (
            <div key={u.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: cardBg, border: `1px solid ${u.activo ? border : "#2a1a1a"}`, borderRadius: 8, padding: "16px 20px", opacity: u.activo ? 1 : 0.5 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: textLight, margin: 0 }}>{u.nombre}</p>
                  <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.06em", color: u.rol === "admin" ? accent : textMuted, backgroundColor: u.rol === "admin" ? "rgba(108,99,255,0.1)" : "rgba(90,95,122,0.1)", border: `1px solid ${u.rol === "admin" ? "rgba(108,99,255,0.2)" : border}`, borderRadius: 4, padding: "2px 7px", textTransform: "uppercase" }}>{u.rol}</span>
                  <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.06em", color: pvColor(u.punto_de_venta), backgroundColor: pvBg(u.punto_de_venta), border: `1px solid ${pvBorder(u.punto_de_venta)}`, borderRadius: 4, padding: "2px 7px", textTransform: "uppercase" }}>{pvLabel(u.punto_de_venta)}</span>
                  {!u.activo && <span style={{ fontSize: 10, fontWeight: 600, color: "#e05252", backgroundColor: "rgba(224,82,82,0.08)", border: "1px solid rgba(224,82,82,0.2)", borderRadius: 4, padding: "2px 7px", textTransform: "uppercase" }}>Inactivo</span>}
                </div>
                <p style={{ fontSize: 12, color: textMuted, margin: 0 }}>@{u.username} · desde {new Date(u.creado_en).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" })}</p>
              </div>
              {u.rol !== "admin" && <button onClick={() => toggleActivo(u)} style={{ fontSize: 11, fontWeight: 600, backgroundColor: "transparent", color: u.activo ? "#e05252" : "#4a9c6a", border: `1px solid ${u.activo ? "rgba(224,82,82,0.3)" : "rgba(74,156,106,0.3)"}`, borderRadius: 6, padding: "6px 14px", cursor: "pointer" }}>{u.activo ? "Desactivar" : "Activar"}</button>}
            </div>
          ))}
      </div>
    </div>
  );
}
