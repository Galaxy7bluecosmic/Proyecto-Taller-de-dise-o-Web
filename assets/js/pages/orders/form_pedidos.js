import { apiPost, escapar, moneda } from "../../modules/api.js";
import { actualizarContadoresCarrito, cambiarCantidad, obtenerCarrito, quitarProducto, vaciarCarrito } from "../../modules/cart-store.js";

let sesionActual = {};
let metodoActual = "tarjeta";
let temporizadorPago = null;
let tokenPago = 0;

export function iniciarFormularioPedidos(sesion) {
    if (!document.querySelector("[data-carrito-lista]")) return;
    sesionActual = sesion;
    pintarCarrito();
    prepararModal();
    window.addEventListener("carrito:actualizado", pintarCarrito);
}

function pintarCarrito() {
    const lista = document.querySelector("[data-carrito-lista]");
    const totalTexto = document.querySelector("[data-carrito-total]");
    const botonPagar = document.getElementById("abrirModal");
    const items = obtenerCarrito(sesionActual);

    if (!items.length) {
        lista.innerHTML = `<div class="mensaje_vacio grande">Sin pedidos</div>`;
        totalTexto.textContent = moneda(0);
        botonPagar.disabled = true;
        actualizarContadoresCarrito(sesionActual);
        return;
    }

    lista.innerHTML = items.map((item) => {
        const sinStock = Number(item.cantidad) >= Number(item.stock);
        const disponible = Math.max(Number(item.stock) - Number(item.cantidad), 0);
        return `
            <article class="producto producto_carrito">
                <div class="producto_grid">
                    <div class="producto_imagen">
                        <img src="${escapar(item.imagen)}" alt="${escapar(item.nombre)}">
                    </div>
                    <div class="producto_info">
                        <h3>${escapar(item.nombre)}</h3>
                        <p>${escapar(item.descripcion)}</p>
                        <span class="precio">${moneda(item.precio)}</span>
                        <small class="stock_linea">${item.tipo === "promocion" ? "Promoción" : "Menú"} · Stock disponible: ${disponible}</small>
                    </div>
                    <div class="producto_acciones">
                        <button class="btn_cantidad" data-restar="${item.tipo}:${item.id}" type="button">-</button>
                        <div class="cantidad">${Number(item.cantidad)}</div>
                        <button class="btn_cantidad ${sinStock ? "deshabilitado" : ""}" data-sumar="${item.tipo}:${item.id}" type="button" ${sinStock ? "disabled" : ""}>+</button>
                        <button class="btn_eliminar" data-quitar="${item.tipo}:${item.id}" type="button">Eliminar</button>
                    </div>
                </div>
            </article>
        `;
    }).join("");

    lista.querySelectorAll("[data-sumar]").forEach((boton) => boton.addEventListener("click", () => cambiarDesdeBoton(boton.dataset.sumar, 1)));
    lista.querySelectorAll("[data-restar]").forEach((boton) => boton.addEventListener("click", () => cambiarDesdeBoton(boton.dataset.restar, -1)));
    lista.querySelectorAll("[data-quitar]").forEach((boton) => boton.addEventListener("click", () => quitarDesdeBoton(boton.dataset.quitar)));

    const total = items.reduce((suma, item) => suma + Number(item.precio) * Number(item.cantidad), 0);
    totalTexto.textContent = moneda(total);
    botonPagar.disabled = false;
    actualizarContadoresCarrito(sesionActual);
}

function cambiarDesdeBoton(valor, delta) {
    const [tipo, id] = valor.split(":");
    cambiarCantidad(sesionActual, tipo, id, delta);
}

function quitarDesdeBoton(valor) {
    const [tipo, id] = valor.split(":");
    quitarProducto(sesionActual, tipo, id);
}

function prepararModal() {
    const abrirModal = document.getElementById("abrirModal");
    const modal = document.getElementById("modalPago");
    const cerrar = document.querySelector("[data-cerrar-pago]");
    if (!abrirModal || !modal) return;

    abrirModal.addEventListener("click", () => {
        metodoActual = "tarjeta";
        modal.classList.add("mostrar");
        pintarMetodo();
    });
    cerrar?.addEventListener("click", cerrarModalPago);

    document.querySelectorAll("[data-metodo]").forEach((boton) => {
        boton.addEventListener("click", () => {
            metodoActual = boton.dataset.metodo;
            pintarMetodo();
        });
    });

    document.getElementById("formPago")?.addEventListener("submit", confirmarPago);
}

function cancelarTemporizador() {
    tokenPago += 1;
    clearTimeout(temporizadorPago);
    temporizadorPago = null;
}

function pintarMetodo() {
    cancelarTemporizador();
    document.querySelectorAll("[data-metodo]").forEach((boton) => boton.classList.toggle("activo", boton.dataset.metodo === metodoActual));
    const zona = document.querySelector("[data-campos-pago]");

    if (metodoActual === "tarjeta") {
        zona.innerHTML = `
            <div class="tarjeta_grid">
                <label class="campo_pago ancho">
                    <span>Dirección</span>
                    <input name="direccion" type="text" placeholder="Distrito, calle, número" required>
                </label>
                <label class="campo_pago">
                    <span>Teléfono</span>
                    <input name="telefono" type="text" placeholder="+51 999 999 999" required>
                </label>
                <label class="campo_pago ancho">
                    <span>Número de tarjeta</span>
                    <input name="tarjeta" type="text" minlength="12" placeholder="1234 5678 9123 4567" required>
                </label>
                <label class="campo_pago ancho">
                    <span>Nombre del titular</span>
                    <input name="titular" type="text" placeholder="Nombre completo" required>
                </label>
                <label class="campo_pago">
                    <span>Fecha</span>
                    <input name="fecha" type="text" placeholder="MM/AA" required>
                </label>
                <label class="campo_pago">
                    <span>CVV</span>
                    <input name="cvv" type="password" minlength="3" maxlength="4" placeholder="123" required>
                </label>
            </div>
            <button type="submit" id="btnPagar" class="btn_confirmar_pago">Confirmar pago</button>
        `;
        return;
    }

    if (metodoActual === "yape") {
        zona.innerHTML = `
            <div class="pago_simulado">
                <h3>Yape al 987 654 321</h3>
                <div class="qr_falso">QR</div>
                <p>La página se actualizará una vez se haya pagado.</p>
                <small>Esperando confirmación simulada por 10 segundos.</small>
            </div>
        `;
        iniciarPagoAutomatico("yape");
        return;
    }

    zona.innerHTML = `
        <div class="pago_simulado">
            <h3>Pago en efectivo BCP</h3>
            <p>Cuenta BCP: 191-23456789-0-99</p>
            <p>Acércate a una agencia, agente BCP o local Multired. Indica el código de pago 456789 y conserva tu comprobante.</p>
            <p class="aviso_pago">Se envió un correo a ${escapar(sesionActual.email)} con la información detallada para el pago, el pago debe realizarce en 1 hora o será cancelado, no podrá continuar hasta realizar el pago o cancelarlo.</p>
            <button type="button" id="cancelarPagoPendiente">Cancelar pago</button>
            <small>Esperando confirmación simulada por 10 segundos.</small>
        </div>
    `;
    document.getElementById("cancelarPagoPendiente").addEventListener("click", cancelarPagoPendiente);
    iniciarPagoAutomatico("efectivo");
}

function iniciarPagoAutomatico(metodo) {
    const tokenActual = tokenPago;
    temporizadorPago = setTimeout(() => {
        if (metodoActual !== metodo || tokenActual !== tokenPago) return;
        procesarPago(metodo);
    }, 10000);
}

function confirmarPago(event) {
    event.preventDefault();
    if (metodoActual !== "tarjeta") return;
    if (!event.currentTarget.checkValidity()) {
        event.currentTarget.reportValidity();
        return;
    }
    procesarPago("tarjeta");
}

async function procesarPago(metodo = metodoActual) {
    cancelarTemporizador();
    const pantalla = document.getElementById("pantallaCarga");
    const loader = document.querySelector(".loader");
    document.getElementById("modalPago")?.classList.remove("mostrar");
    loader.innerHTML = `
        <div class="spinner"></div>
        <h2>Procesando pago...</h2>
    `;
    pantalla.classList.add("mostrarCarga");

    try {
        const items = obtenerCarrito(sesionActual).map((item) => ({ tipo: item.tipo, id: item.id, cantidad: item.cantidad }));
        await apiPost("checkout", { metodo_pago: metodo, items });
        vaciarCarrito(sesionActual);
        loader.innerHTML = `
            <div class="check_final">&#10003;</div>
            <h2 class="mensaje_exito">Gracias por su compra</h2>
            <p class="texto_exito">Su pedido está siendo preparado</p>
        `;
        setTimeout(() => { window.location.href = "pedidos.html"; }, 1800);
    } catch (error) {
        pantalla.classList.remove("mostrarCarga");
        alert(error.message);
    }
}

function cancelarPagoPendiente() {
    cancelarTemporizador();
    const zona = document.querySelector("[data-campos-pago]");
    zona.innerHTML = `<div class="pago_simulado"><h3>Pago cancelado</h3><p>Tu pedido sigue en el carrito.</p></div>`;
    setTimeout(cerrarModalPago, 1500);
}

function cerrarModalPago() {
    cancelarTemporizador();
    document.getElementById("modalPago").classList.remove("mostrar");
}
