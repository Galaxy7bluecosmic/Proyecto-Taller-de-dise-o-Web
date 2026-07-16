import { obtenerSesion, prepararFormularios, protegerPagina } from "./modules/auth.js?v=9";
import { prepararHeader } from "./modules/navigation.js?v=8";
import { prepararCarrito, prepararPago } from "./modules/cart.js?v=6";
import { actualizarPerfil } from "./modules/profile.js";
import { iniciarMenu } from "./pages/menu/menu.js?v=9";
import { iniciarPromociones } from "./pages/promotions/promociones.js?v=9";
import { iniciarFormularioPedidos } from "./pages/orders/form_pedidos.js?v=11";
import { iniciarPedidos } from "./pages/orders/pedidos.js?v=8";
import { iniciarMostrarContrasena } from "./pages/auth/password.js?v=7";

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
