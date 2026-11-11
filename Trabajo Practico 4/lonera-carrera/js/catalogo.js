// Página del catálogo: carga los datos, aplica filtros, maneja el pedido y envía el formulario.
// Cada pieza vive en su módulo (carpetas js/modulos y js/vistas); este archivo las conecta.

import "./comun.js";
import { $ } from "./modulos/dom.js";
import { cargarCatalogo } from "./modulos/api.js";
import { leerFiltros, filtrar } from "./modulos/filtros.js";
import { estadoDe, estaLibre } from "./modulos/disponibilidad.js";
import { fechaCorta, hoyISO } from "./modulos/formato.js";
import { avisar } from "./modulos/avisos.js";
import * as carrito from "./modulos/carrito.js";
import { enviarPedido, reservasLocales } from "./modulos/pedidos.js";
import { reglas, validarFormulario, activarValidacionEnVivo, limpiarErrores } from "./modulos/validacion.js";
import { dibujarLista, dibujarErrorDeCarga } from "./vistas/lista-productos.js";
import { iniciarPedido } from "./vistas/pedido.js";
import { abrirFicha, iniciarFicha } from "./vistas/ficha.js";
import { mostrarConfirmacion } from "./vistas/confirmacion.js";

const formFiltros = $("#filtros");
const lista = $("#lista-productos");
const resumen = $("#resumen-resultados");
const campoFecha = $("#fecha-evento");
const formPedido = $("#form-pedido");

let productos = [];
let reservasDelArchivo = [];

// Reservas del archivo JSON + las que se hicieron desde este navegador
const reservas = () => [...reservasDelArchivo, ...reservasLocales()];

// --- Filtros y lista -------------------------------------------------------

function mostrarProductos() {
  const filtros = leerFiltros(formFiltros);
  dibujarLista(lista, resumen, filtrar(productos, filtros), { fecha: filtros.fecha, reservas: reservas() });
}

function aplicarFiltrosDeLaURL() {
  // Los enlaces del inicio llevan catalogo.html?tipo=castillos o ?tipo=loneria
  const tipo = new URLSearchParams(window.location.search).get("tipo");
  const radio = tipo && formFiltros.querySelector(`input[name="tipo"][value="${CSS.escape(tipo)}"]`);
  if (radio) radio.checked = true;
}

// --- Agregar al pedido -----------------------------------------------------

function agregarAlPedido(producto) {
  const fecha = campoFecha.value;

  if (producto.accion === "alquiler") {
    if (!fecha || fecha < hoyISO()) {
      avisar("Elegí la fecha del evento (desde hoy en adelante) para reservar el castillo.", "error");
      campoFecha.focus();
      return;
    }
    if (!estaLibre(reservas(), producto.id, fecha)) {
      avisar(`${producto.nombre} no está disponible el ${fechaCorta(fecha)}.`, "error");
      return;
    }
  }

  const resultado = carrito.agregar(producto, fecha);
  if (resultado.ok) avisar(`${producto.nombre} agregado al pedido.`, "ok");
  else avisar(`${producto.nombre} ya está en tu pedido.`);
}

function alHacerClicEnLaLista(evento) {
  const boton = evento.target.closest("button[data-accion]");
  if (!boton) return;
  const producto = productos.find((p) => p.id === boton.dataset.id);
  if (!producto) return;

  if (boton.dataset.accion === "agregar") {
    agregarAlPedido(producto);
  } else if (boton.dataset.accion === "ver-ficha") {
    const fecha = campoFecha.value;
    const estado = estadoDe(producto, fecha, reservas(), fecha ? fechaCorta(fecha) : "");
    abrirFicha(producto, estado, agregarAlPedido);
  }
}

// --- Datos y envío del pedido ---------------------------------------------

const hayEnvio = (formulario) => formulario.elements.entrega.value === "envio";

const esquemaPedido = {
  nombre: [reglas.requerido("Ingresá tu nombre y apellido."), reglas.nombreCompleto],
  telefono: [reglas.requerido("Ingresá tu teléfono."), reglas.telefono],
  email: [reglas.requerido("Ingresá tu correo electrónico."), reglas.correo],
  direccion: [reglas.si(hayEnvio, reglas.requerido("Ingresá la dirección de entrega."))],
};

async function alEnviarPedido(evento) {
  evento.preventDefault();

  const { valido, primerInvalido } = validarFormulario(formPedido, esquemaPedido);
  if (!valido) {
    avisar("Revisá los campos marcados antes de confirmar el pedido.", "error");
    primerInvalido.focus();
    return;
  }

  const items = carrito.obtener();
  if (items.length === 0) {
    avisar("Tu pedido está vacío. Agregá al menos un producto.", "error");
    return;
  }

  // Se vuelve a controlar la disponibilidad: otra reserva pudo ocupar la fecha mientras tanto
  const ocupado = items.find((i) => i.accion === "alquiler" && !estaLibre(reservas(), i.id, i.fecha));
  if (ocupado) {
    avisar(`${ocupado.nombre} ya no está disponible el ${fechaCorta(ocupado.fecha)}. Quitalo del pedido o elegí otra fecha.`, "error");
    return;
  }

  const boton = formPedido.querySelector("button[type='submit']");
  const textoOriginal = boton.textContent;
  boton.disabled = true;
  boton.setAttribute("aria-busy", "true");
  boton.textContent = "Enviando…";

  try {
    const datos = new FormData(formPedido);
    const pedido = await enviarPedido({
      cliente: {
        nombre: String(datos.get("nombre")).trim(),
        telefono: String(datos.get("telefono")).trim(),
        email: String(datos.get("email")).trim(),
      },
      entrega: { tipo: String(datos.get("entrega")), direccion: String(datos.get("direccion")).trim() },
      observaciones: String(datos.get("observaciones")).trim(),
      items,
      subtotal: carrito.subtotal(),
    });

    carrito.vaciar();
    formPedido.reset();
    limpiarErrores(formPedido);
    mostrarProductos(); // los castillos reservados pasan a mostrarse como no disponibles
    mostrarConfirmacion(pedido);
  } catch (error) {
    console.error(error);
    avisar("No pudimos enviar el pedido. Probá de nuevo.", "error");
  } finally {
    boton.disabled = false;
    boton.removeAttribute("aria-busy");
    boton.textContent = textoOriginal;
  }
}

// --- Inicio ------------------------------------------------------------------

async function iniciar() {
  campoFecha.min = hoyISO();
  iniciarPedido();
  iniciarFicha();

  formPedido.addEventListener("submit", alEnviarPedido);
  activarValidacionEnVivo(formPedido, esquemaPedido);
  // Al cambiar a "Retiro" ya no hace falta la dirección: se borra su error
  formPedido.addEventListener("change", (evento) => {
    if (evento.target.name === "entrega") {
      const direccion = formPedido.elements.direccion;
      if (!hayEnvio(formPedido)) {
        direccion.removeAttribute("aria-invalid");
        document.getElementById("pedido-direccion-error")?.remove();
      }
    }
  });

  try {
    ({ productos, reservas: reservasDelArchivo } = await cargarCatalogo());
  } catch (error) {
    console.error(error);
    dibujarErrorDeCarga(lista, resumen);
    return;
  } finally {
    lista.removeAttribute("aria-busy");
  }

  aplicarFiltrosDeLaURL();
  mostrarProductos();

  // "input" se dispara al escribir y al cambiar selects, radios y fecha: los filtros responden al instante
  formFiltros.addEventListener("input", mostrarProductos);
  formFiltros.addEventListener("submit", (evento) => {
    evento.preventDefault();
    mostrarProductos();
  });
  // Cuando se dispara "reset" el formulario todavía no se vació: se espera un instante
  formFiltros.addEventListener("reset", () => setTimeout(mostrarProductos, 0));
  lista.addEventListener("click", alHacerClicEnLaLista);
}

iniciar();
