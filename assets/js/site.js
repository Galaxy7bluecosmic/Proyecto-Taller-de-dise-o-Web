import { obtenerSesion, prepararFormularios, protegerPagina } from "./modules/auth.js";
import { prepararHeader } from "./modules/navigation.js";
import { prepararCarrito, prepararPago } from "./modules/cart.js";
import { actualizarPerfil } from "./modules/profile.js";

document.addEventListener("DOMContentLoaded", iniciarSitio);

async function iniciarSitio() {
    prepararFormularios();

    const sesion = await obtenerSesion();
    protegerPagina(sesion);
    prepararHeader(sesion);
    prepararCarrito(sesion);
    actualizarPerfil(sesion);
    prepararPago();
}
