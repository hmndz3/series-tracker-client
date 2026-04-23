
const estado = {
    filtros: {
        q: "",
        sort: "creado_en",
        order: "desc",
        page: 1,
        limit: 12
    },
    totalPaginas: 1
};

// ---- Referencias del DOM ----
const elementos = {
    gridSeries:         document.getElementById("grid-series"),
    estadoCargando:     document.getElementById("estado-cargando"),
    estadoVacio:        document.getElementById("estado-vacio"),
    estadoError:        document.getElementById("estado-error"),
    estadoErrorMensaje: document.getElementById("estado-error-mensaje"),
    paginacion:         document.getElementById("paginacion"),
    paginacionInfo:     document.getElementById("paginacion-info"),
    btnPaginaAnterior:  document.getElementById("btn-pagina-anterior"),
    btnPaginaSiguiente: document.getElementById("btn-pagina-siguiente"),
    buscador:           document.getElementById("buscador"),
    filtroOrden:        document.getElementById("filtro-orden"),
    btnNueva:           document.getElementById("btn-nueva"),
    btnExportar:        document.getElementById("btn-exportar"),
    modalContenedor:    document.getElementById("modal-contenedor")
};


/**
 * Carga las series desde la API según los filtros actuales y las renderiza.
 */
async function cargarSeries() {
    mostrarEstado("cargando");

    try {
        const respuesta = await API.listarSeries(estado.filtros);
        const series = respuesta.datos;
        estado.totalPaginas = respuesta.paginacion.total_paginas;

        if (series.length === 0) {
            mostrarEstado("vacio");
        } else {
            renderizarSeries(series);
            mostrarEstado("datos");
            actualizarPaginacion(respuesta.paginacion);
        }
    } catch (err) {
        console.error(err);
        elementos.estadoErrorMensaje.textContent = err.message;
        mostrarEstado("error");
    }
}

/**
 * Renderiza un arreglo de series en el grid.
 */
function renderizarSeries(series) {
    elementos.gridSeries.innerHTML = series
        .map(serie => crearFichaHTML(serie))
        .join("");

    elementos.gridSeries.querySelectorAll(".ficha").forEach(ficha => {
        ficha.addEventListener("click", () => {
            const id = parseInt(ficha.dataset.id);
            abrirDetalle(id);
        });
    });
}

/**
 * Genera el HTML de una ficha de serie.
 */
function crearFichaHTML(serie) {
    const imagen = serie.imagen_url
        ? `<img src="${escaparHTML(serie.imagen_url)}" 
                 alt="${escaparHTML(serie.titulo)}" 
                 class="ficha__imagen" 
                 onerror="this.style.display='none'">`
        : `<div class="ficha__imagen" 
                style="display:flex;align-items:center;justify-content:center;color:var(--color-texto-tenue);font-size:3rem;">
                🎬
           </div>`;

    const calificacion = serie.calificacion
        ? `<span class="ficha__calificacion">★ ${serie.calificacion}</span>`
        : `<span style="color:var(--color-texto-tenue);">Sin calificar</span>`;

    const progreso = serie.episodios_total
        ? `<span class="ficha__progreso">${serie.episodios_vistos}/${serie.episodios_total} eps</span>`
        : ``;

    return `
        <article class="ficha" data-id="${serie.id}">
            <div class="ficha__imagen-contenedor">
                ${imagen}
                <span class="ficha__estado ficha__estado--${serie.estado}">
                    ${traducirEstado(serie.estado)}
                </span>
            </div>
            <div class="ficha__cuerpo">
                <h3 class="ficha__titulo">${escaparHTML(serie.titulo)}</h3>
                <div class="ficha__info">
                    ${calificacion}
                    ${progreso}
                </div>
            </div>
        </article>
    `;
}

/**
 * Controla qué sección se muestra: cargando, vacío, error o el grid con datos.
 */
function mostrarEstado(nombre) {
    elementos.gridSeries.classList.add("oculto");
    elementos.estadoCargando.classList.add("oculto");
    elementos.estadoVacio.classList.add("oculto");
    elementos.estadoError.classList.add("oculto");
    elementos.paginacion.classList.add("oculto");

    switch (nombre) {
        case "cargando":
            elementos.estadoCargando.classList.remove("oculto");
            break;
        case "vacio":
            elementos.estadoVacio.classList.remove("oculto");
            break;
        case "error":
            elementos.estadoError.classList.remove("oculto");
            break;
        case "datos":
            elementos.gridSeries.classList.remove("oculto");
            break;
    }
}

function actualizarPaginacion(paginacion) {
    if (paginacion.total_paginas <= 1) {
        elementos.paginacion.classList.add("oculto");
        return;
    }

    elementos.paginacion.classList.remove("oculto");
    elementos.paginacionInfo.textContent = 
        `Página ${paginacion.pagina} de ${paginacion.total_paginas}`;
    elementos.btnPaginaAnterior.disabled = paginacion.pagina <= 1;
    elementos.btnPaginaSiguiente.disabled = paginacion.pagina >= paginacion.total_paginas;
}

function abrirDetalle(id) {
    Detalle.mostrar(id);
}

/**
 * Traduce el valor del estado a texto visible en UI.
 */
function traducirEstado(estado) {
    const mapa = {
        viendo:     "Viendo",
        completada: "Completada",
        pendiente:  "Pendiente",
        abandonada: "Abandonada"
    };
    return mapa[estado] || estado;
}

/**
 * Escapa HTML para prevenir XSS al insertar texto del usuario en el DOM.
 */
function escaparHTML(texto) {
    if (texto == null) return "";
    const div = document.createElement("div");
    div.textContent = String(texto);
    return div.innerHTML;
}

function debounce(fn, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn.apply(this, args), delay);
    };
}

// Búsqueda con debounce (espera 300ms después de la última tecla)
elementos.buscador.addEventListener("input", debounce((e) => {
    estado.filtros.q = e.target.value.trim();
    estado.filtros.page = 1; // volver a la primera página al buscar
    cargarSeries();
}, 300));

// Cambio de ordenamiento
elementos.filtroOrden.addEventListener("change", (e) => {
    const [campo, direccion] = e.target.value.split("-");
    estado.filtros.sort = campo;
    estado.filtros.order = direccion;
    estado.filtros.page = 1;
    cargarSeries();
});

// Paginación
elementos.btnPaginaAnterior.addEventListener("click", () => {
    if (estado.filtros.page > 1) {
        estado.filtros.page--;
        cargarSeries();
        window.scrollTo({ top: 0, behavior: "smooth" });
    }
});

elementos.btnPaginaSiguiente.addEventListener("click", () => {
    if (estado.filtros.page < estado.totalPaginas) {
        estado.filtros.page++;
        cargarSeries();
        window.scrollTo({ top: 0, behavior: "smooth" });
    }
});

// Botones que se implementan después
elementos.btnNueva.addEventListener("click", () => {
    Formulario.crear();
});

elementos.btnExportar.addEventListener("click", () => {
    alert("Exportar CSV — se implementa en el Bloque 20");
});

document.addEventListener("DOMContentLoaded", () => {
    console.log("Series Tracker iniciado");
    cargarSeries();
});