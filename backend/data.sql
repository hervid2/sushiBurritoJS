-- Crear el usuario
CREATE USER if not exists ''@'localhost' IDENTIFIED BY '';

#Creamos la base de datos
CREATE DATABASE sushiBurritoJS_DB CHARACTER SET utf8mb4;

#Asignamos la base de datos al usuario y le damos todos los permisos
GRANT ALL PRIVILEGES ON sushiBurritoJS_DB.* TO ""@"localhost";

#Refrescamos los permisos de todo el sistema
FLUSH PRIVILEGES;

-- seleccionamos la base de datos
use sushiBurritoJS_DB;

--  -----------------------------------------------
#Scripts para la creación de las diferentes tablas:
--  -----------------------------------------------

-- 1. Tabla categorias: Para categorizar los productos
-- No tiene dependencias externas.
CREATE TABLE categorias (
  categoria_id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE COMMENT 'Define tipos de categorías de productos.'
);

-- 2. Tabla usuarios: Almacena información de los empleados del sistema 
-- Depende de 'roles'.
CREATE TABLE usuarios (
  usuario_id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  rol_id INT,  -- Se reemplaza el ENUM
  correo VARCHAR(100) UNIQUE,
  contraseña VARCHAR(255) NOT NULL,
  FOREIGN KEY (rol_id) REFERENCES roles(rol_id)
);

-- 3.  Tabla para definir los roles del sistema
CREATE TABLE roles (
  rol_id INT AUTO_INCREMENT PRIMARY KEY,
  nombre_rol VARCHAR(50) NOT NULL UNIQUE COMMENT 'Ej: administrador, mesero'
);

-- 4. Tabla productos: Cada platillo o artículo del menú.
-- Depende de 'categorias'.
CREATE TABLE productos (
  producto_id INT AUTO_INCREMENT PRIMARY KEY,
  nombre_producto VARCHAR(100) NOT NULL COMMENT 'Nombre del producto o platillo.',
  descripcion_ingredientes TEXT COMMENT 'Descripción de los ingredientes o del platillo.',
  valor_neto DECIMAL(10,2) NOT NULL COMMENT 'Precio base del producto sin impuestos.',
  categoria_id INT,
  FOREIGN KEY (categoria_id) REFERENCES categorias(categoria_id)
);

-- 5. Tabla mesas: Para la gestión de las mesas del restaurante.
-- No tiene dependencias externas.
CREATE TABLE mesas (
  mesa_id INT AUTO_INCREMENT PRIMARY KEY,
  numero_mesa INT NOT NULL UNIQUE COMMENT 'Número único de la mesa.',
  estado ENUM('disponible','ocupada','limpieza','inactiva') NOT NULL DEFAULT 'disponible' COMMENT 'Estado actual de la mesa.'
);

-- 6. Tabla pedidos: Representa un pedido realizado en una mesa.
-- Depende de 'usuarios' (para el mesero que tomó el pedido) y 'mesas'.
CREATE TABLE pedidos (
  pedido_id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT COMMENT 'ID del mesero que tomó el pedido.',
  mesa_id INT COMMENT 'ID de la mesa asociada al pedido.',
  estado ENUM('pendiente','en_preparacion','preparado','entregado','pagado','cancelado') NOT NULL DEFAULT 'pendiente' COMMENT 'Estado de preparación y pago del pedido',
  fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha y hora de creación del pedido.',
  fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Última fecha y hora de modificación del pedido, se actualiza automáticamente.',
  FOREIGN KEY (usuario_id) REFERENCES usuarios(usuario_id),
  FOREIGN KEY (mesa_id) REFERENCES mesas(mesa_id)
);

-- 7. Tabla detalle_pedido: Contiene los productos específicos de cada pedido.
-- Es la tabla pivote entre 'pedidos' y 'productos'.
-- Depende de 'pedidos' y 'productos'.
CREATE TABLE detalle_pedido (
  detalle_id INT AUTO_INCREMENT PRIMARY KEY,
  pedido_id INT,
  producto_id INT,
  cantidad INT NOT NULL CHECK (cantidad > 0) COMMENT 'Cantidad del producto en el pedido (debe ser mayor a 0).',
  notas TEXT COMMENT 'Notas adicionales para este producto específico (ej. "sin cebolla").',
  FOREIGN KEY (producto_id) REFERENCES productos(producto_id),
  FOREIGN KEY (pedido_id) REFERENCES pedidos(pedido_id) ON DELETE CASCADE
);

-- 8. Tabla metodos_pago: Para registrar los diferentes métodos de pago aceptados.
-- No tiene dependencias externas.
CREATE TABLE metodos_pago (
  metodo_pago_id INT AUTO_INCREMENT PRIMARY KEY,
  nombre_metodo VARCHAR(50) NOT NULL UNIQUE COMMENT 'Nombre del método de pago (ej. Efectivo, Tarjeta de Crédito, Transferencia).'
);

-- 9. Tabla facturas: Almacena el resumen de las transacciones de pago.
-- Depende de 'pedidos'.
CREATE TABLE facturas (
  factura_id INT AUTO_INCREMENT PRIMARY KEY,
  pedido_id INT UNIQUE,
  subtotal DECIMAL(10,2) NOT NULL,
  impuesto_total DECIMAL(10,2) NOT NULL,
  propina DECIMAL(10, 2) NULL DEFAULT 0.0,
  total DECIMAL(10,2) NOT NULL,
  fecha_factura DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (pedido_id) REFERENCES pedidos(pedido_id)
);

-- 10. Tabla para registrar los pagos de una factura, permitiendo múltiples métodos
-- Depende de 'metodos_pago' y 'facturas'
CREATE TABLE transacciones_pago (
  transaccion_id INT AUTO_INCREMENT PRIMARY KEY,
  factura_id INT,
  metodo_pago_id INT,
  monto_pagado DECIMAL(10, 2) NOT NULL COMMENT 'Monto específico pagado con este método.',
  FOREIGN KEY (factura_id) REFERENCES facturas(factura_id),
  FOREIGN KEY (metodo_pago_id) REFERENCES metodos_pago(metodo_pago_id)
);

--  -----------------------------------------------
#scripts iniciales para manipular la DB:
--  -----------------------------------------------

show tables;

describe productos;
describe categorias;
describe usuarios;
describe roles;
describe facturas;
describe pedidos;
describe detalle_pedido;
describe mesas;
describe metodos_pago;
describe transacciones_pago;

select * from categorias;
select * from usuarios;
select * from roles;
select * from productos;
select * from pedidos;
select * from detalle_pedido;
select * from facturas;
select * from mesas;
select * from metodos_pago;
select * from transacciones_pago;


-- Insertar las categorías iniciales
INSERT INTO categorias (nombre) VALUES
('Infantil'),
('Bebidas'),
('Postres'),
('Entradas'),
('Platos Fuertes'),
('Acompañamientos');

-- insertar las mesas iniciales
INSERT INTO mesas (numero_mesa) VALUES
(1),(2),(3),(4),(5),(6),(7),(8),(9),(10),(11),(12);

-- Insertar los métodos de pago iniciales
INSERT INTO metodos_pago (nombre_metodo) VALUES
('Tarjeta Crédito'),
('Tarjeta Débito'),
('Efectivo'),
('Nequi'),
('Daviplata'),
('Transferencia bancaria');

-- Insertar roles iniciales
INSERT INTO roles (nombre_rol) VALUES
('administrador'),
('mesero'),
('cocinero');

