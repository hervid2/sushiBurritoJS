// =================================================================
// ARCHIVO: src/helpers/solicitudes.js
// ROL: Módulo centralizado para gestionar todas las peticiones
//      HTTP (fetch) a la API del backend. Actúa como una capa de
//      abstracción para simplificar y estandarizar la comunicación.
// =================================================================

import { showAlert } from './alerts.js';
import { navigateTo } from '../router/router.js';

// URL base del backend. Centralizarla aquí facilita el cambio
// entre entornos de desarrollo y producción.
const API_URL = 'http://localhost:3000/api';

/**
 * Función principal y privada que realiza la petición a la API.
 * Maneja la adición de tokens de autenticación y la gestión de errores comunes.
 *
 * @param {string} endpoint - El endpoint específico de la API (ej. 'usuarios', 'productos/1').
 * @param {string} method - El método HTTP a utilizar ('GET', 'POST', 'PUT', 'DELETE').
 * @param {object} [data=null] - El cuerpo de la petición para métodos POST o PUT.
 * @param {boolean} [isPublic=false] - Si es 'true', la petición no incluirá el token de autenticación.
 * @returns {Promise<any>} - Una promesa que se resuelve con la respuesta JSON de la API.
 * @throws {Error} - Lanza un error si la petición falla, para ser capturado por el llamador.
 */
async function fetchAPI(endpoint, method, data = null, isPublic = false) {
    // Configuración inicial de las cabeceras.
    const headers = { 'Content-Type': 'application/json' };
    const config = { method, headers };

    // Para rutas protegidas, se añade el token de autenticación.
    if (!isPublic) {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            // Si no hay token, la sesión es inválida. Se notifica y redirige al login.
            showAlert('Tu sesión ha expirado. Por favor, inicia sesión de nuevo.', 'warning');
            navigateTo('login');
            // Se lanza un error para detener la ejecución de la petición.
            throw new Error('Token de autenticación no encontrado.');
        }
        // Se añade el token al header 'Authorization' con el esquema 'Bearer'.
        headers['Authorization'] = `Bearer ${token}`;
    }

    // Si se proporcionan datos (para POST/PUT), se convierten a JSON y se añaden al cuerpo.
    if (data) {
        config.body = JSON.stringify(data);
    }

    try {
        // Se realiza la petición fetch a la URL completa.
        const response = await fetch(`${API_URL}/${endpoint}`, config);
        
        // Manejo de errores de autenticación/autorización del servidor.
        if (response.status === 401 || response.status === 403) {
            localStorage.clear(); // Limpia la sesión rota.
            showAlert('Tu sesión ha expirado o no tienes permisos. Inicia sesión de nuevo.', 'error');
            navigateTo('login');
            throw new Error('No autorizado');
        }
        
        // Se intenta parsear la respuesta como JSON.
        const responseData = await response.json();

        // Si la respuesta no fue exitosa (ej. status 400, 500), se lanza un error.
        if (!response.ok) {
            // Se usa el mensaje del backend si está disponible, o uno genérico.
            throw new Error(responseData.message || `Error en la petición a ${endpoint}`);
        }

        // Si todo fue exitoso, se devuelve la data.
        return responseData;
    } catch (error) {
        // Se re-lanza el error para que pueda ser manejado por el controlador que originó la llamada.
        // Esto evita mostrar alertas duplicadas y permite un manejo de errores más específico en la UI.
        throw error;
    }
}

/**
 * @description Objeto exportado que proporciona una interfaz simplificada y semántica
 * para realizar peticiones a la API.
 */
export const api = {
    // Peticiones GET (protegidas por defecto)
    get: (endpoint) => fetchAPI(endpoint, 'GET'),
    // Peticiones POST (protegidas por defecto)
    post: (endpoint, data) => fetchAPI(endpoint, 'POST', data),
    // Peticiones PUT (protegidas por defecto)
    put: (endpoint, data) => fetchAPI(endpoint, 'PUT', data),
    // Peticiones DELETE (protegidas por defecto)
    delete: (endpoint) => fetchAPI(endpoint, 'DELETE'),
    
    // Métodos específicos para rutas públicas que no requieren token.
    publicGet: (endpoint) => fetchAPI(endpoint, 'GET', null, true),
    publicPost: (endpoint, data) => fetchAPI(endpoint, 'POST', data, true),
};
