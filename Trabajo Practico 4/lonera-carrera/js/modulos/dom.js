// Ayudas para buscar y crear elementos. Los datos se escriben siempre como texto
// (textContent), nunca como HTML, para que un dato del JSON no pueda inyectar código.

export const $ = (selector, raiz = document) => raiz.querySelector(selector);
export const $$ = (selector, raiz = document) => [...raiz.querySelectorAll(selector)];

/**
 * crear("p", { clase: "aviso", texto: "Hola" }, hijo1, hijo2)
 * - clase  -> className
 * - texto  -> textContent
 * - el resto se asigna como propiedad si existe (type, id, disabled...) o como atributo (aria-*, data-*).
 * - los valores false/null/undefined se ignoran, así se pueden poner condiciones en línea.
 */
export function crear(etiqueta, atributos = {}, ...hijos) {
  const elemento = document.createElement(etiqueta);
  for (const [nombre, valor] of Object.entries(atributos)) {
    if (valor === false || valor === null || valor === undefined) continue;
    if (nombre === "clase") elemento.className = valor;
    else if (nombre === "texto") elemento.textContent = valor;
    else if (nombre in elemento && !nombre.includes("-")) elemento[nombre] = valor;
    else elemento.setAttribute(nombre, valor === true ? "" : valor);
  }
  elemento.append(...hijos.flat().filter((h) => h !== null && h !== undefined && h !== false));
  return elemento;
}

/** Vacía un contenedor y le pone los hijos nuevos. */
export function reemplazar(contenedor, ...hijos) {
  contenedor.replaceChildren(...hijos.flat().filter(Boolean));
}
