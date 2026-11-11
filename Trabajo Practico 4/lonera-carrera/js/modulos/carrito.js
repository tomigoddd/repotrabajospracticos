// Estado del pedido (carrito). Es la única fuente de verdad: las vistas se suscriben
// y se vuelven a dibujar cada vez que cambia. Se guarda en sessionStorage, así se
// conserva al cambiar de página y se pierde al cerrar la pestaña.

import { leer, guardar } from "./almacen.js";

const CLAVE = "lonera-pedido";

let items = leer("sessionStorage", CLAVE, []);
const oyentes = new Set();

// Cada ítem: { clave, id, nombre, accion, fecha, cantidad, precioPorDia }
// - Un castillo se identifica por producto + fecha (se puede reservar el mismo modelo en dos fechas).
// - Un trabajo de lonería se identifica solo por producto.
const claveDe = (producto, fecha) =>
  producto.accion === "alquiler" ? `${producto.id}@${fecha}` : producto.id;

function cambiar(nuevosItems) {
  items = nuevosItems;
  guardar("sessionStorage", CLAVE, items);
  oyentes.forEach((oyente) => oyente(obtener()));
}

export const obtener = () => items.map((item) => ({ ...item }));

export const cantidadTotal = () => items.reduce((suma, item) => suma + item.cantidad, 0);

/** Suma solo lo que tiene precio fijo: la lonería se cotiza aparte. */
export const subtotal = () =>
  items.reduce((suma, item) => suma + (item.precioPorDia ?? 0) * item.cantidad, 0);

/** Devuelve { ok: true } o { ok: false, motivo: "repetido" } */
export function agregar(producto, fecha) {
  const clave = claveDe(producto, fecha);
  if (items.some((item) => item.clave === clave)) {
    return { ok: false, motivo: "repetido" };
  }
  cambiar([
    ...items,
    {
      clave,
      id: producto.id,
      nombre: producto.nombre,
      accion: producto.accion,
      fecha: producto.accion === "alquiler" ? fecha : null,
      cantidad: 1,
      precioPorDia: producto.precioPorDia,
    },
  ]);
  return { ok: true };
}

export function quitar(clave) {
  cambiar(items.filter((item) => item.clave !== clave));
}

export function cambiarCantidad(clave, cantidad) {
  const valida = Math.max(1, Math.min(20, Math.trunc(cantidad) || 1));
  cambiar(items.map((item) => (item.clave === clave ? { ...item, cantidad: valida } : item)));
}

export function vaciar() {
  cambiar([]);
}

/** Registra una función que se llama con los ítems cada vez que el pedido cambia. */
export function suscribir(oyente) {
  oyentes.add(oyente);
  return () => oyentes.delete(oyente);
}
