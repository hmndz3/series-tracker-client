const Exportar = {

    async aCSV() {
        try {
            // Traemos TODAS las series (limit alto para evitar paginación)
            const respuesta = await API.listarSeries({ limit: 1000 });
            const series = respuesta.datos;

            if (series.length === 0) {
                alert("No hay series para exportar.");
                return;
            }

            const contenidoCSV = this._generarCSV(series);
            this._descargar(contenidoCSV);
        } catch (err) {
            console.error(err);
            alert("Error al exportar: " + err.message);
        }
    },

    
    _generarCSV(series) {
        // Definimos las columnas del CSV. El orden importa.
        const columnas = [
            { clave: "id",               titulo: "ID" },
            { clave: "titulo",           titulo: "Título" },
            { clave: "descripcion",      titulo: "Descripción" },
            { clave: "estado",           titulo: "Estado" },
            { clave: "calificacion",     titulo: "Calificación" },
            { clave: "episodios_total",  titulo: "Total Episodios" },
            { clave: "episodios_vistos", titulo: "Episodios Vistos" },
            { clave: "imagen_url",       titulo: "URL Imagen" },
            { clave: "creado_en",        titulo: "Fecha Creación" }
        ];

        // Encabezado
        const encabezado = columnas.map(c => this._escaparCampo(c.titulo)).join(",");

        // Filas de datos
        const filas = series.map(serie => {
            return columnas
                .map(col => this._escaparCampo(this._formatearValor(serie[col.clave], col.clave)))
                .join(",");
        });


        return "\uFEFF" + encabezado + "\r\n" + filas.join("\r\n");
    },


    _escaparCampo(valor) {
        if (valor === null || valor === undefined) return "";
        const texto = String(valor);

        if (texto.includes(",") || texto.includes('"') || texto.includes("\n") || texto.includes("\r")) {
            return '"' + texto.replace(/"/g, '""') + '"';
        }
        return texto;
    },


    _formatearValor(valor, clave) {
        if (valor === null || valor === undefined) return "";

        if (clave === "creado_en") {
            // Fecha en formato legible: "23/04/2026 14:30"
            const fecha = new Date(valor);
            if (isNaN(fecha)) return "";
            return fecha.toLocaleString("es-ES", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit"
            });
        }

        if (clave === "estado") {
            return traducirEstado(valor);
        }

        return valor;
    },


    _descargar(contenido) {
        const blob = new Blob([contenido], { type: "text/csv;charset=utf-8" });
        const url = URL.createObjectURL(blob);

        // Nombre del archivo con fecha para evitar sobrescribir descargas
        const fecha = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
        const nombreArchivo = `series-tracker-${fecha}.csv`;

        // Truco estándar: enlace invisible → click programático → limpieza
        const enlace = document.createElement("a");
        enlace.href = url;
        enlace.download = nombreArchivo;
        document.body.appendChild(enlace);
        enlace.click();
        document.body.removeChild(enlace);

        // Liberar memoria del Blob después de 1 segundo
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
};