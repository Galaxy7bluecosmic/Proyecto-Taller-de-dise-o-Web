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

mysqli_set_charset($conexion, "utf8mb4");
