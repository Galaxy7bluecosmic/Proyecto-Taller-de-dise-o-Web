<?php
session_start();
require_once __DIR__ . "/../config/conexion.php";
require_once __DIR__ . "/helpers.php";

$nombre = trim($_POST['regNombre'] ?? '');
$apellido = trim($_POST['regApellido'] ?? '');
$email = trim($_POST['regEmail'] ?? '');
$contrasena = $_POST['regPass'] ?? '';
$telefono = trim($_POST['regTelefono'] ?? '');
$direccion = trim($_POST['regDireccion'] ?? '');
$destino = destino_seguro($_POST['next'] ?? 'index.html');

@mysqli_query($conexion, "ALTER TABLE usuarios ADD COLUMN direccion TEXT DEFAULT NULL");

if ($nombre === '' || $apellido === '' || $email === '' || $contrasena === '' || $direccion === '') {
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
    "INSERT INTO usuarios (nombre, apellido, email, contrasena, telefono, direccion) VALUES (?, ?, ?, ?, ?, ?)"
);
mysqli_stmt_bind_param($consulta, "ssssss", $nombre, $apellido, $email, $contrasena, $telefono, $direccion);
$registrado = mysqli_stmt_execute($consulta);

if (!$registrado) {
    redirigir("registrar.html?error=registro&next=" . urlencode($destino));
}

$_SESSION['nombre'] = $nombre;
$_SESSION['apellido'] = $apellido;
$_SESSION['email'] = $email;
$_SESSION['direccion'] = $direccion;
$_SESSION['id_usuario'] = mysqli_insert_id($conexion);

redirigir($destino);
