<?php
function destino_seguro($destino)
{
    if (!is_string($destino) || !preg_match('/^[a-zA-Z0-9_\-]+\.html$/', $destino)) {
        return 'index.html';
    }

    return $destino;
}

function redirigir($ruta)
{
    header("Location: ../../" . $ruta);
    exit();
}
