<?php
session_start();
require_once __DIR__ . "/../config/conexion.php";
require_once __DIR__ . "/helpers.php";

$nombre = trim($_POST['regNombre'] ?? '');
$apellido = trim($_POST['regApellido'] ?? '');
$email = trim($_POST['regEmail'] ?? '');
$contrasena = $_POST['regPass'] ?? '';
$telefono = trim($_POST['regTelefono'] ?? '');
$destino = destino_seguro($_POST['next'] ?? 'index.html');

if ($nombre === '' || $apellido === '' || $email === '' || $contrasena === '') {
    redirigir("registrar.html?error=campos&next=" . urlencode($destino));
}

$consultaEmail = mysqli_prepare($conexion, "SELECT id_usuario FROM usuarios WHERE email = ? LIMIT 1");
mysqli_stmt_bind_param($consultaEmail, "s", $email);
mysqli_stmt_execute($consultaEmail);
$resultadoEmail = mysqli_stmt_get_result($consultaEmail);

if (mysqli_fetch_assoc($resultadoEmail)) {
    redirigir("registrar.html?error=email&next=" . urlencode($destino));
}

$consulta = mysqli_prepare(
    $conexion,
    "INSERT INTO usuarios (nombre, apellido, email, contrasena, telefono) VALUES (?, ?, ?, ?, ?)"
);
mysqli_stmt_bind_param($consulta, "sssss", $nombre, $apellido, $email, $contrasena, $telefono);
$registrado = mysqli_stmt_execute($consulta);

if (!$registrado) {
    redirigir("registrar.html?error=registro&next=" . urlencode($destino));
}

$_SESSION['nombre'] = $nombre;
$_SESSION['email'] = $email;

redirigir($destino);
