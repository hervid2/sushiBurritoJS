// =================================================================
// ARCHIVO: src/controllers/metodo_pago.controller.js
// ROL: Controlador que maneja la lógica de negocio para
//      la entidad 'MetodoPago'. En este caso, solo se encarga
//      de la operación de lectura.
// =================================================================

import db from '../models/index.js';
const MetodoPago = db.MetodoPago; // Se obtiene el modelo MetodoPago desde el objeto db.

/**
 * Obtiene una lista de todos los métodos de pago disponibles.
 * @param {object} req - El objeto de la petición de Express.
 * @param {object} res - El objeto de la respuesta de Express.
 */
export const getAllPaymentMethods = async (req, res) => {
    try {
        // Se utiliza el método 'findAll' de Sequelize para obtener todos los registros de la tabla.
        const metodos = await MetodoPago.findAll();
        // Se envía la lista de métodos de pago con un estado 200 (OK).
        res.status(200).send(metodos);
    } catch (error) {
        // En caso de un error en la base de datos, se devuelve un 500 (Internal Server Error).
        res.status(500).send({ message: error.message });
    }
};
