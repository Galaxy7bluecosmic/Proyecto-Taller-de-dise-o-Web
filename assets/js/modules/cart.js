import { protegerEnlace } from "./auth.js";
import { actualizarContadoresCarrito } from "./cart-store.js";

export function prepararCarrito(sesion) {
    document.querySelectorAll(".carrito_flotante").forEach((carrito) => {
        carrito.href = "form_pedidos.html";
        carrito.addEventListener("click", (event) => protegerEnlace(event, sesion));
    });

    actualizarContadoresCarrito(sesion);
    window.addEventListener("carrito:actualizado", () => actualizarContadoresCarrito(sesion));
    window.addEventListener("storage", () => actualizarContadoresCarrito(sesion));

    document.querySelectorAll('a[href="pedidos.html"], a[href="form_pedidos.html"]').forEach((enlace) => {
        enlace.addEventListener("click", (event) => protegerEnlace(event, sesion));
    });
}

export function prepararPago() {
    const btnPagar = document.getElementById("btnPagar");
    if (!btnPagar) return;

    btnPagar.addEventListener("click", () => {
        setTimeout(() => {
            window.location.href = "pedidos.html";
        }, 5600);
    });
}
