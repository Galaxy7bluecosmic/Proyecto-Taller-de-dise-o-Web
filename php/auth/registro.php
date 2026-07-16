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
@mysqli_query($conexion, "ALTER TABLE usuarios ADD COLUMN telefono VARCHAR(20) DEFAULT NULL");

function texto_valido($valor, $min, $max)
{
    $largo = function_exists('mb_strlen') ? mb_strlen($valor, 'UTF-8') : strlen($valor);
    return $largo >= $min && $largo <= $max;
}

function nombre_valido($valor)
{
    return texto_valido($valor, 2, 15) && preg_match('/^[\p{L}]+$/u', $valor);
}

function telefono_valido($valor)
{
    return preg_match('/^9\d{8}$/', $valor);
}

function direccion_valida($valor)
{
    return texto_valido($valor, 8, 80)
        && preg_match('/[\p{L}]/u', $valor)
        && (!str_contains($valor, '#') || preg_match('/#\d+/', $valor))
        && substr_count($valor, '#') <= 1
        && preg_match('/^[\p{L}0-9\s#]+$/u', $valor);
}

function email_valido($valor)
{
    return preg_match('/^[A-Za-z0-9._-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)+$/', $valor)
        && preg_match('/\.(com|edu|pe|org|net)$/i', $valor);
}

if (
    !nombre_valido($nombre) ||
    !nombre_valido($apellido) ||
    !email_valido($email) ||
    !telefono_valido($telefono) ||
    !direccion_valida($direccion) ||
    strlen($contrasena) < 8 ||
    !preg_match('/[A-Za-z]/', $contrasena) ||
    !preg_match('/\d/', $contrasena)
) {
    redirigir("registrar.html?error=validacion&next=" . urlencode($destino));
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
$_SESSION['telefono'] = $telefono;
$_SESSION['direccion'] = $direccion;
$_SESSION['id_usuario'] = mysqli_insert_id($conexion);

redirigir($destino);
