// ============================================================================
// POLYFILL EVENTEMITTER (Para que funcione nativo en el navegador sin Webpack)
// ============================================================================
type Listener = (...args: any[]) => void;
class EventEmitter {
    private events: { [event: string]: Listener[] } = {};
    
    on(event: string, listener: Listener): void {
        if (!this.events[event]) this.events[event] = [];
        this.events[event].push(listener);
    }
    
    emit(event: string, ...args: any[]): void {
        if (this.events[event]) {
            this.events[event].forEach(listener => listener(...args));
        }
    }
}

// ============================================================================
// PARTE 1: INTERFACES Y MODELOS (1.5 puntos)
// ============================================================================

// 1.2 Define un tipo unión llamado CategoriaLibro
type CategoriaLibro = "CIENCIA" | "LITERATURA" | "HISTORIA" | "TECNOLOGIA" | "ARTE";
type CategoriaFiltro = CategoriaLibro | "TODOS";
type OrdenOption = "defecto" | "titulo" | "autor";
type AccionLibro = "prestar" | "devolver" | "favorito";

const CATEGORIAS: readonly CategoriaLibro[] = ["CIENCIA", "LITERATURA", "HISTORIA", "TECNOLOGIA", "ARTE"];

function escapeHTML(valor: string): string {
    return valor.replace(/[&<>"']/g, caracter => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    })[caracter] ?? caracter);
}

// 1.1 y 1.3 Define la interfaz Libro (modificada con CategoriaLibro)
interface Libro {
    id: number;
    titulo: string;
    autor: string;
    categoria: CategoriaLibro;
    anio: number;
    disponible: boolean;
    ejemplares: number;
    ejemplaresTotales: number;
    esFavorito: boolean;
}

// ============================================================================
// PARTE 2: CLASE EMISORA DE EVENTOS (2.5 puntos)
// ============================================================================

// 2.1 Crea la clase Biblioteca que extiende EventEmitter
class Biblioteca extends EventEmitter {
    private libros: Libro[] = [];
    private _idCounter: number = 1;
    private readonly storageKey = "univo_biblioteca_libros";

    // Método extra para obtener la lista actual de libros (necesario para la UI)
    public getLibros(): Libro[] {
        return [...this.libros];
    }

    // 2.2 Implementa agregarLibro
    public agregarLibro(libroData: Omit<Libro, 'id' | 'disponible' | 'ejemplaresTotales' | 'esFavorito'>): void {
        const ejemplares = Number(libroData.ejemplares);
        const nuevoLibro: Libro = {
            ...libroData,
            id: this._idCounter++,
            ejemplares,
            ejemplaresTotales: ejemplares,
            disponible: ejemplares > 0,
            esFavorito: false
        };
        this.libros.push(nuevoLibro);
        this.emitirCambio("libroAgregado", nuevoLibro);
    }

    // 2.3 Implementa solicitarPrestamo
    public solicitarPrestamo(id: number): void {
        const libro = this.libros.find(l => l.id === id);
        if (libro && libro.ejemplares > 0) {
            libro.ejemplares--;
            libro.disponible = libro.ejemplares > 0;
            this.emitirCambio("prestamoExitoso", libro);
        } else if (libro) {
            this.emit("noDisponible", libro);
        }
    }

    // 2.4 Implementa devolverLibro
    public devolverLibro(id: number): void {
        const libro = this.libros.find(l => l.id === id);
        if (libro && libro.ejemplares < libro.ejemplaresTotales) {
            libro.ejemplares++;
            libro.disponible = libro.ejemplares > 0;
            this.emitirCambio("devolucionExitosa", libro);
        }
    }

    // Método adicional necesario para el requerimiento de la UI (Parte 5)
    public toggleFavorito(id: number): void {
        const libro = this.libros.find(l => l.id === id);
        if (libro) {
            libro.esFavorito = !libro.esFavorito;
            this.emitirCambio("favoritoCambiado", libro);
        }
    }

    public cargarDesdeStorage(): boolean {
        try {
            const guardado = localStorage.getItem(this.storageKey);
            if (!guardado) return false;

            const datos: unknown = JSON.parse(guardado);
            if (!Array.isArray(datos) || datos.length < 10 || !datos.every(Biblioteca.esLibroValido)) {
                this.libros = [];
                this._idCounter = 1;
                return false;
            }

            this.libros = datos;
            this._idCounter = this.libros.reduce((maximo, libro) => Math.max(maximo, libro.id), 0) + 1;
            return true;
        } catch (error) {
            console.warn("[LOG] No se pudo cargar la colección guardada.", error);
            return false;
        }
    }

    private emitirCambio(evento: string, libro: Libro): void {
        this.sincronizarStorage();
        this.emit(evento, libro);
    }

    private sincronizarStorage(): void {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.libros));
        } catch (error) {
            console.warn("[LOG] No se pudo guardar la colección.", error);
        }
    }

    private static esLibroValido(valor: unknown): valor is Libro {
        if (typeof valor !== "object" || valor === null) return false;
        const libro = valor as Record<string, unknown>;
        return Number.isInteger(libro.id) && (libro.id as number) > 0
            && typeof libro.titulo === "string"
            && typeof libro.autor === "string"
            && typeof libro.categoria === "string"
            && CATEGORIAS.includes(libro.categoria as CategoriaLibro)
            && Number.isInteger(libro.anio)
            && Number.isInteger(libro.ejemplares) && (libro.ejemplares as number) >= 0
            && Number.isInteger(libro.ejemplaresTotales)
            && (libro.ejemplaresTotales as number) >= (libro.ejemplares as number)
            && typeof libro.disponible === "boolean"
            && typeof libro.esFavorito === "boolean";
    }
}

// ============================================================================
// PARTE 3: CLASES OYENTES (2.0 puntos)
// ============================================================================

// 3.1 Crea la clase NotificadorBiblioteca (oyente de consola)
class NotificadorBiblioteca {
    public notificarNuevoLibro(libro: Libro): void {
        console.log(`[LOG] Nuevo libro agregado: "${libro.titulo}" de ${libro.autor}.`);
    }
    public notificarPrestamo(libro: Libro): void {
        console.log(`[LOG] Préstamo exitoso: "${libro.titulo}". Quedan ${libro.ejemplares} ejemplares.`);
    }
    public notificarNoDisponible(libro: Libro): void {
        console.warn(`[LOG] Libro no disponible: "${libro.titulo}". No hay ejemplares.`);
    }
    public notificarDevolucion(libro: Libro): void {
        console.log(`[LOG] Devolución exitosa: "${libro.titulo}". Ahora hay ${libro.ejemplares} ejemplares.`);
    }
}

// 3.2 Crea la clase GestorUIBiblioteca (oyente de interfaz)
class GestorUIBiblioteca {
    private contenedorLibros: HTMLElement;
    private totalSpan: HTMLElement;
    private disponiblesSpan: HTMLElement;
    private areaMensajes: HTMLElement;

    constructor() {
        this.contenedorLibros = document.getElementById('contenedor-libros')!;
        this.totalSpan = document.getElementById('total-libros')!;
        this.disponiblesSpan = document.getElementById('disponibles-libros')!;
        this.areaMensajes = document.getElementById('area-mensajes')!;
    }

    public renderizarLibros(libros: Libro[]): void {
        this.contenedorLibros.innerHTML = '';
        
        if (libros.length === 0) {
            this.contenedorLibros.innerHTML = '<div class="empty-state">No se encontraron libros que coincidan con la búsqueda.</div>';
            return;
        }

        libros.forEach(libro => {
            const card = document.createElement('div');
            card.className = 'libro-card';
            
            const estadoClase = libro.disponible ? 'disponible' : 'agotado';
            const estadoTexto = libro.disponible ? `${libro.ejemplares} disp.` : 'Agotado';
            const sinStock = libro.ejemplares === 0;
            const sinDevolucion = libro.ejemplares >= libro.ejemplaresTotales;
            const favClase = libro.esFavorito ? 'btn-favorito active' : 'btn-favorito';
            const favIcono = libro.esFavorito ? '★' : '☆';
            const titulo = escapeHTML(libro.titulo);
            const autor = escapeHTML(libro.autor);
            const categoria = escapeHTML(libro.categoria);

            card.innerHTML = `
                <span class="libro-tag">${categoria}</span>
                <div class="libro-title">${titulo}</div>
                <div class="libro-author">${autor}</div>
                <div class="libro-info">
                    <span>${libro.anio}</span>
                    <span class="${estadoClase}">${estadoTexto}</span>
                </div>
                    <div class="card-actions" data-book-id="${libro.id}">
                        <button class="btn-primary" data-action="prestar" ${sinStock ? 'disabled' : ''}>${sinStock ? 'Sin Stock' : 'Prestar'}</button>
                        <button class="btn-secondary" data-action="devolver" ${sinDevolucion ? 'disabled' : ''}>Devolver</button>
                        <button class="${favClase}" data-action="favorito" aria-label="${libro.esFavorito ? 'Quitar de favoritos' : 'Añadir a favoritos'}" title="${libro.esFavorito ? 'Quitar de favoritos' : 'Añadir a favoritos'}">${favIcono}</button>
                </div>
            `;
            this.contenedorLibros.appendChild(card);
        });
    }

    public actualizarContador(libros: Libro[]): void {
        this.totalSpan.textContent = libros.length.toString();
        const disponibles = libros.filter(l => l.disponible).length;
        this.disponiblesSpan.textContent = disponibles.toString();
    }

    public mostrarMensaje(mensaje: string, tipo: 'exito' | 'error' | 'info'): void {
        const toast = document.createElement('div');
        toast.className = `toast ${tipo}`;
        toast.textContent = mensaje;
        
        this.areaMensajes.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
}

// ============================================================================
// PARTE 4: SUSCRIPCIONES Y CONEXIONES (2.0 puntos)
// ============================================================================

// 4.1 Instanciar clases
const biblioteca = new Biblioteca();
const notificador = new NotificadorBiblioteca();
const gestorUI = new GestorUIBiblioteca();

// 4.2 Registrar suscripciones con .on()
biblioteca.on("libroAgregado", (libro: Libro) => {
    notificador.notificarNuevoLibro(libro);
    gestorUI.mostrarMensaje(`Libro agregado: ${libro.titulo}`, 'exito');
    app.actualizarVista();
});

biblioteca.on("prestamoExitoso", (libro: Libro) => {
    notificador.notificarPrestamo(libro);
    gestorUI.mostrarMensaje(`Préstamo exitoso: ${libro.titulo}`, 'exito');
    app.actualizarVista();
});

biblioteca.on("noDisponible", (libro: Libro) => {
    notificador.notificarNoDisponible(libro);
    gestorUI.mostrarMensaje(`Agotado: ${libro.titulo}`, 'error');
});

biblioteca.on("devolucionExitosa", (libro: Libro) => {
    notificador.notificarDevolucion(libro);
    gestorUI.mostrarMensaje(`Devolución exitosa: ${libro.titulo}`, 'info');
    app.actualizarVista();
});

biblioteca.on("favoritoCambiado", (libro: Libro) => {
    gestorUI.mostrarMensaje(libro.esFavorito ? `Añadido a favoritos` : `Removido de favoritos`, 'info');
    app.actualizarVista();
});


// ============================================================================
// PARTE 5 Y CONTROLADOR PRINCIPAL (App)
// ============================================================================

// Objeto global para conectar el DOM con la lógica sin exponer todo
const app = {
    filtros: {
        categoria: 'TODOS' as CategoriaFiltro,
        orden: 'defecto' as OrdenOption,
        soloDisponibles: false,
        soloFavoritos: false,
        busqueda: ''
    },

    inicializar: () => {
        // Datos de prueba (de la rúbrica)
        const librosIniciales: Omit<Libro, 'id' | 'disponible' | 'ejemplaresTotales' | 'esFavorito'>[] = [
            { titulo: "El Principito", autor: "Antoine de Saint-Exupéry", categoria: "LITERATURA" as CategoriaLibro, anio: 1943, ejemplares: 5 },
            { titulo: "Cien años de soledad", autor: "Gabriel García Márquez", categoria: "LITERATURA" as CategoriaLibro, anio: 1967, ejemplares: 3 },
            { titulo: "Fahrenheit 451", autor: "Ray Bradbury", categoria: "LITERATURA" as CategoriaLibro, anio: 1953, ejemplares: 0 },
            { titulo: "Breve historia del tiempo", autor: "Stephen Hawking", categoria: "CIENCIA" as CategoriaLibro, anio: 1988, ejemplares: 2 },
            { titulo: "Cosmos", autor: "Carl Sagan", categoria: "CIENCIA" as CategoriaLibro, anio: 1980, ejemplares: 4 },
            { titulo: "El arte de la guerra", autor: "Sun Tzu", categoria: "HISTORIA" as CategoriaLibro, anio: 500, ejemplares: 4 },
            { titulo: "Sapiens", autor: "Yuval Noah Harari", categoria: "HISTORIA" as CategoriaLibro, anio: 2011, ejemplares: 3 },
            { titulo: "Clean Code", autor: "Robert C. Martin", categoria: "TECNOLOGIA" as CategoriaLibro, anio: 2008, ejemplares: 6 },
            { titulo: "The Pragmatic Programmer", autor: "Andrew Hunt", categoria: "TECNOLOGIA" as CategoriaLibro, anio: 1999, ejemplares: 2 },
            { titulo: "Refactoring", autor: "Martin Fowler", categoria: "TECNOLOGIA" as CategoriaLibro, anio: 1999, ejemplares: 1 },
            { titulo: "Historia del arte", autor: "Ernst Gombrich", categoria: "ARTE" as CategoriaLibro, anio: 1950, ejemplares: 2 },
            { titulo: "Ways of Seeing", autor: "John Berger", categoria: "ARTE" as CategoriaLibro, anio: 1972, ejemplares: 3 }
        ];

        if (!biblioteca.cargarDesdeStorage()) {
            librosIniciales.forEach(libro => biblioteca.agregarLibro(libro));
        }
        app.actualizarVista();
        
        // Setup Formulario
        document.getElementById('form-libro')?.addEventListener('submit', (e) => {
            e.preventDefault();
            const titulo = (document.getElementById('titulo') as HTMLInputElement).value;
            const autor = (document.getElementById('autor') as HTMLInputElement).value;
            const categoria = (document.getElementById('categoria') as HTMLSelectElement).value as CategoriaLibro;
            const ejemplares = parseInt((document.getElementById('ejemplares') as HTMLInputElement).value);
            const anio = parseInt((document.getElementById('anio') as HTMLInputElement).value);

            biblioteca.agregarLibro({ titulo, autor, categoria, ejemplares, anio });
            (e.target as HTMLFormElement).reset();
        });

        // Setup Filtros y Orden
        document.getElementById('filtro-categoria')?.addEventListener('change', (e) => {
            app.filtros.categoria = (e.target as HTMLSelectElement).value as CategoriaFiltro;
            app.actualizarVista();
        });

        document.getElementById('filtro-orden')?.addEventListener('change', (e) => {
            app.filtros.orden = (e.target as HTMLSelectElement).value as OrdenOption;
            app.actualizarVista();
        });

        document.getElementById('buscar-libros')?.addEventListener('input', (e) => {
            app.filtros.busqueda = (e.target as HTMLInputElement).value.trim().toLocaleLowerCase();
            app.actualizarVista();
        });

        document.getElementById('btn-solo-disponibles')?.addEventListener('click', (e) => {
            app.filtros.soloDisponibles = !app.filtros.soloDisponibles;
            const btn = e.target as HTMLButtonElement;
            btn.classList.toggle('active', app.filtros.soloDisponibles);
            app.actualizarVista();
        });

        document.getElementById('btn-solo-favoritos')?.addEventListener('click', (e) => {
            app.filtros.soloFavoritos = !app.filtros.soloFavoritos;
            const btn = e.target as HTMLButtonElement;
            btn.classList.toggle('active', app.filtros.soloFavoritos);
            app.actualizarVista();
        });

        document.getElementById('btn-limpiar-filtros')?.addEventListener('click', () => {
            app.filtros = { categoria: 'TODOS', orden: 'defecto', soloDisponibles: false, soloFavoritos: false, busqueda: '' };
            (document.getElementById('filtro-categoria') as HTMLSelectElement).value = 'TODOS';
            (document.getElementById('filtro-orden') as HTMLSelectElement).value = 'defecto';
            (document.getElementById('buscar-libros') as HTMLInputElement).value = '';
            document.getElementById('btn-solo-disponibles')?.classList.remove('active');
            document.getElementById('btn-solo-favoritos')?.classList.remove('active');
            app.actualizarVista();
        });

        document.getElementById('contenedor-libros')?.addEventListener('click', (e) => {
            const boton = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-action]');
            const acciones = boton?.closest<HTMLElement>('[data-book-id]');
            if (!boton || !acciones) return;

            const id = Number(acciones.dataset.bookId);
            const accionesLibro: Record<AccionLibro, (libroId: number) => void> = {
                prestar: app.solicitarPrestamo,
                devolver: app.devolverLibro,
                favorito: app.toggleFavorito
            };
            const accion = boton.dataset.action as AccionLibro | undefined;
            if (accion) accionesLibro[accion]?.(id);
        });

        console.log("📚 Sistema de Gestión de Biblioteca UNIVO iniciado");
    },

    actualizarVista: () => {
        let librosActuales = biblioteca.getLibros();

        // Aplicar filtros en el orden de búsqueda, categoría, disponibilidad y favoritos.
        if (app.filtros.busqueda) {
            librosActuales = librosActuales.filter(l =>
                `${l.titulo} ${l.autor}`.toLocaleLowerCase().includes(app.filtros.busqueda)
            );
        }

        if (app.filtros.categoria !== 'TODOS') {
            librosActuales = librosActuales.filter(l => l.categoria === app.filtros.categoria);
        }

        if (app.filtros.soloDisponibles) {
            librosActuales = librosActuales.filter(l => l.disponible);
        }

        if (app.filtros.soloFavoritos) {
            librosActuales = librosActuales.filter(l => l.esFavorito);
        }

        // Aplicar orden
        if (app.filtros.orden === 'titulo') {
            librosActuales.sort((a, b) => a.titulo.localeCompare(b.titulo));
        } else if (app.filtros.orden === 'autor') {
            librosActuales.sort((a, b) => a.autor.localeCompare(b.autor));
        }

        // Renderizar y actualizar contadores
        gestorUI.renderizarLibros(librosActuales);
        gestorUI.actualizarContador(biblioteca.getLibros()); // El contador global siempre muestra el total real
    },

    // Métodos delegados para el HTML
    solicitarPrestamo: (id: number) => biblioteca.solicitarPrestamo(id),
    devolverLibro: (id: number) => biblioteca.devolverLibro(id),
    toggleFavorito: (id: number) => biblioteca.toggleFavorito(id)
};

// ============================================================================
// INICIALIZACIÓN
// ============================================================================
document.addEventListener('DOMContentLoaded', app.inicializar);