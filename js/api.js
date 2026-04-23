const API = {

    /**
     * Listar series con filtros opcionales.
     * @param {Object} filtros - { q, sort, order, page, limit }
     * @returns {Promise<{datos: Array, paginacion: Object}>}
     */
    async listarSeries(filtros = {}) {
        const params = new URLSearchParams();
        
        if (filtros.q)     params.append("q", filtros.q);
        if (filtros.sort)  params.append("sort", filtros.sort);
        if (filtros.order) params.append("order", filtros.order);
        if (filtros.page)  params.append("page", filtros.page);
        if (filtros.limit) params.append("limit", filtros.limit);

        const url = `${CONFIG.API_URL}/series?${params.toString()}`;
        const res = await fetch(url);

        if (!res.ok) {
            throw new Error(`Error al listar series: HTTP ${res.status}`);
        }

        return await res.json();
    },

    /**
     * Obtener una serie específica por ID.
     * @param {number} id
     * @returns {Promise<Object>}
     */
    async obtenerSerie(id) {
        const res = await fetch(`${CONFIG.API_URL}/series/${id}`);

        if (res.status === 404) {
            throw new Error("Serie no encontrada");
        }
        if (!res.ok) {
            throw new Error(`Error al obtener serie: HTTP ${res.status}`);
        }

        return await res.json();
    },

    /**
     * Crear una nueva serie.
     * @param {Object} datos - campos de la serie
     * @returns {Promise<Object>} - la serie creada (con id asignado)
     */
    async crearSerie(datos) {
        const res = await fetch(`${CONFIG.API_URL}/series`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datos)
        });

        const cuerpo = await res.json();

        if (!res.ok) {
            throw new Error(cuerpo.error || `Error al crear serie: HTTP ${res.status}`);
        }

        return cuerpo;
    },

    /**
     * Actualizar una serie existente.
     * @param {number} id
     * @param {Object} datos - solo los campos a actualizar
     * @returns {Promise<Object>} - la serie actualizada
     */
    async actualizarSerie(id, datos) {
        const res = await fetch(`${CONFIG.API_URL}/series/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datos)
        });

        const cuerpo = await res.json();

        if (!res.ok) {
            throw new Error(cuerpo.error || `Error al actualizar serie: HTTP ${res.status}`);
        }

        return cuerpo;
    },

    /**
     * Eliminar una serie por ID.
     * @param {number} id
     */
    async eliminarSerie(id) {
        const res = await fetch(`${CONFIG.API_URL}/series/${id}`, {
            method: "DELETE"
        });

        if (res.status === 404) {
            throw new Error("Serie no encontrada");
        }
        if (!res.ok) {
            throw new Error(`Error al eliminar serie: HTTP ${res.status}`);
        }
    }
};