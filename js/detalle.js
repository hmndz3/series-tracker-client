const Detalle = {

    /**
     * Abre el modal de detalle con la información de una serie.
     */
    async mostrar(id) {
        Modal.abrir(`
            <div style="padding: 4rem; text-align: center;">
                <div class="spinner"></div>
            </div>
        `);

        try {
            const serie = await API.obtenerSerie(id);
            Modal.abrir(this._generarHTML(serie));
            this._registrarAcciones(serie);
        } catch (err) {
            console.error(err);
            Modal.abrir(`
                <div class="estado-error" style="padding: 3rem;">
                    <h2 class="estado-error__titulo">Error</h2>
                    <p>${escaparHTML(err.message)}</p>
                    <button class="btn btn--secundario" onclick="Modal.cerrar()" style="margin-top: 1rem;">
                        Cerrar
                    </button>
                </div>
            `);
        }
    },

    /**
     * Genera el HTML del detalle.
     */
    _generarHTML(serie) {
        const imagen = serie.imagen_url
            ? `<img src="${escaparHTML(serie.imagen_url)}" 
                     alt="${escaparHTML(serie.titulo)}" 
                     class="detalle__imagen" 
                     onerror="this.parentElement.innerHTML='<div style=\\'display:flex;align-items:center;justify-content:center;height:100%;font-size:4rem;color:var(--color-texto-tenue);\\'>🎬</div>'">`
            : `<div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:4rem;color:var(--color-texto-tenue);">🎬</div>`;

        const descripcion = serie.descripcion
            ? `<p class="detalle__descripcion">${escaparHTML(serie.descripcion)}</p>`
            : `<p class="detalle__descripcion" style="font-style:italic;color:var(--color-texto-tenue);">Sin descripción</p>`;

        const calificacion = serie.calificacion
            ? `<span style="color: var(--color-advertencia);">★ ${serie.calificacion}/10</span>`
            : `<span style="color: var(--color-texto-tenue);">Sin calificar</span>`;

        const progreso = serie.episodios_total
            ? `${serie.episodios_vistos} / ${serie.episodios_total}`
            : (serie.episodios_vistos > 0 ? `${serie.episodios_vistos}` : "—");

        const fechaCreacion = new Date(serie.creado_en).toLocaleDateString("es-ES", {
            year: "numeric",
            month: "long",
            day: "numeric"
        });

        return `
            <button class="modal__cerrar" onclick="Modal.cerrar()" aria-label="Cerrar">×</button>
            <div class="detalle">
                <div class="detalle__imagen-contenedor">
                    ${imagen}
                </div>
                <div class="detalle__info">
                    <div class="detalle__estado-fila">
                        <span class="detalle__estado-badge detalle__estado-badge--${serie.estado}">
                            ${traducirEstado(serie.estado)}
                        </span>
                        <span style="color: var(--color-texto-tenue); font-size: var(--texto-sm);">
                            Agregada el ${fechaCreacion}
                        </span>
                    </div>
                    <h2 class="detalle__titulo">${escaparHTML(serie.titulo)}</h2>
                    ${descripcion}
                    <div class="detalle__metadatos">
                        <div>
                            <div class="detalle__metadato-etiqueta">Calificación</div>
                            <div class="detalle__metadato-valor">${calificacion}</div>
                        </div>
                        <div>
                            <div class="detalle__metadato-etiqueta">Episodios</div>
                            <div class="detalle__metadato-valor">${progreso}</div>
                        </div>
                    </div>
                    <div class="detalle__acciones">
                        <button class="btn btn--primario" id="btn-detalle-editar">
                            ✎ Editar
                        </button>
                        <button class="btn btn--peligro" id="btn-detalle-eliminar">
                            🗑 Eliminar
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    _registrarAcciones(serie) {
        document.getElementById("btn-detalle-editar").addEventListener("click", () => {
            // Se implementa en el Bloque 18
            alert(`Editar serie ${serie.id} — formulario viene en el Bloque 18`);
        });

        document.getElementById("btn-detalle-eliminar").addEventListener("click", () => {
            this._confirmarEliminacion(serie);
        });
    },

    /**
     * Pide confirmación y elimina la serie.
     */
    async _confirmarEliminacion(serie) {
        const confirmado = confirm(
            `¿Seguro que quieres eliminar "${serie.titulo}"?\n\nEsta acción no se puede deshacer.`
        );

        if (!confirmado) return;

        try {
            await API.eliminarSerie(serie.id);
            Modal.cerrar();
            // Recargar el grid
            await cargarSeries();
        } catch (err) {
            console.error(err);
            alert(`No se pudo eliminar: ${err.message}`);
        }
    }
};