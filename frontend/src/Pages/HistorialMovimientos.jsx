import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function HistorialMovimientos() {
    const navigate = useNavigate();
    const [movimientos, setMovimientos] = useState([]);
    const [filtroTipo, setFiltroTipo] = useState("");

    const cargarMovimientos = async () => {
        const token = localStorage.getItem("token");
        let url = "http://localhost:8081/movimientos/historial";
        if (filtroTipo) url += `?tipo=${filtroTipo}`;

        try {
            const res = await fetch(url, {
                headers: { "Authorization": "Bearer " + token }
            });
            if (res.ok) {
                setMovimientos(await res.json());
            }
        } catch (error) {
            console.error("Error cargando movimientos:", error);
        }
    };

    useEffect(() => {
        cargarMovimientos();
    }, [filtroTipo]);

    const formatearFecha = (fechaStr) => {
        if (!fechaStr) return "N/A";
        const fecha = new Date(fechaStr);
        return fecha.toLocaleString('es-CO');
    };

    return (
        <div style={{ padding: "20px", fontFamily: "Arial" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h1>📦 Historial de Movimientos</h1>
                <button onClick={() => navigate("/")} style={{ padding: "10px 15px", background: "#6c757d", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
                    Volver al Dashboard
                </button>
            </div>

            <div style={{ margin: "20px 0", background: "#f4f4f4", padding: "15px", borderRadius: "8px", display: "flex", alignItems: "center", gap: "10px" }}>
                <label><strong>Filtrar por tipo:</strong></label>
                <select
                    value={filtroTipo}
                    onChange={(e) => setFiltroTipo(e.target.value)}
                    style={{ padding: "8px", borderRadius: "5px", border: "1px solid #ccc" }}
                >
                    <option value="">Todos los movimientos</option>
                    <option value="ENTRADA">Entradas (Compras)</option>
                    <option value="SALIDA">Salidas (Ventas)</option>
                    <option value="AJUSTE">Ajustes manuales</option>
                </select>
            </div>

            {movimientos.length === 0 ? (
                <p>No hay movimientos registrados.</p>
            ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
                    <thead>
                    <tr style={{ background: "#343a40", color: "white" }}>
                        <th style={{ padding: "10px", textAlign: "left" }}>Fecha y Hora</th>
                        <th style={{ padding: "10px", textAlign: "left" }}>Producto</th>
                        <th style={{ padding: "10px", textAlign: "center" }}>Tipo</th>
                        <th style={{ padding: "10px", textAlign: "center" }}>Cantidad</th>
                        <th style={{ padding: "10px", textAlign: "left" }}>Motivo</th>
                        <th style={{ padding: "10px", textAlign: "center" }}>Stock Final</th>
                    </tr>
                    </thead>
                    <tbody>
                    {movimientos.map((mov) => (
                        <tr key={mov.id} style={{ borderBottom: "1px solid #ddd" }}>
                            <td style={{ padding: "10px", fontSize: "13px" }}>{formatearFecha(mov.fecha)}</td>
                            <td style={{ padding: "10px" }}>{mov.producto?.nombre || "Producto Eliminado"}</td>
                            <td style={{ padding: "10px", textAlign: "center" }}>
                                    <span style={{
                                        padding: "4px 8px",
                                        borderRadius: "5px",
                                        fontSize: "12px",
                                        fontWeight: "bold",
                                        color: "white",
                                        background: mov.tipoMovimiento === "ENTRADA" ? "#28a745" : mov.tipoMovimiento === "SALIDA" ? "#dc3545" : "#ffc107"
                                    }}>
                                        {mov.tipoMovimiento}
                                    </span>
                            </td>
                            <td style={{ padding: "10px", textAlign: "center", fontWeight: "bold" }}>{mov.cantidad}</td>
                            <td style={{ padding: "10px", fontSize: "12px", color: "#555" }}>{mov.motivo}</td>
                            <td style={{ padding: "10px", textAlign: "center", fontWeight: "bold" }}>{mov.stockNuevo}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default HistorialMovimientos;