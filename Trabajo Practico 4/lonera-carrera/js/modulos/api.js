// Acceso a los datos. Los archivos JSON de la carpeta data/ simulan una API REST:
//   GET data/productos.json  -> { productos: [...] }
//   GET data/reservas.json   -> { reservas: [{ productoId, fecha }] }
// Si más adelante hay una API real, solo cambian las dos URL de este archivo.

const URL_PRODUCTOS = "data/productos.json";
const URL_RESERVAS = "data/reservas.json";

async function pedirJSON(url) {
  const respuesta = await fetch(url);
  if (!respuesta.ok) {
    throw new Error(`No se pudo leer ${url} (HTTP ${respuesta.status})`);
  }
  return respuesta.json();
}

/** Trae productos y reservas en paralelo. */
export async function cargarCatalogo() {
  const [datosProductos, datosReservas] = await Promise.all([
    pedirJSON(URL_PRODUCTOS),
    pedirJSON(URL_RESERVAS),
  ]);
  return {
    productos: datosProductos.productos,
    reservas: datosReservas.reservas,
  };
}
