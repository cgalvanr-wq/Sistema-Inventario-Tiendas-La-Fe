import { useEffect, useState } from "react";
import { obtenerProductos, eliminarProducto, actualizarProducto } from "../../services/productoService";

function ListaProductos({ categoriaId, productosFiltrados }) {

    const [productos, setProductos] = useState([]);
    const [editando, setEditando] = useState(null);
    // ✅ ESTADO PARA SABER QUÉ SUBCATEGORÍA ESTÁ ABIERTA
    const [subcategoriaAbierta, setSubcategoriaAbierta] = useState(null);

    const [formEdicion, setFormEdicion] = useState({
        nombre: "",
        cantidad: "",
        precioCompra: "",
        ofertaActiva: false,
        motivoSugerido: "",
        subcategoria: ""
    });

    const rol = localStorage.getItem("rol");
    const esAdmin = rol === "ADMIN";

    const cargar = async () => {
        try {
            const todos = await obtenerProductos();
            const filtrados = todos.filter(p => p.categoria?.id === categoriaId);
            setProductos(filtrados);
        } catch (error) {
            console.error("Error cargando productos:", error);
        }
    };

    useEffect(() => { cargar(); }, [categoriaId]);

    const productosAMostrar = productosFiltrados && productosFiltrados.length > 0
        ? productosFiltrados
        : productos;

    // ✅ AGRUPAR POR SUBCATEGORÍA
    const productosPorSubcategoria = productosAMostrar.reduce((acc, prod) => {
        const sub = prod.subcategoria || "Sin clasificar";
        if (!acc[sub]) acc[sub] = [];
        acc[sub].push(prod);
        return acc;
    }, {});

    const handleEliminar = async (id) => {
        if (window.confirm("¿Eliminar este producto?")) {
            try {
                await eliminarProducto(id);
                cargar();
            } catch (error) {
                alert("Error al eliminar: " + error.message);
                console.error(error);
            }
        }
    };

    const handleEditar = (prod) => {
        setEditando(prod.id);
        setFormEdicion({
            nombre: prod.nombre,
            cantidad: prod.cantidad,
            precioCompra: prod.precioCompra,
            ofertaActiva: prod.ofertaActiva || false,
            motivoSugerido: prod.motivoSugerido || "Próximo a vencer",
            subcategoria: prod.subcategoria || ""
        });
    };

    const handleGuardarEdicion = async () => {
        try {
            const datos = {
                nombre: formEdicion.nombre,
                cantidad: Number(formEdicion.cantidad),
                precioCompra: Number(formEdicion.precioCompra),
                categoria: { id: categoriaId },
                ofertaActiva: formEdicion.ofertaActiva,
                subcategoria: formEdicion.subcategoria
            };

            if (formEdicion.ofertaActiva === true) {
                datos.motivoSugerido = formEdicion.motivoSugerido || "Próximo a vencer";
            }

            await actualizarProducto(editando, datos);
            alert("✅ Producto actualizado correctamente");
            setEditando(null);
            cargar();
        } catch (error) {
            alert("Error al actualizar: " + error.message);
            console.error(error);
        }
    };

    const handleCancelarEdicion = () => {
        setEditando(null);
    };

    return (
        <div style={{ marginTop: "30px" }}>
            <h2>Inventario de la Sección</h2>

            {productosAMostrar.length === 0 ? (
                <p>No hay productos para mostrar.</p>
            ) : (
                <div>
                    {/* ✅ LISTA DE SUBCATEGORÍAS COMO BOTONES DESPLEGABLES */}
                    {Object.keys(productosPorSubcategoria).map(subcategoria => (
                        <div key={subcategoria} style={{ marginBottom: "15px", border: "1px solid #e0e0e0", borderRadius: "8px", overflow: "hidden" }}>

                            {/* BOTÓN DE LA SUBCATEGORÍA */}
                            <button
                                onClick={() => setSubcategoriaAbierta(subcategoriaAbierta === subcategoria ? null : subcategoria)}
                                style={{
                                    width: "100%",
                                    padding: "15px 20px",
                                    background: "#f8f9fa",
                                    border: "none",
                                    borderBottom: subcategoriaAbierta === subcategoria ? "2px solid #007bff" : "none",
                                    textAlign: "left",
                                    fontSize: "18px",
                                    fontWeight: "bold",
                                    color: "#343a40",
                                    cursor: "pointer",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center"
                                }}
                            >
                                <span>📁 {subcategoria} ({productosPorSubcategoria[subcategoria].length})</span>
                                <span>{subcategoriaAbierta === subcategoria ? "▲" : "▼"}</span>
                            </button>

                            {/* PRODUCTOS DE LA SUBCATEGORÍA (SIN LÍMITES DE ALTURA) */}
                            {subcategoriaAbierta === subcategoria && (
                                <div style={{ padding: "15px", background: "white" }}>
                                    <div style={{
                                        display: "grid",
                                        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                                        gap: "15px"
                                    }}>
                                        {productosPorSubcategoria[subcategoria].map(prod => (
                                            <div key={prod.id} style={{
                                                border: prod.ofertaActiva ? "2px solid #dc3545" : "1px solid #ccc",
                                                padding: "15px",
                                                borderRadius: "8px",
                                                background: prod.ofertaActiva ? "#fff5f5" : "white"
                                            }}>
                                                {editando === prod.id ? (
                                                    <div>
                                                        <h4>Editando</h4>
                                                        <input type="text" placeholder="Nombre" value={formEdicion.nombre} onChange={(e) => setFormEdicion({ ...formEdicion, nombre: e.target.value })} style={{ width: "100%", padding: "5px", marginBottom: "5px" }} />
                                                        <input type="number" placeholder="Cantidad" value={formEdicion.cantidad} onChange={(e) => setFormEdicion({ ...formEdicion, cantidad: e.target.value })} style={{ width: "100%", padding: "5px", marginBottom: "5px" }} />
                                                        <input type="number" placeholder="Precio Costo (Total)" value={formEdicion.precioCompra} onChange={(e) => setFormEdicion({ ...formEdicion, precioCompra: e.target.value })} style={{ width: "100%", padding: "5px", marginBottom: "5px" }} />

                                                        <select value={formEdicion.subcategoria} onChange={(e) => setFormEdicion({ ...formEdicion, subcategoria: e.target.value })} style={{ width: "100%", padding: "5px", marginBottom: "10px" }}>
                                                            <option value="">-- Subcategoría --</option>
                                                            <option value="Cerveza">Cerveza</option>
                                                            <option value="Aguardiente">Aguardiente</option>
                                                            <option value="Ron">Ron</option>
                                                            <option value="Vino">Vino</option>
                                                            <option value="Gaseosa">Gaseosa</option>
                                                            <option value="Jugo">Jugo</option>
                                                            <option value="Granos">Granos</option>
                                                            <option value="Lácteos">Lácteos</option>
                                                            <option value="Limpieza">Limpieza</option>
                                                            <option value="Aceites">Aceites</option>
                                                            <option value="Huevos">Huevos</option>
                                                            <option value="Panela">Panela</option>
                                                            <option value="Cuadernos">Cuadernos</option>
                                                            <option value="Colores">Colores</option>
                                                            <option value="Esferos">Esferos</option>
                                                            <option value="Lápices">Lápices</option>
                                                            <option value="Resmas">Resmas</option>
                                                            <option value="Reglas">Reglas</option>
                                                            <option value="Otros">Otros</option>
                                                        </select>

                                                        <div style={{ padding: "5px", background: "#fff3cd", borderRadius: "5px", marginBottom: "10px" }}>
                                                            <label style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "12px" }}>
                                                                <input type="checkbox" checked={formEdicion.ofertaActiva} onChange={(e) => setFormEdicion({ ...formEdicion, ofertaActiva: e.target.checked })} />
                                                                Oferta
                                                            </label>
                                                        </div>

                                                        <div style={{ display: "flex", gap: "5px" }}>
                                                            <button onClick={handleGuardarEdicion} style={{ flex: 1, background: "#28a745", color: "white", border: "none", padding: "5px", borderRadius: "3px", cursor: "pointer" }}>Guardar</button>
                                                            <button onClick={handleCancelarEdicion} style={{ flex: 1, background: "#6c757d", color: "white", border: "none", padding: "5px", borderRadius: "3px", cursor: "pointer" }}>Cancelar</button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        {prod.ofertaActiva && <div style={{ background: "#dc3545", color: "white", padding: "2px 6px", borderRadius: "4px", fontSize: "10px", fontWeight: "bold", display: "inline-block", marginBottom: "5px" }}>🔥 OFERTA</div>}

                                                        <h4>{prod.nombre}</h4>
                                                        <p><strong>Stock:</strong> {prod.cantidad} Und</p>
                                                        <p><strong>Precio Costo:</strong> ${prod.precioCompra?.toFixed(2)}</p>

                                                        {prod.ofertaActiva ? (
                                                            <>
                                                                <p><strong>Normal:</strong> <span style={{ textDecoration: "line-through", color: "#999" }}>${prod.precioDetal?.toFixed(2)}</span></p>
                                                                <p><strong>Oferta:</strong> <span style={{ color: "#dc3545", fontWeight: "bold" }}>${prod.precioSugerido?.toFixed(2)}</span></p>
                                                            </>
                                                        ) : (
                                                            <p><strong>Precio Detal:</strong> <span style={{ color: "green" }}>${prod.precioDetal?.toFixed(2)}</span></p>
                                                        )}

                                                        <p><strong>Precio Mayor:</strong> <span style={{ color: "blue" }}>${prod.precioMayor?.toFixed(2)}</span></p>
                                                        <p><strong>Proveedor:</strong> {prod.proveedor?.nombre || "Sin proveedor"}</p>

                                                        {esAdmin && (
                                                            <div style={{ display: "flex", gap: "5px", marginTop: "10px" }}>
                                                                <button onClick={() => handleEditar(prod)} style={{ flex: 1, background: "#007bff", color: "white", border: "none", padding: "5px", borderRadius: "3px", cursor: "pointer" }}>✏️ Editar</button>
                                                                <button onClick={() => handleEliminar(prod.id)} style={{ flex: 1, background: "red", color: "white", border: "none", padding: "5px", borderRadius: "3px", cursor: "pointer" }}>🗑️ Eliminar</button>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default ListaProductos;