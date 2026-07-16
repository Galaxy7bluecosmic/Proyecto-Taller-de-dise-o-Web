import { apiPost, escapar, moneda } from "../../modules/api.js";
import { actualizarContadoresCarrito, cambiarCantidad, obtenerCarrito, quitarProducto, vaciarCarrito } from "../../modules/cart-store.js";
import { prepararFormulario, validarFormulario } from "../../modules/validation.js?v=2";

let sesionActual = {};
let metodoActual = "tarjeta";
let temporizadorPago = null;
let tokenPago = 0;
let datosPago = {};

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
                        <small class="stock_linea">${item.tipo === "promocion" ? "Promocion" : "Menu"} · Stock disponible: ${disponible}</small>
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
        datosPago = {
            ...datosPago,
            direccion: datosPago.direccion || sesionActual.direccion || "",
            telefono: datosPago.telefono || sesionActual.telefono || "",
            tarjeta: "",
            titular: nombreTitularUsuario(),
            fecha: "",
            cvv: ""
        };
        modal.classList.add("mostrar");
        pintarMetodo();
    });
    cerrar?.addEventListener("click", cerrarModalPago);

    document.querySelectorAll("[data-metodo]").forEach((boton) => {
        boton.addEventListener("click", () => {
            guardarDatosPago();
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
    const direccion = escapar(datosPago.direccion || sesionActual.direccion || "");
    const telefono = escapar(datosPago.telefono || sesionActual.telefono || "");
    const camposEntrega = `
        <div class="tarjeta_grid">
            <label class="campo_pago ancho">
                <span>Dirección de entrega</span>
                <input name="direccion" type="text" placeholder="Av Lima #123" value="${direccion}" required autocomplete="street-address">
            </label>
            <label class="campo_pago">
                <span>Celular</span>
                <input name="telefono" type="tel" inputmode="numeric" maxlength="9" placeholder="987654321" value="${telefono}" required autocomplete="tel">
            </label>
        </div>
    `;

    if (metodoActual === "tarjeta") {
        zona.innerHTML = `
            ${camposEntrega}
            <div class="tarjeta_grid campos_tarjeta">
                <label class="campo_pago ancho">
                    <span>Numero de tarjeta</span>
                    <input name="tarjeta" type="text" inputmode="numeric" maxlength="16" placeholder="4111111111111111" value="${escapar(datosPago.tarjeta || "")}" required>
                </label>
                <label class="campo_pago ancho">
                    <span>Nombre del titular</span>
                    <input name="titular" type="text" placeholder="Juan Perez" value="${escapar(datosPago.titular || "")}" required>
                </label>
                <label class="campo_pago">
                    <span>Fecha</span>
                    <input name="fecha" type="text" inputmode="numeric" maxlength="5" placeholder="08/28" value="${escapar(datosPago.fecha || "")}" required>
                </label>
                <label class="campo_pago">
                    <span>CVV</span>
                    <input name="cvv" type="password" inputmode="numeric" minlength="3" maxlength="4" placeholder="123" value="${escapar(datosPago.cvv || "")}" required>
                </label>
            </div>
            <p class="msg_error" data-error-pago></p>
            <button type="submit" id="btnPagar" class="btn_confirmar_pago">Confirmar pago</button>
        `;
        prepararValidacionesPago();
        return;
    }

    if (metodoActual === "yape") {
        zona.innerHTML = `
            ${camposEntrega}
            <div class="pago_simulado">
                <h3>Yape al 987 654 321</h3>
                <div class="qr_falso">QR</div>
                <p class="aviso_pago">Verifica que tu dirección y celular estén correctos antes de confirmar.</p>
                <p>Cuando hayas realizado el Yape, confirma para registrar el pedido.</p>
            </div>
            <p class="msg_error" data-error-pago></p>
            <button type="submit" id="btnPagar" class="btn_confirmar_pago">Ya pagué con Yape</button>
        `;
        prepararValidacionesPago();
        return;
    }

    zona.innerHTML = `
        ${camposEntrega}
        <div class="pago_simulado">
            <h3>Pago en efectivo BCP</h3>
            <p>Cuenta BCP: 191-23456789-0-99</p>
            <p>Acercate a una agencia, agente BCP o local Multired. Indica el codigo de pago 456789 y conserva tu comprobante.</p>
            <p class="aviso_pago">Se envio un correo a ${escapar(sesionActual.email)} con la informacion detallada para el pago. El pago debe realizarse en 1 hora o sera cancelado.</p>
            <button type="button" id="cancelarPagoPendiente">Cancelar pago</button>
        </div>
        <p class="msg_error" data-error-pago></p>
        <button type="submit" id="btnPagar" class="btn_confirmar_pago">Confirmar pago en efectivo</button>
    `;
    document.getElementById("cancelarPagoPendiente").addEventListener("click", cancelarPagoPendiente);
    prepararValidacionesPago();
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
    guardarDatosPago();
    const campos = camposPorMetodo();
    if (!validarFormulario(event.currentTarget, campos)) {
        mostrarErrorPago("Corrige los campos marcados en rojo. Tus datos correctos se mantendrán.");
        return;
    }
    procesarPago(metodoActual);
}

async function procesarPago(metodo = metodoActual) {
    cancelarTemporizador();
    guardarDatosPago();
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
        const direccion = datosPago.direccion || sesionActual.direccion || "";
        const resultado = await apiPost("checkout", { metodo_pago: metodo, direccion_envio: direccion, telefono: datosPago.telefono || "", items });
        vaciarCarrito(sesionActual);
        loader.innerHTML = `
            <div class="check_final">&#10003;</div>
            <h2 class="mensaje_exito">Gracias por su compra</h2>
            <p class="texto_exito">Su pedido esta siendo preparado</p>
        `;
        setTimeout(() => { window.location.href = `pedidos.html?pedido=${Number(resultado.id_pedido)}`; }, 1800);
    } catch (error) {
        pantalla.classList.remove("mostrarCarga");
        document.getElementById("modalPago")?.classList.add("mostrar");
        mostrarErrorPago(error.message);
    }
}

function cancelarPagoPendiente() {
    cancelarTemporizador();
    const zona = document.querySelector("[data-campos-pago]");
    zona.innerHTML = `<div class="pago_simulado"><h3>Pago cancelado</h3><p>Tu pedido sigue en el carrito.</p></div>`;
    setTimeout(cerrarModalPago, 1500);
}

function cerrarModalPago() {
    guardarDatosPago();
    cancelarTemporizador();
    document.getElementById("modalPago").classList.remove("mostrar");
}

function prepararValidacionesPago() {
    prepararFormulario(document.getElementById("formPago"), camposPorMetodo());
}

function camposPorMetodo() {
    const comunes = {
        '[name="direccion"]': "direccion",
        '[name="telefono"]': "telefono"
    };
    if (metodoActual !== "tarjeta") return comunes;
    return {
        ...comunes,
        '[name="tarjeta"]': "tarjeta",
        '[name="titular"]': "titular",
        '[name="fecha"]': "fechaTarjeta",
        '[name="cvv"]': "cvv"
    };
}

function guardarDatosPago() {
    document.querySelectorAll("#formPago input").forEach((input) => {
        datosPago[input.name] = input.value;
    });
}

function mostrarErrorPago(mensaje) {
    const error = document.querySelector("[data-error-pago]");
    if (error) error.textContent = mensaje || "";
}

function nombreTitularUsuario() {
    return `${sesionActual.nombre || ""} ${sesionActual.apellido || ""}`.trim();
}
