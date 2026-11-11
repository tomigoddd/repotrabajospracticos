// Pantalla de confirmación del pedido. Está en el HTML con el atributo hidden;
// al enviar el pedido se completa, se muestra y se le pasa el foco.

import { $, crear, reemplazar } from "../modulos/dom.js";
import { precio, fechaCorta } from "../modulos/formato.js";

export function mostrarConfirmacion(pedido) {
  $("#confirmacion-numero").textContent = pedido.numero;

  const lista = crear(
    "ul",
    { clase: "confirmacion__lista" },
    pedido.items.map((item) =>
      crear("li", {
        texto:
          item.accion === "alquiler"
            ? `${item.nombre}, ${fechaCorta(item.fecha)}`
            : `${item.nombre} (presupuesto)${item.cantidad > 1 ? `, ${item.cantidad} unidades` : ""}`,
      }),
    ),
  );

  const entrega =
    pedido.entrega.tipo === "envio" ? `Envío a domicilio: ${pedido.entrega.direccion}` : "Retiro en el local";

  reemplazar($("#confirmacion-datos"), [
    crear("dt", { texto: "Productos" }),
    crear("dd", {}, lista),
    crear("dt", { texto: "Entrega" }),
    crear("dd", { texto: entrega }),
    crear("dt", { texto: "Subtotal" }),
    crear("dd", {}, crear("data", { value: pedido.subtotal, texto: precio(pedido.subtotal) })),
    crear("dt", { texto: "Contacto" }),
    crear("dd", { texto: `${pedido.cliente.nombre}, ${pedido.cliente.email}` }),
  ]);

  const seccion = $("#confirmacion");
  seccion.hidden = false;
  seccion.scrollIntoView({ behavior: "smooth", block: "start" });
  seccion.focus({ preventScroll: true });
}
