// // ==========================
// // ARCHIVO: src/seed.js 
// // PROPÓSITO: Hacer una script "siembra" para insertar el administrador
// // =========================

// import db from './models/index.js';
// import bcrypt from 'bcryptjs';

// const createInitialData = async () => {
//   try {
//     // --- Crear Roles ---
//     // Usamos findOrCreate para no duplicar si ya existen
//     const [adminRole, adminCreated] = await db.Rol.findOrCreate({
//       where: { nombre_rol: 'administrador' },
//       defaults: { nombre_rol: 'administrador' }
//     });
    
//     const [waiterRole, waiterCreated] = await db.Rol.findOrCreate({
//       where: { nombre_rol: 'mesero' },
//       defaults: { nombre_rol: 'mesero' }
//     });

//     const [kitchenRole, kitchenCreated] = await db.Rol.findOrCreate({
//       where: { nombre_rol: 'cocinero' },
//       defaults: { nombre_rol: 'cocinero' }
//     });
    
//     if (adminCreated) console.log('Rol "administrador" creado.');
//     if (waiterCreated) console.log('Rol "mesero" creado.');
//     if (kitchenCreated) console.log('Rol "cocinero" creado.');

//     // --- Crear Usuario Administrador ---
//     // Usamos findOrCreate para no crear el admin si ya existe
//     const [adminUser, adminUserCreated] = await db.Usuario.findOrCreate({
//       where: { correo: 'correo en mención' },
//       defaults: {
//         nombre: 'nombre en mención',
//         correo: 'correo en mención',
//         // IMPORTANTE: Pasamos la contraseña en texto plano.
//         // El hook 'beforeCreate' del modelo se encargará de hashearla.
//         contraseña: 'contraseña en mención', 
//         rol_id: adminRole.rol_id
//       }
//     });

//     if (adminUserCreated) {
//       console.log('============================================================');
//       console.log('¡Usuario Administrador nombre en mención creado exitosamente!');
//       console.log(`Correo: correo en mención`);
//       console.log(`Contraseña: contraseña en mención`);
//       console.log('============================================================');
//     } else {
//       console.log('El usuario administrador "correo en mención" ya existía.');
//     }

//   } catch (error) {
//     console.error('Error al ejecutar el script de seed:', error);
//   } finally {
//     // Cerramos la conexión a la base de datos
//     await db.sequelize.close();
//     console.log('Conexión con la base de datos cerrada.');
//   }
// };

// createInitialData();

// // Posterior a descomentar este codigo y con el prósito de sembrar el primer usario root,
// // se debe ejecutar el siguiente comando en la terminal a la altura de 
// // la raiz del backend: npm run db:seed