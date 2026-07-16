import { prepararFormulario, validarFormulario, mostrarError } from "./validation.js?v=2";

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

    prepararValidacionLogin();
    prepararValidacionRegistro();
    mostrarErrorFormulario(error);
}

function prepararValidacionLogin() {
    const formulario = document.getElementById("login");
    if (!formulario) return;
    const campos = {
        '[name="loginEmail"]': "email",
        '[name="loginPass"]': "password"
    };
    prepararFormulario(formulario, campos);

    formulario.addEventListener("submit", (event) => {
        if (!validarFormulario(formulario, campos)) {
            event.preventDefault();
            escribirError("errorLogin", "Corrige los campos marcados en rojo para iniciar sesión.");
        }
    });
}

function prepararValidacionRegistro() {
    const formulario = document.getElementById("register");
    if (!formulario) return;
    const campos = {
        '[name="regNombre"]': "nombre",
        '[name="regApellido"]': "apellido",
        '[name="regEmail"]': "email",
        '[name="regTelefono"]': "telefono",
        '[name="regDireccion"]': "direccion",
        '[name="regPass"]': "passwordFuerte"
    };
    prepararFormulario(formulario, campos);
    restaurarRegistro();
    const confirmar = document.getElementById("regPass2");
    confirmar?.addEventListener("input", () => validarConfirmacionPassword());

    formulario.addEventListener("submit", (event) => {
        const camposOk = validarFormulario(formulario, campos);
        const confirmacionOk = validarConfirmacionPassword();

        if (!camposOk || !confirmacionOk) {
            event.preventDefault();
            escribirError("errorRegistro", "Corrige los campos marcados en rojo para crear tu cuenta.");
            guardarRegistro();
            return;
        }
        guardarRegistro();
    });
}

function validarConfirmacionPassword() {
    const pass = document.getElementById("regPass")?.value || "";
    const confirmar = document.getElementById("regPass2");
    if (!confirmar) return true;
    const mensaje = confirmar.value && pass === confirmar.value
        ? ""
        : "Las contraseñas no coinciden. Ejemplo: repite exactamente Bocados123";
    mostrarError(confirmar, mensaje);
    return !mensaje;
}

function mostrarErrorFormulario(error) {
    if (!error) return;

    const mensajes = {
        campos: "Completa todos los campos obligatorios.",
        credenciales: "Correo o contraseña incorrectos.",
        email: "Ese correo ya está registrado.",
        validacion: "Revisa los campos marcados. Hay datos con formato inválido.",
        registro: "No se pudo completar el registro. Inténtalo nuevamente."
    };

    const contenedor = document.getElementById("errorLogin") || document.getElementById("errorRegistro");
    if (error === "email") {
        mostrarError(document.getElementById("regEmail"), "Ese correo ya está registrado. Usa otro correo.");
        return;
    }
    if (error === "validacion" && document.getElementById("register")) {
        validarFormulario(document.getElementById("register"), {
            '[name="regNombre"]': "nombre",
            '[name="regApellido"]': "apellido",
            '[name="regEmail"]': "email",
            '[name="regTelefono"]': "telefono",
            '[name="regDireccion"]': "direccion",
            '[name="regPass"]': "passwordFuerte"
        });
    }
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

function guardarRegistro() {
    const formulario = document.getElementById("register");
    if (!formulario) return;
    const datos = {};
    ["regNombre", "regApellido", "regEmail", "regTelefono", "regDireccion"].forEach((id) => {
        datos[id] = document.getElementById(id)?.value || "";
    });
    localStorage.setItem("registroBocadosPendiente", JSON.stringify(datos));
}

function restaurarRegistro() {
    const tieneError = new URLSearchParams(window.location.search).has("error");
    if (!tieneError) {
        localStorage.removeItem("registroBocadosPendiente");
        return;
    }
    const guardado = localStorage.getItem("registroBocadosPendiente");
    if (!guardado) return;
    const datos = JSON.parse(guardado);
    Object.entries(datos).forEach(([id, valor]) => {
        const input = document.getElementById(id);
        if (input && !input.value) input.value = valor;
    });
}
