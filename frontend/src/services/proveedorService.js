import { fetchConToken } from "./api";

const URL = "/proveedores";

export const obtenerProveedores = async () => {
    const response = await fetchConToken(URL);
    if (!response.ok) throw new Error("Error al obtener proveedores: " + response.status);
    return await response.json();
};

export const guardarProveedor = async (proveedor) => {
    const response = await fetchConToken(URL, {
        method: "POST",
        body: JSON.stringify(proveedor),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText || "No se pudo guardar proveedor"}`);
    }

    const texto = await response.text();
    return texto ? JSON.parse(texto) : { ok: true };
};