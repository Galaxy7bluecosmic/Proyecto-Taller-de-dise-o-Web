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

$consulta = mysqli_prepare($conexion, "SELECT id_usuario, nombre, email, contrasena FROM usuarios WHERE email = ? LIMIT 1");
mysqli_stmt_bind_param($consulta, "s", $email);
mysqli_stmt_execute($consulta);
$resultado = mysqli_stmt_get_result($consulta);
$usuario = mysqli_fetch_assoc($resultado);

if (!$usuario || $contrasena !== $usuario['contrasena']) {
    redirigir("login.html?error=credenciales&next=" . urlencode($destino));
}

$_SESSION['id_usuario'] = $usuario['id_usuario'];
$_SESSION['nombre'] = $usuario['nombre'];
$_SESSION['email'] = $usuario['email'];

redirigir($destino);
