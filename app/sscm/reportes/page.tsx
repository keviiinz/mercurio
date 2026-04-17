"use client";

import { useEffect, useState } from "react";

interface Period {
  id: number;
  nombre: string;
  activo: boolean;
}

interface Summary {
  totalSales: number;
  giftSales: number;
  codeSales: number;
  totalVbucks: number;
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  totalCashbackPesos: number;
  totalCashbackPavos: number;
}

interface ClientSummary {
  id: number;
  nombre_real: string;
  nombre_juego: string;
  totalVbucks: number;
  totalRevenue: number;
  totalProfit: number;
  totalSales: number;
  cashbackPesos: number;
  cashbackPavos: number;
}

const gold = "#c9a84c";
const cardBg = "#131310";
const border = "#2a2a1a";
const textMuted = "#6a6a5a";
const textLight = "#c8c8b8";

export default function ReportesPage() {
  const [periods, setPeriods] = useState<Period[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState("");
  const [summary, setSummary] = useState<Summary | null>(null);
  const [clientSummary, setClientSummary] = useState<ClientSummary[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadPeriods(); }, []);
  useEffect(() => { loadReport(); }, [selectedPeriod]);

  async function loadPeriods() {
    const res = await fetch("/api/sscm/periodos");
    const data = await res.json();
    setPeriods(data);
    const active = data.find((p: Period) => p.activo);
    if (active) setSelectedPeriod(active.id.toString());
  }

  async function loadReport() {
    setLoading(true);
    const url = selectedPeriod ? `/api/sscm/reportes?period_id=${selectedPeriod}` : `/api/sscm/reportes`;
    const res = await fetch(url);
    const data = await res.json();
    setSummary(data.summary);
    setClientSummary(data.clientSummary);
    setLoading(false);
  }

  return (
    <div style={{ padding: "40px", backgroundColor: "#0a0a0a", minHeight: "100vh" }}>

      <div style={{ marginBottom: "32px", borderBottom: `1px solid ${border}`, paddingBottom: "24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ height: "1px", width: "30px", background: `linear-gradient(to right, transparent, ${gold})` }} />
          <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: "22px", fontWeight: 700, color: gold, margin: 0, letterSpacing: "0.15em", textTransform: "uppercase" }}>Reportes</h1>
          <div style={{ height: "1px", width: "60px", background: `linear-gradient(to right, ${gold}, transparent)` }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            style={{
              backgroundColor: cardBg, border: `1px solid ${border}`, borderRadius: "4px",
              padding: "8px 16px", color: textLight, fontFamily: "'Cinzel', serif",
              fontSize: "11px", letterSpacing: "0.1em", outline: "none", cursor: "pointer",
              appearance: "none",
            }}
          >
            <option value="">TODOS LOS PERIODOS</option>
            {periods.map((p) => (
              <option key={p.id} value={p.id}>{p.nombre.toUpperCase()}{p.activo ? " (ACTIVO)" : ""}</option>
            ))}
          </select>
          <span style={{ fontFamily: "'Cinzel', serif", fontSize: "9px", color: textMuted, letterSpacing: "0.1em" }}>
            Cambia el periodo para filtrar el reporte
          </span>
        </div>
      </div>

      {loading ? (
        <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "32px 0" }}>
          <div style={{ width: "16px", height: "16px", border: `2px solid ${gold}33`, borderTop: `2px solid ${gold}`, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          <span style={{ color: textMuted, fontFamily: "'Cinzel', serif", fontSize: "11px", letterSpacing: "0.15em" }}>CARGANDO REPORTE...</span>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : summary && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "36px" }}>
            {[
              { label: "Total Ventas", value: String(summary.totalSales), sub: `${summary.giftSales} regalo · ${summary.codeSales} código`, accent: textLight },
              { label: "Pavos Movidos", value: `${summary.totalVbucks.toLocaleString()}V`, accent: "#8b6914" },
              { label: "Ganancia Total", value: `$${summary.totalProfit.toFixed(2)}`, accent: "#4a7c59" },
              { label: "Ingresos Brutos", value: `$${summary.totalRevenue.toFixed(2)}`, accent: textLight },
              { label: "Costo Total", value: `$${summary.totalCost.toFixed(2)}`, accent: "#8b3a2a" },
              { label: "Cashback Otorgado", value: `$${summary.totalCashbackPesos.toFixed(2)}`, sub: `${summary.totalCashbackPavos.toFixed(0)}V en pavos`, accent: "#8b6914" },
            ].map(({ label, value, sub, accent }) => (
              <div key={label} style={{ backgroundColor: cardBg, border: `1px solid ${border}`, borderRadius: "4px", padding: "20px", position: "relative", overflow: "hidden" }}>
                <span style={{ position: "absolute", top: 6, left: 6, color: gold, fontSize: "8px", opacity: 0.3 }}>✦</span>
                <span style={{ position: "absolute", top: 6, right: 6, color: gold, fontSize: "8px", opacity: 0.3 }}>✦</span>
                <p style={{ fontFamily: "'Cinzel', serif", fontSize: "10px", color: textMuted, letterSpacing: "0.15em", textTransform: "uppercase", margin: "0 0 10px" }}>{label}</p>
                <p style={{ fontFamily: "'Cinzel', serif", fontSize: "20px", fontWeight: 700, color: accent, margin: 0 }}>{value}</p>
                {sub && <p style={{ fontSize: "11px", color: textMuted, fontStyle: "italic", margin: "4px 0 0" }}>{sub}</p>}
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "2px", background: `linear-gradient(to right, transparent, ${accent}33, transparent)` }} />
              </div>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <span style={{ color: gold, fontSize: "12px" }}>⚜</span>
            <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: "13px", color: gold, letterSpacing: "0.12em", textTransform: "uppercase", margin: 0 }}>Desglose por Cliente</h2>
            <div style={{ flex: 1, height: "1px", background: `linear-gradient(to right, ${border}, transparent)` }} />
          </div>

          <div style={{ backgroundColor: cardBg, border: `1px solid ${border}`, borderRadius: "4px", overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr", padding: "12px 20px", borderBottom: `1px solid ${border}`, backgroundColor: "#0f0f0f" }}>
              {["Cliente", "Ventas", "Pavos", "Ingresos", "Ganancia", "Cashback"].map((h) => (
                <span key={h} style={{ fontFamily: "'Cinzel', serif", fontSize: "10px", color: textMuted, letterSpacing: "0.12em", textTransform: "uppercase", textAlign: h !== "Cliente" ? "right" : "left" as any }}>
                  {h}
                </span>
              ))}
            </div>

            {clientSummary.map((client, i) => (
              <div key={client.id} style={{
                display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr",
                padding: "14px 20px",
                borderBottom: i < clientSummary.length - 1 ? `1px solid ${border}` : "none",
                transition: "background 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#1a1a0f")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                <a href={`/sscm/clientes/${client.id}`} style={{ textDecoration: "none" }}>
                  <p style={{ fontFamily: "'Cinzel', serif", fontSize: "13px", color: textLight, margin: "0 0 3px" }}>{client.nombre_real}</p>
                  <p style={{ fontSize: "11px", color: textMuted, fontStyle: "italic", margin: 0 }}>{client.nombre_juego}</p>
                </a>
                <span style={{ fontFamily: "'Cinzel', serif", fontSize: "13px", color: textLight, textAlign: "right", alignSelf: "center" }}>{client.totalSales}</span>
                <span style={{ fontFamily: "'Cinzel', serif", fontSize: "13px", color: "#8b6914", textAlign: "right", alignSelf: "center" }}>{client.totalVbucks.toLocaleString()}V</span>
                <span style={{ fontFamily: "'Cinzel', serif", fontSize: "13px", color: textLight, textAlign: "right", alignSelf: "center" }}>${client.totalRevenue.toFixed(2)}</span>
                <span style={{ fontFamily: "'Cinzel', serif", fontSize: "13px", color: "#4a7c59", textAlign: "right", alignSelf: "center" }}>${client.totalProfit.toFixed(2)}</span>
                <div style={{ textAlign: "right", alignSelf: "center" }}>
                  {client.cashbackPesos > 0 && <p style={{ fontFamily: "'Cinzel', serif", fontSize: "11px", color: "#8b6914", margin: 0 }}>${client.cashbackPesos.toFixed(2)}</p>}
                  {client.cashbackPavos > 0 && <p style={{ fontFamily: "'Cinzel', serif", fontSize: "11px", color: "#8b6914", margin: 0 }}>{client.cashbackPavos.toFixed(0)}V</p>}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
