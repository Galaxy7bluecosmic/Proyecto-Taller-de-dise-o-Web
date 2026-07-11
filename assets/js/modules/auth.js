export const paginasProtegidas = ["pedidos.html", "form_pedidos.html"];

export function rutaActual() {
    return window.location.pathname.split("/").pop() || "index.html";
}

export async function obtenerSesion() {
    try {
        const respuesta = await fetch("php/api/sesion.php", { credentials: "same-origin" });
        return await respuesta.json();
    } catch (error) {
        return { logueado: false, nombre: "", email: "", direccion: "" };
    }
}

export function protegerPagina(sesion) {
    const pagina = rutaActual();

    if (!sesion.logueado && paginasProtegidas.includes(pagina)) {
        window.location.href = `login.html?next=${encodeURIComponent(pagina)}`;
    }
}

export function protegerEnlace(event, sesion) {
    const destino = event.currentTarget.getAttribute("href") || "login.html";
    const requiereLogin = paginasProtegidas.some((pagina) => destino.endsWith(pagina)) ||
        event.currentTarget.dataset.requiereLogin === "true";

    if (requiereLogin && !sesion.logueado) {
        event.preventDefault();
        window.location.href = `login.html?next=${encodeURIComponent(destino)}`;
    }
}

export function prepararFormularios() {
    const parametros = new URLSearchParams(window.location.search);
    const siguiente = parametros.get("next");
    const error = parametros.get("error");

    if (siguiente) {
        document.querySelectorAll('form[action="php/auth/login.php"], form[action="php/auth/registro.php"]').forEach((formulario) => {
            const input = document.createElement("input");
            input.type = "hidden";
            input.name = "next";
            input.value = siguiente;
            formulario.appendChild(input);
        });
    }

    mostrarErrorFormulario(error);
    prepararValidacionLogin();
    prepararValidacionRegistro();
}

function prepararValidacionLogin() {
    const formulario = document.getElementById("login");
    if (!formulario) return;

    formulario.addEventListener("submit", (event) => {
        const email = document.getElementById("loginEmail")?.value.trim();
        const pass = document.getElementById("loginPass")?.value.trim();

        if (!email || !pass) {
            event.preventDefault();
            escribirError("errorLogin", "Completa tu correo y contraseña.");
        }
    });
}

function prepararValidacionRegistro() {
    const formulario = document.getElementById("register");
    if (!formulario) return;

    formulario.addEventListener("submit", (event) => {
        const nombre = document.getElementById("regNombre")?.value.trim();
        const apellido = document.getElementById("regApellido")?.value.trim();
        const email = document.getElementById("regEmail")?.value.trim();
        const direccion = document.getElementById("regDireccion")?.value.trim();
        const pass = document.getElementById("regPass")?.value;
        const pass2 = document.getElementById("regPass2")?.value;

        if (!nombre || !apellido || !email || !direccion || !pass) {
            event.preventDefault();
            escribirError("errorRegistro", "Completa todos los campos obligatorios.");
            return;
        }

        if (pass !== pass2) {
            event.preventDefault();
            escribirError("errorRegistro", "Las contraseñas no coinciden.");
        }
    });
}

function mostrarErrorFormulario(error) {
    if (!error) return;

    const mensajes = {
        campos: "Completa todos los campos obligatorios.",
        credenciales: "Correo o contraseña incorrectos.",
        email: "Ese correo ya está registrado.",
        registro: "No se pudo completar el registro. Inténtalo nuevamente."
    };

    const contenedor = document.getElementById("errorLogin") || document.getElementById("errorRegistro");
    if (contenedor) {
        contenedor.textContent = mensajes[error] || "Ocurrió un error. Inténtalo nuevamente.";
    }
}

function escribirError(id, mensaje) {
    const contenedor = document.getElementById(id);
    if (contenedor) contenedor.textContent = mensaje;
}

export function escaparHtml(texto) {
    const div = document.createElement("div");
    div.textContent = texto;
    return div.innerHTML;
}
