"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const accent = "#6c63ff";
const border = "#1e2130";
const textMuted = "#5a5f7a";
const textLight = "#e8eaf0";
const inputStyle = { width: "100%", backgroundColor: "#0f1117", border: `1px solid ${border}`, borderRadius: 6, padding: "11px 14px", color: textLight, fontFamily: "system-ui, sans-serif", fontSize: 14, outline: "none", boxSizing: "border-box" as const };
const labelStyle = { fontSize: 11, fontWeight: 600 as const, color: textMuted, letterSpacing: "0.06em", textTransform: "uppercase" as const, display: "block", marginBottom: 6 };

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ nombre: "", username: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.nombre.trim()) { setError("El nombre es obligatorio."); return; }
    if (!form.username.trim()) { setError("El usuario es obligatorio."); return; }
    if (form.password.length < 6) { setError("La contraseña debe tener al menos 6 caracteres."); return; }
    if (form.password !== form.confirm) { setError("Las contraseñas no coinciden."); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: form.nombre, username: form.username, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Error al registrar."); return; }
      router.push("/dashboard");
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0a0b0f", fontFamily: "system-ui, sans-serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, position: "relative" }}>
      {/* Glow */}
      <div style={{ position: "fixed", top: "20%", left: "50%", transform: "translate(-50%, 0)", width: 500, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(108,99,255,0.1) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{ width: "100%", maxWidth: 420, position: "relative", zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Link href="/" style={{ textDecoration: "none", display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            <div style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg, #6c63ff, #4a90e2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: "#fff" }}>◈</div>
            <span style={{ fontSize: 20, fontWeight: 700, color: textLight }}>Mercurio</span>
          </Link>
          <p style={{ fontSize: 13, color: textMuted, marginTop: 8 }}>Crea tu cuenta para acceder al sistema</p>
        </div>

        <div style={{ backgroundColor: "#16181f", border: `1px solid ${border}`, borderRadius: 12, padding: 32, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(to right, transparent, #6c63ff, #4a90e2, transparent)" }} />

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div>
              <label style={labelStyle}>Nombre completo <span style={{ color: "#e05252" }}>*</span></label>
              <input type="text" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} placeholder="Tu nombre" style={inputStyle} autoFocus />
            </div>
            <div>
              <label style={labelStyle}>Usuario <span style={{ color: "#e05252" }}>*</span></label>
              <input type="text" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} placeholder="ej. jgarcia" style={inputStyle} autoComplete="username" />
            </div>
            <div>
              <label style={labelStyle}>Contraseña <span style={{ color: "#e05252" }}>*</span></label>
              <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Mínimo 6 caracteres" style={inputStyle} autoComplete="new-password" />
            </div>
            <div>
              <label style={labelStyle}>Confirmar contraseña <span style={{ color: "#e05252" }}>*</span></label>
              <input type="password" value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} placeholder="Repite tu contraseña" style={inputStyle} autoComplete="new-password" />
            </div>

            {error && (
              <div style={{ backgroundColor: "rgba(224,82,82,0.08)", border: "1px solid rgba(224,82,82,0.2)", borderRadius: 6, padding: "10px 14px", fontSize: 13, color: "#e05252" }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{ fontSize: 14, fontWeight: 700, color: "#fff", border: "none", borderRadius: 8, padding: 13, cursor: loading ? "not-allowed" : "pointer", background: "linear-gradient(135deg, #6c63ff, #4a90e2)", opacity: loading ? 0.6 : 1, marginTop: 2, transition: "opacity 0.2s" }}>
              {loading ? "Creando cuenta..." : "Crear cuenta"}
            </button>
          </form>
        </div>

        <p style={{ textAlign: "center", fontSize: 13, color: textMuted, marginTop: 20 }}>
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" style={{ color: accent, textDecoration: "none", fontWeight: 600 }}>Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
}
