<?php
session_start();
?>

<!DOCTYPE html>
<html lang="es">

<head>

    <meta charset="UTF-8">

    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Promociones | BocadosDeAyuda</title>

    <link rel="stylesheet" href="css/promocionesEstilo.css">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">

    <link rel="stylesheet" href="css/grid/grid-promociones.css">

</head>

<body>

    <div class="contenedor_promos">

        <!-- HEADER -->

        <header>
            <a href="index.php" class="logo_link">
                <div class="contenedor_logo">
                    <img src="img/tienda-de-comestibles.gif" width="50">
                    <h1>Bocados<span>DeAyuda</span></h1>
                </div>
            </a>

            <nav class="menu_principal">
                <a href="index.php">Inicio</a>
                <a href="menu.php">Menú</a>
                <a href="pedidos.php">Pedidos</a>
                <a href="promociones.php">Promociones</a>
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
                                <a href="perfil.php">Mi perfil</a>
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

        <!-- HERO -->

        <section class="hero_promos">

            <div class="hero_texto">

                <h2>PROMOCIONES QUE RESCATAN SABOR</h2>
                <p>
                    Aprovecha nuestras ofertas especiales y ayuda a reducir el desperdicio
                    alimentario comprando alimentos deliciosos de restaurantes peruanos.
                </p>
                <a href="menu.php">Explorar Menú</a>

            </div>

            <div class="hero_imagen">
                <img src="img/promociones.jpg" alt="Promoción">
            </div>

        </section>

        <!-- PROMOS DESTACADAS -->

        <section class="promos_destacadas">

            <!-- CARD -->

            <article class="promo_grande amarillo">

                <div class="texto_promo">

                    <span class="etiqueta">
                        🔥 SUPER PROMO
                    </span>

                    <h3>
                        2 Lomo Saltado + Inka Cola
                    </h3>

                    <p>
                        Restaurante: El Sabor Criollo
                    </p>

                    <div class="precios">

                        <span class="precio_anterior">
                            S/ 28.90
                        </span>

                        <span class="precio_nuevo">
                            S/ 18.90
                        </span>

                    </div>

                    <div class="descuento">

                        35% OFF

                    </div>

                    <button>
                        Añádelo ya
                    </button>

                </div>

                <img src="img/lomoSaltado.webp" alt="Lomo Saltado">

            </article>

            <!-- CARD -->

            <article class="promo_grande rojo">

                <div class="texto_promo">

                    <span class="etiqueta">
                        🛒 CÓMPRALO YA
                    </span>

                    <h3>
                        Combo Verano Marino
                    </h3>

                    <p>
                        Restaurante: Costa Azul
                    </p>

                    <div class="precios">

                        <span class="precio_anterior">
                            S/ 54.90
                        </span>

                        <span class="precio_nuevo">
                            S/ 39.90
                        </span>

                    </div>

                    <div class="descuento">

                        27% OFF

                    </div>

                    <button>
                        Añádelo ya
                    </button>

                </div>

                <img src="img/combomarino.jpg" alt="Ceviche">

            </article>

        </section>

        <!-- MINI PROMOS -->

        <section class="mini_promos">

            <!-- MINI CARD -->

            <article class="mini_card morado promo_pollo">

                <h3>
                    2 Pollos a la Brasa
                </h3>

                <p>
                    Incluye papas familiares y cremas.
                </p>

                <div class="mini_precios">

                    <span class="tachado">
                        S/ 89.90
                    </span>

                    <span class="nuevo">
                        S/ 64.90
                    </span>

                </div>

                <button>
                    Añádelo ya
                </button>

            </article>

            <!-- MINI CARD -->

            <article class="mini_card verde promo_Chifa">

                <h3>
                    Combo Familiar Chifa
                </h3>

                <p>
                    Chaufa + Wantán + Gaseosa 1.5L
                </p>

                <div class="mini_precios">

                    <span class="tachado">
                        S/ 49.90
                    </span>

                    <span class="nuevo">
                        S/ 34.90
                    </span>

                </div>

                <button>
                    Añádelo ya
                </button>

            </article>

            <!-- MINI CARD -->

            <article class="mini_card naranja promo_Postres">

                <h3>
                    Postres Peruanos
                </h3>

                <p>
                    Picarones + Mazamorra + Arroz con leche
                </p>

                <div class="mini_precios">

                    <span class="tachado">
                        S/ 24.90
                    </span>

                    <span class="nuevo">
                        S/ 16.90
                    </span>

                </div>

                <button>
                    Añádelo ya
                </button>

            </article>

            <!-- MINI CARD -->

            <article class="mini_card celeste promo_Parrilla">

                <h3>
                    Parrilla Doble
                </h3>

                <p>
                    Carne + pollo + chorizo + papas
                </p>

                <div class="mini_precios">

                    <span class="tachado">
                        S/ 69.90
                    </span>

                    <span class="nuevo">
                        S/ 49.90
                    </span>

                </div>

                <button>
                    Añádelo ya
                </button>

            </article>

        </section>

        <!-- FRASE -->

        <section class="mensaje_final">

            <h2>
                “Comprar promociones también puede ayudar al planeta”
            </h2>

            <p>
                Cada compra evita que alimentos en perfecto estado sean desperdiciados.
            </p>

        </section>

        <!-- CARRITO -->

        <a href="form_pedidos.php" class="carrito_flotante">

             Carrito

            <span>
                3
            </span>

        </a>

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