// Funciones de formato y de texto. No tocan el DOM.

const formatoPrecio = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

/** 45000 -> "$ 45.000" */
export function precio(numero) {
  return formatoPrecio.format(numero);
}

/** "2026-12-12" -> "12/12/2026" */
export function fechaCorta(iso) {
  const [anio, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${anio}`;
}

/** Fecha de hoy en formato ISO (aaaa-mm-dd), en hora local. */
export function hoyISO() {
  const hoy = new Date();
  const mes = String(hoy.getMonth() + 1).padStart(2, "0");
  const dia = String(hoy.getDate()).padStart(2, "0");
  return `${hoy.getFullYear()}-${mes}-${dia}`;
}

/** Minúsculas y sin tildes, para comparar textos al buscar. */
export function normalizar(texto) {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

export function plural(cantidad, singular, pluralTexto) {
  return cantidad === 1 ? singular : pluralTexto;
}
