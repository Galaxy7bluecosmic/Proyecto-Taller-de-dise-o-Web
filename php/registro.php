<?php

require_once "conexion.php";

$nombre = $_POST['regNombre'];
$apellido = $_POST['regApellido'];
$email = $_POST['regEmail'];
$contrasena = $_POST['regPass'];
$telefono = $_POST['regTelefono'];

$sql = "INSERT INTO usuarios
(nombre, apellido, email, contrasena, telefono)
VALUES
('$nombre', '$apellido', '$email', '$contrasena', '$telefono')";

$resultado = mysqli_query($conexion, $sql);

if($resultado){
    echo "Usuario registrado correctamente";
}else{
    echo "Error al registrar usuario";
}

?>