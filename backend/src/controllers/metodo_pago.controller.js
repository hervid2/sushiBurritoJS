// src/controllers/metodo_pago.controller.js
import db from '../models/index.js';
const MetodoPago = db.MetodoPago;

// Obtener todos los métodos de pago
export const getAllPaymentMethods = async (req, res) => {
    try {
        const metodos = await MetodoPago.findAll();
        res.status(200).send(metodos);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};