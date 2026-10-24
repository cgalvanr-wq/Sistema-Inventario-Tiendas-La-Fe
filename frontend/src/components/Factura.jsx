function Factura({ venta, onCerrar }) {
    if (!venta) return null;

    const esCarrito = venta.carrito && venta.carrito.length > 0;
    const subtotal = venta.subtotal || 0;
    const iva = venta.iva || 0;
    const total = venta.total || 0;

    return (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999, padding: "20px" }}>
            <div id="factura-imprimible" style={{ background: "white", padding: "20px", borderRadius: "10px", maxWidth: "380px", width: "100%", fontFamily: "'Courier New', monospace", fontSize: "12px", boxShadow: "0 10px 25px rgba(0,0,0,0.5)", border: "1px solid #ddd" }}>

                <div style={{ textAlign: "center", marginBottom: "10px" }}>
                    <h2 style={{ margin: "0", fontSize: "18px", letterSpacing: "1px" }}>TIENDAS LA FE</h2>
                    <p style={{ margin: "2px 0", fontSize: "10px", color: "#555" }}>NIT: 123.456.789-0<br />Calle 1 # 2-34 - San Pelayo, Córdoba<br />Tel: 300 123 4567</p>
                </div>

                <div style={{ borderTop: "1px dashed #000", margin: "8px 0" }} />

                <div style={{ fontSize: "11px" }}>
                    <p style={{ margin: "2px 0" }}><strong>FACTURA:</strong> {venta.numeroFactura || "Pendiente"}</p>
                    <p style={{ margin: "2px 0" }}><strong>FECHA:</strong> {venta.fecha || new Date().toLocaleDateString()}</p>
                    <p style={{ margin: "2px 0" }}><strong>VENDEDOR:</strong> {venta.vendedor || "Admin"}</p>
                    <p style={{ margin: "2px 0" }}><strong>CLIENTE:</strong> {venta.cliente?.nombre || "Consumidor Final"}</p>
                    <p style={{ margin: "2px 0" }}><strong>CC/NIT:</strong> {venta.cliente?.cedula || "N/A"}</p>
                    <p style={{ margin: "2px 0" }}><strong>TEL:</strong> {venta.cliente?.telefono || "N/A"}</p>
                    <p style={{ margin: "2px 0" }}><strong>DIR:</strong> {venta.direccionPedido || venta.cliente?.direccion || "N/A"}</p>
                    <p style={{ margin: "2px 0" }}><strong>PAGO:</strong> {venta.metodoPago || "EFECTIVO"}</p>
                </div>

                <div style={{ borderTop: "1px dashed #000", margin: "8px 0" }} />

                <table style={{ width: "100%", fontSize: "11px", borderCollapse: "collapse" }}>
                    <thead>
                    <tr>
                        <th style={{ textAlign: "left", borderBottom: "1px solid #000", paddingBottom: "3px" }}>Producto</th>
                        <th style={{ textAlign: "center", borderBottom: "1px solid #000", paddingBottom: "3px" }}>Cant</th>
                        <th style={{ textAlign: "right", borderBottom: "1px solid #000", paddingBottom: "3px" }}>Total</th>
                    </tr>
                    </thead>
                    <tbody>
                    {esCarrito ? (
                        venta.carrito.map((item, index) => (
                            <tr key={index}>
                                <td style={{ paddingTop: "5px" }}>{item.producto.nombre}</td>
                                <td style={{ textAlign: "center" }}>{item.cantidad}</td>
                                <td style={{ textAlign: "right" }}>${item.precioFinal.toFixed(2)}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td style={{ paddingTop: "5px" }}>{venta.producto?.nombre || "Producto"}</td>
                            <td style={{ textAlign: "center" }}>{venta.cantidad || 0}</td>
                            <td style={{ textAlign: "right" }}>${subtotal.toFixed(2)}</td>
                        </tr>
                    )}
                    </tbody>
                </table>

                <div style={{ borderTop: "1px dashed #000", margin: "8px 0" }} />

                <div style={{ textAlign: "right", fontSize: "11px" }}>
                    <p style={{ margin: "2px 0" }}><strong>Subtotal:</strong> ${subtotal.toFixed(2)}</p>
                    <p style={{ margin: "2px 0" }}>
                        <strong>IVA:</strong> ${iva.toFixed(2)}
                        {subtotal > 0 && ` (${((iva / subtotal) * 100).toFixed(0)}%)`}
                    </p>
                    <p style={{ margin: "5px 0", fontSize: "14px" }}><strong>TOTAL: ${total.toFixed(2)}</strong></p>
                </div>

                <div style={{ borderTop: "1px dashed #000", margin: "8px 0" }} />

                <p style={{ textAlign: "center", fontSize: "10px", margin: "5px 0", color: "#555" }}>¡Gracias por su compra!</p>

                <div className="no-print" style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
                    <button onClick={() => window.print()} style={{ flex: 1, padding: "10px", background: "#28a745", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}>🖨️ Imprimir</button>
                    <button onClick={onCerrar} style={{ flex: 1, padding: "10px", background: "#6c757d", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}>Cerrar</button>
                </div>
            </div>
        </div>
    );
}

export default Factura;