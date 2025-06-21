// =================================================================
// ARCHIVO: src/models/index.js
// =================================================================

import { Sequelize } from 'sequelize';
import sequelize from '../config/database.js';

// Importar todos los modelos
import UsuarioModel from './usuario.model.js';
import CategoriaModel from './categoria.model.js';
import ProductoModel from './producto.model.js';
import MesaModel from './mesa.model.js';
import PedidoModel from './pedido.model.js';
import DetallePedidoModel from './detalle_pedido.model.js';
import MetodoPagoModel from './metodo_pago.model.js';
import FacturaModel from './factura.model.js';

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Inicializar todos los modelos
db.Usuario = UsuarioModel(sequelize, Sequelize);
db.Categoria = CategoriaModel(sequelize, Sequelize);
db.Producto = ProductoModel(sequelize, Sequelize);
db.Mesa = MesaModel(sequelize, Sequelize);
db.Pedido = PedidoModel(sequelize, Sequelize);
db.DetallePedido = DetallePedidoModel(sequelize, Sequelize);
db.MetodoPago = MetodoPagoModel(sequelize, Sequelize);
db.Factura = FacturaModel(sequelize, Sequelize);

// --- Definir Asociaciones ---

// Usuario y Pedido (Un usuario/mesero tiene muchos pedidos)
db.Usuario.hasMany(db.Pedido, { foreignKey: 'usuario_id' });
db.Pedido.belongsTo(db.Usuario, { foreignKey: 'usuario_id' });

// Mesa y Pedido (Una mesa puede tener muchos pedidos a lo largo del tiempo)
db.Mesa.hasMany(db.Pedido, { foreignKey: 'mesa_id' });
db.Pedido.belongsTo(db.Mesa, { foreignKey: 'mesa_id' });

// Categoria y Producto (Una categoría tiene muchos productos)
db.Categoria.hasMany(db.Producto, { foreignKey: 'categoria_id' });
db.Producto.belongsTo(db.Categoria, { foreignKey: 'categoria_id' });

// Pedido y Producto (Relación Muchos a Muchos a través de DetallePedido)
db.Pedido.belongsToMany(db.Producto, { through: db.DetallePedido, foreignKey: 'pedido_id' });
db.Producto.belongsToMany(db.Pedido, { through: db.DetallePedido, foreignKey: 'producto_id' });

// Pedido y Factura (Uno a Uno)
db.Pedido.hasOne(db.Factura, { foreignKey: 'pedido_id' });
db.Factura.belongsTo(db.Pedido, { foreignKey: 'pedido_id' });

// MetodoPago y Factura (Un método de pago puede estar en muchas facturas)
db.MetodoPago.hasMany(db.Factura, { foreignKey: 'metodo_pago_id' });
db.Factura.belongsTo(db.MetodoPago, { foreignKey: 'metodo_pago_id' });


export default db;