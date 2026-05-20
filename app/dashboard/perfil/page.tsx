"use client";

import { useState } from "react";
import { validatePassword } from "@/lib/validations";

const cardBg = "#16181f";
const border = "#1e2130";
const textMuted = "#5a5f7a";
const textLight = "#e8eaf0";

export default function PerfilPage() {
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
    if (res.ok) { setMessage("✓ Contraseña actualizada correctamente."); setForm({ actual: "", nueva: "", confirmar: "" }); }
    else setMessage(`✗ ${data.error}`);
    setSaving(false);
  }

  const inputStyle = {
    width: "100%", background: "#0f1117", border: `1px solid ${border}`, borderRadius: 6,
    padding: "10px 14px", color: textLight, fontSize: 14, outline: "none", boxSizing: "border-box" as const,
  };
  const labelStyle = {
    display: "block", fontSize: 12, fontWeight: 600 as const, color: textMuted,
    marginBottom: 6, letterSpacing: "0.04em", textTransform: "uppercase" as const,
  };
  const ok = message.startsWith("✓");

  return (
    <div style={{ padding: 40, backgroundColor: "#0f1117", minHeight: "100vh" }}>
      <div style={{ marginBottom: 32, borderBottom: `1px solid ${border}`, paddingBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: textLight, margin: 0 }}>Perfil</h1>
        <p style={{ fontSize: 13, color: textMuted, margin: "4px 0 0" }}>Gestiona tu contraseña de acceso</p>
      </div>

      <div style={{ maxWidth: 420, background: cardBg, border: `1px solid ${border}`, borderRadius: 8, padding: "28px 32px" }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: textLight, margin: "0 0 22px" }}>Cambiar contraseña</h2>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            { label: "Contraseña actual", key: "actual" },
            { label: "Nueva contraseña", key: "nueva", placeholder: "6-16 caracteres, número y símbolo" },
            { label: "Confirmar nueva contraseña", key: "confirmar", placeholder: "Repite la nueva contraseña" },
          ].map(({ label, key, placeholder }) => (
            <div key={key}>
              <label style={labelStyle}>{label}</label>
              <input
                type="password"
                value={form[key as keyof typeof form]}
                onChange={e => update(key, e.target.value)}
                placeholder={placeholder ?? ""}
                maxLength={key !== "actual" ? 16 : undefined}
                style={inputStyle}
                onFocus={e => (e.target.style.borderColor = "#6c63ff")}
                onBlur={e => (e.target.style.borderColor = border)}
              />
            </div>
          ))}

          {message && (
            <p style={{
              fontSize: 13, borderRadius: 4, padding: "8px 12px", margin: 0,
              color: ok ? "#4a9c6a" : "#e05252",
              background: ok ? "rgba(74,156,106,0.08)" : "rgba(224,82,82,0.08)",
              border: `1px solid ${ok ? "rgba(74,156,106,0.2)" : "rgba(224,82,82,0.2)"}`,
            }}>{message}</p>
          )}

          <button
            type="submit"
            disabled={saving}
            style={{
              background: saving ? "#2a2d3a" : "linear-gradient(135deg, #6c63ff, #4a90e2)",
              color: "#fff", border: "none", borderRadius: 6, padding: "11px",
              fontSize: 13, fontWeight: 700, letterSpacing: "0.06em",
              cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1, marginTop: 4,
            }}
          >
            {saving ? "Guardando..." : "ACTUALIZAR CONTRASEÑA"}
          </button>
        </form>
      </div>
    </div>
  );
}
