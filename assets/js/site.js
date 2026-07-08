import { obtenerSesion, prepararFormularios, protegerPagina } from "./modules/auth.js";
import { prepararHeader } from "./modules/navigation.js";
import { prepararCarrito, prepararPago } from "./modules/cart.js?v=5";
import { actualizarPerfil } from "./modules/profile.js";
import { iniciarMenu } from "../../JSscripts/menu/menu.js?v=5";
import { iniciarPromociones } from "../../JSscripts/promociones/promociones.js?v=5";
import { iniciarFormularioPedidos } from "../../JSscripts/form_pedidos/form_pedidos.js?v=5";
import { iniciarPedidos } from "../../JSscripts/pedidos/pedidos.js?v=5";
import { iniciarMostrarContrasena } from "../../JSscripts/auth/password.js?v=5";

document.addEventListener("DOMContentLoaded", iniciarSitio);

async function iniciarSitio() {
    prepararFormularios();
    iniciarMostrarContrasena();

    const sesion = await obtenerSesion();
    window.__SESION_ACTUAL__ = sesion;
    protegerPagina(sesion);
    prepararHeader(sesion);
    prepararCarrito(sesion);
    actualizarPerfil(sesion);
    prepararPago();
    await iniciarMenu(sesion);
    await iniciarPromociones(sesion);
    iniciarFormularioPedidos(sesion);
    await iniciarPedidos(sesion);
}
