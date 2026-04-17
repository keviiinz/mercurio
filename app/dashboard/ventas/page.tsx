"use client";

import { useEffect, useState } from "react";

interface Producto { id: number; nombre: string; precio: number; stock: number; }
interface ItemCarrito { producto: Producto; cantidad: number; }

const accent = "#6c63ff";
const cardBg = "#16181f";
const border = "#1e2130";
const textMuted = "#5a5f7a";
const textLight = "#e8eaf0";
const inputStyle = { backgroundColor: "#0f1117", border: `1px solid ${border}`, borderRadius: 6, padding: "8px 12px", color: textLight, fontFamily: "system-ui, sans-serif", fontSize: 13, outline: "none", width: "60px", textAlign: "center" as const };

export default function NuevaVentaPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
  const [notas, setNotas] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => { load(); }, []);
  async function load() {
    const r = await fetch("/api/base/productos");
    setProductos(await r.json());
  }

  function addToCart(p: Producto) {
    setCarrito(prev => {
      const exists = prev.find(i => i.producto.id === p.id);
      if (exists) return prev.map(i => i.producto.id === p.id ? { ...i, cantidad: i.cantidad + 1 } : i);
      return [...prev, { producto: p, cantidad: 1 }];
    });
  }

  function updateQty(id: number, qty: number) {
    if (qty <= 0) { setCarrito(prev => prev.filter(i => i.producto.id !== id)); return; }
    setCarrito(prev => prev.map(i => i.producto.id === id ? { ...i, cantidad: qty } : i));
  }

  const total = carrito.reduce((acc, i) => acc + i.producto.precio * i.cantidad, 0);

  async function handleSubmit() {
    if (carrito.length === 0) { setMessage("✗ Agrega al menos un producto."); return; }
    setSaving(true); setMessage("");
    const items = carrito.map(i => ({ producto_id: i.producto.id, cantidad: i.cantidad, precio_unit: i.producto.precio }));
    const res = await fetch("/api/base/ventas", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items, notas }) });
    const data = await res.json();
    if (res.ok) { setMessage("✓ Venta registrada."); setCarrito([]); setNotas(""); load(); }
    else setMessage(`✗ ${data.error}`);
    setSaving(false);
  }

  return (
    <div style={{ padding: 40, backgroundColor: "#0f1117", minHeight: "100vh" }}>
      <div style={{ marginBottom: 32, borderBottom: `1px solid ${border}`, paddingBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: textLight, margin: 0 }}>Nueva Venta</h1>
        <p style={{ fontSize: 13, color: textMuted, margin: "4px 0 0" }}>Selecciona los productos y registra la venta</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24, maxWidth: 960 }}>

        {/* Catálogo */}
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, color: textMuted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 14 }}>Catálogo</p>
          {productos.length === 0
            ? <p style={{ color: textMuted, fontSize: 13, fontStyle: "italic" }}>No tienes productos. Agrégalos en la sección Productos.</p>
            : <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10 }}>
                {productos.map(p => {
                  const enCarrito = carrito.find(i => i.producto.id === p.id);
                  return (
                    <div key={p.id} onClick={() => addToCart(p)} style={{ backgroundColor: cardBg, border: `1px solid ${enCarrito ? accent + "55" : border}`, borderRadius: 8, padding: 16, cursor: "pointer", transition: "border-color 0.15s, background 0.15s", position: "relative" }}
                      onMouseEnter={e => { if (!enCarrito) e.currentTarget.style.borderColor = "#2e3148"; }}
                      onMouseLeave={e => { if (!enCarrito) e.currentTarget.style.borderColor = border; }}>
                      {enCarrito && <span style={{ position: "absolute", top: 8, right: 8, width: 18, height: 18, borderRadius: "50%", backgroundColor: accent, color: "#fff", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{enCarrito.cantidad}</span>}
                      <p style={{ fontSize: 13, fontWeight: 600, color: textLight, margin: "0 0 6px" }}>{p.nombre}</p>
                      <p style={{ fontSize: 15, fontWeight: 700, color: "#4a9c6a", margin: "0 0 4px" }}>${p.precio.toFixed(2)}</p>
                      <p style={{ fontSize: 11, color: textMuted, margin: 0 }}>Stock: {p.stock}</p>
                    </div>
                  );
                })}
              </div>
          }
        </div>

        {/* Carrito */}
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, color: textMuted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 14 }}>Carrito</p>
          <div style={{ backgroundColor: cardBg, border: `1px solid ${border}`, borderRadius: 8, overflow: "hidden" }}>
            {carrito.length === 0
              ? <p style={{ padding: 20, color: textMuted, fontSize: 13, fontStyle: "italic", textAlign: "center" }}>Sin productos</p>
              : <>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    {carrito.map(item => (
                      <div key={item.producto.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: `1px solid ${border}` }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 13, fontWeight: 600, color: textLight, margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.producto.nombre}</p>
                          <p style={{ fontSize: 11, color: textMuted, margin: 0 }}>${item.producto.precio.toFixed(2)} c/u</p>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: 10 }}>
                          <button onClick={() => updateQty(item.producto.id, item.cantidad - 1)} style={{ width: 24, height: 24, borderRadius: 4, border: `1px solid ${border}`, backgroundColor: "#0f1117", color: textLight, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                          <input type="number" value={item.cantidad} min={1} onChange={e => updateQty(item.producto.id, parseInt(e.target.value) || 0)} style={inputStyle} />
                          <button onClick={() => updateQty(item.producto.id, item.cantidad + 1)} style={{ width: 24, height: 24, borderRadius: 4, border: `1px solid ${border}`, backgroundColor: "#0f1117", color: textLight, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                        </div>
                        <p style={{ fontSize: 13, fontWeight: 700, color: "#4a9c6a", margin: "0 0 0 12px", minWidth: 56, textAlign: "right" }}>${(item.producto.precio * item.cantidad).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>

                  <div style={{ padding: 16, borderTop: `1px solid ${border}`, display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 13, color: textMuted }}>Total</span>
                      <span style={{ fontSize: 20, fontWeight: 700, color: textLight }}>${total.toFixed(2)}</span>
                    </div>
                    <input type="text" value={notas} onChange={e => setNotas(e.target.value)} placeholder="Notas (opcional)" style={{ width: "100%", backgroundColor: "#0f1117", border: `1px solid ${border}`, borderRadius: 6, padding: "9px 12px", color: textLight, fontFamily: "system-ui, sans-serif", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                    {message && <p style={{ color: message.startsWith("✓") ? "#4a9c6a" : "#e05252", fontSize: 13, margin: 0 }}>{message}</p>}
                    <button onClick={handleSubmit} disabled={saving || carrito.length === 0} style={{ fontSize: 14, fontWeight: 700, backgroundColor: accent, color: "#fff", border: "none", borderRadius: 6, padding: 12, cursor: "pointer", opacity: (saving || carrito.length === 0) ? 0.4 : 1 }}>
                      {saving ? "Registrando..." : "Registrar Venta"}
                    </button>
                  </div>
                </>
            }
          </div>
        </div>
      </div>
    </div>
  );
}
