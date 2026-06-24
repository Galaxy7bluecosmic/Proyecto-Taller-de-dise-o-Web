<?php

session_start();

session_unset(); // Borra variables de sesión
session_destroy(); // Destruye la sesión

header("Location: ../index.php");
exit();

?>