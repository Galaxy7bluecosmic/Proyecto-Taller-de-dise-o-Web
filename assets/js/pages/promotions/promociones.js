import { apiGet, apiPost, escapar, leerImagenComoDataUrl, moneda } from "../../modules/api.js";
import { agregarAlCarrito, actualizarContadoresCarrito, stockDisponible } from "../../modules/cart-store.js";
import { prepararFormulario, validarFormulario } from "../../modules/validation.js?v=2";

let catalogo = { promociones: [], menus: [], sesion: {} };

export async function iniciarPromociones(sesion) {
    if (!document.querySelector("[data-promociones]")) return;
    catalogo = await apiGet("catalogo");
    catalogo.sesion = sesion;
    pintarHeroPromocion();
    pintarPromociones();
    pintarUltimosPlatos();
    prepararAdminPromos();
}

function pintarHeroPromocion() {
    const hero = document.querySelector(".hero_promos");
    const promo = catalogo.promociones[0];
    if (!hero || !promo) return;

    const disponible = stockDisponible(catalogo.sesion, "promocion", promo.id_promocion, promo.stock);
    const agotado = disponible <= 0;
    hero.innerHTML = `
        <div class="hero_texto">
            <span class="hero_etiqueta">${escapar(promo.etiqueta)}</span>
            <h2>${escapar(promo.nombre)}</h2>
            <p>${escapar(promo.descripcion)}</p>
            <div class="hero_precios">
                <span>${moneda(promo.precio_anterior)}</span>
                <strong>${moneda(promo.precio_nuevo)}</strong>
            </div>
            <button type="button" class="hero_boton" data-agregar-promo="${Number(promo.id_promocion)}" ${agotado ? "disabled" : ""}>
                ${agotado ? "Agotado" : "Añádelo ya"}
            </button>
            ${catalogo.sesion.admin ? controlesAdmin(promo) : ""}
        </div>
        <div class="hero_imagen">
            <img src="${escapar(promo.imagen)}" alt="${escapar(promo.nombre)}">
        </div>
    `;
    enlazarBotonesPromos(hero);
}

function pintarPromociones() {
    const contenedor = document.querySelector("[data-promociones]");
    contenedor.innerHTML = catalogo.promociones.map((promo, index) => {
        const disponible = stockDisponible(catalogo.sesion, "promocion", promo.id_promocion, promo.stock);
        const agotado = disponible <= 0;
        const grande = index < 2;
        return `
            <article class="promo_card ${grande ? "promo_grande" : "mini_card"} ${escapar(promo.color)} ${agotado ? "agotado" : ""}">
                <div class="promo_card_texto ${grande ? "texto_promo" : ""}">
                    <span class="etiqueta">${escapar(promo.etiqueta)}</span>
                    <h3>${escapar(promo.nombre)}</h3>
                    <p>${escapar(promo.descripcion)}</p>
                    <div class="${grande ? "precios" : "mini_precios"}">
                        <span class="${grande ? "precio_anterior" : "tachado"}">${moneda(promo.precio_anterior)}</span>
                        <span class="${grande ? "precio_nuevo" : "nuevo"}">${moneda(promo.precio_nuevo)}</span>
                    </div>
                    <div class="descuento">${escapar(promo.descuento)}</div>
                    <small class="stock_linea">Stock: ${disponible} · 20 min</small>
                    ${agotado ? `<span class="tag_stock agotado_tag">Agotado</span>` : ""}
                    <button class="btn_agregar_promo" type="button" data-agregar-promo="${Number(promo.id_promocion)}" ${agotado ? "disabled" : ""}>
                        ${agotado ? "Agotado" : "Añádelo ya"}
                    </button>
                    ${catalogo.sesion.admin ? controlesAdmin(promo) : ""}
                </div>
                <img class="promo_card_img" src="${escapar(promo.imagen)}" alt="${escapar(promo.nombre)}">
            </article>
        `;
    }).join("");

    enlazarBotonesPromos(contenedor);
}

function enlazarBotonesPromos(raiz) {
    raiz.querySelectorAll("[data-agregar-promo]").forEach((boton) => {
        boton.addEventListener("click", () => {
            if (!catalogo.sesion.logueado) {
                window.location.href = "login.html?next=promociones.html";
                return;
            }

            const promo = catalogo.promociones.find((item) => Number(item.id_promocion) === Number(boton.dataset.agregarPromo));
            const ok = agregarAlCarrito(catalogo.sesion, {
                id: promo.id_promocion,
                nombre: promo.nombre,
                descripcion: promo.descripcion,
                imagen: promo.imagen,
                precio: promo.precio_nuevo,
                demoraAPROX: 20,
                stock: promo.stock
            }, "promocion");
            if (ok) {
                actualizarContadoresCarrito(catalogo.sesion);
                pintarHeroPromocion();
                pintarPromociones();
            }
        });
    });

    raiz.querySelectorAll("[data-editar-promo]").forEach((boton) => {
        boton.addEventListener("click", () => {
            const promo = catalogo.promociones.find((item) => Number(item.id_promocion) === Number(boton.dataset.editarPromo));
            abrirModalPromo(promo);
        });
    });

    raiz.querySelectorAll("[data-stock-promo]").forEach((boton) => {
        boton.addEventListener("click", async () => {
            await apiPost("stock", { tipo: "promocion", id: boton.dataset.id, delta: Number(boton.dataset.stockPromo) });
            await recargarPromociones();
        });
    });

    raiz.querySelectorAll("[data-eliminar-promo]").forEach((boton) => {
        boton.addEventListener("click", async () => {
            await apiPost("eliminar", { tipo: "promocion", id: boton.dataset.eliminarPromo });
            await recargarPromociones();
        });
    });
}

window.addEventListener("carrito:actualizado", () => {
    if (document.querySelector("[data-promociones]")) {
        pintarHeroPromocion();
        pintarPromociones();
    }
});

async function recargarPromociones() {
    catalogo = await apiGet("catalogo");
    catalogo.sesion = window.__SESION_ACTUAL__;
    pintarHeroPromocion();
    pintarPromociones();
    pintarUltimosPlatos();
}

function pintarUltimosPlatos() {
    const contenedor = document.querySelector("[data-ultimos-platos]");
    if (!contenedor) return;
    const ultimos = catalogo.menus.slice(0, 5);
    contenedor.innerHTML = `
        <h2>Últimos platos</h2>
        <div class="ultimos_grid">
            ${ultimos.map((plato) => `
                <article class="ultimo_plato ${Number(plato.stock) <= 0 ? "agotado" : ""}">
                    <img src="${escapar(plato.imagen)}" alt="${escapar(plato.nombre)}">
                    <div>
                        <h3>${escapar(plato.nombre)}</h3>
                        <p>${moneda(plato.precio)} · Stock ${Number(plato.stock)}</p>
                    </div>
                </article>
            `).join("")}
        </div>
    `;
}

function controlesAdmin(promo) {
    return `
        <div class="admin_card_controles">
            <button type="button" class="admin_btn_stock" data-stock-promo="-1" data-id="${Number(promo.id_promocion)}">-</button>
            <button type="button" class="admin_btn_stock" data-stock-promo="1" data-id="${Number(promo.id_promocion)}">+</button>
            <button type="button" class="admin_btn_texto" data-editar-promo="${Number(promo.id_promocion)}">Modificar</button>
            <button type="button" class="admin_btn_texto peligro" data-eliminar-promo="${Number(promo.id_promocion)}">Eliminar</button>
        </div>
    `;
}

function prepararAdminPromos() {
    if (!catalogo.sesion.admin) return;
    const zona = document.querySelector("[data-admin-promos]");
    zona.innerHTML = `<button class="btn_admin" type="button" id="agregarPromo">Agregar promoción</button>`;
    document.getElementById("agregarPromo").addEventListener("click", () => abrirModalPromo());
}

function abrirModalPromo(promo = null) {
    const modal = document.querySelector("[data-modal-admin]");
    modal.innerHTML = `
        <div class="modal_contenido modal_admin">
            <button class="cerrar_modal" type="button" data-cerrar-modal>×</button>
            <h2>${promo ? "Modificar promoción" : "Agregar promoción"}</h2>
            <form id="formPromoAdmin">
                <input name="nombre" placeholder="Nombre" value="${escapar(promo?.nombre || "")}" required>
                <textarea name="descripcion" placeholder="Descripción" required>${escapar(promo?.descripcion || "")}</textarea>
                <input name="etiqueta" placeholder="Etiqueta" value="${escapar(promo?.etiqueta || "")}" required>
                <input name="restaurante" placeholder="Restaurante" value="${escapar(promo?.restaurante || "BocadosDeAyuda")}">
                <input name="precio_anterior" type="text" inputmode="decimal" placeholder="Precio anterior" value="${escapar(promo?.precio_anterior || "")}">
                <input name="precio_nuevo" type="text" inputmode="decimal" placeholder="Precio nuevo" value="${escapar(promo?.precio_nuevo || "")}" required>
                <input name="descuento" placeholder="Descuento" value="${escapar(promo?.descuento || "")}">
                <select name="color">
                    ${["amarillo", "rojo", "morado", "verde", "naranja", "celeste"].map((color) => `<option value="${color}" ${promo?.color === color ? "selected" : ""}>${color}</option>`).join("")}
                </select>
                <input name="stock" type="text" inputmode="numeric" value="${escapar(promo?.stock ?? 10)}" placeholder="Stock">
                <input name="imagenRuta" placeholder="Ruta de imagen" value="${escapar(promo?.imagen || "")}">
                <input name="imagenArchivo" type="file" accept="image/*">
                <p class="msg_error" data-error-admin></p>
                <button type="submit">Guardar cambios</button>
            </form>
        </div>
    `;
    modal.classList.add("mostrar");
    modal.querySelector("[data-cerrar-modal]").addEventListener("click", () => modal.classList.remove("mostrar"));
    const formPromo = modal.querySelector("form");
    prepararFormulario(formPromo, camposPromoAdmin());
    formPromo.addEventListener("submit", async (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        if (!validarFormulario(form, camposPromoAdmin())) {
            form.querySelector("[data-error-admin]").textContent = "Corrige los campos marcados en rojo antes de guardar.";
            return;
        }
        const datos = Object.fromEntries(new FormData(form).entries());
        const imagenArchivo = await leerImagenComoDataUrl(form.imagenArchivo);
        await apiPost("guardar_promocion", { ...datos, id: promo?.id_promocion || 0, imagen: imagenArchivo || datos.imagenRuta });
        modal.classList.remove("mostrar");
        await recargarPromociones();
    });
}

function camposPromoAdmin() {
    return {
        '[name="nombre"]': "textoCorto",
        '[name="descripcion"]': "descripcion",
        '[name="etiqueta"]': "textoCorto",
        '[name="restaurante"]': "textoCorto",
        '[name="precio_anterior"]': "dinero",
        '[name="precio_nuevo"]': "dinero",
        '[name="descuento"]': "textoCorto",
        '[name="stock"]': "stock",
        '[name="imagenRuta"]': "imagen"
    };
}
