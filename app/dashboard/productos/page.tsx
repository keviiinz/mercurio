"use client";

import { useEffect, useState } from "react";

interface Producto { id: number; nombre: string; precio: number; stock: number; activo: boolean; }

const accent = "#6c63ff";
const cardBg = "#16181f";
const border = "#1e2130";
const textMuted = "#5a5f7a";
const textLight = "#e8eaf0";
const inputStyle = { width: "100%", backgroundColor: "#0f1117", border: `1px solid ${border}`, borderRadius: 6, padding: "10px 14px", color: textLight, fontFamily: "system-ui, sans-serif", fontSize: 14, outline: "none", boxSizing: "border-box" as const };
const labelStyle = { fontSize: 11, fontWeight: 600 as const, color: textMuted, letterSpacing: "0.06em", textTransform: "uppercase" as const, display: "block", marginBottom: 6 };

export default function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nombre: "", precio: "", stock: "" });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ nombre: "", precio: "", stock: "" });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => { load(); }, []);
  async function load() {
    const r = await fetch("/api/base/productos");
    setProductos(await r.json());
  }

  async function handleCreate() {
    if (!form.nombre.trim()) { setMessage("✗ El nombre es obligatorio."); return; }
    if (!form.precio || parseFloat(form.precio) <= 0) { setMessage("✗ El precio debe ser mayor a cero."); return; }
    setSaving(true); setMessage("");
    const res = await fetch("/api/base/productos", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nombre: form.nombre, precio: parseFloat(form.precio), stock: parseInt(form.stock) || 0 }) });
    const data = await res.json();
    if (res.ok) { setMessage("✓ Producto creado."); setForm({ nombre: "", precio: "", stock: "" }); setShowForm(false); load(); }
    else setMessage(`✗ ${data.error}`);
    setSaving(false);
  }

  async function handleEdit(id: number) {
    setSaving(true);
    await fetch(`/api/base/productos/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nombre: editForm.nombre, precio: parseFloat(editForm.precio), stock: parseInt(editForm.stock) || 0 }) });
    setEditingId(null); load(); setSaving(false);
  }

  async function handleDelete(id: number) {
    if (!confirm("¿Desactivar este producto?")) return;
    await fetch(`/api/base/productos/${id}`, { method: "DELETE" });
    load();
  }

  function startEdit(p: Producto) {
    setEditingId(p.id);
    setEditForm({ nombre: p.nombre, precio: p.precio.toString(), stock: p.stock.toString() });
  }

  return (
    <div style={{ padding: 40, backgroundColor: "#0f1117", minHeight: "100vh" }}>
      <div style={{ marginBottom: 32, borderBottom: `1px solid ${border}`, paddingBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: textLight, margin: 0 }}>Productos</h1>
          <p style={{ fontSize: 13, color: textMuted, margin: "4px 0 0" }}>Catálogo de productos de tu punto de venta</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setMessage(""); }} style={{ fontSize: 13, fontWeight: 600, backgroundColor: showForm ? "transparent" : accent, color: showForm ? textMuted : "#fff", border: `1px solid ${showForm ? border : accent}`, borderRadius: 6, padding: "8px 18px", cursor: "pointer" }}>
          {showForm ? "✕ Cancelar" : "+ Nuevo Producto"}
        </button>
      </div>

      {showForm && (
        <div style={{ backgroundColor: cardBg, border: `1px solid ${border}`, borderRadius: 8, padding: 28, marginBottom: 28, maxWidth: 480 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: textLight, margin: "0 0 20px" }}>Nuevo Producto</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div><label style={labelStyle}>Nombre <span style={{ color: "#e05252" }}>*</span></label><input type="text" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} placeholder="Ej. Coca-Cola 600ml" style={inputStyle} /></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div><label style={labelStyle}>Precio ($) <span style={{ color: "#e05252" }}>*</span></label><input type="number" value={form.precio} onChange={e => setForm({ ...form, precio: e.target.value })} placeholder="0.00" style={inputStyle} /></div>
              <div><label style={labelStyle}>Stock inicial</label><input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} placeholder="0" style={inputStyle} /></div>
            </div>
            {message && <p style={{ color: message.startsWith("✓") ? "#4a9c6a" : "#e05252", fontSize: 13, margin: 0 }}>{message}</p>}
            <button onClick={handleCreate} disabled={saving} style={{ fontSize: 13, fontWeight: 600, backgroundColor: accent, color: "#fff", border: "none", borderRadius: 6, padding: 12, cursor: "pointer", opacity: saving ? 0.5 : 1 }}>{saving ? "Guardando..." : "Crear Producto"}</button>
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 680 }}>
        {productos.length === 0
          ? <p style={{ color: textMuted, fontSize: 13, fontStyle: "italic" }}>No tienes productos registrados.</p>
          : productos.map(p => (
            <div key={p.id} style={{ backgroundColor: cardBg, border: `1px solid ${border}`, borderRadius: 8, padding: "16px 20px" }}>
              {editingId === p.id ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 10 }}>
                    <input value={editForm.nombre} onChange={e => setEditForm({ ...editForm, nombre: e.target.value })} style={{ ...inputStyle, padding: "8px 12px", fontSize: 13 }} />
                    <input type="number" value={editForm.precio} onChange={e => setEditForm({ ...editForm, precio: e.target.value })} placeholder="Precio" style={{ ...inputStyle, padding: "8px 12px", fontSize: 13 }} />
                    <input type="number" value={editForm.stock} onChange={e => setEditForm({ ...editForm, stock: e.target.value })} placeholder="Stock" style={{ ...inputStyle, padding: "8px 12px", fontSize: 13 }} />
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => handleEdit(p.id)} disabled={saving} style={{ fontSize: 12, fontWeight: 600, backgroundColor: accent, color: "#fff", border: "none", borderRadius: 5, padding: "6px 16px", cursor: "pointer" }}>Guardar</button>
                    <button onClick={() => setEditingId(null)} style={{ fontSize: 12, color: textMuted, backgroundColor: "transparent", border: `1px solid ${border}`, borderRadius: 5, padding: "6px 16px", cursor: "pointer" }}>Cancelar</button>
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: textLight, margin: "0 0 4px" }}>{p.nombre}</p>
                    <div style={{ display: "flex", gap: 14 }}>
                      <span style={{ fontSize: 13, color: "#4a9c6a", fontWeight: 600 }}>${p.precio.toFixed(2)}</span>
                      <span style={{ fontSize: 12, color: p.stock <= 5 ? "#e05252" : textMuted }}>Stock: {p.stock}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => startEdit(p)} style={{ fontSize: 11, fontWeight: 600, color: "#4a90e2", backgroundColor: "rgba(74,144,226,0.08)", border: "1px solid rgba(74,144,226,0.2)", borderRadius: 5, padding: "5px 12px", cursor: "pointer" }}>Editar</button>
                    <button onClick={() => handleDelete(p.id)} style={{ fontSize: 11, fontWeight: 600, color: "#e05252", backgroundColor: "rgba(224,82,82,0.06)", border: "1px solid rgba(224,82,82,0.2)", borderRadius: 5, padding: "5px 12px", cursor: "pointer" }}>Desactivar</button>
                  </div>
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}
