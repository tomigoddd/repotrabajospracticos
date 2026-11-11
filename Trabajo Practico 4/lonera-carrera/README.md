# Lonera Carrera — SP4 (JavaScript)

Autor: Tomas Godoy · Aplicaciones Web I – Sistemas · Prof. Andrés Senn

## Cómo abrirlo

El sitio usa módulos de JavaScript (`import`) y `fetch` para leer los datos en JSON.
Los navegadores **no permiten ninguna de las dos cosas si la página se abre con doble clic** (`file://`),
así que hay que servirla desde un servidor local. Cualquiera de estas opciones sirve:

- **Visual Studio Code:** instalar la extensión *Live Server*, clic derecho sobre `index.html` → *Open with Live Server*.
- **Python:** desde esta carpeta, `python -m http.server 8000` y abrir <http://localhost:8000>.
- **Node:** desde esta carpeta, `npx serve`.

Si se abre sin servidor, la página muestra un aviso explicando esto.

## Estructura

```
lonera-carrera/
├── index.html · catalogo.html · contacto.html
├── css/        variables · base · layout · componentes · paginas
├── data/       productos.json · reservas.json   (simulan la API)
├── fonts/      Archivo (variable) + licencia OFL
├── img/        logo e ilustraciones SVG
└── js/
    ├── comun.js · catalogo.js · contacto.js     (un punto de entrada por página)
    ├── modulos/  api · almacen · carrito · filtros · disponibilidad · validacion
    │             pedidos · avisos · menu · dom · formato
    └── vistas/   lista-productos · pedido · ficha · confirmacion
```

## Qué hace

- **Catálogo desde JSON:** `fetch("data/productos.json")` y `fetch("data/reservas.json")`; las tarjetas se dibujan con JavaScript.
- **Filtros por eventos:** búsqueda, tipo, capacidad, precio y fecha del evento responden al escribir o cambiar.
- **Disponibilidad por fecha:** un castillo reservado ese día aparece como "No disponible" y no se puede agregar.
- **Pedido:** se guarda en `sessionStorage`, se ve en todas las páginas (contador en la cabecera) y se conserva al recargar.
- **Validación propia** de los formularios de pedido y de contacto, con mensajes junto a cada campo.
- **Envío simulado:** no hay servidor; al confirmar se genera un número (`LC-0001`…) y el pedido queda en `localStorage`.
- **Avisos** (toasts), ficha de producto en `<dialog>` y menú responsive con botón.
