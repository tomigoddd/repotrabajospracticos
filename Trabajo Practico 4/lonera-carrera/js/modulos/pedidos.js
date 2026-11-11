// Envío y registro de pedidos y consultas.
// El sitio es solo front-end: no hay servidor al que enviar los datos. Por eso el envío se
// SIMULA con una espera corta, y el pedido queda guardado en localStorage para poder verlo.
// En una versión con servidor, esta espera se reemplaza por un fetch(url, { method: "POST", ... }).

import { leer, guardar } from "./almacen.js";

const CLAVE_CONTADOR = "lonera-contador-pedidos";
const CLAVE_PEDIDOS = "lonera-pedidos";
const CLAVE_RESERVAS = "lonera-reservas-locales";

const esperar = (milisegundos) => new Promise((resolver) => setTimeout(resolver, milisegundos));

/** Reservas hechas desde este navegador: se suman a las del archivo reservas.json. */
export const reservasLocales = () => leer("localStorage", CLAVE_RESERVAS, []);

function siguienteNumero() {
  const numero = leer("localStorage", CLAVE_CONTADOR, 0) + 1;
  guardar("localStorage", CLAVE_CONTADOR, numero);
  return `LC-${String(numero).padStart(4, "0")}`;
}

/**
 * Envía un pedido (simulado). datos: { cliente, entrega, observaciones, items, subtotal }
 * Devuelve el pedido con su número. Los castillos reservados quedan como no disponibles.
 */
export async function enviarPedido(datos) {
  await esperar(700);

  const pedido = { numero: siguienteNumero(), creado: new Date().toISOString(), ...datos };

  const anteriores = leer("localStorage", CLAVE_PEDIDOS, []);
  guardar("localStorage", CLAVE_PEDIDOS, [...anteriores, pedido].slice(-20));

  const nuevasReservas = pedido.items
    .filter((item) => item.accion === "alquiler")
    .map((item) => ({ productoId: item.id, fecha: item.fecha }));
  guardar("localStorage", CLAVE_RESERVAS, [...reservasLocales(), ...nuevasReservas]);

  return pedido;
}

/** Envía una consulta del formulario de contacto (simulado). */
export async function enviarConsulta() {
  await esperar(700);
}
