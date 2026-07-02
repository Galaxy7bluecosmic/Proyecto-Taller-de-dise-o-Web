import { escaparHtml } from "./auth.js";

export function actualizarPerfil(sesion) {
    if (!sesion.logueado) return;

    document.querySelector(".banner_perfil .tag_fastfood")?.replaceChildren(document.createTextNode(sesion.nombre || "Usuario"));
    const correo = document.querySelector(".banner_perfil p");
    if (correo) correo.innerHTML = `<strong>Correo: </strong>${escaparHtml(sesion.email || "correo no registrado")}`;
}
