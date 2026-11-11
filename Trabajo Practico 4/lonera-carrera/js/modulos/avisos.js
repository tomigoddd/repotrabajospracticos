// Notificaciones tipo toast. Se escriben dentro de la región #avisos (role="status"),
// que ya existe vacía en el HTML: así los lectores de pantalla anuncian cada mensaje.

import { $, crear } from "./dom.js";

const MAXIMO_VISIBLES = 3;

/**
 * avisar("Producto agregado", "ok")
 * tipo: "info" (por defecto), "ok" o "error". Los errores duran más y se anuncian con prioridad.
 */
export function avisar(texto, tipo = "info") {
  const region = $("#avisos");
  if (!region) return;

  const clases = tipo === "info" ? "aviso" : `aviso aviso--${tipo}`;
  const aviso = crear("p", { clase: clases, texto, role: tipo === "error" ? "alert" : false });
  region.append(aviso);

  while (region.children.length > MAXIMO_VISIBLES) {
    region.firstElementChild.remove();
  }
  setTimeout(() => aviso.remove(), tipo === "error" ? 9000 : 6000);
}
