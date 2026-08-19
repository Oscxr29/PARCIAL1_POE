# Estado completo del proyecto

## 1. Identificación

- **Proyecto:** Sistema de Gestión de Biblioteca UNIVO
- **Tipo:** Aplicación web estática para gestión de préstamos
- **Ubicación:** `Parcial-POE`
- **Idioma de la interfaz:** Español
- **Arquitectura:** TypeScript + HTML + CSS, sin frameworks
- **Patrón principal:** Programación Orientada a Eventos mediante un `EventEmitter` personalizado
- **Persistencia:** `localStorage` mediante la clave `univo_biblioteca_libros`.

## 2. Objetivo actual

La aplicación permite administrar un catálogo de libros de una biblioteca central. El usuario puede agregar libros, consultar el catálogo, buscar, filtrar, ordenar, prestar, devolver y marcar libros como favoritos.

Cada cambio importante del estado de un libro genera un evento. Ese evento puede actualizar la interfaz y producir un mensaje en la consola.

## 3. Estructura actual de archivos

```text
Parcial-POE/
├── app.ts
├── app.js
├── index.html
├── style.css
├── tsconfig.json
├── package.json
├── package-lock.json
├── RESUMEN_CAMBIOS.md
├── ESTADO_PROYECTO.md
└── node_modules/
```

### Archivos principales

| Archivo | Función |
|---|---|
| `app.ts` | Código fuente TypeScript, modelos, lógica de negocio, eventos y control de interfaz |
| `app.js` | JavaScript generado por TypeScript y cargado por el navegador |
| `index.html` | Estructura semántica de la aplicación |
| `style.css` | Diseño visual, componentes, estados y responsive design |
| `tsconfig.json` | Configuración del compilador TypeScript |
| `package.json` | Configuración del proyecto y dependencia de TypeScript |
| `package-lock.json` | Versiones bloqueadas de dependencias |
| `RESUMEN_CAMBIOS.md` | Resumen anterior de cambios |
| `ESTADO_PROYECTO.md` | Documento técnico actual para revisión externa |

## 4. Tecnologías

- HTML5
- CSS3
- TypeScript 7.x
- JavaScript compatible con ES2020
- APIs nativas del navegador:
  - DOM
  - `document.addEventListener`
  - `HTMLElement.dataset`
  - `Element.closest`
  - `setTimeout`
  - `console.log` y `console.warn`
- No se utiliza React, Vue, Angular, Bootstrap ni otra librería de interfaz.

## 5. Configuración TypeScript actual

El archivo `tsconfig.json` está configurado para código nativo de navegador:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["app.ts"]
}
```

### Decisiones relevantes

- Se eliminó `module: "nodenext"`, porque el proyecto no es Node.js.
- Se eliminó `jsx`, ya que no existe React ni JSX.
- Se eliminaron opciones de declaraciones y mapas de declaraciones porque no son necesarios para esta aplicación.
- Se eliminó `moduleResolution: "node"` porque TypeScript 7 reporta esa opción como obsoleta.
- No se utiliza `outDir`; por eso `npx tsc` genera `app.js` junto a `app.ts`.
- `index.html` carga directamente el archivo generado con:

```html
<script src="app.js" defer></script>
```

## 6. Modelo de datos

El tipo de categoría permitido es:

```typescript
type CategoriaLibro =
  | "CIENCIA"
  | "LITERATURA"
  | "HISTORIA"
  | "TECNOLOGIA"
  | "ARTE";
```

La interfaz `Libro` contiene:

```typescript
interface Libro {
  id: number;
  titulo: string;
  autor: string;
  categoria: CategoriaLibro;
  anio: number;
  disponible: boolean;
  ejemplares: number;
  esFavorito: boolean;
}
```

## 7. Arquitectura de `app.ts`

### 7.1 `EventEmitter`

Implementación ligera de un emisor de eventos para navegador.

Métodos disponibles:

- `on(event, listener)`: registra un listener.
- `emit(event, ...args)`: ejecuta los listeners registrados.

El proyecto no depende del `EventEmitter` de Node.js.

### 7.2 `Biblioteca`

Clase principal de negocio. Extiende `EventEmitter` y mantiene internamente el arreglo de libros.

Métodos actuales:

- `getLibros()`
- `agregarLibro(libroData)`
- `solicitarPrestamo(id)`
- `devolverLibro(id)`
- `toggleFavorito(id)`
- `cargarDesdeStorage()`
- Sincronización automática después de cambios de colección.

### 7.3 `NotificadorBiblioteca`

Servicio que escribe eventos relevantes en la consola:

- Libro agregado.
- Préstamo exitoso.
- Libro no disponible.
- Devolución exitosa.

### 7.4 `GestorUIBiblioteca`

Responsable de:

- Renderizar las tarjetas de libros.
- Mostrar el estado de disponibilidad.
- Actualizar contadores.
- Mostrar notificaciones tipo toast.
- Mostrar el estado vacío cuando no hay resultados.

### 7.5 Objeto `app`

Controlador principal que mantiene el estado de filtros:

```typescript
{
  categoria: string;
  orden: string;
  soloDisponibles: boolean;
  busqueda: string;
}
```

También conecta los controles del HTML con la lógica de negocio.

## 8. Eventos actuales

| Evento | Cuándo ocurre | Efectos actuales |
|---|---|---|
| `libroAgregado` | Se registra un nuevo libro | Consola, toast y actualización del catálogo |
| `prestamoExitoso` | Se presta un ejemplar disponible | Consola, toast y actualización del catálogo |
| `noDisponible` | Se intenta prestar un libro agotado | Advertencia en consola y toast de error |
| `devolucionExitosa` | Se devuelve un libro | Consola, toast y actualización del catálogo |
| `favoritoCambiado` | Se activa o desactiva favorito | Toast y actualización del catálogo |

## 9. Funcionalidades de usuario

### Catálogo inicial

Al iniciar se cargan doce libros de prueba cuando no hay una colección válida guardada:

| Título | Autor | Categoría | Año | Ejemplares iniciales |
|---|---|---:|---:|---:|
| El Principito | Antoine de Saint-Exupéry | LITERATURA | 1943 | 5 |
| Cien años de soledad | Gabriel García Márquez | LITERATURA | 1967 | 3 |
| Fahrenheit 451 | Ray Bradbury | LITERATURA | 1953 | 0 |
| Breve historia del tiempo | Stephen Hawking | CIENCIA | 1988 | 2 |
| Cosmos | Carl Sagan | CIENCIA | 1980 | 4 |
| El arte de la guerra | Sun Tzu | HISTORIA | 500 | 4 |
| Sapiens | Yuval Noah Harari | HISTORIA | 2011 | 3 |
| Clean Code | Robert C. Martin | TECNOLOGIA | 2008 | 6 |
| The Pragmatic Programmer | Andrew Hunt | TECNOLOGIA | 1999 | 2 |
| Refactoring | Martin Fowler | TECNOLOGIA | 1999 | 1 |
| Historia del arte | Ernst Gombrich | ARTE | 1950 | 2 |
| Ways of Seeing | John Berger | ARTE | 1972 | 3 |

### Agregar libros

El formulario permite introducir:

- Título.
- Autor.
- Categoría.
- Número de ejemplares.
- Año de publicación.

Al guardar, el sistema genera automáticamente:

- `id` incremental.
- `disponible`, según el número de ejemplares.
- `esFavorito: false`.

### Préstamos

- Reduce los ejemplares en uno.
- Cambia `disponible` a `false` cuando llega a cero.
- Emite `prestamoExitoso` si hay ejemplares.
- Emite `noDisponible` si el libro está agotado.

### Devoluciones

- Aumenta los ejemplares en uno.
- Marca el libro como disponible.
- Emite `devolucionExitosa`.

### Favoritos

- Alterna `esFavorito` entre `true` y `false`.
- Cambia visualmente el botón mediante la clase `active`.
- Emite `favoritoCambiado`.

### Búsqueda, filtro y orden

- Búsqueda por título o autor.
- Filtro por categoría.
- Filtro de solo disponibles.
- Orden por título A-Z.
- Orden por autor A-Z.
- Orden original.
- Mensaje cuando no existen resultados.

## 10. Delegación de eventos

Las tarjetas de libros no dependen de varios `onclick` inline.

El contenedor `#contenedor-libros` escucha un único evento `click` y detecta:

```html
<button data-action="prestar">
<button data-action="devolver">
<button data-action="favorito">
```

El identificador del libro se obtiene mediante:

```html
<div data-book-id="..."></div>
```

Esto reduce la repetición y mantiene las acciones centralizadas en `app.ts`.

## 11. Estructura HTML actual

La interfaz se divide en:

### Barra lateral

- Marca de Biblioteca UNIVO.
- Contadores globales.
- Formulario de nuevo libro.
- Selectores de categoría y orden.
- Botón para mostrar solo disponibles.

### Área principal

- Contenedor de notificaciones.
- Encabezado del catálogo.
- Campo de búsqueda.
- Contenedor dinámico de tarjetas.

Referencias importantes:

```html
<link rel="stylesheet" href="style.css">
<script src="app.js" defer></script>
```

## 12. Accesibilidad actual

Se han añadido etiquetas accesibles a los controles que no tienen texto visible asociado directamente:

- `aria-label="Título del libro"`
- `aria-label="Autor"`
- `aria-label="Categoría del libro"`
- `aria-label="Filtrar por categoría"`
- `aria-label="Ordenar catálogo"`
- `aria-label="Buscar título o autor"`
- El icono visual de búsqueda utiliza `aria-hidden="true"`.
- El botón de favoritos recibe un `aria-label` dinámico según su estado.
- Los botones deshabilitados reflejan visualmente el agotamiento del libro.

## 13. Diseño visual actual

El diseño utiliza una interfaz oscura y moderna con:

- Fondo carbón.
- Panel lateral oscuro.
- Tarjetas de libros con fondo degradado sutil.
- Cyber Lime (`#a3e635`) para acciones principales, éxito y disponibilidad.
- Tech Cyan (`#38bdf8`) para filtros activos, etiquetas y estados informativos.
- Coral Soft (`#f87171`) exclusivamente para errores y libros agotados.
- Variables CSS centralizadas en `:root`.
- Tipografías externas `Space Grotesk` y `DM Mono` mediante Google Fonts.
- Grid responsive con `repeat(auto-fill, minmax(280px, 1fr))`.
- Adaptación móvil mediante `@media (max-width: 760px)`.
- Animación de entrada para los toast.
- Efecto hover en tarjetas y botones.

## 14. Dependencias

### Dependencia instalada

```json
"devDependencies": {
  "typescript": "^7.0.2"
}
```

### Dependencia externa no instalada por npm

`style.css` importa fuentes desde Google Fonts:

```css
@import url('https://fonts.googleapis.com/...');
```

Si la aplicación se ejecuta sin conexión, el navegador utilizará la fuente alternativa definida en CSS.

## 15. Scripts disponibles

Actualmente `package.json` solo contiene un script de prueba placeholder:

```json
"test": "echo \"Error: no test specified\" && exit 1"
```

Por el momento se utilizan directamente estos comandos:

```powershell
npx tsc --noEmit
npx tsc
```

## 16. Validaciones realizadas

Validaciones ejecutadas correctamente:

```text
npx tsc --noEmit
npx tsc
```

Resultados:

- No hay errores de tipado en `app.ts`.
- La configuración `tsconfig.json` es válida para el compilador actual.
- Se genera `app.js` correctamente.
- `index.html` referencia `style.css`.
- `index.html` referencia `app.js`.
- Los controles principales tienen atributos de accesibilidad.
- No se detectaron errores en `tsconfig.json`, `index.html` ni `app.ts` mediante el diagnóstico del editor.
- La colección se carga desde `localStorage` cuando existe y es válida.
- Los datos de usuario visibles en tarjetas pasan por `escapeHTML` antes de usar `innerHTML`.
- No se expone `app` en `window`; las acciones usan delegación de eventos.
- Los tipos de orden, filtro de categoría y acciones de tarjeta son uniones estrictas.

## 17. Puntos pendientes para una auditoría externa

Estos puntos no necesariamente son errores, pero conviene que otra IA los revise:

1. **Pruebas automatizadas:** no existen tests unitarios ni de integración.
2. **Persistencia avanzada:** existe persistencia local, pero no sincronización con backend ni cuentas de usuario.
3. **Seguridad del renderizado:** `titulo`, `autor` y `categoria` se escapan antes de usar `innerHTML`. Conviene valorar creación de nodos DOM si se desea eliminar por completo el uso de plantillas HTML.
4. **Tipado de eventos:** `Listener` utiliza `any[]`; puede reemplazarse por un mapa de eventos tipado.
5. **Tipado del emisor:** `Listener` todavía utiliza `any[]`; puede reemplazarse por un mapa de eventos tipado.
6. **Validación de formulario:** `parseInt` no comprueba explícitamente valores `NaN`, aunque los campos HTML son obligatorios y tienen restricciones básicas.
7. **Devoluciones:** actualmente es posible devolver ejemplares sin registrar quién realizó el préstamo ni validar un historial de préstamos.
8. **Validación de almacenamiento:** los datos corruptos se rechazan, pero podría mostrarse una notificación específica al usuario cuando `localStorage` no esté disponible.
9. **Accesibilidad avanzada:** conviene probar navegación completa con teclado, lectores de pantalla, contraste y foco visible.
10. **Responsive visual:** conviene verificar la interfaz en móvil, tablet y escritorio mediante un navegador real.
11. **Dependencia de fuentes:** Google Fonts depende de conexión externa; podría utilizarse una fuente local si se exige funcionamiento completamente offline.
12. **Scripts de proyecto:** sería conveniente añadir un script `build` y reemplazar el script `test` placeholder.
13. **Archivo generado:** `app.js` es un producto compilado; la fuente editable principal es `app.ts`. Después de cambiar `app.ts`, debe ejecutarse `npx tsc`.

## 18. Prompt sugerido para una IA externa

Puedes utilizar el siguiente texto junto con este documento:

> Actúa como auditor Senior Frontend y TypeScript. Revisa el estado descrito en `ESTADO_PROYECTO.md` y contrástalo con los archivos del proyecto. Verifica compilación, tipado, accesibilidad, seguridad del renderizado, flujo de eventos, comportamiento de préstamos y devoluciones, filtros, búsqueda, responsive design y coherencia entre `app.ts` y `app.js`. Clasifica los hallazgos por severidad: crítico, alto, medio o bajo. No propongas cambios cosméticos si antes existe un problema funcional o de seguridad. Indica archivo, causa, impacto, solución recomendada y pruebas necesarias.

## 19. Estado resumido

El proyecto funciona actualmente como una aplicación de biblioteca con persistencia local, compilada desde TypeScript a JavaScript y ejecutada directamente en el navegador. La funcionalidad principal está implementada y la compilación no presenta errores conocidos.

Las áreas que más conviene revisar antes de continuar son:

- Pruebas automatizadas.
- Persistencia remota y gestión de usuarios.
- Tipado más estricto del emisor de eventos.
- Accesibilidad con teclado y lector de pantalla.
- Eliminación de código global innecesario.

## 20. Guía de instalación y ejecución

### Requisitos

- Node.js y npm instalados.
- Navegador moderno con soporte para ES2020 y `localStorage`.

### Instalación

```powershell
cd C:\Users\Oscar1029\Desktop\Parcial-POE
npm install
```

### Compilación

```powershell
npx tsc
```

Este comando genera o actualiza `app.js`, que es cargado por `index.html`.

Para validar sin generar archivos:

```powershell
npx tsc --noEmit
```

### Ejecución

Se puede abrir `index.html` directamente en un navegador. También se puede usar un servidor local:

```powershell
npx serve .
```

Luego se abre la URL indicada por la terminal, normalmente `http://localhost:3000`.

## 21. Validación manual de botones y persistencia

1. **Prestar:** reduce ejemplares, actualiza la tarjeta y guarda el estado.
2. **Devolver:** incrementa ejemplares, marca disponibilidad y guarda el estado.
3. **Favorito:** cambia el estado visual amarillo y se conserva después de recargar.
4. **Solo disponibles:** filtra el catálogo y usa cyan cuando el botón tiene `.active`.
5. **Libro agotado:** `Fahrenheit 451` inicia con cero ejemplares y su botón de préstamo está deshabilitado.
6. **Búsqueda:** filtra por título o autor en tiempo real.
7. **Delegación:** pulsar el texto o contenido interno de un botón ejecuta la acción correspondiente.
8. **Reset de versión:** una colección guardada con menos de 10 libros se reemplaza por la semilla de 12 libros.

Para restablecer manualmente la colección:

```javascript
localStorage.removeItem('univo_biblioteca_libros');
location.reload();
```

## 22. Evidencia visual de la interfaz

La siguiente captura muestra el estado visual actual del Sistema de Biblioteca UNIVO: catálogo de 12 libros, panel de registro, filtros, buscador, tarjetas de libros y estados de disponibilidad.

![Vista actual del Sistema de Biblioteca UNIVO](Screenshot%202026-08-19%20115526.png)

Archivo utilizado: `Screenshot 2026-08-19 115526.png`.
