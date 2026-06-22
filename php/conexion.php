<?php

$conexion = mysqli_connect(
    "localhost",
    "root",
    "",
    "bocados_de_ayuda"
);

if (!$conexion) {
    die("Error de conexión: " . mysqli_connect_error());
}

?>