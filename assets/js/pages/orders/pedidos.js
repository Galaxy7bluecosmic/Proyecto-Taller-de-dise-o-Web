import { apiGet, apiPost, escapar, moneda } from "../../modules/api.js";

let pedidos = [];
let sesionActual = {};
let pedidoSeleccionado = null;

export async function iniciarPedidos(sesion) {
    if (!document.querySelector("[data-lista-pedidos]")) return;
    sesionActual = sesion;
    await cargarPedidos();
    setInterval(pintarPedidos, 30000);
}

async function cargarPedidos() {
    const datos = await apiGet("pedidos");
    pedidos = datos.pedidos;
    pintarPedidos();
}

function pintarPedidos() {
    const contenedor = document.querySelector("[data-lista-pedidos]");
    if (!pedidos.length) {
        contenedor.innerHTML = `<div class="mensaje_vacio grande">Sin pedidos</div>`;
        return;
    }

    contenedor.innerHTML = pedidos.map((pedido) => {
        return pedido.detalles.map((detalle) => {
            const estado = estadoDetalle(pedido, detalle);
            return `
            <article class="card_pedido ${estado.clase}">
                <div class="foto_comida">
                    <img src="${escapar(detalle.imagen)}" alt="${escapar(detalle.nombre)}">
                </div>
                <div class="info_comida">
                    <h4>${escapar(detalle.nombre)}</h4>
                    <p>${escapar(detalle.descripcion)}</p>
                    <small>Pedido #${Number(pedido.numero_pedido || pedido.id_pedido)} · ${escapar(pedido.metodo_pago)}</small>
                </div>
                <div class="valores_comida">
                    <span class="cantidad">Cant: ${Number(detalle.cantidad)}</span>
                    <span class="precio_total">${moneda(Number(detalle.precio) * Number(detalle.cantidad))}</span>
                </div>
                <div class="estado_pedido">
                    <span class="status ${estado.badge}">${estado.texto}</span>
                    ${estado.puedeCancelar ? `<button class="btn_cancelar" data-cancelar-detalle="${Number(detalle.id_detalle)}" type="button">Cancelar Pedido</button>` : ""}
                </div>
            </article>
        `;
        }).join("");
    }).join("");

    contenedor.querySelectorAll("[data-cancelar-detalle]").forEach((boton) => {
        boton.addEventListener("click", () => abrirModalCancelar(Number(boton.dataset.cancelarDetalle)));
    });
}

function estadoDetalle(pedido, detalle) {
    if (detalle.estado === "cancelado" || pedido.estado === "cancelado") {
        return { texto: "Cancelado", clase: "cancelado", badge: "badge_cancelado", puedeCancelar: false };
    }
    const creado = new Date(String(pedido.creado_en).replace(" ", "T"));
    const minutos = (Date.now() - creado.getTime()) / 60000;
    if (minutos >= Number(detalle.demoraAPROX || 20)) return { texto: "Entregado", clase: "entregado", badge: "badge_entregado", puedeCancelar: false };
    return { texto: "En camino", clase: "en_camino", badge: "badge_camino", puedeCancelar: true };
}

function abrirModalCancelar(idDetalle) {
    pedidoSeleccionado = idDetalle;
    const modal = document.getElementById("modalCancelarPedido");
    modal.querySelector("[data-mensaje-cancelar]").innerHTML = `
        <h2>¿Está seguro?</h2>
        <p>Si cancela este pedido, el stock volverá al menú o a promociones según corresponda.</p>
        <div class="modal_acciones">
            <button type="button" data-confirmar-cancelacion>Sí</button>
            <button type="button" data-cerrar-cancelacion>No</button>
        </div>
    `;
    modal.classList.add("mostrar");
    modal.querySelector("[data-cerrar-cancelacion]").addEventListener("click", cerrarModalCancelar);
    modal.querySelector("[data-confirmar-cancelacion]").addEventListener("click", confirmarCancelacion);
}

async function confirmarCancelacion() {
    await apiPost("cancelar", { id_detalle: pedidoSeleccionado });
    const modal = document.getElementById("modalCancelarPedido");
    modal.querySelector("[data-mensaje-cancelar]").innerHTML = `
        <h2>Pedido cancelado</h2>
        <p>Enviamos un correo a ${escapar(sesionActual.email)} donde encontrará ver más detalles de reembolso.</p>
    `;
    await cargarPedidos();
    setTimeout(cerrarModalCancelar, 2500);
}

function cerrarModalCancelar() {
    document.getElementById("modalCancelarPedido").classList.remove("mostrar");
}
