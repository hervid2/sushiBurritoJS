-- Crear una contraseña para el usuario root
ALTER USER 'root'@'localhost' IDENTIFIED BY 'MYSQLKey2025';
FLUSH PRIVILEGES;
-- Crear el usuario
CREATE USER 'sushiBurrito'@'localhost' IDENTIFIED BY 'SBDataBaseKey2025';

#Creamos la base de datos
CREATE DATABASE sushiBurrito_DB CHARACTER SET utf8mb4;

#Asignamos la base de datos al usuario y le damos todos los permisos
GRANT ALL PRIVILEGES ON sushiBurrito_DB.* TO "sushiBurrito"@"localhost";

#Refrescamos los permisos de todo el sistema
FLUSH PRIVILEGES;

-- seleccionamos la base de datos
use sushiBurrito_DB;


-- Tabla usuarios (roles del sistema)
CREATE TABLE usuarios (
  usuario_id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  rol ENUM('administrador','mesero','cocinero') NOT NULL,
  correo VARCHAR(100) UNIQUE,
  contraseña VARCHAR(255) NOT NULL
);


--  Tabla productos (cada uno de los platillos  del menú)
CREATE TABLE productos (
  producto_id    INT AUTO_INCREMENT PRIMARY KEY,
  nombre         VARCHAR(100) NOT NULL,
  ingredientes   TEXT,
  valor_neto     DECIMAL(10,2),
  valor_venta    DECIMAL(10,2),
  impuesto       DECIMAL(5,2)    COMMENT 'Tasa de impuesto (%)',
  valor_total    DECIMAL(10,2)
);

-- Tabla Categorías para categorizar los productos
CREATE TABLE categorias (
  categoria_id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL UNIQUE
);


--  Tabla pedidos (Aquí el pedido junto con su estado de preparación)
CREATE TABLE pedidos (
  pedido_id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT,
  mesa INT,
  estado ENUM('pendiente','en_preparacion','preparado','entregado','pagado') NOT NULL DEFAULT 'pendiente',
  fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(usuario_id)
);

--  Tabla detalle_pedido (Son los detalles del pedido: platos, notas, cantidad, id de pedido)
CREATE TABLE detalle_pedido (
  detalle_id INT AUTO_INCREMENT PRIMARY KEY,
  pedido_id INT,
  producto_id INT,
  cantidad INT NOT NULL,
  notas TEXT,
  FOREIGN KEY (pedido_id) REFERENCES pedidos(pedido_id),
  FOREIGN KEY (producto_id) REFERENCES productos(producto_id)
);

--  Tabla facturas
CREATE TABLE facturas (
  factura_id INT AUTO_INCREMENT PRIMARY KEY,
  pedido_id INT,
  subtotal DECIMAL(10,2),
  impuesto_total DECIMAL(10,2),
  total DECIMAL(10,2),
  fecha_factura DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (pedido_id) REFERENCES pedidos(pedido_id)
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
ALTER TABLE facturas ADD COLUMN propina DECIMAL(10, 2) NOT NULL DEFAULT 0.0; -- Añade con un valor por defecto de 0.0
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