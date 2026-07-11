<?php
session_start();
require_once __DIR__ . "/../config/conexion.php";

header('Content-Type: application/json; charset=utf-8');

@mysqli_query($conexion, "ALTER TABLE usuarios ADD COLUMN direccion TEXT DEFAULT NULL");

if (isset($_SESSION['id_usuario'])) {
    $idUsuario = (int)$_SESSION['id_usuario'];
    $consulta = mysqli_prepare($conexion, "SELECT nombre, apellido, email, direccion FROM usuarios WHERE id_usuario = ? LIMIT 1");
    mysqli_stmt_bind_param($consulta, "i", $idUsuario);
    mysqli_stmt_execute($consulta);
    $usuario = mysqli_fetch_assoc(mysqli_stmt_get_result($consulta));
    if ($usuario) {
        $_SESSION['nombre'] = $usuario['nombre'] ?? ($_SESSION['nombre'] ?? '');
        $_SESSION['apellido'] = $usuario['apellido'] ?? ($_SESSION['apellido'] ?? '');
        $_SESSION['email'] = $usuario['email'] ?? ($_SESSION['email'] ?? '');
        $_SESSION['direccion'] = $usuario['direccion'] ?? ($_SESSION['direccion'] ?? '');
    }
}

echo json_encode([
    'logueado' => isset($_SESSION['nombre']),
    'id_usuario' => $_SESSION['id_usuario'] ?? null,
    'nombre' => $_SESSION['nombre'] ?? '',
    'apellido' => $_SESSION['apellido'] ?? '',
    'email' => $_SESSION['email'] ?? '',
    'direccion' => $_SESSION['direccion'] ?? '',
    'admin' => strtolower($_SESSION['email'] ?? '') === 'admin@admin.com'
], JSON_UNESCAPED_UNICODE);
