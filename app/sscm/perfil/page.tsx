"use client";

import { useState } from "react";
import { validatePassword } from "@/lib/validations";

const gold = "#c9a84c";
const cardBg = "#131310";
const border = "#2a2a1a";
const textMuted = "#6a6a5a";
const textLight = "#c8c8b8";

export default function PerfilSscmPage() {
  const [form, setForm] = useState({ actual: "", nueva: "", confirmar: "" });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  function update(key: string, value: string) {
    setForm(f => ({ ...f, [key]: value }));
    setMessage("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.actual || !form.nueva || !form.confirmar) { setMessage("✗ Todos los campos son requeridos."); return; }
    if (form.nueva !== form.confirmar) { setMessage("✗ Las contraseñas no coinciden."); return; }
    const err = validatePassword(form.nueva);
    if (err) { setMessage(`✗ ${err}`); return; }
    setSaving(true); setMessage("");
    const res = await fetch("/api/auth/password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok) { setMessage("✦ Contraseña actualizada correctamente."); setForm({ actual: "", nueva: "", confirmar: "" }); }
    else setMessage(`✗ ${data.error}`);
    setSaving(false);
  }

  const inputStyle = {
    width: "100%", backgroundColor: "#0f0f0f", border: `1px solid ${border}`, borderRadius: "4px",
    padding: "10px 14px", color: textLight, fontFamily: "'Crimson Text', serif",
    fontSize: "14px", outline: "none", boxSizing: "border-box" as const,
  };
  const labelStyle = {
    fontFamily: "'Cinzel', serif", fontSize: "10px", color: textMuted, letterSpacing: "0.12em",
    textTransform: "uppercase" as const, display: "block", marginBottom: "8px",
  };
  const ok = message.startsWith("✦");

  return (
    <div style={{ padding: "40px", backgroundColor: "#0a0a0a", minHeight: "100vh" }}>
      <div style={{ marginBottom: "32px", borderBottom: `1px solid ${border}`, paddingBottom: "24px", display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{ height: "1px", width: "30px", background: `linear-gradient(to right, transparent, ${gold})` }} />
        <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: "22px", fontWeight: 700, color: gold, margin: 0, letterSpacing: "0.15em", textTransform: "uppercase" }}>Perfil</h1>
        <div style={{ height: "1px", width: "60px", background: `linear-gradient(to right, ${gold}, transparent)` }} />
      </div>

      <div style={{ maxWidth: 440, backgroundColor: cardBg, border: `1px solid ${border}`, borderRadius: "4px", padding: "28px 32px", position: "relative" }}>
        <span style={{ position: "absolute", top: 8, left: 8, color: gold, fontSize: "8px", opacity: 0.4 }}>✦</span>
        <span style={{ position: "absolute", top: 8, right: 8, color: gold, fontSize: "8px", opacity: 0.4 }}>✦</span>
        <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: "13px", color: gold, letterSpacing: "0.12em", textTransform: "uppercase", margin: "0 0 22px" }}>Cambiar Contraseña</h2>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            { label: "Contraseña actual", key: "actual", placeholder: "" },
            { label: "Nueva contraseña", key: "nueva", placeholder: "6-16 caracteres, número y símbolo" },
            { label: "Confirmar nueva contraseña", key: "confirmar", placeholder: "Repite la nueva contraseña" },
          ].map(({ label, key, placeholder }) => (
            <div key={key}>
              <label style={labelStyle}>{label} <span style={{ color: "#c0392b" }}>*</span></label>
              <input
                type="password"
                value={form[key as keyof typeof form]}
                onChange={e => update(key, e.target.value)}
                placeholder={placeholder}
                maxLength={key !== "actual" ? 16 : undefined}
                style={inputStyle}
              />
            </div>
          ))}

          {message && (
            <p style={{
              fontSize: "13px", fontStyle: "italic", margin: 0,
              color: ok ? "#4a7c59" : "#8b3a2a",
            }}>{message}</p>
          )}

          <button
            type="submit"
            disabled={saving}
            style={{
              fontFamily: "'Cinzel', serif", fontSize: "11px", letterSpacing: "0.12em",
              backgroundColor: "#1a1a0f", color: gold, border: `1px solid ${gold}66`,
              borderRadius: "4px", padding: "10px", cursor: saving ? "not-allowed" : "pointer",
              opacity: saving ? 0.5 : 1, marginTop: 4,
            }}
          >
            {saving ? "GUARDANDO..." : "ACTUALIZAR CONTRASEÑA"}
          </button>
        </form>
      </div>
    </div>
  );
}
