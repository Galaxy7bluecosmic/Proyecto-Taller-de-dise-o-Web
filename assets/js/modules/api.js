const API = "php/api/datos.php";

export async function apiGet(accion) {
    const respuesta = await fetch(`${API}?accion=${encodeURIComponent(accion)}`, {
        credentials: "same-origin"
    });
    return leerRespuesta(respuesta);
}

export async function apiPost(accion, datos = {}) {
    const respuesta = await fetch(`${API}?accion=${encodeURIComponent(accion)}`, {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos)
    });
    return leerRespuesta(respuesta);
}

async function leerRespuesta(respuesta) {
    const datos = await respuesta.json().catch(() => ({ ok: false, mensaje: "No se pudo leer la respuesta." }));
    if (!respuesta.ok || datos.ok === false) {
        throw new Error(datos.mensaje || "Ocurrió un error.");
    }
    return datos;
}

export function moneda(valor) {
    return `S/ ${Number(valor || 0).toFixed(2)}`;
}

export function escapar(texto) {
    const div = document.createElement("div");
    div.textContent = texto ?? "";
    return div.innerHTML;
}

export function leerImagenComoDataUrl(input) {
    return new Promise((resolve) => {
        const archivo = input.files?.[0];
        if (!archivo) return resolve("");
        const lector = new FileReader();
        lector.onload = () => resolve(String(lector.result || ""));
        lector.readAsDataURL(archivo);
    });
}
