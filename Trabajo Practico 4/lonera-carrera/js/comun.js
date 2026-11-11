// Lo que necesitan todas las páginas: el menú responsive y el contador del pedido
// que aparece en la cabecera. Las demás páginas importan este archivo.

import { iniciarMenu } from "./modulos/menu.js";
import { cantidadTotal, suscribir } from "./modulos/carrito.js";
import { $$ } from "./modulos/dom.js";

function actualizarContador() {
  const cantidad = cantidadTotal();
  $$(".carrito-enlace__cantidad").forEach((elemento) => {
    elemento.textContent = cantidad;
  });
}

iniciarMenu();
actualizarContador();
suscribir(actualizarContador);

// Al volver con el botón "Atrás" el navegador puede mostrar la página como estaba: se refresca el número
window.addEventListener("pageshow", actualizarContador);
