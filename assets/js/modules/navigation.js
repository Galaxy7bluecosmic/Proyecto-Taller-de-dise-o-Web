import { escaparHtml, protegerEnlace } from "./auth.js";

export function prepararHeader(sesion) {
    const header = document.querySelector("header");
    if (!header) return;

    header.querySelectorAll(".contenedorBotonSesio, .acciones_header, .btn_login").forEach((elemento) => elemento.remove());
    header.appendChild(crearBotonMenu());
    header.appendChild(crearMenuMovil(sesion));
    header.appendChild(crearZonaSesion(sesion));
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
                    <img src="img/cerrar-sesion.png" alt="" width="20">
                    <a href="php/auth/cerrar-sesion.php" class="btn_cerrar">Cerrar sesión</a>
                </div>
            </div>
        </div>
    `;

    const boton = contenedor.querySelector(".usuario_logueado");
    const menu = contenedor.querySelector(".user-menu");
    const flecha = contenedor.querySelector("#avatarAbajo");

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

    return contenedor;
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
