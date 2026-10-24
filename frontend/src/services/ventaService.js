import { fetchConToken } from "./api";

const URL = "/ventas";

export const guardarVenta = async (ventas) => {
    const response = await fetchConToken(URL, {
        method: "POST",
        body: JSON.stringify(ventas),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText || "No se pudo guardar venta"}`);
    }

    // ✅ Leemos el JSON con los totales reales
    return await response.json();
};

export const obtenerVentas = async () => {
    const response = await fetchConToken(URL);
    if (!response.ok) throw new Error("Error al obtener ventas: " + response.status);
    return await response.json();
};