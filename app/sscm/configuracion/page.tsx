"use client";

import { useEffect, useState } from "react";

interface Config {
  id: number;
  costo_por_100v: number;
  precio_por_100v: number;
  cashback_regalo: number;
  cashback_codigo: number;
  vigente_desde: string;
}

const gold = "#c9a84c";
const cardBg = "#131310";
const border = "#2a2a1a";
const textMuted = "#6a6a5a";
const textLight = "#c8c8b8";

const inputStyle = {
  width: "100%", backgroundColor: "#0f0f0f", border: `1px solid #2a2a1a`,
  borderRadius: "4px", padding: "10px 14px", color: textLight,
  fontFamily: "'Crimson Text', serif", fontSize: "14px",
  outline: "none", boxSizing: "border-box" as const,
};

const labelStyle = {
  fontFamily: "'Cinzel', serif", fontSize: "10px", color: textMuted,
  letterSpacing: "0.12em", textTransform: "uppercase" as const,
  display: "block", marginBottom: "8px",
};

export default function ConfiguracionPage() {
  const [configs, setConfigs] = useState<Config[]>([]);
  const [form, setForm] = useState({ costo_por_100v: "", precio_por_100v: "", cashback_regalo: "", cashback_codigo: "" });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => { loadConfigs(); }, []);

  async function loadConfigs() {
    const res = await fetch("/api/sscm/configuracion");
    const data = await res.json();
    setConfigs(Array.isArray(data) ? data : [data]);
    if (data.length > 0) {
      const latest = data[0];
      setForm({
        costo_por_100v: latest.costo_por_100v.toString(),
        precio_por_100v: latest.precio_por_100v.toString(),
        cashback_regalo: latest.cashback_regalo.toString(),
        cashback_codigo: latest.cashback_codigo.toString(),
      });
    }
  }

  async function handleSave() {
    const vals = [form.costo_por_100v, form.precio_por_100v, form.cashback_regalo, form.cashback_codigo];
    if (vals.some(v => !v.trim() || isNaN(parseFloat(v)))) {
      setMessage("✗ Todos los campos son obligatorios y deben ser numéricos."); return;
    }
    if (vals.some(v => parseFloat(v) <= 0)) {
      setMessage("✗ Todos los valores deben ser mayores a cero."); return;
    }
    if (parseFloat(form.precio_por_100v) <= parseFloat(form.costo_por_100v)) {
      setMessage("✗ El precio por 100V debe ser mayor al costo."); return;
    }
    setSaving(true); setMessage("");
    try {
      const res = await fetch("/api/sscm/configuracion", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          costo_por_100v: parseFloat(form.costo_por_100v),
          precio_por_100v: parseFloat(form.precio_por_100v),
          cashback_regalo: parseFloat(form.cashback_regalo),
          cashback_codigo: parseFloat(form.cashback_codigo),
        }),
      });
      if (res.ok) { setMessage("✦ Configuración guardada."); loadConfigs(); }
      else setMessage("✗ Error al guardar.");
    } catch { setMessage("✗ Error de conexión."); }
    finally { setSaving(false); }
  }

  return (
    <div style={{ padding: "40px", backgroundColor: "#0a0a0a", minHeight: "100vh" }}>

      <div style={{ marginBottom: "32px", borderBottom: `1px solid ${border}`, paddingBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ height: "1px", width: "30px", background: `linear-gradient(to right, transparent, ${gold})` }} />
          <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: "22px", fontWeight: 700, color: gold, margin: 0, letterSpacing: "0.15em", textTransform: "uppercase" }}>Configuración</h1>
          <div style={{ height: "1px", width: "60px", background: `linear-gradient(to right, ${gold}, transparent)` }} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px", maxWidth: "900px" }}>

        <div style={{ backgroundColor: cardBg, border: `1px solid ${border}`, borderRadius: "4px", padding: "28px", position: "relative" }}>
          <span style={{ position: "absolute", top: 8, left: 8, color: gold, fontSize: "8px", opacity: 0.4 }}>✦</span>
          <span style={{ position: "absolute", top: 8, right: 8, color: gold, fontSize: "8px", opacity: 0.4 }}>✦</span>

          <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: "13px", color: gold, letterSpacing: "0.12em", textTransform: "uppercase", margin: "0 0 24px" }}>
            Tasas Actuales
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              {[
                { label: "Costo por 100V ($)", key: "costo_por_100v", placeholder: "6" },
                { label: "Precio por 100V ($)", key: "precio_por_100v", placeholder: "8" },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label style={labelStyle}>{label} <span style={{ color: "#c0392b" }}>*</span></label>
                  <input
                    type="number"
                    value={form[key as keyof typeof form]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    placeholder={placeholder}
                    style={inputStyle}
                  />
                </div>
              ))}
            </div>

            <div style={{ height: "1px", background: `linear-gradient(to right, transparent, ${border}, transparent)` }} />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              {[
                { label: "Cashback Regalo ($ / 1000V)", key: "cashback_regalo", placeholder: "5" },
                { label: "Cashback Código (V / 1000V)", key: "cashback_codigo", placeholder: "100" },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label style={labelStyle}>{label} <span style={{ color: "#c0392b" }}>*</span></label>
                  <input
                    type="number"
                    value={form[key as keyof typeof form]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    placeholder={placeholder}
                    style={inputStyle}
                  />
                </div>
              ))}
            </div>

            {message && (
              <p style={{ color: message.startsWith("✦") ? "#4a7c59" : "#8b3a2a", fontStyle: "italic", fontSize: "13px", margin: 0 }}>
                {message}
              </p>
            )}

            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                fontFamily: "'Cinzel', serif", fontSize: "12px", letterSpacing: "0.15em",
                backgroundColor: "#1a1a0f", color: gold, border: `1px solid ${gold}66`,
                borderRadius: "4px", padding: "12px", cursor: "pointer",
                opacity: saving ? 0.5 : 1, transition: "all 0.2s",
              }}
            >
              {saving ? "GUARDANDO..." : "GUARDAR CONFIGURACIÓN"}
            </button>
          </div>
        </div>

        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <span style={{ color: gold, fontSize: "12px" }}>◎</span>
            <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: "13px", color: gold, letterSpacing: "0.12em", textTransform: "uppercase", margin: 0 }}>Historial de Tasas</h2>
            <div style={{ flex: 1, height: "1px", background: `linear-gradient(to right, ${border}, transparent)` }} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {configs.length === 0 ? (
              <p style={{ color: textMuted, fontStyle: "italic", fontSize: "13px" }}>No hay configuraciones registradas.</p>
            ) : configs.map((config, i) => (
              <div key={config.id} style={{
                backgroundColor: cardBg, border: `1px solid ${i === 0 ? gold + "33" : border}`,
                borderRadius: "4px", padding: "16px 20px", position: "relative",
              }}>
                {i === 0 && (
                  <span style={{ position: "absolute", top: 8, right: 10, fontFamily: "'Cinzel', serif", fontSize: "9px", letterSpacing: "0.1em", color: "#4a7c59", backgroundColor: "#1a2a1a", border: "1px solid #2a4a2a", borderRadius: "2px", padding: "2px 8px" }}>
                    VIGENTE
                  </span>
                )}
                <p style={{ fontFamily: "'Cinzel', serif", fontSize: "10px", color: textMuted, letterSpacing: "0.1em", margin: "0 0 12px" }}>
                  {new Date(config.vigente_desde).toLocaleDateString("es-MX", { day: "2-digit", month: "long", year: "numeric" }).toUpperCase()}
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  {[
                    { label: "Costo / 100V", value: `$${config.costo_por_100v}` },
                    { label: "Precio / 100V", value: `$${config.precio_por_100v}` },
                    { label: "Cashback Regalo", value: `$${config.cashback_regalo} / 1000V` },
                    { label: "Cashback Código", value: `${config.cashback_codigo}V / 1000V` },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p style={{ fontFamily: "'Cinzel', serif", fontSize: "9px", color: textMuted, letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 3px" }}>{label}</p>
                      <p style={{ fontFamily: "'Cinzel', serif", fontSize: "13px", color: textLight, margin: 0 }}>{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
