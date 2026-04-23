const Toast = {
    mostrar(mensaje, tipo = "info", duracion = 2500) {
        const contenedor = this._obtenerContenedor();

        const toast = document.createElement("div");
        toast.className = `toast toast--${tipo}`;
        toast.textContent = mensaje;

        contenedor.appendChild(toast);

        setTimeout(() => {
            toast.classList.add("toast--saliendo");
            setTimeout(() => toast.remove(), 200);
        }, duracion);
    },

    exito(mensaje) { this.mostrar(mensaje, "exito"); },
    error(mensaje) { this.mostrar(mensaje, "error"); },

    /**
     * Crea (si no existe) y devuelve el contenedor donde se apilan los toasts.
     */
    _obtenerContenedor() {
        let c = document.getElementById("toast-contenedor");
        if (!c) {
            c = document.createElement("div");
            c.id = "toast-contenedor";
            c.className = "toast-contenedor";
            document.body.appendChild(c);
        }
        return c;
    }
};