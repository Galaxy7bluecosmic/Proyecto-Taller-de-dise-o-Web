import { apiGet, apiPost, escapar, moneda } from "../../modules/api.js";

let pedidos = [];
let sesionActual = {};
let pedidoActivoId = null;
let detallePendienteId = null;

export async function iniciarPedidos(sesion) {
    if (!document.querySelector("[data-lista-pedidos]")) return;
    sesionActual = sesion;
    await cargarPedidos();
    abrirPedidoDesdeUrl();
    setInterval(cargarPedidosSilencioso, 30000);
}

async function cargarPedidos() {
    const datos = await apiGet("pedidos");
    pedidos = datos.pedidos || [];
    pintarPedidos();
}

async function cargarPedidosSilencioso() {
    const abierto = document.getElementById("modalCancelarPedido")?.classList.contains("mostrar");
    await cargarPedidos();
    if (abierto && pedidoActivoId) pintarModalPedido();
}

function abrirPedidoDesdeUrl() {
    const params = new URLSearchParams(window.location.search);
    const id = Number(params.get("pedido") || 0);
    if (!id) return;
    const pedido = pedidos.find((item) => Number(item.id_pedido) === id);
    if (pedido) abrirModalPedido(id);
}

function pintarPedidos() {
    const contenedor = document.querySelector("[data-lista-pedidos]");
    if (!pedidos.length) {
        contenedor.innerHTML = `<div class="mensaje_vacio grande">Sin pedidos</div>`;
        return;
    }

    contenedor.innerHTML = pedidos.map((pedido) => {
        const resumen = resumenPedido(pedido);
        return `
            <article class="orden_card ${resumen.clase}">
                <div class="orden_numero">
                    <span>Orden</span>
                    <strong>#${Number(pedido.numero_pedido || pedido.id_pedido)}</strong>
                </div>
                <div class="orden_info">
                    <h4>${formatearFecha(pedido.creado_en)}</h4>
                    <p>${escapar(pedido.direccion_envio || "Direccion no registrada")}</p>
                    <small>${Number(pedido.detalles?.length || 0)} producto(s) · ${escapar(pedido.metodo_pago)}</small>
                </div>
                <div class="orden_pago">
                    <span>Total</span>
                    <strong>${moneda(pedido.total)}</strong>
                    ${Number(pedido.boleta_emitida) === 1 ? `<small>Boleta emitida</small>` : ""}
                </div>
                <div class="orden_estado">
                    <span class="status ${resumen.badge}">${resumen.texto}</span>
                    <button class="btn_detalles" type="button" data-ver-pedido="${Number(pedido.id_pedido)}">Detalles</button>
                </div>
            </article>
        `;
    }).join("");

    contenedor.querySelectorAll("[data-ver-pedido]").forEach((boton) => {
        boton.addEventListener("click", () => abrirModalPedido(Number(boton.dataset.verPedido)));
    });
}

function abrirModalPedido(idPedido) {
    pedidoActivoId = idPedido;
    pintarModalPedido();
    document.getElementById("modalCancelarPedido").classList.add("mostrar");
}

function pintarModalPedido() {
    const modal = document.getElementById("modalCancelarPedido");
    const contenido = modal.querySelector("[data-mensaje-cancelar]");
    const pedido = pedidoActivo();
    if (!pedido) {
        cerrarModalPedido();
        return;
    }

    const grupos = agruparDetalles(pedido.detalles || []);
    const boletaEmitida = Number(pedido.boleta_emitida) === 1;

    contenido.className = "modal_contenido modal_pedido";
    contenido.innerHTML = `
        <div class="modal_pedido_header">
            <div>
                <span>Orden #${Number(pedido.numero_pedido || pedido.id_pedido)}</span>
                <h2>Detalle del pedido</h2>
                <p>${formatearFecha(pedido.creado_en)} · ${escapar(pedido.metodo_pago)}</p>
            </div>
            <button class="cerrar_modal" type="button" data-cerrar-pedido>×</button>
        </div>
        <div class="boleta_alerta ${boletaEmitida ? "mostrar" : ""}">
            La boleta ya fue descargada. Las cancelaciones estan bloqueadas por seguridad.
        </div>
        <div class="orden_resumen_modal">
            <div><span>Direccion</span><strong>${escapar(pedido.direccion_envio || "Direccion no registrada")}</strong></div>
            <div><span>Total</span><strong>${moneda(pedido.total)}</strong></div>
        </div>
        <div class="detalle_grupos">
            ${pintarGrupo("Menus", grupos.menu, pedido)}
            ${pintarGrupo("Promociones", grupos.promocion, pedido)}
        </div>
        <div class="modal_acciones pedido_acciones_finales">
            <button type="button" data-cerrar-pedido>Cerrar</button>
            <button type="button" class="btn_boleta" data-imprimir-boleta>${boletaEmitida ? "Descargar boleta" : "Imprimir boleta"}</button>
        </div>
        <div class="confirmacion_boleta" data-confirmacion-boleta hidden>
            <div class="confirmacion_boleta_panel">
                <h3>Emitir boleta</h3>
                <p>Una vez descargada la boleta, no podras cancelar productos de esta orden por seguridad.</p>
                <div class="modal_acciones">
                    <button type="button" class="btn_boleta" data-confirmar-boleta>Continuar y descargar</button>
                    <button type="button" data-cancelar-boleta>Volver</button>
                </div>
            </div>
        </div>
    `;

    contenido.querySelectorAll("[data-cerrar-pedido]").forEach((boton) => boton.addEventListener("click", cerrarModalPedido));
    contenido.querySelectorAll("[data-cancelar-detalle]").forEach((boton) => {
        boton.addEventListener("click", () => abrirConfirmacionCancelacion(Number(boton.dataset.cancelarDetalle)));
    });
    contenido.querySelectorAll("[data-entregar-detalle]").forEach((boton) => {
        boton.addEventListener("click", () => confirmarEntrega(Number(boton.dataset.entregarDetalle)));
    });
    contenido.querySelector("[data-imprimir-boleta]")?.addEventListener("click", abrirConfirmacionBoleta);
    contenido.querySelector("[data-cancelar-boleta]")?.addEventListener("click", cerrarConfirmacionBoleta);
    contenido.querySelector("[data-confirmar-boleta]")?.addEventListener("click", imprimirBoleta);
}

function pintarGrupo(titulo, detalles, pedido) {
    if (!detalles.length) return "";
    return `
        <section class="detalle_grupo">
            <h3>${titulo}</h3>
            <div class="detalle_lista">
                ${detalles.map((detalle) => pintarDetalle(detalle, pedido)).join("")}
            </div>
        </section>
    `;
}

function pintarDetalle(detalle, pedido) {
    const estado = estadoDetalle(pedido, detalle);
    const boletaEmitida = Number(pedido.boleta_emitida) === 1;
    const puedeCancelar = estado.puedeCancelar && !boletaEmitida;
    return `
        <article class="detalle_item ${estado.clase}">
            <img src="${escapar(detalle.imagen)}" alt="${escapar(detalle.nombre)}">
            <div class="detalle_item_info">
                <h4>${escapar(detalle.nombre)}</h4>
                <p>${escapar(detalle.descripcion)}</p>
                <small>Cant: ${Number(detalle.cantidad)} · ${moneda(Number(detalle.precio) * Number(detalle.cantidad))}</small>
            </div>
            <div class="detalle_item_estado">
                <span class="status ${estado.badge}">${estado.texto}</span>
                ${estado.puedeEntregar ? `<button class="btn_entregado" type="button" data-entregar-detalle="${Number(detalle.id_detalle)}">Ya llego</button>` : ""}
                ${puedeCancelar ? `<button class="btn_cancelar" type="button" data-cancelar-detalle="${Number(detalle.id_detalle)}">Cancelar</button>` : ""}
                ${boletaEmitida && estado.puedeCancelar ? `<button class="btn_cancelar" type="button" disabled>Cancelacion bloqueada</button>` : ""}
            </div>
        </article>
    `;
}

function agruparDetalles(detalles) {
    return detalles.reduce((grupos, detalle) => {
        const tipo = detalle.tipo_producto === "promocion" ? "promocion" : "menu";
        grupos[tipo].push(detalle);
        return grupos;
    }, { menu: [], promocion: [] });
}

function estadoDetalle(pedido, detalle) {
    if (detalle.estado === "cancelado" || pedido.estado === "cancelado") {
        return { texto: "Cancelado", clase: "cancelado", badge: "badge_cancelado", puedeCancelar: false, puedeEntregar: false };
    }
    if (detalle.estado === "entregado") {
        return { texto: "Entregado", clase: "entregado", badge: "badge_entregado", puedeCancelar: false, puedeEntregar: false };
    }
    const creado = new Date(String(pedido.creado_en).replace(" ", "T"));
    const minutos = (Date.now() - creado.getTime()) / 60000;
    if (minutos >= Number(detalle.demoraAPROX || 20)) {
        return { texto: "Verificar llegada", clase: "por_confirmar", badge: "badge_camino", puedeCancelar: true, puedeEntregar: true };
    }
    return { texto: "En camino", clase: "en_camino", badge: "badge_camino", puedeCancelar: true, puedeEntregar: false };
}

function resumenPedido(pedido) {
    const detalles = pedido.detalles || [];
    if (pedido.estado === "cancelado" || detalles.every((detalle) => detalle.estado === "cancelado")) {
        return { texto: "Cancelado", clase: "cancelado", badge: "badge_cancelado" };
    }
    if (detalles.length && detalles.every((detalle) => detalle.estado === "entregado" || detalle.estado === "cancelado")) {
        return { texto: "Entregado", clase: "entregado", badge: "badge_entregado" };
    }
    if (detalles.some((detalle) => estadoDetalle(pedido, detalle).puedeEntregar)) {
        return { texto: "Por verificar", clase: "por_confirmar", badge: "badge_camino" };
    }
    return { texto: "En camino", clase: "en_camino", badge: "badge_camino" };
}

function abrirConfirmacionCancelacion(idDetalle) {
    detallePendienteId = idDetalle;
    const modal = document.getElementById("modalCancelarPedido");
    const contenido = modal.querySelector("[data-mensaje-cancelar]");
    contenido.className = "modal_contenido";
    contenido.innerHTML = `
        <h2>¿Cancelar producto?</h2>
        <p>El stock volvera al menu o promociones segun corresponda.</p>
        <div class="modal_acciones">
            <button type="button" data-confirmar-cancelacion>Si, cancelar</button>
            <button type="button" data-volver-detalle>Volver</button>
        </div>
    `;
    contenido.querySelector("[data-confirmar-cancelacion]").addEventListener("click", confirmarCancelacion);
    contenido.querySelector("[data-volver-detalle]").addEventListener("click", pintarModalPedido);
}

async function confirmarCancelacion() {
    await apiPost("cancelar", { id_detalle: detallePendienteId });
    await cargarPedidos();
    pintarModalPedido();
}

async function confirmarEntrega(idDetalle) {
    await apiPost("entregar", { id_detalle: idDetalle });
    await cargarPedidos();
    pintarModalPedido();
}

function abrirConfirmacionBoleta() {
    const pedido = pedidoActivo();
    if (!pedido) return;

    if (Number(pedido.boleta_emitida) === 1) {
        imprimirBoleta();
        return;
    }

    document.querySelector("[data-confirmacion-boleta]")?.removeAttribute("hidden");
}

function cerrarConfirmacionBoleta() {
    document.querySelector("[data-confirmacion-boleta]")?.setAttribute("hidden", "");
}

async function imprimirBoleta() {
    const pedido = pedidoActivo();
    if (!pedido) return;

    if (Number(pedido.boleta_emitida) !== 1) {
        await apiPost("emitir_boleta", { id_pedido: pedido.id_pedido });
        await cargarPedidos();
    }

    const actualizado = pedidoActivo();
    descargarPdfBoleta(actualizado || pedido);
    pintarModalPedido();
}

function descargarPdfBoleta(pedido) {
    const lineas = lineasBoleta(pedido);
    const pdf = crearPdfTexto(lineas);
    const blob = new Blob([pdf], { type: "application/pdf" });
    const enlace = document.createElement("a");
    enlace.href = URL.createObjectURL(blob);
    enlace.download = `boleta-orden-${Number(pedido.numero_pedido || pedido.id_pedido)}.pdf`;
    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();
    setTimeout(() => URL.revokeObjectURL(enlace.href), 1000);
}

function lineasBoleta(pedido) {
    const cliente = `${sesionActual.nombre || ""} ${sesionActual.apellido || ""}`.trim() || "Cliente";
    const numero = String(Number(pedido.numero_pedido || pedido.id_pedido)).padStart(8, "0");
    const lineas = [
        "                         BOCADOSDEAYUDA",
        "                 Rescate de alimentos y delivery",
        "                         Arequipa - Peru",
        "                    contacto@bocadosdeayuda.pe",
        "",
        "                       BOLETA ELECTRONICA",
        `                         BDA-${numero}`,
        "",
        `Fecha de emision       : ${formatearFecha(pedido.creado_en)}`,
        `Orden                  : #${Number(pedido.numero_pedido || pedido.id_pedido)}`,
        `Cliente                : ${cliente}`,
        `Correo                 : ${sesionActual.email || ""}`,
        `Direccion de delivery  : ${pedido.direccion_envio || "No registrada"}`,
        `Metodo de pago         : ${pedido.metodo_pago}`,
        "--------------------------------------------------------------------",
        "CANT. DESCRIPCION                              P. UNIT       TOTAL",
        "--------------------------------------------------------------------"
    ];

    (pedido.detalles || []).forEach((detalle) => {
        const cantidad = Number(detalle.cantidad);
        const subtotal = Number(detalle.precio) * cantidad;
        const nombre = `${detalle.tipo_producto === "promocion" ? "Promocion" : "Menu"} - ${detalle.nombre}`;
        lineas.push(
            `${String(cantidad).padEnd(5)} ${columna(nombre, 39)} ${moneda(detalle.precio).padStart(10)} ${moneda(subtotal).padStart(11)}`
        );
        lineas.push(`      Estado: ${estadoDetalle(pedido, detalle).texto}`);
    });

    lineas.push("--------------------------------------------------------------------");
    lineas.push(`${"Importe total".padEnd(56)}${moneda(pedido.total).padStart(11)}`);
    lineas.push("");
    lineas.push("Representacion impresa de la boleta de compra.");
    lineas.push("Gracias por comprar responsablemente con BocadosDeAyuda.");
    return lineas;
}

function crearPdfTexto(lineas) {
    const alto = Math.max(842, 120 + lineas.length * 16);
    const comandos = ["BT", "/F1 11 Tf", "50 " + (alto - 60) + " Td"];
    lineas.forEach((linea, indice) => {
        if (indice > 0) comandos.push("0 -16 Td");
        comandos.push(`(${textoPdf(linea)}) Tj`);
    });
    comandos.push("ET");
    const contenido = comandos.join("\n");
    const objetos = [
        "<< /Type /Catalog /Pages 2 0 R >>",
        "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
        `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 ${alto}] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>`,
        "<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>",
        `<< /Length ${contenido.length} >>\nstream\n${contenido}\nendstream`
    ];
    let pdf = "%PDF-1.4\n";
    const offsets = [0];
    objetos.forEach((objeto, indice) => {
        offsets.push(pdf.length);
        pdf += `${indice + 1} 0 obj\n${objeto}\nendobj\n`;
    });
    const xref = pdf.length;
    pdf += `xref\n0 ${objetos.length + 1}\n0000000000 65535 f \n`;
    for (let i = 1; i < offsets.length; i += 1) {
        pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
    }
    pdf += `trailer\n<< /Size ${objetos.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
    return pdf;
}

function columna(texto, ancho) {
    const limpio = String(texto || "");
    if (limpio.length <= ancho) return limpio.padEnd(ancho);
    return `${limpio.slice(0, ancho - 3)}...`;
}

function textoPdf(texto) {
    return String(texto || "")
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^\x20-\x7E]/g, "")
        .replace(/\\/g, "\\\\")
        .replace(/\(/g, "\\(")
        .replace(/\)/g, "\\)");
}

function pedidoActivo() {
    return pedidos.find((pedido) => Number(pedido.id_pedido) === Number(pedidoActivoId));
}

function cerrarModalPedido() {
    document.getElementById("modalCancelarPedido").classList.remove("mostrar");
    detallePendienteId = null;
}

function formatearFecha(fecha) {
    const valor = new Date(String(fecha).replace(" ", "T"));
    if (Number.isNaN(valor.getTime())) return "Fecha no disponible";
    return valor.toLocaleDateString("es-PE", { year: "numeric", month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}
