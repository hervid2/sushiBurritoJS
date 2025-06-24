// =================================================================
// ARCHIVO: src/views/admin/stats/statsController.js
// DESCRIPCIÓN: Controlador de estadísticas conectado a la API
// =================================================================

import { showAlert } from '../../../helpers/alerts.js';
import { api } from '../../../helpers/solicitudes.js';

export const statsController = () => {
    // --- Referencias al DOM ---
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    const generateBtn = document.getElementById('generate-stats-btn');
    const statsResultsContainer = document.getElementById('stats-results-container');
    
    // --- Lógica de la Interfaz ---
    const setDateLimits = () => {
        const today = new Date();
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
        const todayString = today.toISOString().split('T')[0];
        
        startDateInput.value = firstDayOfMonth;
        endDateInput.value = todayString;
        startDateInput.max = todayString;
        endDateInput.max = todayString;
    };

    // --- Renderizado ---
    const renderStats = (data) => {
        document.getElementById('total-orders').textContent = data.summary.totalOrders;
        document.getElementById('total-revenue').textContent = `$${data.summary.totalRevenue}`;

        const paymentContainer = document.getElementById('payment-methods-stats');
        paymentContainer.innerHTML = data.paymentMethods.length > 0
            ? data.paymentMethods.map(method => `
                <div class="stat-card stat-card--secondary">
                    <div class="stat-card__value">$${parseFloat(method.totalAmount).toFixed(2)}</div>
                    <div class="stat-card__label">${method.name}</div>
                </div>
            `).join('')
            : '<p>No hay datos de pago para este período.</p>';

        const rankingTableBody = document.querySelector('#product-ranking-table tbody');
        rankingTableBody.innerHTML = data.productsRanking.length > 0
            ? data.productsRanking.map(item => `
                <tr>
                    <td>${item.name}</td>
                    <td>${item.quantity}</td>
                </tr>
            `).join('')
            : '<tr><td colspan="2">No hay ranking para este período.</td></tr>';
    };

    // --- Lógica de API ---
    const handleSendPdf = async () => {
        const startDate = startDateInput.value;
        const endDate = endDateInput.value;

        try {
            showAlert('Generando y enviando PDF...', 'info');
            // El backend ya tiene la lógica para enviar al admin logueado
            const response = await api.post('stats/send-report', { startDate, endDate });
            showAlert(response.message, 'success');
        } catch(error) {
            showAlert(error.message, 'error');
        }
    };
    
    const handleGenerateStats = async () => {
        const startDate = startDateInput.value;
        const endDate = endDateInput.value;

        if (!startDate || !endDate) {
            showAlert('Por favor, seleccione una fecha de inicio y fin.', 'warning');
            return;
        }
        
        statsResultsContainer.style.display = 'block';
        const rankingTitleEl = statsResultsContainer.querySelector('.ranking-section h3');
        if (rankingTitleEl) {
            rankingTitleEl.textContent = "Ranking de productos"; // <-- TÍTULO CAMBIADO
        }

        try {
            const statsData = await api.get(`stats?startDate=${startDate}&endDate=${endDate}`);
            renderStats(statsData);
            // Re-asignar el listener del botón PDF después de renderizar los resultados
            document.getElementById('send-pdf-btn').addEventListener('click', handleSendPdf);
        } catch (error) {
            statsResultsContainer.innerHTML = `<div class="error-message">${error.message}</div>`;
        }
    };
    
    // --- Inicialización ---
    const init = () => {
        setDateLimits();
        generateBtn.addEventListener('click', handleGenerateStats);
        // Carga inicial de estadísticas
        handleGenerateStats();
    };

    init();
};
