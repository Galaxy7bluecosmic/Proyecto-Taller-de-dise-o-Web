<?php
session_start();
require_once "conexion.php";

$email = $_POST['loginEmail'];
$contrasena = $_POST['loginPass'];

$sql = "SELECT * FROM usuarios WHERE email='$email'";
$resultado = mysqli_query($conexion, $sql);

if(mysqli_num_rows($resultado) == 1){

    $usuario = mysqli_fetch_assoc($resultado);

    if($contrasena == $usuario['contrasena']){

        $_SESSION['nombre'] = $usuario['nombre'];
        $_SESSION['email'] = $usuario['email'];

        header("Location: ../index.php");
        exit();

    }else{
        echo "Contraseña incorrecta";
    }

}else{
    echo "El usuario no existe";
}
?>