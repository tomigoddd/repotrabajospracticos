// Lectura y escritura en el almacenamiento del navegador.
// Se usa sessionStorage para lo que dura la visita (el pedido en curso) y
// localStorage para lo que debe quedar (pedidos enviados, reservas, contador).
// Todo va dentro de try/catch: el almacenamiento puede estar bloqueado (modo privado, por ejemplo)
// y en ese caso el sitio sigue funcionando, pero sin recordar los datos.

function acceso(tipo) {
  try {
    return window[tipo];
  } catch {
    return null;
  }
}

/** tipo: "sessionStorage" o "localStorage" */
export function leer(tipo, clave, valorPorDefecto) {
  try {
    const texto = acceso(tipo)?.getItem(clave);
    return texto === null || texto === undefined ? valorPorDefecto : JSON.parse(texto);
  } catch {
    return valorPorDefecto;
  }
}

export function guardar(tipo, clave, valor) {
  try {
    acceso(tipo)?.setItem(clave, JSON.stringify(valor));
    return true;
  } catch {
    return false;
  }
}
