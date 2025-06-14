import { showAlert } from '../../../helpers/alerts.js';

export const dashboardController = (params) => {
    console.log("Dashboard Controller Initialized (Vanilla JS with fetch).", params);

    // --- LÓGICA DEL CARRUSEL DE IMÁGENES ---
    let slideIndex = 0;
    const showSlides = () => {
        const slides = document.querySelectorAll(".carousel__slide");
        if (!slides || slides.length === 0) return;

        // Ocultar todas las diapositivas
        slides.forEach(slide => slide.style.display = "none");
        
        slideIndex++;
        
        // Reiniciar el índice si excede el número de diapositivas
        if (slideIndex > slides.length) {
            slideIndex = 1;
        }
        
        // Mostrar la diapositiva actual
        slides[slideIndex - 1].style.display = "block";
        
        // Llamar a la función de nuevo después de 4 segundos
        setTimeout(showSlides, 4000); // Cambia de imagen cada 4 segundos
    };

    // --- Funciones para cargar datos del dashboard (tu código original) ---
    const loadSummaryData = async () => {
        // ... tu lógica original para cargar las tarjetas de estadísticas
        // (La he omitido por brevedad, pero iría aquí)
        document.getElementById('pending-orders-count').textContent = 15;
        document.getElementById('registered-users-count').textContent = 87;
        document.getElementById('menu-items-count').textContent = 45;
        document.getElementById('daily-sales-amount').textContent = '$1250.75';
    };

    const loadRecentActivity = async () => {
        // ... tu lógica original para cargar la actividad reciente
        // (La he omitido por brevedad, pero iría aquí)
        document.getElementById('activity-list').innerHTML = `
            <li><span class="activity-date">2025-06-08 11:45 AM:</span> Pedido #1235 completado</li>
            <li><span class="activity-date">2025-06-08 10:10 AM:</span> Nuevo usuario "ana_m" registrado</li>
        `;
    };

    // --- INICIALIZACIÓN DEL CONTROLADOR ---

    // Cargar los datos del dashboard
    loadSummaryData();
    loadRecentActivity();

    // Iniciar el carrusel de imágenes
    // Se usa un pequeño retraso para asegurar que el DOM esté completamente cargado
    setTimeout(showSlides, 100); 
};