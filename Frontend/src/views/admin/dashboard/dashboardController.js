// =================================================================
// ARCHIVO: src/views/admin/dashboard/dashboardController.js
// ROL: Controlador para la vista del Dashboard de Administración.
//      Se encarga de inicializar los componentes visuales y de
//      cargar los datos de resumen desde la API.
// =================================================================

import { showAlert } from '../../../helpers/alerts.js';
import { api } from '../../../helpers/solicitudes.js'; 

/**
 * Controlador principal para la vista del Dashboard.
 * Se ejecuta cuando el router carga esta vista.
 */
export const dashboardController = () => {
    
    // --- LÓGICA DEL CARRUSEL DE IMÁGENES ---
    let slideIndex = 0; // Mantiene el índice de la diapositiva actual.

    /**
     * Gestiona la lógica para mostrar las diapositivas del carrusel en un ciclo.
     */
    const showSlides = () => {
        const slides = document.querySelectorAll(".carousel__slide");
        if (!slides || slides.length === 0) return; // Salida segura si no hay diapositivas.

        // Oculta todas las diapositivas.
        slides.forEach(slide => slide.style.display = "none");
        
        slideIndex++; // Avanza al siguiente índice.
        
        // Si el índice supera el número de diapositivas, vuelve al principio.
        if (slideIndex > slides.length) {
            slideIndex = 1;
        }
        
        // Muestra solo la diapositiva actual.
        if (slides[slideIndex - 1]) {
            slides[slideIndex - 1].style.display = "block";
        }
        
        // Vuelve a llamar a esta función después de 4 segundos para crear el bucle.
        setTimeout(showSlides, 4000);
    };

    // --- CARGA DE DATOS DESDE LA API ---

    /**
     * Obtiene y renderiza las estadísticas de resumen del dashboard.
     */
    const loadDashboardData = async () => {
        try {
            // Realiza la petición al endpoint de resumen de estadísticas.
            const summaryData = await api.get('stats/dashboard-summary');
            
            // Popula las tarjetas de estadísticas con los datos recibidos.
            document.getElementById('pending-orders-count').textContent = summaryData.pendingOrdersCount;
            document.getElementById('registered-users-count').textContent = summaryData.registeredUsersCount;
            document.getElementById('daily-sales-amount').textContent = `$${summaryData.dailySalesAmount}`;
        } catch (error) {
            // En caso de error, muestra una alerta y actualiza la UI para reflejar el fallo.
            showAlert(error.message, 'error');
            console.error("Error al cargar los datos del dashboard:", error);
            document.getElementById('pending-orders-count').textContent = 'Error';
            document.getElementById('registered-users-count').textContent = 'Error';
            document.getElementById('daily-sales-amount').textContent = 'Error';
        }
    };
    
    /**
     * Obtiene y renderiza la lista de actividades recientes.
     */
    const loadRecentActivity = async () => {
        const activityList = document.getElementById('activity-list');
        try {
            // Realiza la petición al endpoint de actividad reciente.
            const activities = await api.get('stats/recent-activity');
            
            // Si no hay actividades, muestra un mensaje informativo.
            if (activities.length === 0) {
                activityList.innerHTML = '<li>No hay actividad reciente para mostrar.</li>';
                return;
            }

            /**
             * Formatea una cadena de fecha ISO a un formato localizado y legible.
             * @param {string} dateString - La fecha en formato ISO.
             * @returns {string} - La fecha formateada.
             */
            const formatDate = (dateString) => {
                const date = new Date(dateString);
                return date.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
            };

            // Transforma el array de datos en un string de elementos HTML y lo inyecta en la lista.
            activityList.innerHTML = activities.map(activity => `
                <li><span class="activity-date">${formatDate(activity.date)}:</span> ${activity.description}</li>
            `).join('');

        } catch (error) {
            // En caso de error, lo muestra en la consola y en la UI.
            console.error("Error al cargar la actividad reciente:", error);
            activityList.innerHTML = '<li>Error al cargar la actividad reciente.</li>';
        }
    };

    // --- INICIALIZACIÓN DEL CONTROLADOR ---

    /**
     * Función de inicialización que se ejecuta al cargar el controlador.
     * Orquesta la llamada a todas las funciones necesarias para montar la vista.
     */
    const init = () => {
        loadDashboardData();
        loadRecentActivity(); 
        showSlides();
    };

    // Llama a la función de inicialización para arrancar el controlador.
    init();
};