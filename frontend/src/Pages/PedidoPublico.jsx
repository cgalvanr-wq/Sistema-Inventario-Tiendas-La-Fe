import { useState, useEffect } from "react";

function PedidoPublico() {
    const [productos, setProductos] = useState([]);
    const [carrito, setCarrito] = useState([]);
    const [mostrarCarrito, setMostrarCarrito] = useState(false);

    // Estados del cliente
    const [cedula, setCedula] = useState("");
    const [nombre, setNombre] = useState("");
    const [telefono, setTelefono] = useState("");
    const [direccion, setDireccion] = useState("");
    const [metodoPago, setMetodoPago] = useState("EFECTIVO");
    const [pedidoExitoso, setPedidoExitoso] = useState(null);
    const [sugerencias, setSugerencias] = useState([]); // ✅ Para autocompletar

    // Estados para el acordeón de categorías
    const [categoriaAbierta, setCategoriaAbierta] = useState(null);

    useEffect(() => {
        fetch("http://localhost:8081/productos/publicos")
            .then(res => res.json())
            .then(data => setProductos(data))
            .catch(err => console.error("Error cargando catálogo:", err));
    }, []);

    // ✅ AUTOCOMPLETADO DE CLIENTES
    const buscarClientes = async (termino) => {
        if (termino.length < 2) { setSugerencias([]); return; }
        try {
            // Usamos la misma ruta de búsqueda de clientes (asumiendo que es pública o que el backend la permite)
            const res = await fetch(`http://localhost:8081/clientes/buscar?termino=${termino}`);
            if (res.ok) setSugerencias(await res.json());
        } catch (error) { console.error("Error buscando clientes:", error); }
    };

    const seleccionarCliente = (cliente) => {
        setCedula(cliente.cedula);
        setNombre(cliente.nombre);
        setTelefono(cliente.telefono || "");
        setDireccion(cliente.direccion || "");
        setSugerencias([]);
    };

    const agregarAlCarrito = (producto) => {
        if (producto.cantidad <= 0) return alert("Producto agotado");

        const existe = carrito.find(item => item.producto.id === producto.id);
        if (existe) {
            setCarrito(carrito.map(item =>
                item.producto.id === producto.id
                    ? { ...item, cantidad: item.cantidad + 1, total: (item.cantidad + 1) * producto.precioDetal }
                    : item
            ));
        } else {
            setCarrito([...carrito, { producto, cantidad: 1, total: producto.precioDetal }]);
        }
    };

    const confirmarPedido = async () => {
        if (!cedula || !nombre || !direccion) return alert("Por favor completa cédula, nombre y dirección.");
        if (carrito.length === 0) return alert("Tu carrito está vacío.");

        const ventasParaBackend = carrito.map(item => ({
            cantidad: item.cantidad,
            tipoVenta: "detal",
            producto: { id: item.producto.id },
            cliente: { cedula, nombre, telefono, direccion },
            metodoPago: metodoPago,
            direccionPedido: direccion
        }));

        try {
            const response = await fetch("http://localhost:8081/ventas", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(ventasParaBackend)
            });

            if (!response.ok) throw new Error("Error al procesar el pedido");

            const data = await response.json();
            setPedidoExitoso(data);
            setCarrito([]);
        } catch (error) {
            alert("No se pudo realizar el pedido. Intenta de nuevo.");
        }
    };

    // Calcular el total del carrito en el frontend para mostrarlo
    const totalCarrito = carrito.reduce((acc, item) => acc + (item.cantidad * item.producto.precioDetal), 0);

    if (pedidoExitoso) {
        return (
            <div style={{ padding: "40px", textAlign: "center", fontFamily: "Arial" }}>
                <h1 style={{ color: "#28a745" }}>¡Pedido Recibido! 🎉</h1>
                <p>Hola <strong>{nombre}</strong>, tu pedido ha sido registrado con éxito.</p>
                <p>Tu número de factura es: <strong>{pedidoExitoso.numeroFactura}</strong></p>

                {/* ✅ DESGLOSE DEL IVA REAL ENVIADO POR EL BACKEND */}
                <div style={{ display: "inline-block", textAlign: "left", background: "#f8f9fa", padding: "20px", borderRadius: "10px", marginTop: "20px", border: "1px solid #ddd" }}>
                    <p><strong>Subtotal:</strong> ${pedidoExitoso.subtotal?.toFixed(2)}</p>
                    <p><strong>IVA:</strong> ${pedidoExitoso.iva?.toFixed(2)}</p>
                    <p style={{ fontSize: "18px", color: "#28a745" }}><strong>Total Pagado: ${pedidoExitoso.total?.toFixed(2)}</strong></p>
                </div>

                <p style={{ marginTop: "20px" }}>Nos pondremos en contacto al teléfono <strong>{telefono}</strong> para coordinar la entrega en: <br/><em>{direccion}</em></p>
                <button onClick={() => window.location.reload()} style={{ marginTop: "20px", padding: "10px 20px", background: "#007bff", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
                    Hacer otro pedido
                </button>
            </div>
        );
    }

    // Agrupar productos por categoría
    const productosPorCategoria = productos.reduce((acc, prod) => {
        const cat = prod.categoria?.nombre || "Otros";
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(prod);
        return acc;
    }, {});

    return (
        <div style={{ padding: "20px", fontFamily: "Arial" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h1>🛍️ Catálogo Tiendas La Fe</h1>
                <button onClick={() => setMostrarCarrito(true)} style={{ padding: "10px 20px", background: "#28a745", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}>
                    🛒 Ver mi Pedido ({carrito.length})
                </button>
            </div>

            {/* ✅ DISEÑO POR CATEGORÍAS (ACORDEÓN) */}
            {Object.keys(productosPorCategoria).map(cat => (
                <div key={cat} style={{ marginBottom: "15px", border: "1px solid #ccc", borderRadius: "8px", overflow: "hidden" }}>
                    <button
                        onClick={() => setCategoriaAbierta(categoriaAbierta === cat ? null : cat)}
                        style={{ width: "100%", padding: "15px 20px", background: "#343a40", color: "white", border: "none", textAlign: "left", fontSize: "18px", fontWeight: "bold", cursor: "pointer", display: "flex", justifyContent: "space-between" }}
                    >
                        <span>🏬 {cat} ({productosPorCategoria[cat].length} productos)</span>
                        <span>{categoriaAbierta === cat ? "▲" : "▼"}</span>
                    </button>

                    {categoriaAbierta === cat && (
                        <div style={{ padding: "20px", background: "#f8f9fa", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "15px" }}>
                            {productosPorCategoria[cat].map(p => (
                                <div key={p.id} style={{ border: "1px solid #ddd", padding: "15px", borderRadius: "8px", background: "#fff" }}>
                                    <h4 style={{ margin: "0 0 10px 0" }}>{p.nombre}</h4>
                                    <p style={{ fontSize: "18px", fontWeight: "bold", color: "#28a745" }}>${p.precioDetal?.toFixed(2)}</p>
                                    {p.cantidad > 0 ? (
                                        <button onClick={() => agregarAlCarrito(p)} style={{ width: "100%", padding: "10px", background: "#007bff", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
                                            Agregar
                                        </button>
                                    ) : (
                                        <button disabled style={{ width: "100%", padding: "10px", background: "#ccc", color: "#666", border: "none", borderRadius: "5px" }}>
                                            Agotado
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))}

            {/* MODAL DEL CARRITO PÚBLICO */}
            {mostrarCarrito && (
                <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center", padding: "20px" }}>
                    <div style={{ background: "white", padding: "20px", borderRadius: "10px", width: "100%", maxWidth: "500px", maxHeight: "90vh", overflowY: "auto" }}>
                        <h2>🛒 Tu Pedido</h2>
                        {carrito.length === 0 ? (
                            <p>El carrito está vacío.</p>
                        ) : (
                            <ul style={{ listStyle: "none", padding: 0 }}>
                                {carrito.map((item, idx) => (
                                    <li key={idx} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #eee" }}>
                                        <span>{item.producto.nombre} x {item.cantidad}</span>
                                        <strong>${(item.cantidad * item.producto.precioDetal).toFixed(2)}</strong>
                                    </li>
                                ))}
                            </ul>
                        )}

                        <h3 style={{ textAlign: "right" }}>Total (sin IVA): ${totalCarrito.toFixed(2)}</h3>

                        <h4>Datos de Entrega</h4>
                        <div style={{ position: "relative" }}>
                            <input
                                type="text"
                                placeholder="Cédula *"
                                value={cedula}
                                onChange={(e) => { setCedula(e.target.value); buscarClientes(e.target.value); }}
                                style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
                            />
                            {/* ✅ LISTA DE AUTOCOMPLETADO */}
                            {sugerencias.length > 0 && (
                                <ul style={{ position: "absolute", top: "40px", left: 0, right: 0, background: "white", border: "1px solid #ccc", borderRadius: "5px", listStyle: "none", padding: 0, margin: 0, zIndex: 10, maxHeight: "150px", overflowY: "auto", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
                                    {sugerencias.map(c => (
                                        <li key={c.id} onClick={() => seleccionarCliente(c)} style={{ padding: "8px", borderBottom: "1px solid #eee", cursor: "pointer" }}>
                                            <strong>{c.cedula}</strong> - {c.nombre}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <input type="text" placeholder="Nombre Completo *" value={nombre} onChange={(e) => setNombre(e.target.value)} style={{ width: "100%", padding: "8px", marginBottom: "10px" }} />
                        <input type="text" placeholder="Teléfono" value={telefono} onChange={(e) => setTelefono(e.target.value)} style={{ width: "100%", padding: "8px", marginBottom: "10px" }} />
                        <input type="text" placeholder="Dirección de entrega *" value={direccion} onChange={(e) => setDireccion(e.target.value)} style={{ width: "100%", padding: "8px", marginBottom: "10px" }} />

                        <select value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)} style={{ width: "100%", padding: "8px", marginBottom: "20px" }}>
                            <option value="EFECTIVO">💵 Pago en Efectivo (Contra entrega)</option>
                            <option value="TRANSFERENCIA">🏦 Transferencia (Nequi/Daviplata)</option>
                            <option value="TARJETA">💳 Tarjeta (Datafono en entrega)</option>
                        </select>

                        <div style={{ display: "flex", gap: "10px" }}>
                            <button onClick={() => setMostrarCarrito(false)} style={{ flex: 1, padding: "10px", background: "#6c757d", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>Seguir Comprando</button>
                            <button onClick={confirmarPedido} style={{ flex: 1, padding: "10px", background: "#28a745", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}>Confirmar Pedido ✅</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PedidoPublico;