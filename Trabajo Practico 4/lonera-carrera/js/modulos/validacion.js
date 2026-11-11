// Validación de formularios. Los formularios llevan el atributo novalidate para que
// los mensajes los controle este módulo (en español y junto a cada campo), no el navegador.
//
// Un "esquema" dice qué reglas tiene cada campo, por nombre:
//   { nombre: [reglas.requerido(), reglas.nombreCompleto], email: [reglas.email] }
// Una regla es una función (valor, formulario) que devuelve un mensaje de error o null.
// Se revisan en orden y se muestra solo el primer error de cada campo.

import { crear } from "./dom.js";
import { hoyISO } from "./formato.js";

const LETRAS_Y_ESPACIOS = /^\p{L}[\p{L}'.-]*(\s+\p{L}[\p{L}'.-]*)+$/u;
const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const reglas = {
  requerido: (mensaje = "Completá este campo.") => (valor) => (valor.trim() ? null : mensaje),

  largoMinimo: (cantidad, mensaje) => (valor) =>
    valor.trim().length >= cantidad ? null : mensaje,

  nombreCompleto: (valor) =>
    LETRAS_Y_ESPACIOS.test(valor.trim())
      ? null
      : "Ingresá tu nombre y apellido, solo con letras.",

  // Acepta que se escriba con espacios, guiones, paréntesis o + y cuenta solo los números
  telefono: (valor) =>
    /^\d{8,13}$/.test(valor.replace(/[\s\-()+]/g, ""))
      ? null
      : "Ingresá un teléfono de 8 a 13 números, con código de área.",

  correo: (valor) =>
    CORREO.test(valor.trim()) ? null : "Ingresá un correo válido, por ejemplo nombre@correo.com.",

  // La fecha es opcional: si está vacía no se controla
  fechaDesdeHoy: (valor) =>
    !valor || valor >= hoyISO() ? null : "Elegí una fecha desde hoy en adelante.",

  /** Aplica una regla solo si se cumple la condición (recibe el formulario). */
  si: (condicion, regla) => (valor, formulario) =>
    condicion(formulario) ? regla(valor, formulario) : null,
};

function primerError(listaDeReglas, valor, formulario) {
  for (const regla of listaDeReglas) {
    const mensaje = regla(valor, formulario);
    if (mensaje) return mensaje;
  }
  return null;
}

// --- Mostrar y borrar errores (con atributos ARIA) -------------------------

function marcar(campo, mensaje) {
  const idError = `${campo.id}-error`;
  let parrafo = document.getElementById(idError);
  if (!parrafo) {
    parrafo = crear("p", { id: idError, clase: "campo__error" });
    (campo.closest(".campo") ?? campo.parentElement).append(parrafo);
  }
  parrafo.textContent = mensaje;

  // Se guarda la ayuda original (aria-describedby) para poder restaurarla al corregir el error
  if (campo.dataset.ayudaOriginal === undefined) {
    campo.dataset.ayudaOriginal = campo.getAttribute("aria-describedby") ?? "";
  }
  campo.setAttribute("aria-invalid", "true");
  campo.setAttribute("aria-describedby", `${campo.dataset.ayudaOriginal} ${idError}`.trim());
}

function limpiar(campo) {
  document.getElementById(`${campo.id}-error`)?.remove();
  campo.removeAttribute("aria-invalid");
  if (campo.dataset.ayudaOriginal !== undefined) {
    if (campo.dataset.ayudaOriginal) campo.setAttribute("aria-describedby", campo.dataset.ayudaOriginal);
    else campo.removeAttribute("aria-describedby");
  }
}

// --- API del módulo ---------------------------------------------------------

/** Valida un solo campo. Devuelve true si está bien. */
export function validarCampo(formulario, esquema, campo) {
  const lista = esquema[campo.name];
  if (!lista) return true;
  const mensaje = primerError(lista, campo.value, formulario);
  if (mensaje) marcar(campo, mensaje);
  else limpiar(campo);
  return !mensaje;
}

/** Valida todo el formulario. Devuelve { valido, primerInvalido } para poder mandar el foco. */
export function validarFormulario(formulario, esquema) {
  let primerInvalido = null;
  for (const nombre of Object.keys(esquema)) {
    const campo = formulario.elements[nombre];
    if (!campo) continue;
    if (!validarCampo(formulario, esquema, campo)) primerInvalido ??= campo;
  }
  return { valido: primerInvalido === null, primerInvalido };
}

/** Quita todos los errores (por ejemplo, después de enviar o de reiniciar el formulario). */
export function limpiarErrores(formulario) {
  for (const campo of formulario.querySelectorAll("[aria-invalid]")) limpiar(campo);
}

/**
 * Valida cada campo al salir de él, y vuelve a validarlo mientras se escribe
 * si ya tenía un error (así el mensaje desaparece apenas se corrige).
 */
export function activarValidacionEnVivo(formulario, esquema) {
  formulario.addEventListener("focusout", (evento) => {
    if (evento.target.name in esquema) validarCampo(formulario, esquema, evento.target);
  });
  formulario.addEventListener("input", (evento) => {
    if (evento.target.name in esquema && evento.target.hasAttribute("aria-invalid")) {
      validarCampo(formulario, esquema, evento.target);
    }
  });
}
