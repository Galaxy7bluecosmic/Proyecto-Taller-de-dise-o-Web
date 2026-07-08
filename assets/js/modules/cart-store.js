function claveCarrito(sesion) {
    const usuario = sesion?.email ? sesion.email.toLowerCase() : "invitado";
    return `bocados_carrito_${usuario}`;
}

export function obtenerCarrito(sesion) {
    try {
        return JSON.parse(localStorage.getItem(claveCarrito(sesion)) || "[]");
    } catch (error) {
        return [];
    }
}

export function guardarCarrito(sesion, items) {
    localStorage.setItem(claveCarrito(sesion), JSON.stringify(items));
    window.dispatchEvent(new CustomEvent("carrito:actualizado"));
}

export function vaciarCarrito(sesion) {
    guardarCarrito(sesion, []);
}

export function totalItems(sesion) {
    return obtenerCarrito(sesion).reduce((total, item) => total + Number(item.cantidad || 0), 0);
}

export function actualizarContadoresCarrito(sesion) {
    document.querySelectorAll(".carrito_flotante span").forEach((contador) => {
        contador.textContent = String(totalItems(sesion));
    });
}

export function agregarAlCarrito(sesion, producto, tipo) {
    const items = obtenerCarrito(sesion);
    const existente = items.find((item) => item.tipo === tipo && Number(item.id) === Number(producto.id));
    const stock = Number(producto.stock || 0);
    const cantidadActual = existente ? Number(existente.cantidad || 0) : 0;
    if (stock <= cantidadActual) return false;

    if (existente) {
        existente.cantidad += 1;
    } else {
        items.push({
            tipo,
            id: Number(producto.id),
            nombre: producto.nombre,
            descripcion: producto.descripcion,
            imagen: producto.imagen,
            precio: Number(producto.precio),
            demoraAPROX: Number(producto.demoraAPROX || 20),
            stock,
            cantidad: 1
        });
    }
    guardarCarrito(sesion, items);
    return true;
}

export function cambiarCantidad(sesion, tipo, id, delta) {
    const items = obtenerCarrito(sesion);
    const item = items.find((producto) => producto.tipo === tipo && Number(producto.id) === Number(id));
    if (!item) return;
    item.cantidad = Math.max(0, Number(item.cantidad || 0) + delta);
    guardarCarrito(sesion, items.filter((producto) => producto.cantidad > 0));
}

export function quitarProducto(sesion, tipo, id) {
    const items = obtenerCarrito(sesion).filter((producto) => !(producto.tipo === tipo && Number(producto.id) === Number(id)));
    guardarCarrito(sesion, items);
}
