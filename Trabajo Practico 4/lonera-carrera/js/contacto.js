// Página de contacto: valida el formulario y simula el envío de la consulta.

import "./comun.js";
import { $ } from "./modulos/dom.js";
import { hoyISO } from "./modulos/formato.js";
import { avisar } from "./modulos/avisos.js";
import { enviarConsulta } from "./modulos/pedidos.js";
import { reglas, validarFormulario, activarValidacionEnVivo, limpiarErrores } from "./modulos/validacion.js";

const formulario = $("#form-contacto");

const esquema = {
  nombre: [reglas.requerido("Ingresá tu nombre y apellido."), reglas.nombreCompleto],
  telefono: [reglas.requerido("Ingresá tu teléfono."), reglas.telefono],
  email: [reglas.requerido("Ingresá tu correo electrónico."), reglas.correo],
  motivo: [reglas.requerido("Elegí el motivo de la consulta.")],
  fecha: [reglas.fechaDesdeHoy],
  mensaje: [
    reglas.requerido("Escribí tu mensaje."),
    reglas.largoMinimo(10, "El mensaje es muy corto: contanos un poco más (mínimo 10 letras)."),
  ],
};

async function alEnviar(evento) {
  evento.preventDefault();

  const { valido, primerInvalido } = validarFormulario(formulario, esquema);
  if (!valido) {
    avisar("Revisá los campos marcados antes de enviar.", "error");
    primerInvalido.focus();
    return;
  }

  const boton = formulario.querySelector("button[type='submit']");
  const textoOriginal = boton.textContent;
  boton.disabled = true;
  boton.setAttribute("aria-busy", "true");
  boton.textContent = "Enviando…";

  try {
    await enviarConsulta();
    formulario.reset();
    limpiarErrores(formulario);
    avisar("Recibimos tu consulta. Te vamos a responder a la brevedad.", "ok");
  } catch (error) {
    console.error(error);
    avisar("No pudimos enviar la consulta. Probá de nuevo.", "error");
  } finally {
    boton.disabled = false;
    boton.removeAttribute("aria-busy");
    boton.textContent = textoOriginal;
  }
}

$("#fecha").min = hoyISO();
formulario.addEventListener("submit", alEnviar);
activarValidacionEnVivo(formulario, esquema);
