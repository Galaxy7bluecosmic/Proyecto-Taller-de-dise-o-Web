SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";
SET NAMES utf8mb4;

CREATE DATABASE IF NOT EXISTS `bocados_de_ayuda` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `bocados_de_ayuda`;

CREATE TABLE `categoriasmenu` (
  `id_categoria` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` varchar(500) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `categoriasmenu` (`id_categoria`, `nombre`, `descripcion`) VALUES
(1, 'Criolla', 'Sabores criollos que reúnen tradición, calidad y el auténtico gusto de casa.'),
(2, 'Casera', 'Platos caseros elaborados con ingredientes frescos y de calidad.'),
(3, 'Mariscos', 'Disfruta de deliciosos platos marinos, frescos y llenos de sabor.'),
(4, 'Parrillas', 'Disfruta de las mejores parrillas, jugosas y llenas de sabor.'),
(5, 'Chifa', 'Recetas de chifa con ingredientes frescos y de calidad.'),
(6, 'Postres', 'El final perfecto con un postre lleno de sabor.'),
(7, 'Bebidas', 'Bebidas refrescantes para acompañar cada momento.');

CREATE TABLE `menus` (
  `id_Menu` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` varchar(300) NOT NULL,
  `precio` double NOT NULL,
  `imagen` text NOT NULL,
  `demoraAPROX` int(100) NOT NULL,
  `id_categoria` int(11) NOT NULL,
  `stock` int(11) NOT NULL DEFAULT 10,
  `creado_en` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `menus` (`id_Menu`, `nombre`, `descripcion`, `precio`, `imagen`, `demoraAPROX`, `id_categoria`, `stock`, `creado_en`) VALUES
(1, 'Lomo Saltado', 'Jugosos trozos de carne salteados al wok con cebolla, tomate, papas fritas crocantes y arroz blanco.', 18.9, 'img/lomoSaltado.webp', 20, 1, 8, current_timestamp()),
(2, 'Ají de Gallina', 'Cremoso ají amarillo con pollo deshilachado, acompañado de arroz, papa sancochada y huevo.', 16.5, 'img/aji de gallina.jpg', 15, 1, 5, current_timestamp()),
(3, 'Ceviche Clásico', 'Pescado fresco marinado en limón peruano con cebolla, choclo, camote y cancha serrana.', 24.9, 'img/ceviche.webp', 25, 3, 4, current_timestamp()),
(4, 'Arroz Chaufa', 'Arroz salteado al estilo chifa con pollo, tortilla de huevo, cebollita china y sillao.', 17.9, 'img/chaufa.jpg', 18, 5, 10, current_timestamp()),
(5, 'Parrilla Mixta', 'Carne, pollo y chorizo a la parrilla con papas doradas, ensalada fresca y cremas especiales.', 29.9, 'img/parrillamixta.jpg', 30, 4, 2, current_timestamp()),
(6, 'Tallarines Verdes', 'Pasta bañada en salsa de albahaca y espinaca, acompañada de bistec jugoso.', 18, 'img/tallarines verdes.jpg', 22, 2, 7, current_timestamp()),
(7, 'Pollo a la Brasa', 'Pollo crocante y jugoso acompañado de papas fritas, ensalada y cremas peruanas.', 22.9, 'img/pollo a la brasa.jpg', 20, 2, 12, current_timestamp()),
(8, 'Picarones', 'Tradicional postre peruano preparado con zapallo y miel de chancaca artesanal.', 12.9, 'img/picarones.jpg', 10, 6, 0, current_timestamp());

CREATE TABLE `promociones` (
  `id_promocion` int(11) NOT NULL,
  `nombre` varchar(120) NOT NULL,
  `descripcion` varchar(400) NOT NULL,
  `etiqueta` varchar(80) NOT NULL,
  `restaurante` varchar(120) NOT NULL DEFAULT 'BocadosDeAyuda',
  `precio_anterior` double NOT NULL,
  `precio_nuevo` double NOT NULL,
  `descuento` varchar(40) NOT NULL,
  `imagen` text NOT NULL,
  `color` varchar(30) NOT NULL DEFAULT 'amarillo',
  `stock` int(11) NOT NULL DEFAULT 10,
  `demoraAPROX` int(11) NOT NULL DEFAULT 20,
  `creado_en` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `promociones` (`id_promocion`, `nombre`, `descripcion`, `etiqueta`, `restaurante`, `precio_anterior`, `precio_nuevo`, `descuento`, `imagen`, `color`, `stock`, `demoraAPROX`, `creado_en`) VALUES
(1, '2 Lomo Saltado + Inka Cola', 'Restaurante: El Sabor Criollo', 'SUPER PROMO', 'El Sabor Criollo', 28.9, 18.9, '35% OFF', 'img/lomoSaltado.webp', 'amarillo', 6, 20, current_timestamp()),
(2, 'Combo Verano Marino', 'Restaurante: Costa Azul', 'CÓMPRALO YA', 'Costa Azul', 54.9, 39.9, '27% OFF', 'img/combomarino.jpg', 'rojo', 5, 20, current_timestamp()),
(3, '2 Pollos a la Brasa', 'Incluye papas familiares y cremas.', 'PROMO FAMILIAR', 'BocadosDeAyuda', 89.9, 64.9, '28% OFF', 'img/pollos.jpg', 'morado', 4, 20, current_timestamp()),
(4, 'Combo Familiar Chifa', 'Chaufa + Wantán + Gaseosa 1.5L', 'COMBO', 'BocadosDeAyuda', 49.9, 34.9, '30% OFF', 'img/chifa.jpg', 'verde', 7, 20, current_timestamp()),
(5, 'Postres Peruanos', 'Picarones + Mazamorra + Arroz con leche', 'DULCE', 'BocadosDeAyuda', 24.9, 16.9, '32% OFF', 'img/postres.png', 'naranja', 3, 20, current_timestamp()),
(6, 'Parrilla Doble', 'Carne + pollo + chorizo + papas', 'PARRILLA', 'BocadosDeAyuda', 69.9, 49.9, '29% OFF', 'img/parrilla.jpg', 'celeste', 0, 20, current_timestamp());

CREATE TABLE `usuarios` (
  `id_usuario` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `contrasena` varchar(255) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `rol` varchar(20) NOT NULL DEFAULT 'cliente'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `usuarios` (`id_usuario`, `nombre`, `apellido`, `email`, `contrasena`, `telefono`, `rol`) VALUES
(1, 'Paolo Josue', 'Coaquira Anccori', 'paolojosuecoaquiraanccori@gmail.com', 'pao20505', '937319442', 'cliente'),
(2, 'Juan', 'Pérez Quispe', 'juanperezquispe@gmail.com', 'Abc123', '93734859', 'cliente'),
(3, 'Admin', 'General', 'Admin@admin.com', 'Admin12345', '', 'admin');

CREATE TABLE `pedidos` (
  `id_pedido` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `total` double NOT NULL,
  `metodo_pago` varchar(30) NOT NULL,
  `estado` varchar(30) NOT NULL DEFAULT 'en_camino',
  `creado_en` timestamp NULL DEFAULT current_timestamp(),
  `cancelado_en` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `pedido_detalles` (
  `id_detalle` int(11) NOT NULL,
  `id_pedido` int(11) NOT NULL,
  `tipo_producto` enum('menu','promocion') NOT NULL,
  `id_producto` int(11) NOT NULL,
  `nombre` varchar(120) NOT NULL,
  `descripcion` varchar(400) NOT NULL,
  `imagen` text NOT NULL,
  `precio` double NOT NULL,
  `cantidad` int(11) NOT NULL,
  `demoraAPROX` int(11) NOT NULL,
  `estado` varchar(30) NOT NULL DEFAULT 'en_camino',
  `cancelado_en` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

ALTER TABLE `categoriasmenu`
  ADD PRIMARY KEY (`id_categoria`);

ALTER TABLE `menus`
  ADD PRIMARY KEY (`id_Menu`),
  ADD KEY `id_categoria` (`id_categoria`);

ALTER TABLE `promociones`
  ADD PRIMARY KEY (`id_promocion`);

ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id_usuario`),
  ADD UNIQUE KEY `email` (`email`);

ALTER TABLE `pedidos`
  ADD PRIMARY KEY (`id_pedido`),
  ADD KEY `id_usuario` (`id_usuario`);

ALTER TABLE `pedido_detalles`
  ADD PRIMARY KEY (`id_detalle`),
  ADD KEY `id_pedido` (`id_pedido`);

ALTER TABLE `categoriasmenu`
  MODIFY `id_categoria` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

ALTER TABLE `menus`
  MODIFY `id_Menu` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

ALTER TABLE `promociones`
  MODIFY `id_promocion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

ALTER TABLE `usuarios`
  MODIFY `id_usuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

ALTER TABLE `pedidos`
  MODIFY `id_pedido` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `pedido_detalles`
  MODIFY `id_detalle` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `menus`
  ADD CONSTRAINT `menus_ibfk_1` FOREIGN KEY (`id_categoria`) REFERENCES `categoriasmenu` (`id_categoria`);

COMMIT;
