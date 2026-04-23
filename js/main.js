// Script de prueba: hace fetch al backend y muestra la respuesta.

async function testBackend() {
    const statusEl = document.getElementById("status");
    const responseEl = document.getElementById("response");

    try {
        statusEl.textContent = "Conectando al backend...";
        statusEl.className = "loading";

        const res = await fetch(CONFIG.API_URL + "/");

        if (!res.ok) {
            throw new Error("HTTP " + res.status);
        }

        const data = await res.json();

        statusEl.textContent = "✓ Conexión exitosa";
        statusEl.className = "success";
        responseEl.textContent = JSON.stringify(data, null, 2);
    } catch (err) {
        statusEl.textContent = "✗ Error al conectar";
        statusEl.className = "error";
        responseEl.textContent = err.message;
    }
}

document.addEventListener("DOMContentLoaded", testBackend);