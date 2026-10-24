import { fetchConToken } from "./api";

const URL = "/productos";

export const obtenerProductos = async () => {
    const response = await fetchConToken(URL);
    if (!response.ok) throw new Error("Error al obtener productos: " + response.status);
    return await response.json();
};

export const guardarProducto = async (producto) => {
    const response = await fetchConToken(URL, {
        method: "POST",
        body: JSON.stringify(producto),
    });

    // ✅ VALIDAR EL STATUS
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText || "No se pudo guardar"}`);
    }

    const texto = await response.text();
    return texto ? JSON.parse(texto) : { ok: true };
};

export const actualizarProducto = async (id, data) => {
    const response = await fetchConToken(`${URL}/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText || "No se pudo actualizar"}`);
    }

    const texto = await response.text();
    return texto ? JSON.parse(texto) : { ok: true };
};

export const eliminarProducto = async (id) => {
    const response = await fetchConToken(`${URL}/${id}`, {
        method: "DELETE"
    });

    if (!response.ok) {
        throw new Error(`Error ${response.status}: No se pudo eliminar`);
    }
};