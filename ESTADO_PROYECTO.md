# Estado del proyecto

## Descripción

Sistema web de gestión de biblioteca UNIVO desarrollado con HTML5, CSS3 y TypeScript nativo. Permite agregar libros, buscar, filtrar por categoría, disponibilidad o favoritos, ordenar el catálogo, prestar, devolver y guardar los cambios en `localStorage`.

## Instalación y ejecución

Requisitos: Node.js y npm.

```powershell
cd C:\Users\Oscar1029\Desktop\Parcial-POE
npm install
npx tsc
```

Después de compilar, abre [index.html](index.html) en un navegador moderno. El comando `npx tsc` genera el `app.js` que utiliza la página.

## Archivos principales

- [index.html](index.html): estructura y controles de la interfaz.
- [app.ts](app.ts): modelos, eventos, préstamos, favoritos, filtros y persistencia.
- [style.css](style.css): diseño visual, estados de botones y adaptación responsive.

## Funcionalidades actuales

- Búsqueda por título o autor.
- Filtros combinados por categoría, disponibilidad y favoritos.
- Orden por título o autor.
- Botón para limpiar todos los filtros.
- Botones de prestar, devolver y marcar favoritos.
- Estado `Sin Stock` para libros sin ejemplares.
- Devoluciones limitadas por `ejemplaresTotales`.
- Persistencia local mediante `localStorage`.

## Captura de prueba

![Vista actual del Sistema de Biblioteca UNIVO](Screenshot%202026-08-19%20115526.png)

Captura conservada: `Screenshot 2026-08-19 115526.png`.