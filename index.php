<?php
session_start();
?>

<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BocadosDeAyuda</title>
    <link rel="shortcut icon" href="img/tienda-de-comestibles.gif" type="image/x-icon">
    <link rel="stylesheet" href="css/indexEstilo.css">
    <link rel="stylesheet" href="css/grid/grid-index.css">
    <link rel="stylesheet" href="css/PantallaCarga.css">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>

<body>
    <!-- PANTALLA DE CARGA AVISAR SI MODIFICAN DIV -->
    <div class="pantalla_carga">
        <div class="contenido_carga">
            <p>Bienvenido a</p>
            <img src="img/tienda-de-comestibles.gif" alt="Logo">
            <h1>BocadosDeAyuda</h1>
        </div>
    </div>

    <div class="contenedor_principal">
        <!-- HEADER -->
        <header>
            <a href="index.php" class="logo_link">
                <div class="contenedor_logo">
                    <img src="img/tienda-de-comestibles.gif" alt="logo" width="55">
                    <h1>Bocados<span>DeAyuda</span></h1>
                </div>
            </a>
            <nav class="menu_navegacion">
                <a href="menu.html">Menú</a>
                <a href="pedidos.html">tus pedidos</a>
                <a href="promociones.html">Promociones</a>
            </nav>

            <?php if (isset($_SESSION['nombre'])) { ?>

                <div class="usuario_logueado">
                    <span> <img src="img/avatar.png" alt="avatar" id="avatarIcon"> <?php echo $_SESSION['nombre']; ?></span>

                    <a href="php/cerrarSesion.php" class="btn_cerrar">
                        Cerrar sesión
                    </a>
                </div>

            <?php } else { ?>

                <a href="login.html" class="btn_login">
                    <p>Acceder</p>
                </a>

            <?php } ?>

        </header>

        <!-- HERO -->

        <section class="hero">
            <div class="hero_texto">
                <h2>
                    Cada alimento salvado es una ayuda para el planeta
                </h2>
                <p>
                    En BocadosDeAyuda conectamos personas con restaurantes y marcas
                    peruanas para rescatar alimentos de calidad y evitar el desperdicio.
                    Comer rico también puede generar un impacto positivo.
                </p>
                <div class="hero_botones">
                    <a href="menu.html" class="btn_principal">
                        Ver Menú
                    </a>

                </div>
            </div>

            <div class="hero_imagen">
                <img src="img/ensalada2.png" alt="Comida saludable">
            </div>
        </section>

        <!-- MENSAJES -->

        <section class="mensajes">

            <div class="mensaje">
                <h3>Menos desperdicio</h3>
                <p>
                    Ayudamos a reducir toneladas de comida desperdiciada.
                </p>
            </div>

            <div class="mensaje">
                <h3>Restaurantes peruanos</h3>
                <p>
                    Trabajamos con marcas y negocios locales recomendados.
                </p>
            </div>

            <div class="mensaje">
                <h3>Alimentos de calidad</h3>
                <p>
                    Productos frescos a precios accesibles para todos.
                </p>
            </div>

        </section>

        <!-- SOBRE NOSOTROS -->

        <section class="sobre_nosotros">

            <div class="sobre_texto">

                <h2>
                    ¿Por qué nace BocadosDeAyuda?
                </h2>

                <p>
                    Miles de alimentos en perfecto estado terminan desperdiciados cada día.
                    Nuestro objetivo es rescatar esos productos y ofrecerlos mediante
                    promociones responsables, ayudando tanto al consumidor como a los
                    restaurantes aliados.
                </p>

                <p>
                    Creemos que pequeñas acciones pueden generar grandes cambios.
                    Comprar alimentos rescatados significa ahorrar dinero y también
                    cuidar el medio ambiente.
                </p>

                <a href="promociones.html">
                    Ver promociones
                </a>

            </div>

            <div class="sobre_imagen">

                <img src="img/promos.jpg" alt="Comida">

            </div>

        </section>

        <!-- BENEFICIOS -->

        <section class="beneficios">

            <div class="card_beneficio">

                <h3>Compra consciente</h3>

                <p>
                    Apoyas negocios locales mientras reduces el desperdicio alimentario.
                </p>

            </div>

            <div class="card_beneficio">

                <h3>Precios accesibles</h3>

                <p>
                    Encuentra productos de calidad con descuentos especiales.
                </p>

            </div>

            <div class="card_beneficio">

                <h3>Impacto positivo</h3>

                <p>
                    Cada pedido representa menos comida desperdiciada.
                </p>

            </div>

        </section>

        <!-- FRASE -->

        <section class="frase">

            <h2>
                “La comida no se desperdicia, se comparte.”
            </h2>

            <p>
                Juntos podemos construir un consumo más responsable y sostenible.
            </p>

            <a href="menu.html">
                Explorar alimentos
            </a>

        </section>

        <!-- FOOTER -->

        <footer>

            <div class="footer_info">

                <div>

                    <h3>BocadosDeAyuda</h3>

                    <p>
                        Proyecto enfocado en rescatar alimentos y reducir el desperdicio.
                    </p>

                </div>

                <div>

                    <h3>Enlaces</h3>

                    <a href="menu.html">Menú</a>
                    <a href="promociones.html">Promociones</a>

                </div>

                <div>

                    <h3>Contacto</h3>

                    <p>+51 999 999 999</p>
                    <p>Arequipa - Perú</p>

                </div>

            </div>

            <div class="redes">

                <a href="https://facebook.com" target="_blank">Facebook</a>

                <a href="https://instagram.com" target="_blank">Instagram</a>

                <a href="https://whatsapp.com" target="_blank">WhatsApp</a>

            </div>

            <p class="copy">
                © 2026 BocadosDeAyuda
            </p>

        </footer>

    </div>

</body>

</html>