// src/seed.js (Verificado)

// Se importa la configuración de dotenv al principio para asegurar que las variables de entorno se carguen
// import dotenv from 'dotenv';
// import path from 'path';
// import { fileURLToPath } from 'url';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// dotenv.config({ path: path.join(__dirname, '..', '.env') });

// import db from './models/index.js';

// const createAdminUser = async () => {
//     try {
//         await db.sequelize.sync(); 
    
//         const adminUser = await db.Usuario.findOne({ where: { correo: 'admin@sushi.com' } });
    
//         if (!adminUser) {
//             await db.Usuario.create({
//                 nombre: '',
//                 rol: '',
//                 correo: '',
//                 contraseña: ''
//             });
//             console.log('✅ ¡Usuario administrador creado exitosamente!');
//         } else {
//             console.log('ℹ️ El usuario administrador ya existe.');
//         }

//     } catch (error) {
//         console.error('❌ Error al crear el usuario administrador:', error);
//     } finally {
//         await db.sequelize.close();
//     }
// };

// createAdminUser();