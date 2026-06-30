<?php
session_start();
?>

<!DOCTYPE html>
<html lang="es">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>BocadosDeAyuda – Login / Registro</title>
  <link rel="shortcut icon" href="img/tienda-de-comestibles.gif" type="image/x-icon" />
  <link rel="stylesheet" href="css/loginEstilo.css">
</head>

<body>

  <!-- HEADER -->
  <header>
    <a href="index.php" class="logo_link">
      <div class="contenedor_logo">
        <img src="img/tienda-de-comestibles.gif" alt="logo" width="45" onerror="this.style.display='none'">
        <h1>Bocados<span>DeAyuda</span></h1>
      </div>
    </a>

    <nav class="menu_navegacion">
      <a href="index.php">Inicio</a>
      <a href="menu.html">Menú</a>
      <a href="form_pedidos.html">Pedidos</a>
      <a href="promociones.html">Promociones</a>
    </nav>
  </header>

  <!-- MAIN -->
  <main>
    <div class="auth_card">

      <!-- PANEL IZQUIERDO -->
      <div class="panel_izquierdo">
        <div>
          <div class="panel_logo">
            <div class="panel_logo_icon">
              <img src="img/tienda-de-comestibles.gif" alt="carrito" width="35px" style="transform: scaleX(-1);">
            </div>
            <span class="panel_logo_nombre">Bocados<span>DeAyuda</span></span>
          </div>

          <h2 class="panel_titulo">
            Cada alimento salvado es una <em>ayuda para el planeta</em>
          </h2>
          <p class="panel_desc">
            Conectamos personas con restaurantes y marcas peruanas para rescatar
            alimentos de calidad y evitar el desperdicio. Comer rico también genera impacto.
          </p>
        </div>

        <div class="panel_stats">
          <div class="stat_item">
            <span class="stat_num">500+</span>
            <span class="stat_label">Alimentos rescatados</span>
          </div>
          <div class="stat_item">
            <span class="stat_num">80+</span>
            <span class="stat_label">Restaurantes aliados</span>
          </div>
          <div class="panel_tag">
            <span>♻️</span>
            <p>Menos desperdicio · Precios accesibles · Impacto positivo</p>
          </div>
        </div>
      </div>

      <!-- PANEL DERECHO -->
      <div class="panel_derecho">

        <div class="tabs">
          <button class="tab_btn active">Iniciar Sesión</button>
          <button class="tab_btn">
            <a href="registrar.html" style="text-decoration: none; color: #888;">Registrarse</a>
          </button>
        </div>

        <!-- LOGIN -->
        <form class="form_panel active" id="login" action="php/login.php" method="post">
          <div class="form_titulo">¡Bienvenido de vuelta! 👋</div>
          <div class="form_sub">¿No tienes cuenta? <a href="registrar.html">Regístrate
              gratis</a></div>

          <div class="campo">
            <label for="loginEmail">Correo electrónico</label>
            <input type="email" id="loginEmail" name="loginEmail" placeholder="tucorreo@ejemplo.com" autocomplete="on">
          </div>

          <div class="campo">
            <label for="loginPass">Contraseña</label>
            <input type="password" id="loginPass" name="loginPass" placeholder="••••••••" autocomplete="off">
            <img src="img/cerrado.png" alt="OJO CERRADO" id="ojoCerradoIconPass" onclick="mostrarContraseña()">
          </div>

          <div class="form_opciones">
            <label class="recordarme">
              <input type="checkbox" /> Recuérdame
            </label>
            <a href="#" class="olvide">¿Olvidaste tu contraseña?</a>
          </div>

          <button class="submit_btn" onclick="validarLogin()" type="submit">Iniciar Sesión →</button>

          <p id="errorLogin" class="msg_error"></p>
        </form>
      </div>
    </div>
  </main>

  <!-- FOOTER -->
  <footer>
    <span>© 2026 BocadosDeAyuda · Arequipa, Perú</span>
    <span>
      <a href="menu.html">Menú</a> ·
      <a href="promociones.html">Promociones</a>
    </span>
  </footer>

  <script>
    // Mostrar contraseña
    function mostrarContraseña() {
      const input = document.getElementById("loginPass");
      if (input.type === "password") {
        input.type = "text";
      } else {
        input.type = "password";
      }
    }
  </script>

</body>

</html>