import { apiGet, apiPost, escapar, leerImagenComoDataUrl, moneda } from "../../modules/api.js";
import { agregarAlCarrito, actualizarContadoresCarrito, stockDisponible } from "../../modules/cart-store.js";
import { prepararFormulario, validarFormulario } from "../../modules/validation.js?v=2";

let catalogo = { categorias: [], menus: [], sesion: {} };
let categoriaActiva = "Todas";

export async function iniciarMenu(sesion) {
    const contenedorProductos = document.querySelector("[data-menu-productos]");
    if (!contenedorProductos) return;

    catalogo = await apiGet("catalogo");
    catalogo.sesion = sesion;
    pintarCategorias();
    pintarProductos();
    prepararAdminMenu();
}

function pintarCategorias() {
    const contenedor = document.querySelector("[data-menu-categorias]");
    if (!contenedor) return;
    const categorias = ["Todas", ...catalogo.categorias.map((categoria) => categoria.nombre)];
    contenedor.innerHTML = categorias.map((nombre) => `
        <button class="categoria ${nombre === categoriaActiva ? "activa" : ""}" type="button" data-categoria="${escapar(nombre)}">${escapar(nombre)}</button>
    `).join("");

    contenedor.querySelectorAll("button").forEach((boton) => {
        boton.addEventListener("click", () => {
            categoriaActiva = boton.dataset.categoria;
            pintarCategorias();
            pintarProductos();
        });
    });
}

function pintarProductos() {
    const contenedor = document.querySelector("[data-menu-productos]");
    const platos = categoriaActiva === "Todas"
        ? catalogo.menus
        : catalogo.menus.filter((plato) => plato.categoria === categoriaActiva);

    contenedor.innerHTML = platos.map((plato, index) => {
        const disponible = stockDisponible(catalogo.sesion, "menu", plato.id_Menu, plato.stock);
        const agotado = disponible <= 0;
        const ultimos = disponible > 0 && disponible <= 5;
        return `
            <article class="card_producto ${agotado ? "agotado" : ""}" style="--i:${index + 1}">
                <div class="producto_etiquetas">
                    ${ultimos ? `<span class="tag_stock ultimo">Últimos platos</span>` : ""}
                    ${agotado ? `<span class="tag_stock agotado_tag">Agotado</span>` : ""}
                </div>
                <img src="${escapar(plato.imagen)}" alt="${escapar(plato.nombre)}">
                <div class="contenido_producto">
                    <h3>${escapar(plato.nombre)}</h3>
                    <p>${escapar(plato.descripcion)}</p>
                    <div class="detalle_producto">
                        <span>${moneda(plato.precio)}</span>
                        <p>${Number(plato.demoraAPROX)} min</p>
                    </div>
                    <small class="stock_linea">Stock: ${disponible}</small>
                    <button type="button" data-agregar-menu="${Number(plato.id_Menu)}" ${agotado ? "disabled" : ""}>
                        ${agotado ? "Agotado" : "Añadir al carrito +"}
                    </button>
                    ${catalogo.sesion.admin ? controlesAdmin(plato) : ""}
                </div>
            </article>
        `;
    }).join("") || `<p class="mensaje_vacio">No hay platos en esta etiqueta.</p>`;

    contenedor.querySelectorAll("[data-agregar-menu]").forEach((boton) => {
        boton.addEventListener("click", () => {
            if (!catalogo.sesion.logueado) {
                window.location.href = "login.html?next=menu.html";
                return;
            }
            const plato = catalogo.menus.find((item) => Number(item.id_Menu) === Number(boton.dataset.agregarMenu));
            const ok = agregarAlCarrito(catalogo.sesion, normalizarPlato(plato), "menu");
            if (ok) {
                actualizarContadoresCarrito(catalogo.sesion);
                pintarProductos();
            }
        });
    });

    contenedor.querySelectorAll("[data-stock]").forEach((boton) => {
        boton.addEventListener("click", async () => {
            await apiPost("stock", { tipo: "menu", id: boton.dataset.id, delta: Number(boton.dataset.stock) });
            catalogo = await apiGet("catalogo");
            catalogo.sesion = window.__SESION_ACTUAL__;
            pintarProductos();
        });
    });

    contenedor.querySelectorAll("[data-eliminar-menu]").forEach((boton) => {
        boton.addEventListener("click", async () => {
            await apiPost("eliminar", { tipo: "menu", id: boton.dataset.eliminarMenu });
            catalogo = await apiGet("catalogo");
            catalogo.sesion = window.__SESION_ACTUAL__;
            pintarProductos();
        });
    });
}

window.addEventListener("carrito:actualizado", () => {
    if (document.querySelector("[data-menu-productos]")) pintarProductos();
});

function controlesAdmin(plato) {
    return `
        <div class="admin_card_controles">
            <button type="button" data-stock="-1" data-id="${Number(plato.id_Menu)}">-</button>
            <button type="button" data-stock="1" data-id="${Number(plato.id_Menu)}">+</button>
            <button type="button" data-eliminar-menu="${Number(plato.id_Menu)}">Eliminar</button>
        </div>
    `;
}

function normalizarPlato(plato) {
    return {
        id: plato.id_Menu,
        nombre: plato.nombre,
        descripcion: plato.descripcion,
        imagen: plato.imagen,
        precio: plato.precio,
        demoraAPROX: plato.demoraAPROX,
        stock: plato.stock
    };
}

function prepararAdminMenu() {
    if (!catalogo.sesion.admin) return;
    const zona = document.querySelector("[data-admin-menu]");
    if (!zona) return;
    zona.innerHTML = `<button class="btn_admin" type="button" id="abrirPlatoAdmin">Agregar plato</button>`;
    document.getElementById("abrirPlatoAdmin").addEventListener("click", () => abrirModalPlato());
}

function abrirModalPlato() {
    const modal = document.querySelector("[data-modal-admin]");
    modal.innerHTML = `
        <div class="modal_contenido modal_admin">
            <button class="cerrar_modal" type="button" data-cerrar-modal>×</button>
            <h2>Agregar plato</h2>
            <form id="formPlatoAdmin">
                <input name="nombre" placeholder="Nombre del plato" required>
                <textarea name="descripcion" placeholder="Descripción" required></textarea>
                <input name="precio" type="text" inputmode="decimal" placeholder="Precio" required>
                <input name="demoraAPROX" type="text" inputmode="numeric" value="20" placeholder="Tiempo de preparación">
                <input name="stock" type="text" inputmode="numeric" value="10" placeholder="Stock">
                <select name="id_categoria">${catalogo.categorias.map((c) => `<option value="${c.id_categoria}">${escapar(c.nombre)}</option>`).join("")}</select>
                <input name="imagenRuta" placeholder="Ruta de imagen, ejemplo img/plato.jpg">
                <input name="imagenArchivo" type="file" accept="image/*">
                <p class="msg_error" data-error-admin></p>
                <button type="submit">Guardar plato</button>
            </form>
        </div>
    `;
    modal.classList.add("mostrar");
    modal.querySelector("[data-cerrar-modal]").addEventListener("click", () => modal.classList.remove("mostrar"));
    const form = modal.querySelector("form");
    prepararFormulario(form, camposPlatoAdmin());
    form.addEventListener("submit", guardarPlato);
}

async function guardarPlato(event) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!validarFormulario(form, camposPlatoAdmin())) {
        form.querySelector("[data-error-admin]").textContent = "Corrige los campos marcados en rojo antes de guardar.";
        return;
    }
    const datos = Object.fromEntries(new FormData(form).entries());
    const imagenArchivo = await leerImagenComoDataUrl(form.imagenArchivo);
    await apiPost("guardar_menu", {
        nombre: datos.nombre,
        descripcion: datos.descripcion,
        precio: datos.precio,
        demoraAPROX: datos.demoraAPROX,
        stock: datos.stock,
        id_categoria: datos.id_categoria,
        imagen: imagenArchivo || datos.imagenRuta
    });
    document.querySelector("[data-modal-admin]").classList.remove("mostrar");
    catalogo = await apiGet("catalogo");
    catalogo.sesion = window.__SESION_ACTUAL__;
    pintarProductos();
}

function camposPlatoAdmin() {
    return {
        '[name="nombre"]': "textoCorto",
        '[name="descripcion"]': "descripcion",
        '[name="precio"]': "dinero",
        '[name="demoraAPROX"]': "enteroPositivo",
        '[name="stock"]': "stock",
        '[name="imagenRuta"]': "imagen"
    };
}
