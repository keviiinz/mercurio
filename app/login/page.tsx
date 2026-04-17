"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim()) { setError("El usuario es obligatorio."); return; }
    if (!password) { setError("La contraseña es obligatoria."); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok) {
        router.push(data.punto_de_venta === "sscm" ? "/sscm" : "/dashboard");
      } else {
        setError(data.error ?? "Credenciales inválidas");
        setLoading(false);
      }
    } catch {
      setError("Error de conexión — intenta de nuevo");
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0f1117", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 380, background: "#16181f", border: "1px solid #2a2d3a", borderRadius: 8, padding: "40px 36px", boxShadow: "0 8px 40px rgba(0,0,0,0.4)" }}>

        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg, #6c63ff, #4a90e2)", margin: "0 auto 14px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
            ◈
          </div>
          <a href="/" style={{ fontFamily: "system-ui, sans-serif", fontSize: 20, fontWeight: 700, color: "#e8eaf0", margin: "0 0 4px", letterSpacing: "0.02em" }}>Mercurio</a>
          <p style={{ fontSize: 13, color: "#5a5f7a", margin: 0 }}>Plataforma de puntos de venta</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#8b90a8", marginBottom: 6, letterSpacing: "0.04em" }}>
              USUARIO <span style={{ color: "#e05252" }}>*</span>
            </label>
            <input
              type="text"
              value={username}
              onChange={e => { setUsername(e.target.value); setError(""); }}
              placeholder="nombre de usuario"
              autoComplete="off"
              style={{ width: "100%", background: "#0f1117", border: "1px solid #2a2d3a", borderRadius: 6, padding: "10px 14px", color: "#e8eaf0", fontSize: 14, outline: "none", boxSizing: "border-box", transition: "border-color 0.2s" }}
              onFocus={e => (e.target.style.borderColor = "#6c63ff")}
              onBlur={e => (e.target.style.borderColor = "#2a2d3a")}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#8b90a8", marginBottom: 6, letterSpacing: "0.04em" }}>
              CONTRASEÑA <span style={{ color: "#e05252" }}>*</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(""); }}
              placeholder="••••••••"
              style={{ width: "100%", background: "#0f1117", border: "1px solid #2a2d3a", borderRadius: 6, padding: "10px 14px", color: "#e8eaf0", fontSize: 14, outline: "none", boxSizing: "border-box", transition: "border-color 0.2s" }}
              onFocus={e => (e.target.style.borderColor = "#6c63ff")}
              onBlur={e => (e.target.style.borderColor = "#2a2d3a")}
            />
          </div>

          {error && (
            <p style={{ fontSize: 13, color: "#e05252", background: "rgba(224,82,82,0.08)", border: "1px solid rgba(224,82,82,0.2)", borderRadius: 4, padding: "8px 12px", margin: 0 }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{ background: loading ? "#2a2d3a" : "linear-gradient(135deg, #6c63ff, #4a90e2)", color: "#fff", border: "none", borderRadius: 6, padding: "12px", fontSize: 13, fontWeight: 700, letterSpacing: "0.06em", cursor: loading ? "not-allowed" : "pointer", transition: "opacity 0.2s", opacity: loading ? 0.7 : 1, marginTop: 4 }}
          >
            {loading ? "Verificando..." : "INGRESAR"}
          </button>
        </form>
      </div>
    </div>
  );
}
