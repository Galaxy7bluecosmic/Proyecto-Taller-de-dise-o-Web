<?php
session_start();
require_once __DIR__ . "/../config/conexion.php";

header("Content-Type: application/json; charset=utf-8");

function responder($datos, $codigo = 200)
{
    http_response_code($codigo);
    echo json_encode($datos, JSON_UNESCAPED_UNICODE);
    exit();
}

function cuerpo_json()
{
    $entrada = file_get_contents("php://input");
    $datos = json_decode($entrada, true);
    return is_array($datos) ? $datos : [];
}

function usuario_actual()
{
    return [
        "id" => $_SESSION["id_usuario"] ?? null,
        "email" => $_SESSION["email"] ?? "",
        "admin" => strtolower($_SESSION["email"] ?? "") === "admin@admin.com"
    ];
}

function exigir_login()
{
    $usuario = usuario_actual();
    if (!$usuario["id"]) responder(["ok" => false, "mensaje" => "Inicia sesión para continuar."], 401);
    return $usuario;
}

function exigir_admin()
{
    $usuario = exigir_login();
    if (!$usuario["admin"]) responder(["ok" => false, "mensaje" => "Solo el administrador puede realizar esta acción."], 403);
    return $usuario;
}

function consulta_todos($conexion, $sql)
{
    $resultado = mysqli_query($conexion, $sql);
    $filas = [];
    while ($fila = mysqli_fetch_assoc($resultado)) $filas[] = $fila;
    return $filas;
}

function numero($valor)
{
    return is_numeric($valor) ? (float)$valor : 0;
}

function entero($valor)
{
    return is_numeric($valor) ? (int)$valor : 0;
}

function asegurar_columnas($conexion)
{
    // Estas consultas permiten que el proyecto funcione aunque se importe una base antigua.
    @mysqli_query($conexion, "ALTER TABLE menus ADD COLUMN stock INT NOT NULL DEFAULT 10");
    @mysqli_query($conexion, "ALTER TABLE menus ADD COLUMN creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP");
    @mysqli_query($conexion, "ALTER TABLE menus MODIFY imagen TEXT NOT NULL");
    @mysqli_query($conexion, "ALTER TABLE usuarios ADD COLUMN rol VARCHAR(20) NOT NULL DEFAULT 'cliente'");

    @mysqli_query($conexion, "CREATE TABLE IF NOT EXISTS promociones (
        id_promocion INT NOT NULL AUTO_INCREMENT,
        nombre VARCHAR(120) NOT NULL,
        descripcion VARCHAR(400) NOT NULL,
        etiqueta VARCHAR(80) NOT NULL,
        restaurante VARCHAR(120) NOT NULL DEFAULT 'BocadosDeAyuda',
        precio_anterior DOUBLE NOT NULL,
        precio_nuevo DOUBLE NOT NULL,
        descuento VARCHAR(40) NOT NULL,
        imagen TEXT NOT NULL,
        color VARCHAR(30) NOT NULL DEFAULT 'amarillo',
        stock INT NOT NULL DEFAULT 10,
        demoraAPROX INT NOT NULL DEFAULT 20,
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id_promocion)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci");

    @mysqli_query($conexion, "CREATE TABLE IF NOT EXISTS pedidos (
        id_pedido INT NOT NULL AUTO_INCREMENT,
        id_usuario INT NOT NULL,
        total DOUBLE NOT NULL,
        metodo_pago VARCHAR(30) NOT NULL,
        estado VARCHAR(30) NOT NULL DEFAULT 'en_camino',
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        cancelado_en DATETIME DEFAULT NULL,
        PRIMARY KEY (id_pedido),
        KEY id_usuario (id_usuario)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci");

    @mysqli_query($conexion, "CREATE TABLE IF NOT EXISTS pedido_detalles (
        id_detalle INT NOT NULL AUTO_INCREMENT,
        id_pedido INT NOT NULL,
        tipo_producto ENUM('menu','promocion') NOT NULL,
        id_producto INT NOT NULL,
        nombre VARCHAR(120) NOT NULL,
        descripcion VARCHAR(400) NOT NULL,
        imagen TEXT NOT NULL,
        precio DOUBLE NOT NULL,
        cantidad INT NOT NULL,
        demoraAPROX INT NOT NULL,
        PRIMARY KEY (id_detalle),
        KEY id_pedido (id_pedido)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci");
    @mysqli_query($conexion, "ALTER TABLE pedido_detalles ADD COLUMN estado VARCHAR(30) NOT NULL DEFAULT 'en_camino'");
    @mysqli_query($conexion, "ALTER TABLE pedido_detalles ADD COLUMN cancelado_en DATETIME DEFAULT NULL");
}

function sembrar_datos($conexion)
{
    $adminPass = "Admin12345";
    $consultaAdmin = mysqli_prepare($conexion, "SELECT id_usuario FROM usuarios WHERE email = ? LIMIT 1");
    $adminEmail = "Admin@admin.com";
    mysqli_stmt_bind_param($consultaAdmin, "s", $adminEmail);
    mysqli_stmt_execute($consultaAdmin);
    if (!mysqli_fetch_assoc(mysqli_stmt_get_result($consultaAdmin))) {
        $stmt = mysqli_prepare($conexion, "INSERT INTO usuarios (nombre, apellido, email, contrasena, telefono, rol) VALUES ('Admin', 'General', ?, ?, '', 'admin')");
        mysqli_stmt_bind_param($stmt, "ss", $adminEmail, $adminPass);
        mysqli_stmt_execute($stmt);
    }

    $menus = (int)mysqli_fetch_row(mysqli_query($conexion, "SELECT COUNT(*) FROM menus"))[0];
    if ($menus === 0) {
        $datos = [
            ["Lomo Saltado", "Jugosos trozos de carne salteados al wok con cebolla, tomate, papas fritas crocantes y arroz blanco.", 18.90, "img/lomoSaltado.webp", 20, 1, 8],
            ["Ají de Gallina", "Cremoso ají amarillo con pollo deshilachado, acompañado de arroz, papa sancochada y huevo.", 16.50, "img/aji de gallina.jpg", 15, 1, 5],
            ["Ceviche Clásico", "Pescado fresco marinado en limón peruano con cebolla, choclo, camote y cancha serrana.", 24.90, "img/ceviche.webp", 25, 3, 4],
            ["Arroz Chaufa", "Arroz salteado al estilo chifa con pollo, tortilla de huevo, cebollita china y sillao.", 17.90, "img/chaufa.jpg", 18, 5, 10],
            ["Parrilla Mixta", "Carne, pollo y chorizo a la parrilla con papas doradas, ensalada fresca y cremas especiales.", 29.90, "img/parrillamixta.jpg", 30, 4, 2],
            ["Tallarines Verdes", "Pasta bañada en salsa de albahaca y espinaca, acompañada de bistec jugoso.", 18.00, "img/tallarines verdes.jpg", 22, 2, 7],
            ["Pollo a la Brasa", "Pollo crocante y jugoso acompañado de papas fritas, ensalada y cremas peruanas.", 22.90, "img/pollo a la brasa.jpg", 20, 2, 12],
            ["Picarones", "Tradicional postre peruano preparado con zapallo y miel de chancaca artesanal.", 12.90, "img/picarones.jpg", 10, 6, 0]
        ];
        $stmt = mysqli_prepare($conexion, "INSERT INTO menus (nombre, descripcion, precio, imagen, demoraAPROX, id_categoria, stock) VALUES (?, ?, ?, ?, ?, ?, ?)");
        foreach ($datos as $plato) {
            mysqli_stmt_bind_param($stmt, "ssdsiii", $plato[0], $plato[1], $plato[2], $plato[3], $plato[4], $plato[5], $plato[6]);
            mysqli_stmt_execute($stmt);
        }
    }

    $promos = (int)mysqli_fetch_row(mysqli_query($conexion, "SELECT COUNT(*) FROM promociones"))[0];
    if ($promos === 0) {
        $datos = [
            ["2 Lomo Saltado + Inka Cola", "Restaurante: El Sabor Criollo", "SUPER PROMO", "El Sabor Criollo", 28.90, 18.90, "35% OFF", "img/lomoSaltado.webp", "amarillo", 6],
            ["Combo Verano Marino", "Restaurante: Costa Azul", "CÓMPRALO YA", "Costa Azul", 54.90, 39.90, "27% OFF", "img/combomarino.jpg", "rojo", 5],
            ["2 Pollos a la Brasa", "Incluye papas familiares y cremas.", "PROMO FAMILIAR", "BocadosDeAyuda", 89.90, 64.90, "28% OFF", "img/pollos.jpg", "morado", 4],
            ["Combo Familiar Chifa", "Chaufa + Wantán + Gaseosa 1.5L", "COMBO", "BocadosDeAyuda", 49.90, 34.90, "30% OFF", "img/chifa.jpg", "verde", 7],
            ["Postres Peruanos", "Picarones + Mazamorra + Arroz con leche", "DULCE", "BocadosDeAyuda", 24.90, 16.90, "32% OFF", "img/postres.png", "naranja", 3],
            ["Parrilla Doble", "Carne + pollo + chorizo + papas", "PARRILLA", "BocadosDeAyuda", 69.90, 49.90, "29% OFF", "img/parrilla.jpg", "celeste", 0]
        ];
        $stmt = mysqli_prepare($conexion, "INSERT INTO promociones (nombre, descripcion, etiqueta, restaurante, precio_anterior, precio_nuevo, descuento, imagen, color, stock, demoraAPROX) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 20)");
        foreach ($datos as $promo) {
            mysqli_stmt_bind_param($stmt, "ssssddsssi", $promo[0], $promo[1], $promo[2], $promo[3], $promo[4], $promo[5], $promo[6], $promo[7], $promo[8], $promo[9]);
            mysqli_stmt_execute($stmt);
        }
    }
}

asegurar_columnas($conexion);
sembrar_datos($conexion);

$accion = $_GET["accion"] ?? $_POST["accion"] ?? "";

if ($accion === "catalogo") {
    responder([
        "ok" => true,
        "sesion" => usuario_actual(),
        "categorias" => consulta_todos($conexion, "SELECT id_categoria, nombre, descripcion FROM categoriasmenu ORDER BY id_categoria"),
        "menus" => consulta_todos($conexion, "SELECT m.*, c.nombre AS categoria FROM menus m INNER JOIN categoriasmenu c ON c.id_categoria = m.id_categoria ORDER BY m.creado_en DESC, m.id_Menu DESC"),
        "promociones" => consulta_todos($conexion, "SELECT * FROM promociones ORDER BY creado_en DESC, id_promocion DESC")
    ]);
}

if ($accion === "guardar_menu") {
    exigir_admin();
    $d = cuerpo_json();
    $id = entero($d["id"] ?? 0);
    $nombre = trim($d["nombre"] ?? "");
    $descripcion = trim($d["descripcion"] ?? "");
    $imagen = trim($d["imagen"] ?? "");
    $precio = numero($d["precio"] ?? 0);
    $demora = entero($d["demoraAPROX"] ?? 20);
    $categoria = entero($d["id_categoria"] ?? 1);
    $stock = entero($d["stock"] ?? 0);
    if ($nombre === "" || $descripcion === "" || $imagen === "" || $precio <= 0) responder(["ok" => false, "mensaje" => "Completa los datos del plato."], 422);

    if ($id > 0) {
        $stmt = mysqli_prepare($conexion, "UPDATE menus SET nombre=?, descripcion=?, precio=?, imagen=?, demoraAPROX=?, id_categoria=?, stock=? WHERE id_Menu=?");
        mysqli_stmt_bind_param($stmt, "ssdsiiii", $nombre, $descripcion, $precio, $imagen, $demora, $categoria, $stock, $id);
    } else {
        $stmt = mysqli_prepare($conexion, "INSERT INTO menus (nombre, descripcion, precio, imagen, demoraAPROX, id_categoria, stock) VALUES (?, ?, ?, ?, ?, ?, ?)");
        mysqli_stmt_bind_param($stmt, "ssdsiii", $nombre, $descripcion, $precio, $imagen, $demora, $categoria, $stock);
    }
    mysqli_stmt_execute($stmt);
    responder(["ok" => true]);
}

if ($accion === "guardar_promocion") {
    exigir_admin();
    $d = cuerpo_json();
    $id = entero($d["id"] ?? 0);
    $nombre = trim($d["nombre"] ?? "");
    $descripcion = trim($d["descripcion"] ?? "");
    $etiqueta = trim($d["etiqueta"] ?? "");
    $restaurante = trim($d["restaurante"] ?? "BocadosDeAyuda");
    $imagen = trim($d["imagen"] ?? "");
    $precioAnterior = numero($d["precio_anterior"] ?? 0);
    $precioNuevo = numero($d["precio_nuevo"] ?? 0);
    $descuento = trim($d["descuento"] ?? "");
    $color = trim($d["color"] ?? "amarillo");
    $stock = entero($d["stock"] ?? 0);
    if ($nombre === "" || $descripcion === "" || $etiqueta === "" || $imagen === "" || $precioNuevo <= 0) responder(["ok" => false, "mensaje" => "Completa los datos de la promoción."], 422);

    if ($id > 0) {
        $stmt = mysqli_prepare($conexion, "UPDATE promociones SET nombre=?, descripcion=?, etiqueta=?, restaurante=?, precio_anterior=?, precio_nuevo=?, descuento=?, imagen=?, color=?, stock=?, demoraAPROX=20 WHERE id_promocion=?");
        mysqli_stmt_bind_param($stmt, "ssssddsssii", $nombre, $descripcion, $etiqueta, $restaurante, $precioAnterior, $precioNuevo, $descuento, $imagen, $color, $stock, $id);
    } else {
        $stmt = mysqli_prepare($conexion, "INSERT INTO promociones (nombre, descripcion, etiqueta, restaurante, precio_anterior, precio_nuevo, descuento, imagen, color, stock, demoraAPROX) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 20)");
        mysqli_stmt_bind_param($stmt, "ssssddsssi", $nombre, $descripcion, $etiqueta, $restaurante, $precioAnterior, $precioNuevo, $descuento, $imagen, $color, $stock);
    }
    mysqli_stmt_execute($stmt);
    responder(["ok" => true]);
}

if ($accion === "stock" || $accion === "eliminar") {
    exigir_admin();
    $d = cuerpo_json();
    $type = $d["tipo"] ?? "menu";
    $id = entero($d["id"] ?? 0);
    $tabla = $type === "promocion" ? "promociones" : "menus";
    $columna = $type === "promocion" ? "id_promocion" : "id_Menu";
    if ($accion === "eliminar") {
        mysqli_query($conexion, "DELETE FROM $tabla WHERE $columna = $id");
    } else {
        $delta = entero($d["delta"] ?? 0);
        mysqli_query($conexion, "UPDATE $tabla SET stock = GREATEST(stock + ($delta), 0) WHERE $columna = $id");
    }
    responder(["ok" => true]);
}

if ($accion === "checkout") {
    $usuario = exigir_login();
    $d = cuerpo_json();
    $items = $d["items"] ?? [];
    $metodo = trim($d["metodo_pago"] ?? "tarjeta");
    if (!is_array($items) || count($items) === 0) responder(["ok" => false, "mensaje" => "Sin pedidos."], 422);

    mysqli_begin_transaction($conexion);
    try {
        $total = 0;
        $detalles = [];
        foreach ($items as $item) {
            $type = ($item["tipo"] ?? "") === "promocion" ? "promocion" : "menu";
            $id = entero($item["id"] ?? 0);
            $cantidad = max(1, entero($item["cantidad"] ?? 1));
            $tabla = $type === "promocion" ? "promociones" : "menus";
            $columna = $type === "promocion" ? "id_promocion" : "id_Menu";
            $precioCol = $type === "promocion" ? "precio_nuevo AS precio" : "precio";
            $stmt = mysqli_prepare($conexion, "SELECT nombre, descripcion, imagen, $precioCol, demoraAPROX, stock FROM $tabla WHERE $columna = ? FOR UPDATE");
            mysqli_stmt_bind_param($stmt, "i", $id);
            mysqli_stmt_execute($stmt);
            $producto = mysqli_fetch_assoc(mysqli_stmt_get_result($stmt));
            if (!$producto || (int)$producto["stock"] < $cantidad) throw new Exception("Stock insuficiente para " . ($producto["nombre"] ?? "un producto"));
            mysqli_query($conexion, "UPDATE $tabla SET stock = stock - $cantidad WHERE $columna = $id");
            $producto["tipo"] = $type;
            $producto["id"] = $id;
            $producto["cantidad"] = $cantidad;
            $total += (float)$producto["precio"] * $cantidad;
            $detalles[] = $producto;
        }

        $stmtPedido = mysqli_prepare($conexion, "INSERT INTO pedidos (id_usuario, total, metodo_pago, estado) VALUES (?, ?, ?, 'en_camino')");
        mysqli_stmt_bind_param($stmtPedido, "ids", $usuario["id"], $total, $metodo);
        mysqli_stmt_execute($stmtPedido);
        $idPedido = mysqli_insert_id($conexion);

        $stmtDetalle = mysqli_prepare($conexion, "INSERT INTO pedido_detalles (id_pedido, tipo_producto, id_producto, nombre, descripcion, imagen, precio, cantidad, demoraAPROX) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
        foreach ($detalles as $detalle) {
            mysqli_stmt_bind_param($stmtDetalle, "isisssdii", $idPedido, $detalle["tipo"], $detalle["id"], $detalle["nombre"], $detalle["descripcion"], $detalle["imagen"], $detalle["precio"], $detalle["cantidad"], $detalle["demoraAPROX"]);
            mysqli_stmt_execute($stmtDetalle);
        }

        mysqli_commit($conexion);
        responder(["ok" => true, "id_pedido" => $idPedido]);
    } catch (Exception $e) {
        mysqli_rollback($conexion);
        responder(["ok" => false, "mensaje" => $e->getMessage()], 409);
    }
}

if ($accion === "pedidos") {
    $usuario = exigir_login();
    $stmt = mysqli_prepare($conexion, "SELECT * FROM pedidos WHERE id_usuario = ? ORDER BY creado_en DESC");
    mysqli_stmt_bind_param($stmt, "i", $usuario["id"]);
    mysqli_stmt_execute($stmt);
    $pedidos = [];
    $res = mysqli_stmt_get_result($stmt);
    while ($pedido = mysqli_fetch_assoc($res)) {
        $id = (int)$pedido["id_pedido"];
        $pedido["detalles"] = consulta_todos($conexion, "SELECT * FROM pedido_detalles WHERE id_pedido = $id");
        $pedidos[] = $pedido;
    }
    responder(["ok" => true, "pedidos" => $pedidos, "sesion" => usuario_actual()]);
}

if ($accion === "cancelar") {
    $usuario = exigir_login();
    $d = cuerpo_json();
    $idDetalle = entero($d["id_detalle"] ?? 0);

    $stmt = mysqli_prepare($conexion, "SELECT d.*, p.id_usuario FROM pedido_detalles d INNER JOIN pedidos p ON p.id_pedido = d.id_pedido WHERE d.id_detalle = ? AND p.id_usuario = ? LIMIT 1");
    mysqli_stmt_bind_param($stmt, "ii", $idDetalle, $usuario["id"]);
    mysqli_stmt_execute($stmt);
    $detalle = mysqli_fetch_assoc(mysqli_stmt_get_result($stmt));

    if (!$detalle || $detalle["estado"] === "cancelado") {
        responder(["ok" => false, "mensaje" => "No se encontro el producto del pedido."], 404);
    }

    mysqli_begin_transaction($conexion);
    $cantidad = (int)$detalle["cantidad"];
    $idProducto = (int)$detalle["id_producto"];
    $idPedido = (int)$detalle["id_pedido"];

    if ($detalle["tipo_producto"] === "promocion") {
        mysqli_query($conexion, "UPDATE promociones SET stock = stock + $cantidad WHERE id_promocion = $idProducto");
    } else {
        mysqli_query($conexion, "UPDATE menus SET stock = stock + $cantidad WHERE id_Menu = $idProducto");
    }

    mysqli_query($conexion, "UPDATE pedido_detalles SET estado = 'cancelado', cancelado_en = NOW() WHERE id_detalle = $idDetalle");
    $activos = (int)mysqli_fetch_row(mysqli_query($conexion, "SELECT COUNT(*) FROM pedido_detalles WHERE id_pedido = $idPedido AND estado <> 'cancelado'"))[0];
    if ($activos === 0) {
        mysqli_query($conexion, "UPDATE pedidos SET estado = 'cancelado', cancelado_en = NOW() WHERE id_pedido = $idPedido");
    }
    mysqli_commit($conexion);
    responder(["ok" => true]);
}

responder(["ok" => false, "mensaje" => "Acción no válida."], 400);
