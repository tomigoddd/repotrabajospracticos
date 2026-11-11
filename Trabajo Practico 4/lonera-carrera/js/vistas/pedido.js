// Vista del pedido (carrito) en el panel lateral del catálogo.
// Se vuelve a dibujar cada vez que cambia el carrito (patrón suscripción).

import { $, crear, reemplazar } from "../modulos/dom.js";
import { precio, fechaCorta } from "../modulos/formato.js";
import { avisar } from "../modulos/avisos.js";
import * as carrito from "../modulos/carrito.js";

function filaDeItem(item) {
  const detalle =
    item.accion === "alquiler"
      ? crear("span", { clase: "pedido__detalle" }, "Fecha: ", crear("time", { datetime: item.fecha, texto: fechaCorta(item.fecha) }))
      : crear("span", { clase: "pedido__detalle", texto: "Presupuesto" });

  // Un castillo se reserva de a uno por fecha; la lonería permite cambiar la cantidad
  const celdaCantidad =
    item.accion === "alquiler"
      ? crear("td", { texto: "1" })
      : crear(
          "td",
          {},
          crear("input", {
            clase: "campo__control pedido__cantidad",
            type: "number",
            min: 1,
            max: 20,
            value: item.cantidad,
            "data-clave": item.clave,
            "aria-label": `Cantidad de ${item.nombre}`,
          }),
        );

  const importe =
    item.precioPorDia === null
      ? crear("td", { texto: "A cotizar" })
      : crear("td", {}, crear("data", { value: item.precioPorDia * item.cantidad, texto: precio(item.precioPorDia * item.cantidad) }));

  return crear(
    "tr",
    {},
    crear("th", { scope: "row" }, `${item.nombre} `, detalle),
    celdaCantidad,
    importe,
    crear(
      "td",
      {},
      crear("button", {
        clase: "boton boton--secundario boton--chico",
        type: "button",
        "data-accion": "quitar",
        "data-clave": item.clave,
        "aria-label": `Quitar ${item.nombre} del pedido`,
        texto: "Quitar",
      }),
    ),
  );
}

function tabla(items) {
  return crear(
    "table",
    { clase: "pedido__tabla" },
    crear("caption", { clase: "pedido__leyenda", texto: "Productos del pedido" }),
    crear(
      "thead",
      {},
      crear(
        "tr",
        {},
        crear("th", { scope: "col", texto: "Producto" }),
        crear("th", { scope: "col", texto: "Cant." }),
        crear("th", { scope: "col", texto: "Importe" }),
        crear("th", { scope: "col" }, crear("span", { clase: "solo-lector", texto: "Acción" })),
      ),
    ),
    crear("tbody", {}, items.map(filaDeItem)),
    crear(
      "tfoot",
      {},
      crear(
        "tr",
        {},
        crear("th", { scope: "row", colspan: 2, texto: "Subtotal" }),
        crear("td", { colspan: 2 }, crear("data", { value: carrito.subtotal(), texto: precio(carrito.subtotal()) })),
      ),
    ),
  );
}

function dibujar(items) {
  const detalle = $("#pedido-detalle");
  const acciones = $("#pedido-acciones");
  $("#pedido-cantidad").textContent = carrito.cantidadTotal();

  if (items.length === 0) {
    reemplazar(detalle, crear("p", { clase: "pedido__vacio", texto: "Tu pedido está vacío. Agregá productos desde el catálogo." }));
    acciones.hidden = true;
    return;
  }

  reemplazar(
    detalle,
    tabla(items),
    crear("p", { clase: "pedido__nota", texto: "Los trabajos de lonería se cotizan aparte y no se suman al subtotal." }),
  );
  acciones.hidden = false;
}

// Después de quitar un ítem, el botón desaparece: el foco pasa al título del pedido
function enfocarTitulo() {
  $("#titulo-pedido").focus();
}

export function iniciarPedido() {
  const panel = $("#pedido");
  carrito.suscribir(dibujar);
  dibujar(carrito.obtener());

  panel.addEventListener("click", (evento) => {
    const boton = evento.target.closest("button[data-accion='quitar']");
    if (boton) {
      const item = carrito.obtener().find((i) => i.clave === boton.dataset.clave);
      carrito.quitar(boton.dataset.clave);
      avisar(`${item?.nombre ?? "El producto"} se quitó del pedido.`);
      enfocarTitulo();
    }
  });

  panel.addEventListener("change", (evento) => {
    if (evento.target.matches(".pedido__cantidad")) {
      carrito.cambiarCantidad(evento.target.dataset.clave, Number(evento.target.value));
    }
  });

  $("#vaciar-pedido").addEventListener("click", () => {
    carrito.vaciar();
    avisar("Se vació el pedido.");
    enfocarTitulo();
  });
}
