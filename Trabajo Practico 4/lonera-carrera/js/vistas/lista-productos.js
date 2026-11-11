// Vista del catálogo: dibuja las tarjetas de producto a partir de los datos.
// Genera el mismo HTML (y las mismas clases) que se había escrito a mano en el SP3.

import { crear, reemplazar } from "../modulos/dom.js";
import { precio, fechaCorta, plural } from "../modulos/formato.js";
import { estadoDe } from "../modulos/disponibilidad.js";

function tarjeta(producto, estado) {
  const idTitulo = `prod-${producto.id}`;

  const datos = crear(
    "dl",
    { clase: "producto__datos" },
    producto.detalles.flatMap((d) => [
      crear("dt", { clase: "producto__dato", texto: d.etiqueta }),
      crear("dd", { clase: "producto__valor", texto: d.valor }),
    ]),
  );

  const lineaPrecio = crear(
    "p",
    { clase: "producto__precio" },
    producto.precioPorDia === null
      ? "Precio a cotizar"
      : [crear("data", { value: producto.precioPorDia, texto: precio(producto.precioPorDia) }), " por día"],
  );

  const textoBoton =
    producto.accion === "presupuesto" ? "Pedir presupuesto" : estado.puedeAgregar ? "Agregar al pedido" : "No disponible";

  return crear(
    "li",
    { clase: "productos__item" },
    crear(
      "article",
      {
        clase: "producto",
        "data-id": producto.id,
        "data-categoria": producto.categoria,
        "data-precio": producto.precioPorDia ?? 0,
        "aria-labelledby": idTitulo,
      },
      crear("img", { clase: "producto__imagen", src: producto.imagen, alt: producto.alt, width: producto.ancho, height: producto.alto }),
      crear("h3", { clase: "producto__titulo", id: idTitulo, texto: producto.nombre }),
      datos,
      lineaPrecio,
      crear("p", { clase: `producto__estado producto__estado--${estado.tipo}`, texto: estado.texto }),
      crear(
        "div",
        { clase: "producto__acciones" },
        crear("button", {
          clase: "boton boton--secundario boton--chico",
          type: "button",
          "data-accion": "ver-ficha",
          "data-id": producto.id,
          "aria-haspopup": "dialog",
          "aria-controls": "ficha-producto",
          "aria-describedby": idTitulo,
          texto: "Ver ficha",
        }),
        crear("button", {
          clase: "boton boton--chico",
          type: "button",
          "data-accion": "agregar",
          "data-id": producto.id,
          "aria-describedby": idTitulo,
          disabled: !estado.puedeAgregar,
          texto: textoBoton,
        }),
      ),
    ),
  );
}

/**
 * Dibuja la lista. contexto: { fecha, reservas }
 * Actualiza también el resumen "Mostrando N productos" (región aria-live).
 */
export function dibujarLista(lista, resumen, productos, { fecha, reservas }) {
  const textoFecha = fecha ? fechaCorta(fecha) : "";

  if (productos.length === 0) {
    reemplazar(lista, crear("li", { clase: "productos__mensaje", texto: "No hay productos que coincidan con los filtros. Probá con otros o limpiá los filtros." }));
    resumen.textContent = "No hay productos con esos filtros";
    return;
  }

  reemplazar(lista, productos.map((p) => tarjeta(p, estadoDe(p, fecha, reservas, textoFecha))));
  resumen.textContent = `Mostrando ${productos.length} ${plural(productos.length, "producto", "productos")}`;
}

/** Mensaje cuando no se pueden cargar los datos. */
export function dibujarErrorDeCarga(lista, resumen) {
  const desdeArchivo = window.location.protocol === "file:";
  const texto = desdeArchivo
    ? "No se pudo cargar el catálogo: la página se abrió directamente desde un archivo. Abrila con un servidor local (por ejemplo, la extensión Live Server de VS Code). Los pasos están en el README."
    : "No pudimos cargar el catálogo. Probá de nuevo en unos minutos o escribinos desde la página de contacto.";
  reemplazar(lista, crear("li", { clase: "productos__mensaje productos__mensaje--error", role: "alert", texto }));
  resumen.textContent = "No se pudo cargar el catálogo";
}
