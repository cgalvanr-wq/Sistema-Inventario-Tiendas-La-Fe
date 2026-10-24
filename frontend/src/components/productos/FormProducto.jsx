import { useState } from "react";
import { guardarProducto } from "../../services/productoService";


function FormProducto({ categoriaId, nombreCategoria, recargarLista }) {

    const [nombre, setNombre] = useState("");
    const [cantidad, setCantidad] = useState("");
    const [precioCompra, setPrecioCompra] = useState("");
    const [proveedor, setProveedor] = useState("");
    const [telefono, setTelefono] = useState("");

    const manejarGuardar = async (e) => {
        e.preventDefault();

        const datosProducto = {
            nombre: nombre,
            cantidad: parseInt(cantidad),
            precioCompra: parseFloat(precioCompra),
            proveedor: proveedor,
            telefono: telefono,
            categoria: { id: categoriaId }
        };

        try {
            await guardarProducto(datosProducto);
            alert(` Producto guardado en ${nombreCategoria}`);

            // para la lista que se ve pero no muestra toca mirar
            setNombre(""); setCantidad(""); setPrecioCompra(""); setProveedor(""); setTelefono("");


            recargarLista();

        } catch (error) {
            console.error(error);
            alert("Error al guardar");
        }
    };

    return (
        <div style={{padding:"20px", background:"#f8f9fa", margin:"20px 0", borderRadius:"8px"}}>
            <h2>Agregar Producto - <strong>{nombreCategoria}</strong></h2>
            <form onSubmit={manejarGuardar}>

                <input
                    placeholder="Nombre del producto"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                    style={{padding:"10px", width:"300px", margin:"5px"}}
                />
                <br/>

                <input
                    type="number"
                    placeholder="Cantidad (Unidades)"
                    value={cantidad}
                    onChange={(e) => setCantidad(e.target.value)}
                    required
                    style={{padding:"10px", width:"300px", margin:"5px"}}
                />
                <br/>

                <input
                    type="number"
                    placeholder="Precio de Compra Total ($)"
                    value={precioCompra}
                    onChange={(e) => setPrecioCompra(e.target.value)}
                    required
                    style={{padding:"10px", width:"300px", margin:"5px"}}
                />
                <br/>

                <input
                    placeholder="Nombre del Proveedor / Almacén"
                    value={proveedor}
                    onChange={(e) => setProveedor(e.target.value)}
                    required
                    style={{padding:"10px", width:"300px", margin:"5px"}}
                />
                <br/>

                <input
                    placeholder="Teléfono del proveedor"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    style={{padding:"10px", width:"300px", margin:"5px"}}
                />
                <br/>

                <button
                    type="submit"
                    style={{padding:"12px 30px", background:"black", color:"white", border:"none", borderRadius:"5px", marginTop:"10px"}}
                >
                    GUARDAR PRODUCTO
                </button>
            </form>
        </div>
    );
}

export default FormProducto;