// Lógica de los filtros del catálogo. Son funciones puras: reciben datos y devuelven datos.

import { normalizar } from "./formato.js";

/** Lee el formulario de filtros y devuelve un objeto simple. */
export function leerFiltros(formulario) {
  const datos = new FormData(formulario);
  return {
    texto: String(datos.get("q") ?? "").trim(),
    tipo: String(datos.get("tipo") ?? "todos"),
    capacidad: String(datos.get("capacidad") ?? ""),
    precio: String(datos.get("precio") ?? ""),
    fecha: String(datos.get("fecha") ?? ""),
  };
}

// "6-8" -> { minimo: 6, maximo: 8 }
function rango(texto) {
  const [minimo, maximo] = texto.split("-").map(Number);
  return { minimo, maximo };
}

const dentroDelRango = (valor, texto) => {
  if (valor === null || valor === undefined) return false; // sin dato, no entra en un filtro numérico
  const { minimo, maximo } = rango(texto);
  return valor >= minimo && valor <= maximo;
};

/**
 * Devuelve los productos que cumplen todos los filtros.
 * La capacidad y el precio por día solo existen en los castillos de alquiler:
 * si se elige uno de esos filtros, los productos sin ese dato quedan afuera.
 * La fecha no filtra: sirve para mostrar la disponibilidad de cada castillo.
 */
export function filtrar(productos, filtros) {
  const texto = normalizar(filtros.texto);
  return productos.filter((producto) => {
    if (filtros.tipo !== "todos" && producto.categoria !== filtros.tipo) return false;
    if (texto && !normalizar(`${producto.nombre} ${producto.descripcion}`).includes(texto)) return false;
    if (filtros.capacidad && !dentroDelRango(producto.capacidadMax, filtros.capacidad)) return false;
    if (filtros.precio && !dentroDelRango(producto.precioPorDia, filtros.precio)) return false;
    return true;
  });
}
