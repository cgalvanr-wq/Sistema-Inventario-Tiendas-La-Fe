import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { guardarVenta } from "../services/ventaService";
import { actualizarProducto } from "../services/productoService";
import Factura from "../components/Factura";

function Dashboard({ logout }) {
    const navigate = useNavigate();

    const rol = localStorage.getItem("rol") || "EMPLEADO";
    const nombreUsuario = localStorage.getItem("nombre") || "Usuario";
    const esAdmin = rol === "ADMIN";

    // Estados para inventario y búsqueda
    const [busqueda, setBusqueda] = useState("");
    const [productosEncontrados, setProductosEncontrados] = useState([]);
    const [productoSeleccionado, setProductoSeleccionado] = useState(null);
    const [cantidadVender, setCantidadVender] = useState(1);
    const [tipoVenta, setTipoVenta] = useState("detal");
    const [precioFinal, setPrecioFinal] = useState(0);
    const [mostrarInventario, setMostrarInventario] = useState(false);

    // ✅ ESTADOS DEL CARRITO
    const [carrito, setCarrito] = useState([]);
    const [mostrarCarrito, setMostrarCarrito] = useState(false);

    // Estados para facturación
    const [ventaFactura, setVentaFactura] = useState(null);
    const [mostrarAlertas, setMostrarAlertas] = useState(false);

    // ✅ ESTADOS PARA FACTURA (Cliente y Pago)
    const [clienteCedula, setClienteCedula] = useState("");
    const [clienteNombre, setClienteNombre] = useState("");
    const [clienteTelefono, setClienteTelefono] = useState("");
    const [clienteDireccion, setClienteDireccion] = useState("");
    const [metodoPago, setMetodoPago] = useState("EFECTIVO");
    const [direccionPedido, setDireccionPedido] = useState("");

    // ✅ ESTADOS PARA AUTOCOMPLETADO
    const [sugerencias, setSugerencias] = useState([]);

    // Estados para el acordeón del inventario general
    const [categoriaAbierta, setCategoriaAbierta] = useState(null);
    const [subcategoriaAbierta, setSubcategoriaAbierta] = useState(null);

    const cargarProductos = async () => {
        const token = localStorage.getItem("token");
        try {
            const res = await fetch("http://localhost:8081/productos", {
                headers: { "Authorization": "Bearer " + token }
            });
            if (!res.ok) throw new Error("Error " + res.status);
            const data = await res.json();
            setProductosEncontrados(data);
        } catch (err) {
            console.error("Error cargando productos:", err);
        }
    };

    useEffect(() => { cargarProductos(); }, []);

    const resultadosBusqueda = productosEncontrados.filter(p =>
        p.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );

    const productosBajos = productosEncontrados.filter(p => p.cantidad <= 10);

    useEffect(() => {
        if (productoSeleccionado) {
            let precioUnitario;
            if (productoSeleccionado.ofertaActiva && tipoVenta === "detal") {
                precioUnitario = productoSeleccionado.precioSugerido;
            } else {
                precioUnitario = tipoVenta === "detal"
                    ? productoSeleccionado.precioDetal
                    : productoSeleccionado.precioMayor;
            }
            setPrecioFinal(precioUnitario * cantidadVender);
        }
    }, [tipoVenta, cantidadVender, productoSeleccionado]);

    // ✅ BUSCAR CLIENTES (AUTOCOMPLETADO)
    const buscarClientes = async (termino) => {
        if (termino.length < 2) { setSugerencias([]); return; }
        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`http://localhost:8081/clientes/buscar?termino=${termino}`, {
                headers: { "Authorization": "Bearer " + token }
            });
            if (res.ok) setSugerencias(await res.json());
        } catch (error) { console.error("Error buscando clientes:", error); }
    };

    const seleccionarCliente = (cliente) => {
        setClienteCedula(cliente.cedula);
        setClienteNombre(cliente.nombre);
        setClienteTelefono(cliente.telefono || "");
        setClienteDireccion(cliente.direccion || "");
        setSugerencias([]);
    };

    // ✅ 1. AGREGAR PRODUCTO AL CARRITO (CON VALIDACIÓN DE STOCK)
    const agregarAlCarrito = () => {
        if (!productoSeleccionado) return alert("Selecciona un producto");

        if (productoSeleccionado.cantidad <= 0) {
            return alert(`El producto "${productoSeleccionado.nombre}" no tiene stock disponible.`);
        }
        if (cantidadVender > productoSeleccionado.cantidad) {
            return alert(`No hay suficiente stock. Solo quedan ${productoSeleccionado.cantidad} unidades.`);
        }

        const existe = carrito.find(item => item.producto.id === productoSeleccionado.id && item.tipoVenta === tipoVenta);

        if (existe) {
            const nuevoCarrito = carrito.map(item =>
                item.producto.id === productoSeleccionado.id && item.tipoVenta === tipoVenta
                    ? { ...item, cantidad: item.cantidad + cantidadVender, precioFinal: item.precioFinal + precioFinal }
                    : item
            );
            setCarrito(nuevoCarrito);
        } else {
            const nuevoItem = {
                producto: productoSeleccionado,
                cantidad: cantidadVender,
                tipoVenta: tipoVenta,
                precioFinal: precioFinal
            };
            setCarrito([...carrito, nuevoItem]);
        }

        setProductoSeleccionado(null);
        setCantidadVender(1);
        setBusqueda("");
    };

    // ✅ 2. COBRAR TODO EL CARRITO
    const cobrarCarrito = async () => {
        if (carrito.length === 0) return alert("El carrito está vacío");
        if (!clienteCedula) return alert("Ingresa la cédula del cliente");
        if (!clienteNombre) return alert("Ingresa el nombre del cliente");

        const ventasParaBackend = carrito.map(item => ({
            cantidad: item.cantidad,
            tipoVenta: item.tipoVenta,
            producto: { id: item.producto.id },
            cliente: {
                cedula: clienteCedula,
                nombre: clienteNombre,
                telefono: clienteTelefono,
                direccion: clienteDireccion
            },
            metodoPago: metodoPago,
            direccionPedido: direccionPedido
        }));

        try {
            const respuestaBackend = await guardarVenta(ventasParaBackend);

            const nuevaFactura = {
                numeroFactura: respuestaBackend.numeroFactura,
                fecha: new Date().toLocaleDateString(),
                vendedor: nombreUsuario,
                cliente: {
                    cedula: clienteCedula,
                    nombre: clienteNombre,
                    telefono: clienteTelefono,
                    direccion: clienteDireccion
                },
                metodoPago: metodoPago,
                direccionPedido: direccionPedido,
                carrito: carrito,
                subtotal: respuestaBackend.subtotal,
                iva: respuestaBackend.iva,
                total: respuestaBackend.total
            };

            setVentaFactura(nuevaFactura);
            setCarrito([]);
            setMostrarCarrito(false);
            setClienteCedula(""); setClienteNombre(""); setClienteTelefono(""); setClienteDireccion("");
            setMetodoPago("EFECTIVO"); setDireccionPedido("");
            await cargarProductos();

        } catch (error) {
            alert("Error: " + error.message);
            console.error(error);
        }
    };

    // ✅ 3. COBRAR VENTA DIRECTA (1 SOLO PRODUCTO)
    const cobrarDirecto = async () => {
        if (!productoSeleccionado) return alert("Selecciona un producto");

        if (productoSeleccionado.cantidad <= 0) {
            return alert(`El producto "${productoSeleccionado.nombre}" no tiene stock disponible.`);
        }
        if (cantidadVender > productoSeleccionado.cantidad) {
            return alert(`No hay suficiente stock. Solo quedan ${productoSeleccionado.cantidad} unidades.`);
        }
        if (!clienteCedula) return alert("Ingresa la cédula del cliente");
        if (!clienteNombre) return alert("Ingresa el nombre del cliente");

        const ventaDirecta = [{
            cantidad: cantidadVender,
            tipoVenta: tipoVenta,
            producto: { id: productoSeleccionado.id },
            cliente: {
                cedula: clienteCedula,
                nombre: clienteNombre,
                telefono: clienteTelefono,
                direccion: clienteDireccion
            },
            metodoPago: metodoPago,
            direccionPedido: direccionPedido
        }];

        try {
            const respuestaBackend = await guardarVenta(ventaDirecta);

            setVentaFactura({
                numeroFactura: respuestaBackend.numeroFactura,
                fecha: new Date().toLocaleDateString(),
                vendedor: nombreUsuario,
                cliente: { cedula: clienteCedula, nombre: clienteNombre, telefono: clienteTelefono, direccion: clienteDireccion },
                metodoPago: metodoPago, direccionPedido: direccionPedido,
                carrito: [{ producto: productoSeleccionado, cantidad: cantidadVender, tipoVenta, precioFinal: respuestaBackend.total }],
                subtotal: respuestaBackend.subtotal, iva: respuestaBackend.iva, total: respuestaBackend.total
            });

            setProductoSeleccionado(null); setCantidadVender(1);
            setClienteCedula(""); setClienteNombre(""); setClienteTelefono(""); setClienteDireccion("");
            setMetodoPago("EFECTIVO"); setDireccionPedido("");
            await cargarProductos();
        } catch (error) { alert("Error: " + error.message); console.error(error); }
    };

    const reabastecer = async (producto) => {
        if (!esAdmin) {
            alert("Solo el administrador puede reabastecer productos");
            return;
        }

        const cantidad = prompt(`¿Cuántas unidades agregar a "${producto.nombre}"?\n\nStock actual: ${producto.cantidad}`);
        if (!cantidad || isNaN(cantidad) || Number(cantidad) <= 0) return;

        const nuevaCantidad = producto.cantidad + Number(cantidad);

        try {
            await actualizarProducto(producto.id, {
                nombre: producto.nombre,
                cantidad: nuevaCantidad,
                precioCompra: producto.precioCompra,
                categoria: producto.categoria,
                proveedor: producto.proveedor,
                ofertaActiva: producto.ofertaActiva,
                precioSugerido: producto.precioSugerido,
                precioMinimo: producto.precioMinimo,
                motivoSugerido: producto.motivoSugerido
            });
            alert(`✅ Se agregaron ${cantidad} unidades a "${producto.nombre}"\n\nNuevo stock: ${nuevaCantidad}`);
            await cargarProductos();
        } catch (error) {
            alert("Error al reabastecer: " + error.message);
            console.error(error);
        }
    };

    const cerrarFactura = () => {
        setVentaFactura(null);
    };

    return (
        <div style={{ padding: "20px" }}>
            {ventaFactura && (
                <Factura venta={ventaFactura} onCerrar={cerrarFactura} />
            )}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                    <h1 style={{ margin: 0 }}>Sistema de Inventario</h1>
                    <p style={{ margin: "5px 0", color: "#666" }}>
                        Bienvenido, <strong>{nombreUsuario}</strong>{" "}
                        <span style={{
                            background: esAdmin ? "#28a745" : "#17a2b8",
                            color: "white",
                            padding: "2px 8px",
                            borderRadius: "10px",
                            fontSize: "12px"
                        }}>
                            {rol}
                        </span>
                    </p>
                </div>
                <button onClick={logout} style={{ background: "red", color: "white", padding: "8px 15px", border: "none", borderRadius: "5px", cursor: "pointer" }}>
                    Cerrar Sesión
                </button>
            </div>

            {productosBajos.length > 0 && (
                <div style={{
                    background: "#fff3cd", border: "2px solid #ffc107", borderRadius: "8px",
                    padding: "12px 20px", marginTop: "20px", marginBottom: "20px",
                    display: "flex", justifyContent: "space-between", alignItems: "center"
                }}>
                    <div style={{ fontSize: "16px" }}>
                        ⚠️ <strong>Atención:</strong> Tienes <strong>{productosBajos.length}</strong> producto(s) con stock bajo (≤ 10 unidades)
                    </div>
                    <button onClick={() => setMostrarAlertas(!mostrarAlertas)} style={{ background: "#ffc107", border: "none", padding: "8px 15px", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}>
                        {mostrarAlertas ? "Ocultar lista" : "Ver lista"}
                    </button>
                </div>
            )}

            {mostrarAlertas && productosBajos.length > 0 && (
                <div style={{ marginBottom: "20px", padding: "15px", background: "#fff9e6", borderRadius: "8px", border: "1px solid #ffc107" }}>
                    <h3>🚨 Productos con stock bajo</h3>
                    {productosBajos.map(p => (
                        <div key={p.id} style={{ padding: "10px", borderBottom: "1px solid #ddd", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                                <strong>{p.nombre}</strong>
                                <br />
                                <span style={{ color: p.cantidad <= 5 ? "red" : "#856404" }}>
                                    Stock actual: {p.cantidad} unidades
                                </span>
                            </div>
                            {esAdmin ? (
                                <button onClick={() => reabastecer(p)} style={{ background: "#28a745", color: "white", border: "none", padding: "8px 15px", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}>
                                    📦 Reabastecer
                                </button>
                            ) : (
                                <span style={{ color: "#856404", fontSize: "12px", fontStyle: "italic", background: "#fff3cd", padding: "5px 10px", borderRadius: "5px" }}>
                                    📌 Avisar al administrador
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <div style={{ margin: "20px 0", padding: "15px", background: "#f4f4f4", borderRadius: "8px" }}>
                <h3>Buscar Producto</h3>
                <input
                    type="text"
                    placeholder="Escribe el nombre del producto..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    style={{ width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: "5px" }}
                />

                {busqueda !== "" && (
                    <div style={{ marginTop: "10px" }}>
                        {resultadosBusqueda.map(p => (
                            <div
                                key={p.id}
                                onClick={() => {
                                    setProductoSeleccionado(p);
                                    setBusqueda("");
                                }}
                                style={{
                                    padding: "8px", borderBottom: "1px solid #ddd", cursor: "pointer",
                                    background: productoSeleccionado?.id === p.id ? "#d1e7ff" : "white"
                                }}
                            >
                                {p.ofertaActiva && <span style={{ color: "#dc3545", marginRight: "5px" }}>🔥</span>}
                                {p.nombre} | Stock: {p.cantidad}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {productoSeleccionado && (
                <div style={{
                    margin: "20px 0", padding: "20px",
                    border: productoSeleccionado.ofertaActiva ? "2px solid #dc3545" : "2px solid #28a745",
                    borderRadius: "8px",
                    background: productoSeleccionado.ofertaActiva ? "#fff5f5" : "#f8fff9"
                }}>
                    <h2>Registrar Venta</h2>

                    {productoSeleccionado.ofertaActiva && (
                        <div style={{ background: "#dc3545", color: "white", padding: "5px 12px", borderRadius: "5px", display: "inline-block", marginBottom: "10px", fontWeight: "bold" }}>
                            🔥 OFERTA - {productoSeleccionado.motivoSugerido}
                        </div>
                    )}

                    <h3>Producto: {productoSeleccionado.nombre}</h3>

                    {productoSeleccionado.ofertaActiva && tipoVenta === "detal" && (
                        <div style={{ marginBottom: "10px" }}>
                            <p style={{ margin: "3px 0" }}>
                                <strong>Precio Normal:</strong>{" "}
                                <span style={{ textDecoration: "line-through", color: "#999" }}>
                                    ${productoSeleccionado.precioDetal?.toFixed(2)}
                                </span>
                            </p>
                            <p style={{ margin: "3px 0", color: "#dc3545", fontWeight: "bold" }}>
                                <strong>Precio Oferta:</strong> ${productoSeleccionado.precioSugerido?.toFixed(2)}
                            </p>
                        </div>
                    )}

                    <div style={{ display: "flex", gap: "20px", margin: "15px 0" }}>
                        <div>
                            <label>Cantidad a vender:</label>
                            <input
                                type="number"
                                min="1"
                                max={productoSeleccionado.cantidad}
                                value={cantidadVender}
                                onChange={(e) => setCantidadVender(parseInt(e.target.value))}
                                style={{ padding: "8px", width: "80px", marginLeft: "10px" }}
                            />
                        </div>

                        <div>
                            <label>Tipo de Venta:</label>
                            <select value={tipoVenta} onChange={(e) => setTipoVenta(e.target.value)} style={{ padding: "8px", marginLeft: "10px" }}>
                                <option value="detal">Al Detal</option>
                                <option value="mayor">Al Por Mayor</option>
                            </select>
                        </div>
                    </div>

                    <h2 style={{ color: productoSeleccionado.ofertaActiva ? "#dc3545" : "#28a745" }}>
                        Total a Pagar: $ {precioFinal.toFixed(2)}
                    </h2>

                    {/* ✅ FORMULARIO DE CLIENTE Y PAGO */}
                    <hr style={{ margin: "20px 0" }} />
                    <h4>👤 Datos del Cliente</h4>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "15px" }}>

                        <div style={{ position: "relative" }}>
                            <input
                                type="text"
                                placeholder="Cédula *"
                                value={clienteCedula}
                                onChange={(e) => {
                                    setClienteCedula(e.target.value);
                                    buscarClientes(e.target.value);
                                }}
                                required
                                style={{ padding: "8px", width: "100%", boxSizing: "border-box" }}
                            />
                            {sugerencias.length > 0 && (
                                <ul style={{
                                    position: "absolute", top: "100%", left: 0, right: 0,
                                    background: "white", border: "1px solid #ccc", borderRadius: "5px",
                                    listStyle: "none", padding: 0, margin: "2px 0 0 0", zIndex: 10,
                                    maxHeight: "150px", overflowY: "auto", boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
                                }}>
                                    {sugerencias.map(c => (
                                        <li
                                            key={c.id}
                                            onClick={() => seleccionarCliente(c)}
                                            style={{ padding: "8px", borderBottom: "1px solid #eee", cursor: "pointer" }}
                                        >
                                            <strong>{c.cedula}</strong> - {c.nombre}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <input type="text" placeholder="Nombre *" value={clienteNombre} onChange={(e) => setClienteNombre(e.target.value)} required style={{ padding: "8px" }} />
                        <input type="text" placeholder="Teléfono" value={clienteTelefono} onChange={(e) => setClienteTelefono(e.target.value)} style={{ padding: "8px" }} />
                        <input type="text" placeholder="Dirección (opcional)" value={clienteDireccion} onChange={(e) => setClienteDireccion(e.target.value)} style={{ padding: "8px" }} />
                    </div>

                    <h4>💳 Método de Pago</h4>
                    <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
                        <select value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)} style={{ padding: "8px", flex: 1 }}>
                            <option value="EFECTIVO">💵 Efectivo</option>
                            <option value="TRANSFERENCIA">🏦 Transferencia</option>
                            <option value="TARJETA">💳 Tarjeta</option>
                        </select>
                    </div>

                    <h4>📍 Dirección de Pedido (si es domicilio)</h4>
                    <input type="text" placeholder="Dirección de entrega (Opcional)" value={direccionPedido} onChange={(e) => setDireccionPedido(e.target.value)} style={{ padding: "8px", width: "100%", marginBottom: "15px", boxSizing: "border-box" }} />

                    <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                        <button onClick={agregarAlCarrito} style={{
                            flex: 1, padding: "10px 20px", background: "#007bff",
                            color: "white", border: "none", borderRadius: "5px",
                            fontSize: "16px", cursor: "pointer"
                        }}>
                            🛒 Agregar al Pedido
                        </button>

                        <button onClick={cobrarDirecto} style={{
                            flex: 1, padding: "10px 20px", background: "#28a745",
                            color: "white", border: "none", borderRadius: "5px",
                            fontSize: "16px", cursor: "pointer"
                        }}>
                            💵 Cobrar Directo
                        </button>
                    </div>
                </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px", marginTop: "40px" }}>
                <div onClick={() => navigate("/licorera")} style={{ padding: "40px", background: "#343a40", color: "white", textAlign: "center", borderRadius: "10px", cursor: "pointer" }}>
                    <h2>Licorera</h2>
                    <p>Ver y agregar bebidas</p>
                </div>
                <div onClick={() => navigate("/tienda")} style={{ padding: "40px", background: "#007bff", color: "white", textAlign: "center", borderRadius: "10px", cursor: "pointer" }}>
                    <h2>Tienda</h2>
                    <p>Ver y agregar abarrotes</p>
                </div>
                <div onClick={() => navigate("/papeleria")} style={{ padding: "40px", background: "#ffc107", color: "black", textAlign: "center", borderRadius: "10px", cursor: "pointer" }}>
                    <h2>Papelería</h2>
                    <p>Ver y agregar útiles</p>
                </div>
            </div>

            <div style={{ marginTop: "30px" }}>
                <button onClick={() => setMostrarInventario(!mostrarInventario)} style={{
                    padding: "12px 20px", background: "#198754", color: "white",
                    border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "16px"
                }}>
                    {mostrarInventario ? "Ocultar Inventario" : "Ver Inventario General"}
                </button>
                {/* ✅ NUEVO BOTÓN DE HISTORIAL */}
                <button onClick={() => navigate("/historial")} style={{
                    padding: "12px 20px", background: "#0d6efd", color: "white",
                    border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "16px"
                }}>
                    📊 Historial de Ventas
                </button>

                <button onClick={() => navigate("/movimientos")} style={{
                    padding: "12px 20px", background: "#6f42c1", color: "white",
                    border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "16px"
                }}>
                    📦 Historial de Movimientos
                </button>


            </div>

            {mostrarInventario && (
                <div style={{ marginTop: "20px" }}>
                    <h2>Inventario General</h2>

                    {productosEncontrados.length === 0 ? (
                        <p>No hay productos para mostrar.</p>
                    ) : (
                        <div>
                            {["Licorera", "Tienda", "Papeleria"].map(catNombre => {
                                const prodsCat = productosEncontrados.filter(p =>
                                    p.categoria?.nombre?.trim().toLowerCase() === catNombre.trim().toLowerCase()
                                );
                                if (prodsCat.length === 0) return null;

                                const prodsSub = prodsCat.reduce((acc, p) => {
                                    const sub = p.subcategoria || "Sin clasificar";
                                    if (!acc[sub]) acc[sub] = [];
                                    acc[sub].push(p);
                                    return acc;
                                }, {});

                                const estaCatAbierta = categoriaAbierta === catNombre;

                                return (
                                    <div key={catNombre} style={{ marginBottom: "15px", border: "1px solid #ccc", borderRadius: "8px", overflow: "hidden" }}>
                                        <button
                                            onClick={() => setCategoriaAbierta(estaCatAbierta ? null : catNombre)}
                                            style={{
                                                width: "100%", padding: "20px", background: "#343a40", color: "white",
                                                border: "none", textAlign: "left", fontSize: "20px", fontWeight: "bold",
                                                cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center"
                                            }}
                                        >
                                            <span>🏬 {catNombre} ({prodsCat.length} productos)</span>
                                            <span>{estaCatAbierta ? "▲" : "▼"}</span>
                                        </button>

                                        {estaCatAbierta && (
                                            <div style={{ padding: "20px", background: "#f8f9fa" }}>
                                                {Object.keys(prodsSub).map(sub => {
                                                    const estaSubAbierta = subcategoriaAbierta === `${catNombre}-${sub}`;

                                                    return (
                                                        <div key={sub} style={{ marginBottom: "10px", border: "1px solid #ddd", borderRadius: "6px", overflow: "hidden" }}>
                                                            <button
                                                                onClick={() => setSubcategoriaAbierta(estaSubAbierta ? null : `${catNombre}-${sub}`)}
                                                                style={{
                                                                    width: "100%", padding: "12px 15px", background: "white", color: "#495057",
                                                                    border: "none", borderBottom: estaSubAbierta ? "2px solid #007bff" : "none",
                                                                    textAlign: "left", fontSize: "16px", fontWeight: "bold",
                                                                    cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center"
                                                                }}
                                                            >
                                                                <span>📁 {sub} ({prodsSub[sub].length})</span>
                                                                <span>{estaSubAbierta ? "▲" : "▼"}</span>
                                                            </button>

                                                            {estaSubAbierta && (
                                                                <div style={{ padding: "15px", background: "#fff" }}>
                                                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "15px" }}>
                                                                        {prodsSub[sub].map(p => (
                                                                            <div key={p.id} style={{
                                                                                border: "1px solid #ccc", borderRadius: "8px", padding: "15px",
                                                                                background: p.ofertaActiva ? "#fff5f5" : (p.cantidad <= 5 ? "#ffe5e5" : p.cantidad <= 10 ? "#fff3cd" : "white")
                                                                            }}>
                                                                                {p.ofertaActiva && <span style={{ color: "#dc3545", fontWeight: "bold", fontSize: "12px" }}>🔥 OFERTA</span>}
                                                                                <h4 style={{ margin: "5px 0" }}>{p.nombre}</h4>
                                                                                <p style={{ margin: "2px 0", fontSize: "14px" }}><strong>Stock:</strong> {p.cantidad}</p>
                                                                                <p style={{ margin: "2px 0", fontSize: "14px" }}><strong>Precio:</strong> ${p.precioDetal?.toFixed(2)}</p>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* ✅ BOTÓN FLOTANTE DEL CARRITO */}
            {carrito.length > 0 && (
                <div
                    onClick={() => setMostrarCarrito(true)}
                    style={{
                        position: "fixed", bottom: "30px", right: "30px",
                        background: "#007bff", color: "white", width: "70px", height: "70px",
                        borderRadius: "50%", display: "flex", justifyContent: "center", alignItems: "center",
                        fontSize: "30px", cursor: "pointer", boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
                        zIndex: 1000
                    }}
                >
                    🛒
                    <span style={{
                        position: "absolute", top: "0", right: "0", background: "red",
                        color: "white", borderRadius: "50%", width: "25px", height: "25px",
                        fontSize: "14px", display: "flex", justifyContent: "center", alignItems: "center",
                        fontWeight: "bold"
                    }}>
                        {carrito.length}
                    </span>
                </div>
            )}

            {/* ✅ VENTANA MODAL DEL CARRITO */}
            {mostrarCarrito && (
                <div style={{
                    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                    background: "rgba(0,0,0,0.7)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1001
                }}>
                    <div style={{ background: "white", padding: "20px", borderRadius: "10px", width: "90%", maxWidth: "500px" }}>
                        <h2>🛒 Resumen del Pedido</h2>
                        <ul style={{ listStyle: "none", padding: 0, maxHeight: "300px", overflowY: "auto" }}>
                            {carrito.map((item, index) => (
                                <li key={index} style={{ borderBottom: "1px solid #ddd", padding: "10px 0", display: "flex", justifyContent: "space-between" }}>
                                    <div>
                                        <strong>{item.producto.nombre}</strong><br/>
                                        Cant: {item.cantidad} x ${(item.precioFinal / item.cantidad).toFixed(2)}
                                    </div>
                                    <button onClick={() => {
                                        const nuevo = [...carrito];
                                        nuevo.splice(index, 1);
                                        setCarrito(nuevo);
                                        if (nuevo.length === 0) setMostrarCarrito(false);
                                    }} style={{ background: "red", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", height: "30px" }}>❌</button>
                                </li>
                            ))}
                        </ul>

                        <h3 style={{ textAlign: "right", marginTop: "20px" }}>
                            Total a Pagar: ${carrito.reduce((acc, item) => acc + item.precioFinal, 0).toFixed(2)}
                        </h3>

                        <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                            <button onClick={() => setMostrarCarrito(false)} style={{ flex: 1, padding: "10px", background: "#6c757d", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>Seguir Agregando</button>
                            <button onClick={cobrarCarrito} style={{ flex: 1, padding: "10px", background: "#28a745", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}>Confirmar Pedido ✅</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Dashboard;