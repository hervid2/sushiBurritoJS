// src/views/admin/dashboard/dashboardController.js

import { showAlert } from '../../../helpers/alerts.js';

const API_URL = 'http://localhost:3000/api';

// --- API Service Helper para peticiones autenticadas ---
const apiService = {
    get: async (endpoint) => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            // Si no hay token, no intentar hacer la petición.
            throw new Error('No se proporcionó un token.');
        }
        
        const response = await fetch(`${API_URL}/${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            }
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Error en la petición a ${endpoint}`);
        }
        return response.json();
    }
};

export const dashboardController = () => {
    console.log("Dashboard Controller Initialized.");

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
            // Se hace una única llamada al  endpoint del backend
            const summaryData = await apiService.get('stats/dashboard-summary');
            
            // Se actualizan las tarjetas con los datos de la API
            document.getElementById('pending-orders-count').textContent = summaryData.pendingOrdersCount;
            document.getElementById('registered-users-count').textContent = summaryData.registeredUsersCount;
            document.getElementById('daily-sales-amount').textContent = `$${summaryData.dailySalesAmount}`;

        } catch (error) {
            showAlert(error.message, 'error');
            console.error("Error al cargar los datos del dashboard:", error);
            // Mostrar un estado de error en las tarjetas
            document.getElementById('pending-orders-count').textContent = 'Error';
            document.getElementById('registered-users-count').textContent = 'Error';
            document.getElementById('daily-sales-amount').textContent = 'Error';
        }
    };
    
    const loadRecentActivity = () => {
        // La actividad reciente se mantiene con datos de ejemplo por ahora
        document.getElementById('activity-list').innerHTML = `
            <li><span class="activity-date">2025-06-22:</span> Pedido #ORD123 completado</li>
            <li><span class="activity-date">2025-06-21:</span> Nuevo usuario 'Pedro Mesero' registrado</li>
        `;
    };

    // --- INICIALIZACIÓN DEL CONTROLADOR ---
    const init = () => {
        loadDashboardData();
        loadRecentActivity();
        showSlides(); // Iniciar el carrusel directamente
    };

    init();
};