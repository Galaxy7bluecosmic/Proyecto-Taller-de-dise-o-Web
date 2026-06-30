<?php
session_start();
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pedidos | BocadosDeAyuda</title>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="css/pedidos.css">
    <link rel="stylesheet" href="css/grid/grid-pedidos.css">
</head>
<body>

    <div class="contenedor_pedidos">
        <header class="header_principal">
            <a href="index.php" class="logo_link">
                <div class="contenedor_logo">
                    <img src="img/tienda-de-comestibles.gif" width="50" alt="Logo">
                    <h1>Bocados<span>DeAyuda</span></h1>
                </div>
            </a>
            <nav class="menu_principal">
                <a href="index.php">Inicio</a>
                <a href="menu.html">Menú</a>
                <a href="promociones.html">Promociones</a>
                
            </nav>
            
            <?php if (isset($_SESSION['nombre'])) { ?>

                <div class="contenedorBotonSesio">
                    <div class="usuario_logueado" onclick="mostrarMenu()">
                        <span>
                            <img src="img/avatar.png" alt="avatar" id="avatarIcon">
                            <p>
                                <?php echo $_SESSION['nombre']; ?>
                            </p>
                            <img src="img/abajo.png" alt="abajo flecha abrir menu" id="avatarAbajo">
                        </span>
                    </div>
                    <div class="menuDesplegable" id="menuDesplegableID" style="display: none;">
                        <div class="contenedorMenuPerfil">
                            <div class="MenuPerfil">
                                <img src="img/usuario.png" alt="usuario icons" width="20px">
                                <a href="perfil.html">Mi perfil</a>
                            </div>
                            <div class="MenuPerfil">
                                <img src="img/bolsa-de-la-compra.png" alt="bolsa de compra" width="20px">
                                <a href="#">Mis Pedidos</a>
                            </div>
                            <div class="MenuPerfil">
                                <img src="img/favorito.png" alt="favoritos" width="20px">
                                <a href="#">Favoritos</a>
                            </div>
                            <div class="MenuPerfil">
                                <img src="img/mapas-y-banderas.png" alt="direccion" width="20px">
                                <a href="#">Direcciones</a>
                            </div>
                            <div class="MenuPerfil">
                                <img src="img/cerrar-sesion.png" alt="icono salir de la pagina" width="20px">
                                <a href="php/cerrarSesion.php" class="btn_cerrar">
                                    Cerrar sesión
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

            <?php } else { ?>

                <a href="login.php" class="btn_login">
                    <p>Acceder</p>
                </a>

            <?php } ?>
        </header>

        <section class="banner_titulo">
            <div class="banner_info">
                <span class="tag_fastfood">Historial de Antojos</span>
                <h2>FRESCO, RICO Y DELICIOSO</h2>
                <p>Monitorea el estado de tus pedidos en tiempo real.</p>
            </div>
        </section>

        <main class="seccion_pedidos">
            <h3 class="titulo_lista">Mis Pedidos Recientes</h3>
            
            <div class="lista_pedidos_grid">
                
                <article class="card_pedido en_camino">
                    <div class="foto_comida">
                        <img src="img/lomoSaltado.webp" alt="Lomo Saltado">
                    </div>
                    <div class="info_comida">
                        <h4>Lomo Saltado</h4>
                        <p>Carne salteada con cebolla, tomate, papas fritas y arroz blanco.</p>
                    </div>
                    <div class="valores_comida">
                        <span class="cantidad">Cant: 2</span>
                        <span class="precio_total">S/ 18.90</span>
                    </div>
                    <div class="estado_pedido">
                        <span class="status badge_camino"> En camino</span>
                        <button class="btn_cancelar">Cancelar Pedido</button>
                    </div>
                </article>

                <article class="card_pedido entregado">
                    <div class="foto_comida">
                        <img src="img/ceviche.webp" alt="Ceviche Clásico">
                    </div>
                    <div class="info_comida">
                        <h4>Ceviche Clásico</h4>
                        <p>Pescado fresco con limón peruano, choclo, cancha y camote.</p>
                    </div>
                    <div class="valores_comida">
                        <span class="cantidad">Cant: 1</span>
                        <span class="precio_total">S/ 24.90</span>
                    </div>
                    <div class="estado_pedido">
                       <span class="status badge_camino">En camino</span>
                       <button class="btn_cancelar">Cancelar Pedido</button>
                    </div>
                </article>

                <article class="card_pedido en_camino">
                    <div class="foto_comida">
                        <img src="img/picarones.jpg" alt="Picarones">
                    </div>
                    <div class="info_comida">
                        <h4>Picarones</h4>
                        <p>Tradicional postre peruano con miel de chancaca artesanal.</p>
                    </div>
                    <div class="valores_comida">
                        <span class="cantidad">Cant: 3</span>
                        <span class="precio_total">S/ 38.70</span>
                    </div>
                    <div class="estado_pedido">
                         <span class="status badge_entregado"> Entregado</span>
                        
                    </div>
                </article>

            </div>

            <div class="contenedor_volver">
                <a href="index.html" class="btn_volver">Volver al Inicio</a>
            </div>
        </main>
    </div>

    <script>
        function mostrarMenu() {
            const menuUsuario = document.getElementById("menuDesplegableID");
            const imageFlecha = document.getElementById("avatarAbajo");

            if (menuUsuario.style.display === "none") {
                menuUsuario.style.display = "block";
                imageFlecha.src = "img/subir.png";
            } else {
                menuUsuario.style.display = "none";
                imageFlecha.src = "img/abajo.png";
            }
        }

        document.addEventListener("click", function(event) {

            const menu = document.getElementById("menuDesplegableID");
            const boton = document.querySelector(".usuario_logueado");
            const imageFlecha = document.getElementById("avatarAbajo");

            if (!menu.contains(event.target) && !boton.contains(event.target)) {
                menu.style.display = "none";
                imageFlecha.src = "img/abajo.png";
            }

        });
    </script>

</body>
</html>