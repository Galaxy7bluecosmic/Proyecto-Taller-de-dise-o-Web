import { protegerEnlace } from "./auth.js";

export function prepararCarrito(sesion) {
    document.querySelectorAll(".carrito_flotante").forEach((carrito) => {
        carrito.href = "form_pedidos.html";
        carrito.addEventListener("click", (event) => protegerEnlace(event, sesion));
    });

    document.querySelectorAll(".card_producto button, .promo_grande button, .mini_card button").forEach((boton) => {
        boton.addEventListener("click", (event) => {
            if (!sesion.logueado) {
                event.preventDefault();
                window.location.href = "login.html?next=form_pedidos.html";
                return;
            }

            const contador = document.querySelector(".carrito_flotante span");
            if (contador) contador.textContent = String(Number(contador.textContent || 0) + 1);
        });
    });

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
