// Menú responsive. En pantallas angostas el botón "Menú" muestra y oculta la lista de enlaces.
// El CSS solo oculta el menú cuando JavaScript está activo (clase "js" en <html>),
// así que sin JavaScript el menú queda siempre visible.

import { $ } from "./dom.js";

export function iniciarMenu() {
  const boton = $(".menu-toggle");
  const menu = $(".menu");
  if (!boton || !menu) return;

  function alternar(abrir) {
    boton.setAttribute("aria-expanded", String(abrir));
    menu.classList.toggle("menu--abierto", abrir);
  }

  boton.addEventListener("click", () => {
    alternar(boton.getAttribute("aria-expanded") !== "true");
  });

  // Escape cierra el menú y devuelve el foco al botón
  document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape" && boton.getAttribute("aria-expanded") === "true") {
      alternar(false);
      boton.focus();
    }
  });

  // Al pasar a pantalla ancha el menú se muestra solo: se reinicia el estado del botón
  window.matchMedia("(min-width: 64rem)").addEventListener("change", () => alternar(false));
}
