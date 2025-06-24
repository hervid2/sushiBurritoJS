// =================================================================
// ARCHIVO: src/helpers/solicitudes.js
// RESPONSABILIDAD: Centralizar todas las peticiones fetch a la API.
// =================================================================

import { showAlert } from './alerts.js';
import { navigateTo } from '../router/router.js';

const API_URL = 'http://localhost:3000/api';

/**
 * Realiza una petición a la API, manejando la autenticación y errores comunes.
 * @param {string} endpoint - El endpoint de la API (ej. 'usuarios', 'productos/1').
 * @param {string} method - El método HTTP ('GET', 'POST', 'PUT', 'DELETE').
 * @param {object} [data=null] - El cuerpo de la petición para POST o PUT.
 * @param {boolean} [isPublic=false] - Indica si es una ruta pública que no necesita token.
 * @returns {Promise<any>} - La respuesta JSON de la API.
 */
async function fetchAPI(endpoint, method, data = null, isPublic = false) {
    const headers = { 'Content-Type': 'application/json' };
    const config = { method, headers };

    if (!isPublic) {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            showAlert('Tu sesión ha expirado. Por favor, inicia sesión de nuevo.', 'warning');
            navigateTo('login');
            throw new Error('Token de autenticación no encontrado.');
        }
        headers['Authorization'] = `Bearer ${token}`;
    }

    if (data) {
        config.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`${API_URL}/${endpoint}`, config);
        
        if (response.status === 401 || response.status === 403) {
            localStorage.clear();
            showAlert('Tu sesión ha expirado o no tienes permisos. Inicia sesión de nuevo.', 'error');
            navigateTo('login');
            throw new Error('No autorizado');
        }
        
        const responseData = await response.json();

        if (!response.ok) {
            throw new Error(responseData.message || `Error en la petición a ${endpoint}`);
        }

        return responseData;
    } catch (error) {
        // Re-lanzamos el error para que sea capturado por el 'catch' en el controlador.
        // Esto evita mostrar dos alertas (una aquí y otra en el controlador).
        throw error;
    }
}

// Exportamos un objeto 'api' con métodos simplificados para cada verbo HTTP.
export const api = {
    get: (endpoint) => fetchAPI(endpoint, 'GET'),
    post: (endpoint, data) => fetchAPI(endpoint, 'POST', data),
    put: (endpoint, data) => fetchAPI(endpoint, 'PUT', data),
    delete: (endpoint) => fetchAPI(endpoint, 'DELETE'),
    // Métodos para rutas públicas que no requieren token
    publicGet: (endpoint) => fetchAPI(endpoint, 'GET', null, true),
    publicPost: (endpoint, data) => fetchAPI(endpoint, 'POST', data, true),
};