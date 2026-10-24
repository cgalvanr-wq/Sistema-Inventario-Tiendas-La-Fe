import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function HistorialVentas() {
    const navigate = useNavigate();
    const [ventas, setVentas] = useState([]);
    const [fecha, setFecha] = useState("");

    const cargarHistorial = async () => {
        const token = localStorage.getItem("token");
        let url = "http://localhost:8081/ventas/historial";
        if (fecha) url += `?fecha=${fecha}`;

        try {
            const res = await fetch(url, {
                headers: { "Authorization": "Bearer " + token }
            });
            if (res.ok) {
                const data = await res.json();
                // Ordenar de más reciente a más antigua
                data.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
                setVentas(data);
            }
        } catch (error) {
            console.error("Error cargando historial:", error);
        }
    };

    useEffect(() => {
        cargarHistorial();
    }, [fecha]);

    // ✅ AGRUPAR VENTAS POR NÚMERO DE FACTURA
    const ventasAgrupadas = ventas.reduce((acc, venta) => {
        // Si no tiene número de factura, le asignamos uno genérico
        const numFactura = venta.numeroFactura || "Venta Antigua";

        if (!acc[numFactura]) {
            acc[numFactura] = {
                numeroFactura: numFactura,
                fecha: venta.fecha,
                cliente: venta.cliente?.nombre || "Consumidor Final",
                metodoPago: venta.metodoPago,
                total: 0,
                productos: []
            };
        }
        acc[numFactura].total += (venta.total || 0);
        acc[numFactura].productos.push(venta);
        return acc;
    }, {});

    // ✅ CALCULAR EL GRAN TOTAL DE LO MOSTRADO
    const totalMostrado = Object.values(ventasAgrupadas).reduce((acc, factura) => acc + factura.total, 0);

    // ✅ FUNCIÓN PARA FORMATEAR PESOS COLOMBIANOS
    const formatearPrecio = (valor) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(valor);
    };

    return (
        <div style={{ padding: "20px", fontFamily: "Arial" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h1>📊 Historial de Ventas</h1>
                <button onClick={() => navigate("/")} style={{ padding: "10px 15px", background: "#6c757d", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
                    Volver al Dashboard
                </button>
            </div>

            <div style={{ margin: "20px 0", background: "#f4f4f4", padding: "15px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
                <div>
                    <label><strong>Filtrar por fecha:</strong></label>
                    <input
                        type="date"
                        value={fecha}
                        onChange={(e) => setFecha(e.target.value)}
                        style={{ padding: "8px", borderRadius: "5px", border: "1px solid #ccc", marginLeft: "10px" }}
                    />
                    <button onClick={() => setFecha("")} style={{ marginLeft: "10px", padding: "8px 15px", background: "#007bff", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
                        Ver Todas
                    </button>
                </div>

                {/* ✅ RECUADRO DEL TOTAL DEL DÍA CON FORMATO */}
                <div style={{ background: "#198754", color: "white", padding: "10px 20px", borderRadius: "8px", fontSize: "18px", fontWeight: "bold" }}>
                    Total {fecha ? "del día" : "histórico"}: {formatearPrecio(totalMostrado)}
                </div>
            </div>

            {Object.values(ventasAgrupadas).length === 0 ? (
                <p>No hay ventas registradas para esta fecha.</p>
            ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
                    <thead>
                    <tr style={{ background: "#343a40", color: "white" }}>
                        <th style={{ padding: "10px", textAlign: "left" }}>Factura</th>
                        <th style={{ padding: "10px", textAlign: "left" }}>Fecha</th>
                        <th style={{ padding: "10px", textAlign: "left" }}>Cliente</th>
                        <th style={{ padding: "10px", textAlign: "left" }}>Pago</th>
                        <th style={{ padding: "10px", textAlign: "left" }}>Productos</th>
                        <th style={{ padding: "10px", textAlign: "right" }}>Total Factura</th>
                    </tr>
                    </thead>
                    <tbody>
                    {Object.values(ventasAgrupadas).map((factura, index) => (
                        <tr key={factura.numeroFactura + index} style={{ borderBottom: "1px solid #ddd" }}>
                            <td style={{ padding: "10px" }}><strong>{factura.numeroFactura}</strong></td>
                            <td style={{ padding: "10px" }}>{factura.fecha}</td>
                            <td style={{ padding: "10px" }}>{factura.cliente}</td>
                            <td style={{ padding: "10px" }}>{factura.metodoPago}</td>
                            <td style={{ padding: "10px", fontSize: "12px" }}>
                                {factura.productos.map((p, i) => (
                                    <div key={i}>{p.producto.nombre} (x{p.cantidad})</div>
                                ))}
                            </td>
                            <td style={{ padding: "10px", textAlign: "right", fontWeight: "bold", color: "#28a745" }}>
                                {formatearPrecio(factura.total)}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default HistorialVentas;