"use client";

import { useEffect, useState, useRef } from "react";

interface Client {
  id: number;
  nombre_real: string;
  nombre_juego: string;
  bolsa_pavos: number;
  bolsa_pesos: number;
}

interface Cuenta {
  id: number;
  nombre: string;
  pavos: number;
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

export default function VentasPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [cuentas, setCuentas] = useState<Cuenta[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientSearch, setClientSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [form, setForm] = useState({
    client_id: "", type: "regalo", total_vbucks: "",
    vbucks_cashback_used: "0", pesos_cashback_used: "0",
    notes: "", fecha: "", cuenta_id: "", es_sorteo: false,
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [preview, setPreview] = useState<any>(null);

  useEffect(() => { loadClients(); loadCuentas(); }, []);
  useEffect(() => { calculatePreview(); }, [form]);
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
        setHighlightedIndex(-1);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function loadClients() {
    const res = await fetch("/api/sscm/clientes");
    setClients(await res.json());
  }

  async function loadCuentas() {
    const res = await fetch("/api/sscm/cuentas");
    setCuentas(await res.json());
  }

  function calculatePreview() {
    const total = parseInt(form.total_vbucks) || 0;
    const vbucksUsed = parseInt(form.vbucks_cashback_used) || 0;
    const pesosUsed = parseFloat(form.pesos_cashback_used) || 0;
    if (total <= 0) { setPreview(null); return; }

    const pricePerHundred = 8;
    const costPerHundred = 6;
    const giftCashback = 5;
    const codeCashback = 100;
    const vbucksFromConversion = Math.round((pesosUsed / pricePerHundred) * 100 / 100) * 100;
    const realPaid = total - vbucksUsed - vbucksFromConversion;
    if (realPaid < 0) { setPreview(null); return; }

    if (form.es_sorteo) {
      const cost = (realPaid / 100) * costPerHundred;
      setPreview({ realPaid, cashback: 0, cost, revenue: 0, profit: 0, esSorteo: true });
      return;
    }

    let cashback = 0, cost = 0, revenue = 0, profit = 0;
    if (form.type === "regalo") {
      cashback = (realPaid / 1000) * giftCashback;
      cost = (realPaid / 100) * costPerHundred;
      revenue = (realPaid / 100) * pricePerHundred;
      profit = revenue - cost - cashback;
    } else {
      cashback = (realPaid / 1000) * codeCashback;
    }
    setPreview({ realPaid, cashback, cost, revenue, profit, esSorteo: false });
  }

  const filteredClients = clients.filter(c =>
    c.nombre_real.toLowerCase().includes(clientSearch.toLowerCase()) ||
    c.nombre_juego.toLowerCase().includes(clientSearch.toLowerCase())
  );

  const vbucksError = selectedClient && parseInt(form.vbucks_cashback_used) > selectedClient.bolsa_pavos
    ? `Solo tiene ${selectedClient.bolsa_pavos}V disponibles` : "";
  const pesosError = selectedClient && parseFloat(form.pesos_cashback_used) > selectedClient.bolsa_pesos
    ? `Solo tiene $${selectedClient.bolsa_pesos} disponibles` : "";

  function selectClient(c: Client) {
    setSelectedClient(c);
    setClientSearch(`${c.nombre_real} (${c.nombre_juego})`);
    setForm({ ...form, client_id: c.id.toString(), vbucks_cashback_used: "0", pesos_cashback_used: "0" });
    setShowDropdown(false);
    setHighlightedIndex(-1);
  }

  async function handleSubmit() {
    if (!form.client_id) { setMessage("✗ Selecciona un cliente."); return; }
    if (!form.total_vbucks || parseInt(form.total_vbucks) <= 0) { setMessage("✗ El total de pavos es obligatorio."); return; }
    if (vbucksError || pesosError) return;
    setSaving(true); setMessage("");
    try {
      const res = await fetch("/api/sscm/ventas", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("✦ Venta registrada correctamente.");
        setForm({ client_id: "", type: "regalo", total_vbucks: "", vbucks_cashback_used: "0", pesos_cashback_used: "0", notes: "", fecha: "", cuenta_id: "", es_sorteo: false });
        setSelectedClient(null);
        setClientSearch("");
        setPreview(null);
        loadClients();
        loadCuentas();
      } else {
        setMessage(`✗ ${data.error}`);
      }
    } catch { setMessage("✗ Error de conexión."); }
    finally { setSaving(false); }
  }

  return (
    <div style={{ padding: "40px", backgroundColor: "#0a0a0a", minHeight: "100vh" }}>

      <div style={{ marginBottom: "32px", borderBottom: `1px solid ${border}`, paddingBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ height: "1px", width: "30px", background: `linear-gradient(to right, transparent, ${gold})` }} />
          <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: "22px", fontWeight: 700, color: gold, margin: 0, letterSpacing: "0.15em", textTransform: "uppercase" }}>Nueva Venta</h1>
          <div style={{ height: "1px", width: "60px", background: `linear-gradient(to right, ${gold}, transparent)` }} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px", maxWidth: "900px" }}>

        <div style={{ backgroundColor: cardBg, border: `1px solid ${border}`, borderRadius: "4px", padding: "28px", position: "relative" }}>
          <span style={{ position: "absolute", top: 8, left: 8, color: gold, fontSize: "8px", opacity: 0.4 }}>✦</span>
          <span style={{ position: "absolute", top: 8, right: 8, color: gold, fontSize: "8px", opacity: 0.4 }}>✦</span>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

            <div style={{ position: "relative" }} ref={dropdownRef}>
              <label style={labelStyle}>Cliente <span style={{ color: "#c0392b" }}>*</span></label>
              <input
                type="text"
                value={clientSearch}
                onChange={(e) => {
                  setClientSearch(e.target.value);
                  setShowDropdown(true);
                  setHighlightedIndex(-1);
                  if (!e.target.value) {
                    setSelectedClient(null);
                    setForm({ ...form, client_id: "", vbucks_cashback_used: "0", pesos_cashback_used: "0" });
                  }
                }}
                onFocus={() => setShowDropdown(true)}
                onKeyDown={(e) => {
                  if (!showDropdown || filteredClients.length === 0) return;
                  if (e.key === "ArrowDown" || e.key === "Tab") {
                    e.preventDefault();
                    setHighlightedIndex(i => Math.min(i + 1, filteredClients.length - 1));
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setHighlightedIndex(i => Math.max(i - 1, 0));
                  } else if (e.key === "Enter" && highlightedIndex >= 0) {
                    e.preventDefault();
                    selectClient(filteredClients[highlightedIndex]);
                  } else if (e.key === "Escape") {
                    setShowDropdown(false);
                    setHighlightedIndex(-1);
                  }
                }}
                placeholder="Buscar cliente..."
                style={inputStyle}
              />
              {showDropdown && clientSearch && filteredClients.length > 0 && (
                <div style={{
                  position: "absolute", top: "100%", left: 0, right: 0, zIndex: 50,
                  backgroundColor: "#0f0f0f", border: `1px solid ${border}`,
                  borderRadius: "4px", maxHeight: "200px", overflowY: "auto", marginTop: "4px",
                }}>
                  {filteredClients.map((c, i) => (
                    <div key={c.id}
                      onClick={() => selectClient(c)}
                      onMouseEnter={() => setHighlightedIndex(i)}
                      onMouseLeave={() => setHighlightedIndex(-1)}
                      style={{
                        padding: "10px 14px", cursor: "pointer",
                        borderBottom: `1px solid ${border}`, transition: "background 0.15s",
                        backgroundColor: highlightedIndex === i ? "#1a1a0f" : "transparent",
                      }}
                    >
                      <p style={{ fontFamily: "'Cinzel', serif", fontSize: "12px", color: textLight, margin: "0 0 2px" }}>{c.nombre_real}</p>
                      <p style={{ fontSize: "11px", color: textMuted, fontStyle: "italic", margin: 0 }}>{c.nombre_juego}</p>
                    </div>
                  ))}
                </div>
              )}
              {selectedClient && (
                <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                  <span style={{ fontFamily: "'Cinzel', serif", fontSize: "10px", color: "#8b6914", letterSpacing: "0.08em" }}>
                    BOLSA: {selectedClient.bolsa_pavos}V
                  </span>
                  <span style={{ fontFamily: "'Cinzel', serif", fontSize: "10px", color: "#4a7c59", letterSpacing: "0.08em" }}>
                    ${selectedClient.bolsa_pesos} PESOS
                  </span>
                </div>
              )}
            </div>

            <div>
              <label style={labelStyle}>Tipo de venta</label>
              <div style={{ display: "flex", gap: "8px" }}>
                {["regalo", "codigo"].map((t) => (
                  <button key={t} onClick={() => setForm({ ...form, type: t, cuenta_id: "" })} style={{
                    flex: 1, fontFamily: "'Cinzel', serif", fontSize: "11px", letterSpacing: "0.1em",
                    padding: "9px", borderRadius: "4px", cursor: "pointer",
                    border: `1px solid ${form.type === t ? gold + "66" : border}`,
                    backgroundColor: form.type === t ? "#1a1a0f" : "transparent",
                    color: form.type === t ? gold : textMuted,
                  }}>
                    {t === "regalo" ? "REGALO" : "CÓDIGO"}
                  </button>
                ))}
              </div>
            </div>

            {form.type === "regalo" && (
              <div>
                <label style={labelStyle}>Cuenta de envío</label>
                <select
                  value={form.cuenta_id}
                  onChange={(e) => setForm({ ...form, cuenta_id: e.target.value })}
                  style={{ ...inputStyle, appearance: "none" as const }}
                >
                  <option value="">Sin cuenta asignada</option>
                  {cuentas.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.nombre} — {c.pavos.toLocaleString()}V disponibles
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label style={labelStyle}>Total de pavos <span style={{ color: "#c0392b" }}>*</span></label>
              <input type="number" value={form.total_vbucks} onChange={(e) => setForm({ ...form, total_vbucks: e.target.value })} placeholder="0" style={inputStyle} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label style={labelStyle}>Pavos de bolsa</label>
                <input type="number" value={form.vbucks_cashback_used}
                  onChange={(e) => setForm({ ...form, vbucks_cashback_used: e.target.value })}
                  style={{ ...inputStyle, borderColor: vbucksError ? "#8b3a2a" : "#2a2a1a" }}
                />
                {vbucksError && <p style={{ color: "#8b3a2a", fontSize: "11px", fontStyle: "italic", margin: "4px 0 0" }}>{vbucksError}</p>}
              </div>
              <div>
                <label style={labelStyle}>Pesos de bolsa</label>
                <input type="number" value={form.pesos_cashback_used}
                  onChange={(e) => setForm({ ...form, pesos_cashback_used: e.target.value })}
                  style={{ ...inputStyle, borderColor: pesosError ? "#8b3a2a" : "#2a2a1a" }}
                />
                {pesosError && <p style={{ color: "#8b3a2a", fontSize: "11px", fontStyle: "italic", margin: "4px 0 0" }}>{pesosError}</p>}
              </div>
            </div>

            <div>
              <label style={labelStyle}>Fecha <span style={{ color: "#3a3a2a", fontSize: "9px" }}>(vacío = hoy)</span></label>
              <input type="date" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>Notas</label>
              <input type="text" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Opcional" style={inputStyle} />
            </div>

            {message && (
              <p style={{ color: message.startsWith("✦") ? "#4a7c59" : "#8b3a2a", fontStyle: "italic", fontSize: "13px", margin: 0 }}>
                {message}
              </p>
            )}

            {form.type === "regalo" && (
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <input
                  type="checkbox"
                  id="es_sorteo"
                  checked={form.es_sorteo}
                  onChange={(e) => setForm({ ...form, es_sorteo: e.target.checked })}
                  style={{ width: "16px", height: "16px", accentColor: gold }}
                />
                <label htmlFor="es_sorteo" style={{ fontFamily: "'Cinzel', serif", fontSize: "11px", color: textMuted, letterSpacing: "0.1em", cursor: "pointer" }}>
                  ES SORTEO (sin cobro ni cashback)
                </label>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={saving || !form.client_id || !form.total_vbucks || !!vbucksError || !!pesosError}
              style={{
                fontFamily: "'Cinzel', serif", fontSize: "12px", letterSpacing: "0.15em",
                backgroundColor: "#1a1a0f", color: gold, border: `1px solid ${gold}66`,
                borderRadius: "4px", padding: "12px", cursor: "pointer",
                opacity: (saving || !form.client_id || !form.total_vbucks || !!vbucksError || !!pesosError) ? 0.4 : 1,
                transition: "all 0.2s",
              }}
            >
              {saving ? "REGISTRANDO..." : "REGISTRAR VENTA"}
            </button>
          </div>
        </div>

        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <span style={{ color: gold, fontSize: "12px" }}>✦</span>
            <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: "13px", color: gold, letterSpacing: "0.12em", textTransform: "uppercase", margin: 0 }}>Vista Previa</h2>
            <div style={{ flex: 1, height: "1px", background: `linear-gradient(to right, ${border}, transparent)` }} />
          </div>

          {!preview ? (
            <div style={{ backgroundColor: cardBg, border: `1px solid ${border}`, borderRadius: "4px", padding: "28px", textAlign: "center" }}>
              <p style={{ color: "#3a3a2a", fontFamily: "'Cinzel', serif", fontSize: "11px", letterSpacing: "0.1em" }}>
                INGRESA LOS DATOS PARA VER LA VISTA PREVIA
              </p>
            </div>
          ) : (
            <div style={{ backgroundColor: cardBg, border: `1px solid ${border}`, borderRadius: "4px", padding: "24px", position: "relative" }}>
              <span style={{ position: "absolute", top: 8, left: 8, color: gold, fontSize: "8px", opacity: 0.4 }}>✦</span>
              <span style={{ position: "absolute", top: 8, right: 8, color: gold, fontSize: "8px", opacity: 0.4 }}>✦</span>
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {[
                  { label: "Pavos reales pagados", value: `${preview.realPaid.toLocaleString()}V`, accent: textLight },
                  ...(preview.esSorteo ? [
                    { label: "Costo", value: `$${preview.cost.toFixed(2)}`, accent: "#8b3a2a" },
                    { label: "Cashback generado", value: "$0.00", accent: textMuted },
                    { label: "Ganancia neta", value: "$0.00", accent: textMuted },
                  ] : [
                    { label: "Cashback generado", value: form.type === "regalo" ? `$${preview.cashback.toFixed(2)} pesos` : `${preview.cashback.toFixed(0)}V pavos`, accent: "#8b6914" },
                    ...(form.type === "regalo" ? [
                      { label: "Ingreso bruto", value: `$${preview.revenue.toFixed(2)}`, accent: textLight },
                      { label: "Costo", value: `$${preview.cost.toFixed(2)}`, accent: "#8b3a2a" },
                      { label: "Ganancia neta", value: `$${preview.profit.toFixed(2)}`, accent: "#4a7c59" },
                    ] : []),
                  ]),
                ].map(({ label, value, accent }) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${border}`, paddingBottom: "10px" }}>
                    <span style={{ fontFamily: "'Cinzel', serif", fontSize: "10px", color: textMuted, letterSpacing: "0.1em", textTransform: "uppercase" }}>{label}</span>
                    <span style={{ fontFamily: "'Cinzel', serif", fontSize: "14px", fontWeight: 700, color: accent }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
