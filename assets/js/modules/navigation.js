import { escaparHtml, protegerEnlace } from "./auth.js";
import { apiPost } from "./api.js";

export function prepararHeader(sesion) {
    const header = document.querySelector("header");
    if (!header) return;

    header.querySelectorAll(".contenedorBotonSesio, .acciones_header, .btn_login").forEach((elemento) => elemento.remove());
    header.appendChild(crearBotonMenu());
    header.appendChild(crearMenuMovil(sesion));
    if (sesion.admin) header.appendChild(crearBotonGuardarAdmin());
    header.appendChild(crearZonaSesion(sesion));
}

function crearBotonGuardarAdmin() {
    const boton = document.createElement("button");
    boton.className = "btn_guardar_admin";
    boton.type = "button";
    boton.textContent = "Guardar cambios";
    boton.addEventListener("click", () => {
        const aviso = document.createElement("div");
        aviso.className = "aviso_admin_guardado";
        aviso.textContent = "Cambios guardados en la base de datos.";
        document.body.appendChild(aviso);
        setTimeout(() => aviso.remove(), 2200);
    });
    return boton;
}

function crearZonaSesion(sesion) {
    const contenedor = document.createElement("div");
    contenedor.className = "site-auth";

    if (!sesion.logueado) {
        contenedor.innerHTML = `<a href="login.html" class="btn_login"><span>Acceder</span></a>`;
        return contenedor;
    }

    const nombre = escaparHtml(sesion.nombre || "Usuario");
    contenedor.innerHTML = `
        <button class="usuario_logueado" type="button" aria-expanded="false">
            <span>
                <img src="img/avatar.png" alt="avatar" id="avatarIcon">
                <p>${nombre}</p>
                <img src="img/abajo.png" alt="" id="avatarAbajo">
            </span>
        </button>
        <div class="menuDesplegable user-menu" hidden>
            <div class="contenedorMenuPerfil">
                <div class="MenuPerfil">
                    <span class="menu_icono" aria-hidden="true">⌂</span>
                    <button class="btn_menu_perfil" type="button" data-cambiar-direccion>Cambiar dirección</button>
                </div>
                <div class="MenuPerfil">
                    <img src="img/cerrar-sesion.png" alt="" width="20">
                    <a href="php/auth/cerrar-sesion.php" class="btn_cerrar">Cerrar sesión</a>
                </div>
            </div>
        </div>
    `;

    const boton = contenedor.querySelector(".usuario_logueado");
    const menu = contenedor.querySelector(".user-menu");
    const flecha = contenedor.querySelector("#avatarAbajo");
    const cambiarDireccion = contenedor.querySelector("[data-cambiar-direccion]");

    boton.addEventListener("click", (event) => {
        event.stopPropagation();
        const abierto = menu.hasAttribute("hidden");
        menu.toggleAttribute("hidden", !abierto);
        boton.setAttribute("aria-expanded", String(abierto));
        if (flecha) flecha.src = abierto ? "img/subir.png" : "img/abajo.png";
    });

    document.addEventListener("click", () => {
        menu.setAttribute("hidden", "");
        boton.setAttribute("aria-expanded", "false");
        if (flecha) flecha.src = "img/abajo.png";
    });

    cambiarDireccion?.addEventListener("click", (event) => {
        event.stopPropagation();
        menu.setAttribute("hidden", "");
        abrirModalDireccion(sesion);
    });

    return contenedor;
}

function abrirModalDireccion(sesion) {
    let modal = document.getElementById("modalDireccionUsuario");
    if (!modal) {
        modal = document.createElement("div");
        modal.className = "modal modal_direccion";
        modal.id = "modalDireccionUsuario";
        document.body.appendChild(modal);
    }

    modal.innerHTML = `
        <div class="modal_contenido modal_direccion_contenido">
            <button class="cerrar_modal" type="button" data-cerrar-direccion>×</button>
            <h2>Cambiar dirección</h2>
            <p>Esta dirección se usará como destino por defecto en tus próximos pedidos.</p>
            <form data-form-direccion>
                <label class="campo_direccion">
                    <span>Dirección de delivery</span>
                    <input name="direccion" type="text" value="${escaparHtml(sesion.direccion || "")}" placeholder="Distrito, calle, número y referencia" required>
                </label>
                <button type="submit">Guardar dirección</button>
                <small data-mensaje-direccion></small>
            </form>
        </div>
    `;
    modal.classList.add("mostrar");

    modal.querySelector("[data-cerrar-direccion]").addEventListener("click", () => modal.classList.remove("mostrar"));
    modal.onclick = (event) => {
        if (event.target === modal) modal.classList.remove("mostrar");
    };

    modal.querySelector("[data-form-direccion]").addEventListener("submit", async (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const mensaje = form.querySelector("[data-mensaje-direccion]");
        const direccion = form.direccion.value.trim();
        if (!direccion) {
            mensaje.textContent = "Escribe una dirección válida.";
            return;
        }
        try {
            const respuesta = await apiPost("actualizar_direccion", { direccion });
            sesion.direccion = respuesta.direccion;
            if (window.__SESION_ACTUAL__) window.__SESION_ACTUAL__.direccion = respuesta.direccion;
            mensaje.textContent = "Dirección actualizada.";
            setTimeout(() => modal.classList.remove("mostrar"), 900);
        } catch (error) {
            mensaje.textContent = error.message;
        }
    });
}

function crearBotonMenu() {
    const boton = document.createElement("button");
    boton.className = "menu-toggle";
    boton.type = "button";
    boton.setAttribute("aria-label", "Abrir menú");
    boton.innerHTML = `<span></span><span></span><span></span>`;
    boton.addEventListener("click", () => {
        document.body.classList.toggle("menu-movil-abierto");
    });
    return boton;
}

function crearMenuMovil(sesion) {
    const menu = document.createElement("nav");
    menu.className = "mobile-menu";
    const acceso = sesion.logueado
        ? `<a href="php/auth/cerrar-sesion.php">Cerrar sesión</a>`
        : `<a href="login.html">Acceder</a>`;

    menu.innerHTML = `
        <a href="index.html">Inicio</a>
        <a href="menu.html">Menú</a>
        <a href="promociones.html">Promociones</a>
        <a href="pedidos.html" data-requiere-login="true">Pedidos</a>
        ${acceso}
    `;

    menu.querySelectorAll("a").forEach((enlace) => {
        enlace.addEventListener("click", (event) => protegerEnlace(event, sesion));
    });

    return menu;
}
