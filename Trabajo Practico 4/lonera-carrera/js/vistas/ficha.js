// Ficha del producto: ventana modal <dialog>. El navegador se encarga de atrapar el foco
// adentro, cerrar con Escape y devolver el foco al botón que la abrió.

import { $, crear, reemplazar } from "../modulos/dom.js";
import { precio } from "../modulos/formato.js";

const ficha = () => $("#ficha-producto");

/**
 * Abre la ficha con los datos de un producto.
 * estado: el estado de disponibilidad (ver disponibilidad.js).
 * alAgregar: función que se llama al apretar "Agregar al pedido" dentro de la ficha.
 */
export function abrirFicha(producto, estado, alAgregar) {
  const dialogo = ficha();

  const imagen = $("#ficha-imagen");
  imagen.src = producto.imagen;
  imagen.alt = producto.alt;
  imagen.width = producto.ancho;
  imagen.height = producto.alto;

  $("#ficha-titulo").textContent = producto.nombre;
  $("#ficha-descripcion").textContent = producto.descripcion;

  const filas = producto.detalles.flatMap((d) => [crear("dt", { texto: d.etiqueta }), crear("dd", { texto: d.valor })]);
  filas.push(
    crear("dt", { texto: "Precio" }),
    crear(
      "dd",
      {},
      producto.precioPorDia === null
        ? "A cotizar"
        : [crear("data", { value: producto.precioPorDia, texto: precio(producto.precioPorDia) }), " por día"],
    ),
    crear("dt", { texto: "Disponibilidad" }),
    crear("dd", { texto: estado.texto }),
  );
  reemplazar($("#ficha-datos"), filas);

  const boton = $("#ficha-agregar");
  boton.textContent = producto.accion === "presupuesto" ? "Pedir presupuesto" : "Agregar al pedido";
  boton.disabled = !estado.puedeAgregar;
  boton.onclick = () => {
    dialogo.close();
    alAgregar(producto);
  };

  dialogo.showModal();
}

export function iniciarFicha() {
  const dialogo = ficha();
  // Un clic sobre el fondo oscuro (el propio <dialog>, fuera de su contenido) cierra la ventana
  dialogo.addEventListener("click", (evento) => {
    if (evento.target === dialogo) dialogo.close();
  });
}
