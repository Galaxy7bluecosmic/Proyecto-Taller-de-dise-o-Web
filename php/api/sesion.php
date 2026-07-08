<?php
session_start();

header('Content-Type: application/json; charset=utf-8');

echo json_encode([
    'logueado' => isset($_SESSION['nombre']),
    'id_usuario' => $_SESSION['id_usuario'] ?? null,
    'nombre' => $_SESSION['nombre'] ?? '',
    'email' => $_SESSION['email'] ?? '',
    'admin' => strtolower($_SESSION['email'] ?? '') === 'admin@admin.com'
], JSON_UNESCAPED_UNICODE);
