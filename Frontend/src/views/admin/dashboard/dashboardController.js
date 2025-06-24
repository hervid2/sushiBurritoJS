// ===========================================================
// ARCHIVO: src/views/admin/dashboard/dashboardController.js 
// ===========================================================

import { showAlert } from '../../../helpers/alerts.js';
import { api } from '../../../helpers/solicitudes.js'; 

export const dashboardController = () => {
    // --- LÓGICA DEL CARRUSEL ---
    let slideIndex = 0;
    const showSlides = () => {
        const slides = document.querySelectorAll(".carousel__slide");
        if (!slides || slides.length === 0) return;
        slides.forEach(slide => slide.style.display = "none");
        slideIndex++;
        if (slideIndex > slides.length) slideIndex = 1;
        
        if (slides[slideIndex - 1]) {
            slides[slideIndex - 1].style.display = "block";
        }
        setTimeout(showSlides, 4000);
    };

    // --- Carga de Datos desde la API ---
    const loadDashboardData = async () => {
        try {
            const summaryData = await api.get('stats/dashboard-summary');
            document.getElementById('pending-orders-count').textContent = summaryData.pendingOrdersCount;
            document.getElementById('registered-users-count').textContent = summaryData.registeredUsersCount;
            document.getElementById('daily-sales-amount').textContent = `$${summaryData.dailySalesAmount}`;
        } catch (error) {
            showAlert(error.message, 'error');
            console.error("Error al cargar los datos del dashboard:", error);
            document.getElementById('pending-orders-count').textContent = 'Error';
            document.getElementById('registered-users-count').textContent = 'Error';
            document.getElementById('daily-sales-amount').textContent = 'Error';
        }
    };
    
    // ---FUNCIÓN PARA CARGAR ACTIVIDAD RECIENTE ---
    const loadRecentActivity = async () => {
        const activityList = document.getElementById('activity-list');
        try {
            const activities = await api.get('stats/recent-activity');
            
            if (activities.length === 0) {
                activityList.innerHTML = '<li>No hay actividad reciente para mostrar.</li>';
                return;
            }

            // Formatear la fecha para que sea legible
            const formatDate = (dateString) => {
                const date = new Date(dateString);
                return date.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
            };

            activityList.innerHTML = activities.map(activity => `
                <li><span class="activity-date">${formatDate(activity.date)}:</span> ${activity.description}</li>
            `).join('');

        } catch (error) {
            console.error("Error al cargar la actividad reciente:", error);
            activityList.innerHTML = '<li>Error al cargar la actividad.</li>';
        }
    };

    // --- INICIALIZACIÓN DEL CONTROLADOR ---
    const init = () => {
        loadDashboardData();
        loadRecentActivity(); 
        showSlides();
    };

    init();
};