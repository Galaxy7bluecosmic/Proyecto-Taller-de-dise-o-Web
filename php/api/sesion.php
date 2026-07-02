<?php
session_start();

header('Content-Type: application/json; charset=utf-8');

echo json_encode([
    'logueado' => isset($_SESSION['nombre']),
    'nombre' => $_SESSION['nombre'] ?? '',
    'email' => $_SESSION['email'] ?? ''
], JSON_UNESCAPED_UNICODE);
