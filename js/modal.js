const Modal = {

    abrir(contenidoHTML) {
        const contenedor = document.getElementById("modal-contenedor");
        
        contenedor.innerHTML = `
            <div class="modal-overlay" id="modal-overlay-activo">
                <div class="modal" id="modal-activo">
                    ${contenidoHTML}
                </div>
            </div>
        `;

        // Cerrar al hacer click fuera del modal (en el overlay)
        const overlay = document.getElementById("modal-overlay-activo");
        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) {
                Modal.cerrar();
            }
        });

        // Cerrar con tecla Escape
        document.addEventListener("keydown", Modal._manejarEscape);

        // Bloquear scroll del fondo
        document.body.style.overflow = "hidden";
    },

    cerrar() {
        const contenedor = document.getElementById("modal-contenedor");
        contenedor.innerHTML = "";
        document.removeEventListener("keydown", Modal._manejarEscape);
        document.body.style.overflow = "";
    },

    _manejarEscape(e) {
        if (e.key === "Escape") {
            Modal.cerrar();
        }
    }
};