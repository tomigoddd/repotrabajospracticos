// Disponibilidad de los castillos por fecha.

import { hoyISO } from "./formato.js";

/** ¿Hay una reserva de ese producto en esa fecha? (reservas: [{ productoId, fecha }]) */
export function estaLibre(reservas, productoId, fecha) {
  return !reservas.some((reserva) => reserva.productoId === productoId && reserva.fecha === fecha);
}

/**
 * Estado que se muestra en la tarjeta de un producto.
 * Devuelve { tipo: "libre" | "ocupado" | "cotizar", texto, puedeAgregar }
 */
export function estadoDe(producto, fecha, reservas, textoFecha) {
  if (producto.accion === "presupuesto") {
    return { tipo: "cotizar", texto: producto.estadoPresupuesto, puedeAgregar: true };
  }
  if (!fecha) {
    return { tipo: "cotizar", texto: "Elegí una fecha para ver la disponibilidad", puedeAgregar: true };
  }
  if (fecha < hoyISO()) {
    return { tipo: "cotizar", texto: "Elegí una fecha desde hoy en adelante", puedeAgregar: true };
  }
  return estaLibre(reservas, producto.id, fecha)
    ? { tipo: "libre", texto: `Disponible el ${textoFecha}`, puedeAgregar: true }
    : { tipo: "ocupado", texto: `No disponible el ${textoFecha}`, puedeAgregar: false };
}
