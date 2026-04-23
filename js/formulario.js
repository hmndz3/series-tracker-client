// ====================================================================
// FORMULARIO - Modal para crear y editar series
// ====================================================================

const Formulario = {

    /**
     * Abre el formulario en modo "crear" (campos vacíos).
     */
    crear() {
        this._abrir({
            titulo:           "",
            descripcion:      "",
            imagen_url:       "",
            estado:           "pendiente",
            calificacion:     "",
            episodios_total:  "",
            episodios_vistos: 0
        }, null);
    },

    /**
     * Abre el formulario en modo "editar" con los datos de la serie.
     */
    editar(serie) {
        this._abrir({
            titulo:           serie.titulo || "",
            descripcion:      serie.descripcion || "",
            imagen_url:       serie.imagen_url || "",
            estado:           serie.estado || "pendiente",
            calificacion:     serie.calificacion ?? "",
            episodios_total:  serie.episodios_total ?? "",
            episodios_vistos: serie.episodios_vistos ?? 0
        }, serie.id);
    },

    /**
     * Abre el modal del formulario. Si idSerie es null, modo crear; si no, modo editar.
     */
    _abrir(datos, idSerie) {
        const esEdicion = idSerie !== null;
        const titulo = esEdicion ? "Editar serie" : "Nueva serie";
        const textoBoton = esEdicion ? "Guardar cambios" : "Crear serie";

        Modal.abrir(`
            <button class="modal__cerrar" onclick="Modal.cerrar()" aria-label="Cerrar">×</button>
            <div class="formulario">
                <h2 class="formulario__titulo">${titulo}</h2>

                <form id="form-serie">
                    <div class="campo">
                        <label class="campo__etiqueta" for="campo-titulo">Título *</label>
                        <input 
                            type="text" 
                            id="campo-titulo" 
                            class="campo__input" 
                            value="${escaparHTML(datos.titulo)}"
                            required
                            maxlength="200"
                        >
                        <span class="campo__error" id="error-titulo"></span>
                    </div>

                    <div class="campo">
                        <label class="campo__etiqueta" for="campo-descripcion">Descripción</label>
                        <textarea 
                            id="campo-descripcion" 
                            class="campo__textarea"
                        >${escaparHTML(datos.descripcion)}</textarea>
                    </div>

                    <div class="campo">
                        <label class="campo__etiqueta" for="campo-imagen">URL de imagen (portada)</label>
                        <input 
                            type="url" 
                            id="campo-imagen" 
                            class="campo__input" 
                            value="${escaparHTML(datos.imagen_url)}"
                            placeholder="https://..."
                            maxlength="500"
                        >
                    </div>

                    <div class="campo__fila">
                        <div class="campo">
                            <label class="campo__etiqueta" for="campo-estado">Estado</label>
                            <select id="campo-estado" class="campo__select">
                                <option value="pendiente"  ${datos.estado === "pendiente"  ? "selected" : ""}>Pendiente</option>
                                <option value="viendo"     ${datos.estado === "viendo"     ? "selected" : ""}>Viendo</option>
                                <option value="completada" ${datos.estado === "completada" ? "selected" : ""}>Completada</option>
                                <option value="abandonada" ${datos.estado === "abandonada" ? "selected" : ""}>Abandonada</option>
                            </select>
                        </div>

                        <div class="campo">
                            <label class="campo__etiqueta" for="campo-calificacion">Calificación (1-10)</label>
                            <input 
                                type="number" 
                                id="campo-calificacion" 
                                class="campo__input" 
                                value="${datos.calificacion}"
                                min="1" 
                                max="10"
                            >
                        </div>
                    </div>

                    <div class="campo__fila">
                        <div class="campo">
                            <label class="campo__etiqueta" for="campo-episodios-total">Total de episodios</label>
                            <input 
                                type="number" 
                                id="campo-episodios-total" 
                                class="campo__input" 
                                value="${datos.episodios_total}"
                                min="0"
                            >
                        </div>

                        <div class="campo">
                            <label class="campo__etiqueta" for="campo-episodios-vistos">Episodios vistos</label>
                            <input 
                                type="number" 
                                id="campo-episodios-vistos" 
                                class="campo__input" 
                                value="${datos.episodios_vistos}"
                                min="0"
                            >
                        </div>
                    </div>

                    <span class="campo__error" id="error-general" style="display:block;text-align:right;"></span>

                    <div class="formulario__acciones">
                        <button type="button" class="btn btn--secundario" onclick="Modal.cerrar()">
                            Cancelar
                        </button>
                        <button type="submit" class="btn btn--primario" id="btn-guardar">
                            ${textoBoton}
                        </button>
                    </div>
                </form>
            </div>
        `);

        // Registrar submit
        document.getElementById("form-serie").addEventListener("submit", async (e) => {
            e.preventDefault();
            await this._enviar(idSerie);
        });

        // Enfocar el primer campo automáticamente
        setTimeout(() => document.getElementById("campo-titulo").focus(), 100);
    },

    /**
     * Recolecta los valores del formulario y los envía a la API.
     */
    async _enviar(idSerie) {
        const btnGuardar = document.getElementById("btn-guardar");
        const errorGeneral = document.getElementById("error-general");

        // Limpiar errores previos
        errorGeneral.textContent = "";
        document.getElementById("error-titulo").textContent = "";

        // Recolectar valores
        const datos = {
            titulo:      document.getElementById("campo-titulo").value.trim(),
            descripcion: document.getElementById("campo-descripcion").value.trim() || null,
            imagen_url:  document.getElementById("campo-imagen").value.trim() || null,
            estado:      document.getElementById("campo-estado").value,
            calificacion:     this._numeroOpcional("campo-calificacion"),
            episodios_total:  this._numeroOpcional("campo-episodios-total"),
            episodios_vistos: this._numeroOpcional("campo-episodios-vistos") ?? 0
        };

        // Validación rápida en cliente (además de la del servidor)
        if (!datos.titulo) {
            document.getElementById("error-titulo").textContent = "El título es obligatorio";
            return;
        }

        // Deshabilitar botón para evitar doble envío
        btnGuardar.disabled = true;
        btnGuardar.textContent = "Guardando...";

        try {
            if (idSerie === null) {
                await API.crearSerie(datos);
                Modal.cerrar();
                await cargarSeries();
                Toast.exito("Serie creada correctamente");
            } else {
                await API.actualizarSerie(idSerie, datos);
                Modal.cerrar();
                await cargarSeries();
                Toast.exito("Serie actualizada correctamente");
            }
        } catch (err) {
            console.error(err);
            errorGeneral.textContent = err.message;
            btnGuardar.disabled = false;
            btnGuardar.textContent = idSerie === null ? "Crear serie" : "Guardar cambios";
        }
    },

    /**
     * Lee un input numérico. Retorna null si está vacío, número si tiene valor.
     */
    _numeroOpcional(idCampo) {
        const valor = document.getElementById(idCampo).value;
        if (valor === "" || valor === null) return null;
        const num = parseInt(valor, 10);
        return isNaN(num) ? null : num;
    }
};