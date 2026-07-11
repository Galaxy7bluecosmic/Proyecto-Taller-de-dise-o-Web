<?php
session_start();
require_once __DIR__ . "/../config/conexion.php";
require_once __DIR__ . "/helpers.php";

$email = trim($_POST['loginEmail'] ?? '');
$contrasena = $_POST['loginPass'] ?? '';
$destino = destino_seguro($_POST['next'] ?? 'index.html');

if ($email === '' || $contrasena === '') {
    redirigir("login.html?error=campos&next=" . urlencode($destino));
}

@mysqli_query($conexion, "ALTER TABLE usuarios ADD COLUMN direccion TEXT DEFAULT NULL");

$consulta = mysqli_prepare($conexion, "SELECT id_usuario, nombre, apellido, email, contrasena, direccion FROM usuarios WHERE email = ? LIMIT 1");
mysqli_stmt_bind_param($consulta, "s", $email);
mysqli_stmt_execute($consulta);
$resultado = mysqli_stmt_get_result($consulta);
$usuario = mysqli_fetch_assoc($resultado);

if (!$usuario || $contrasena !== $usuario['contrasena']) {
    redirigir("login.html?error=credenciales&next=" . urlencode($destino));
}

$_SESSION['id_usuario'] = $usuario['id_usuario'];
$_SESSION['nombre'] = $usuario['nombre'];
$_SESSION['apellido'] = $usuario['apellido'];
$_SESSION['email'] = $usuario['email'];
$_SESSION['direccion'] = $usuario['direccion'] ?? '';

redirigir($destino);
