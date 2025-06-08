-- Crear el usuario
CREATE USER if not exists 'sushiBurrito'@'localhost' IDENTIFIED BY 'SBDataBaseKey2025';

#Creamos la base de datos
CREATE DATABASE sushiBurritoJS_DB CHARACTER SET utf8mb4;

#Asignamos la base de datos al usuario y le damos todos los permisos
GRANT ALL PRIVILEGES ON sushiBurritoJS_DB.* TO "sushiBurrito"@"localhost";

#Refrescamos los permisos de todo el sistema
FLUSH PRIVILEGES;

-- seleccionamos la base de datos
use sushiBurritoJS_DB;

#Scripts para la creación de las diferentes tablas:

-- 1. Tabla categorias: Para categorizar los productos
-- No tiene dependencias externas.
CREATE TABLE categorias (
  categoria_id INT AUTO_INCREMENT PRIMARY KEY,
  nombre ENUM('entradas','platos_fuertes','bebidas','acompañamientos','infantil','postres') NOT NULL UNIQUE COMMENT 'Define tipos de categorías de productos.'
);

-- 2. Tabla usuarios: Almacena información de los empleados del sistema 
-- No tiene dependencias externas.
CREATE TABLE usuarios (
  usuario_id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL COMMENT 'Nombre completo del usuario.',
  rol ENUM('administrador','mesero','cocinero') NOT NULL COMMENT 'Rol del usuario en el sistema.',
  correo VARCHAR(100) UNIQUE COMMENT 'Correo electrónico único del usuario.',
  contraseña VARCHAR(255) NOT NULL COMMENT 'Contraseña cifrada del usuario con hash.'
);

-- 3. Tabla productos: Cada platillo o artículo del menú.
-- Depende de 'categorias'.
CREATE TABLE productos (
  producto_id INT AUTO_INCREMENT PRIMARY KEY,
  nombre_producto VARCHAR(100) NOT NULL COMMENT 'Nombre del producto o platillo.',
  descripcion_ingredientes TEXT COMMENT 'Descripción de los ingredientes o del platillo.',
  valor_neto DECIMAL(10,2) NOT NULL COMMENT 'Precio base del producto sin impuestos.',
  categoria_id INT,
  FOREIGN KEY (categoria_id) REFERENCES categorias(categoria_id)
);

-- 4. Tabla mesas: Para la gestión de las mesas del restaurante.
-- No tiene dependencias externas.
CREATE TABLE mesas (
  mesa_id INT AUTO_INCREMENT PRIMARY KEY,
  numero_mesa INT NOT NULL UNIQUE COMMENT 'Número único de la mesa.',
  estado ENUM('disponible','ocupada','limpieza','inactiva') NOT NULL DEFAULT 'disponible' COMMENT 'Estado actual de la mesa.'
);

-- 5. Tabla pedidos: Representa un pedido realizado en una mesa.
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

-- 6. Tabla detalle_pedido: Contiene los productos específicos de cada pedido.
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

-- 7. Tabla metodos_pago: Para registrar los diferentes métodos de pago aceptados.
-- No tiene dependencias externas.
CREATE TABLE metodos_pago (
  metodo_pago_id INT AUTO_INCREMENT PRIMARY KEY,
  nombre_metodo VARCHAR(50) NOT NULL UNIQUE COMMENT 'Nombre del método de pago (ej. Efectivo, Tarjeta de Crédito, Transferencia).'
);

-- 8. Tabla facturas: Almacena el resumen de las transacciones de pago.
-- Depende de 'pedidos' y 'metodos_pago'.
CREATE TABLE facturas (
  factura_id INT AUTO_INCREMENT PRIMARY KEY,
  pedido_id INT UNIQUE COMMENT 'ID del pedido asociado a esta factura (una factura por pedido).',
  subtotal DECIMAL(10,2) NOT NULL COMMENT 'Suma de los valores netos de los productos del pedido.',
  impuesto_total DECIMAL(10,2) NOT NULL COMMENT 'Suma total de los impuestos aplicados.',
  propina DECIMAL(10, 2) NULL DEFAULT 0.0 COMMENT 'Valor de la propina, por defecto 0.0.',
  total DECIMAL(10,2) NOT NULL COMMENT 'Monto total de la factura, incluyendo subtotal, impuestos y propina.',
  fecha_factura DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha y hora de emisión de la factura.',
  metodo_pago_id INT COMMENT 'ID del método de pago utilizado.',
  FOREIGN KEY (pedido_id) REFERENCES pedidos(pedido_id),
  FOREIGN KEY (metodo_pago_id) REFERENCES metodos_pago(metodo_pago_id)
);



-- 9. Tabla proveedores: Información de los proveedores de ingredientes y otros suministros.
-- No tiene dependencias externas.
CREATE TABLE proveedores (
  proveedor_id INT AUTO_INCREMENT PRIMARY KEY,
  nombre_proveedor VARCHAR(100) NOT NULL UNIQUE COMMENT 'Nombre único del proveedor.',
  contacto_nombre VARCHAR(100) COMMENT 'Nombre de la persona de contacto en el proveedor.',
  contacto_telefono VARCHAR(20) COMMENT 'Número de teléfono del contacto.',
  contacto_email VARCHAR(100) COMMENT 'Correo electrónico del contacto.',
  direccion VARCHAR(255) COMMENT 'Dirección del proveedor.'
);



-- 10. Tabla turnos_empleados: Para gestionar los turnos de trabajo de los usuarios (empleados).
-- Depende de 'usuarios'.
CREATE TABLE turnos_empleados (
  turno_id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT COMMENT 'ID del usuario (empleado) asignado a este turno.',
  fecha_turno DATE NOT NULL COMMENT 'Fecha del turno.',
  hora_inicio TIME NOT NULL COMMENT 'Hora de inicio del turno.',
  hora_fin TIME NOT NULL COMMENT 'Hora de fin del turno.',
  FOREIGN KEY (usuario_id) REFERENCES usuarios(usuario_id)
);



-- scripts para manipular el CRUD:

describe productos;
describe categorias;
describe usuarios;
describe facturas;
describe pedidos;
describe detalle_pedido;

ALTER TABLE productos DROP COLUMN valor_total;
ALTER TABLE productos ADD categoria_id INT, ADD FOREIGN KEY (categoria_id) REFERENCES categorias(categoria_id);
ALTER TABLE usuarios CHANGE COLUMN contraseña contrasena VARCHAR(255) NOT NULL;
ALTER TABLE productos MODIFY COLUMN impuesto DECIMAL(10,2);
ALTER TABLE productos ADD COLUMN categoria_id INT, ADD CONSTRAINT fk_categoria FOREIGN KEY (categoria_id) REFERENCES categorias(categoria_id);
ALTER TABLE pedidos ADD COLUMN fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE facturas;
ALTER TABLE facturas ADD COLUMN propina DECIMAL(10, 2) NOT NULL DEFAULT 0.0;
ALTER TABLE pedidos ADD COLUMN producto TEXT NOT NULL, ADD COLUMN producto_categoria TEXT NOT NULL, ADD COLUMN hora_entrada DATETIME;
ALTER TABLE pedidos MODIFY COLUMN estado VARCHAR(30) NOT NULL;

UPDATE usuarios SET contrasena = '11ee147a5a224d61f825ad750949ab5939a72ddc4e68bf3f0afdb414637136bd' WHERE correo = 'ana.admin@sushiburrito.com';
UPDATE usuarios SET contrasena = '11ee147a5a224d61f825ad750949ab5939a72ddc4e68bf3f0afdb414637136bd' WHERE correo = 'carlos.mesero@sushiburrito.com';
UPDATE usuarios SET contrasena = '11ee147a5a224d61f825ad750949ab5939a72ddc4e68bf3f0afdb414637136bd' WHERE correo = 'laura.cocinera@sushiburrito.com';
UPDATE usuarios SET contrasena = 'pruebacon';

select * from categorias;
select * from usuarios;
select * from productos;
select * from pedidos;
select * from facturas;
-- Insertar las categorías iniciales
INSERT INTO categorias (nombre) VALUES
('Infantil'),
('Bebidas'),
('Postres'),
('Entradas'),
('Platos Fuertes'),
('Acompañamientos');

-- Insert de usuarios iniciales
INSERT INTO usuarios (nombre, rol, correo, contraseña) VALUES
('Ana Ramírez', 'administrador', 'ana.admin@sushiburrito.com', '6c4b761a3b2eac373c3dc47b9c6b859f00a848cfe77e0b03f04362d37717db2b'),
('Carlos Gómez', 'mesero', 'carlos.mesero@sushiburrito.com', '2b70c6a327b21378f2754dcd7ddff7ff19f8f86bdbff059e4e5b06f658192c18'),
('Laura Torres', 'cocinero', 'laura.cocinera@sushiburrito.com', '1ce1c875ea6b7cecf9cb727b03131b77ce3e52fa9d28a0459d3eb1181c2c4f07');