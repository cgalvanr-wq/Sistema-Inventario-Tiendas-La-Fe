import { fetchConToken } from "./api";

const URL = "/categorias";

export const obtenerCategorias = async () => {
    const response = await fetchConToken(URL);
    if (!response.ok) throw new Error("Error al obtener categorías: " + response.status);
    return await response.json();
};