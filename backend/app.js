// app.js 

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './src/models/index.js';


// .env está en la misma carpeta, así que la configuración es directa
dotenv.config();

// --- Importar Rutas ---
import usuarioRoutes from './src/routes/usuario.routes.js';
import authRoutes from './src/routes/auth.routes.js';
import categoriaRoutes from './src/routes/categoria.routes.js'; 
import productoRoutes from './src/routes/producto.routes.js';
import mesaRoutes from './src/routes/mesa.routes.js';     
import pedidoRoutes from './src/routes/pedido.routes.js';
import facturaRoutes from './src/routes/factura.routes.js';
import metodoPagoRoutes from './src/routes/metodo_pago.routes.js';
import statsRoutes from './src/routes/stats.routes.js';   

const app = express();

// --- Middlewares ---
app.use(cors());
app.use(express.json());

// --- Rutas ---
app.get('/api', (req, res) => {
    res.json({ message: 'Bienvenido al API de Sushi Burrito.' });
});

app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/mesas', mesaRoutes);      
app.use('/api/pedidos', pedidoRoutes);  
app.use('/api/facturas', facturaRoutes);
app.use('/api/metodos-pago', metodoPagoRoutes);
app.use('/api/stats', statsRoutes);


// --- Conexión y Arranque ---
db.sequelize.sync().then(() => {
    console.log('Base de datos sincronizada.');
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Servidor corriendo en el puerto ${PORT}.`);
    });
}).catch((err) => {
    console.error('Fallo al sincronizar la base de datos:', err);
});
