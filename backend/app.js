// app.js (en la raíz del proyecto)

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// .env está en la misma carpeta, así que la configuración es directa
dotenv.config();

// Se importa el archivo de la base de datos desde la carpeta /src
import db from './src/models/index.js';

// Se importan las rutas desde la carpeta /src
import usuarioRoutes from './src/routes/usuario.routes.js';
import authRoutes from './src/routes/auth.routes.js';

const app = express();

// --- Middlewares ---
app.use(cors());
app.use(express.json());

// --- Rutas ---
app.get('/api', (req, res) => {
    res.json({ message: 'Bienvenido al API de Sushi Burrito.' });
});

app.use('/api/usuarios', usuarioRoutes);
app.use('/api/auth', authRoutes);
// (Aquí agregarás las demás rutas de la misma manera)


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
