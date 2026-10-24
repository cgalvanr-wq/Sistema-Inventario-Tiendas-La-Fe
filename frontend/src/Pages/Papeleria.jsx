import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ListaProductos from "../components/productos/ListaProductos";
import { guardarProducto, obtenerProductos } from "../services/productoService";
import { fetchConToken } from "../services/api";

function Papeleria() {
    const navigate = useNavigate();
    const [nombre, setNombre] = useState("");
    const [cantidad, setCantidad] = useState("");
    const [precioCompra, setPrecioCompra] = useState("");
    const [proveedorId, setProveedorId] = useState("");
    const [proveedores, setProveedores] = useState([]);

    const [busqueda, setBusqueda] = useState("");
    const [resultados, setResultados] = useState([]);
    const [mostrarResultados, setMostrarResultados] = useState(false);

    // ✅ Cargar proveedores de Papelería
    useEffect(() => {
        const cargarProveedores = async () => {
            try {
                const res = await fetchConToken("/proveedores");
                const data = await res.json();
                // Filtrar los de papelería
                const filtrados = data.filter(p =>
                        p.linea_producto && (
                            p.linea_producto.toLowerCase().includes("papeler") ||
                            p.linea_producto.toLowerCase().includes("útil") ||
                            p.linea_producto.toLowerCase().includes("escolar")
                        )
                );
                setProveedores(filtrados.length > 0 ? filtrados : data);
            } catch (error) {
                console.error("Error cargando proveedores:", error);
            }
        };
        cargarProveedores();
    }, []);

    const manejarGuardar = async (e) => {
        e.preventDefault();

        if (!proveedorId) {
            alert("Debes seleccionar un proveedor");
            return;
        }

        const costo = Number(precioCompra) || 0;
        const cant = Number(cantidad) || 0;

        const nuevo = {
            nombre: nombre.trim(),
            cantidad: cant,
            precioCompra: costo,
            categoria: { id: 2 }, // Papelería
            proveedor: { id: Number(proveedorId) }
        };

        try {
            await guardarProducto(nuevo);
            alert("✅ Producto guardado correctamente");
            setNombre(""); setCantidad(""); setPrecioCompra(""); setProveedorId("");
        } catch (error) {
            alert("Error: " + error.message);
            console.error(error);
        }
    };

    const buscarProducto = async () => {
        if (busqueda.trim() === "") {
            setMostrarResultados(false);
            return;
        }

        try {
            const data = await obtenerProductos();
            const filtrados = data.filter(
                (p) => p.categoria?.id === 2 &&
                    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
            );
            setResultados(filtrados);
            setMostrarResultados(true);
        } catch (error) {
            console.error(error);
            alert("Error buscando productos");
        }
    };

    return (
        <div style={{ padding: "20px" }}>
            <h1>Categoría: Papelería</h1>

            <div style={{ marginBottom: "30px", padding: "15px", border: "1px solid #ffc107", borderRadius: "8px", background: "#fffdf0" }}>
                <h3>Agregar Nuevo Producto</h3>
                <form onSubmit={manejarGuardar} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                    <input type="text" placeholder="Nombre" value={nombre} onChange={e => setNombre(e.target.value)} required style={{ padding: "8px" }} />
                    <input type="number" placeholder="Cantidad" value={cantidad} onChange={e => setCantidad(e.target.value)} required style={{ padding: "8px" }} />
                    <input type="number" placeholder="Precio Costo" value={precioCompra} onChange={e => setPrecioCompra(e.target.value)} required style={{ padding: "8px" }} />

                    <select
                        value={proveedorId}
                        onChange={(e) => setProveedorId(e.target.value)}
                        required
                        style={{ padding: "8px", gridColumn: "span 2" }}
                    >
                        <option value="">-- Selecciona un proveedor --</option>
                        {proveedores.map(p => (
                            <option key={p.id} value={p.id}>
                                {p.nombre} {p.linea_producto ? `(${p.linea_producto})` : ""}
                            </option>
                        ))}
                    </select>

                    <button type="submit" style={{ padding: "10px", background: "#ffc107", color: "black", border: "none", borderRadius: "5px" }}>
                        Guardar Producto
                    </button>
                </form>
            </div>

            <div style={{ margin: "20px 0", padding: "15px", border: "1px solid #ffc107", borderRadius: "8px", background: "#fff3cd" }}>
                <h3>🔍 Buscar producto en Papelería</h3>
                <div style={{ display: "flex", gap: "10px" }}>
                    <input type="text" placeholder="Escribe el nombre..." value={busqueda} onChange={e => setBusqueda(e.target.value)} style={{ flex: 1, padding: "10px", border: "1px solid #ccc", borderRadius: "5px" }} />
                    <button onClick={buscarProducto} style={{ padding: "10px 15px", background: "#ffc107", color: "black", border: "none", borderRadius: "5px" }}>Buscar</button>
                    <button onClick={() => { setBusqueda(""); setMostrarResultados(false); }} style={{ padding: "10px 15px", background: "#6c757d", color: "white", border: "none", borderRadius: "5px" }}>Limpiar</button>
                </div>
            </div>

            {mostrarResultados && (
                <div style={{ marginTop: "20px", padding: "15px", border: "1px solid #ffc107", borderRadius: "8px" }}>
                    <h4>Resultados de la búsqueda:</h4>
                    {resultados.length > 0 ? (
                        <ListaProductos productosFiltrados={resultados} categoriaId={2} />
                    ) : (
                        <p style={{ color: "red" }}>No se encontraron productos con ese nombre.</p>
                    )}
                </div>
            )}

            <button onClick={() => navigate("/dashboard")} style={{ padding: "10px 15px", background: "#ffc107", color: "black", border: "none", borderRadius: "5px", marginTop: "20px" }}>
                ⬅ Volver al inicio
            </button>
        </div>
    );
}

export default Papeleria;