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
    const rankingPaginationContainer = document.getElementById('product-ranking-pagination');

    // --- Estado ---
    let currentRanking = [];
    let currentRankingPage = 1;
    const rankingItemsPerPage = 5;

    // --- Lógica de Renderizado (Paginación del Ranking) ---
    const renderRankingPagination = () => {
        if (!rankingPaginationContainer) return;
        rankingPaginationContainer.innerHTML = '';
        const totalPages = Math.ceil(currentRanking.length / rankingItemsPerPage);
        if (totalPages <= 1) return;

        let buttonsHTML = '<ul>';
        for (let i = 1; i <= totalPages; i++) {
            buttonsHTML += `<li><button class="pagination-btn ${i === currentRankingPage ? 'active' : ''}" data-page="${i}">${i}</button></li>`;
        }
        buttonsHTML += '</ul>';
        rankingPaginationContainer.innerHTML = buttonsHTML;

        rankingPaginationContainer.querySelectorAll('.pagination-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                currentRankingPage = parseInt(e.target.dataset.page);
                renderRankingTable();
            });
        });
    };

    // --- Lógica de Renderizado (Tabla de Ranking) ---
    const renderRankingTable = () => {
        const rankingTableBody = document.querySelector('#product-ranking-table tbody');
        if (!rankingTableBody) return;

        const startIndex = (currentRankingPage - 1) * rankingItemsPerPage;
        const pageItems = currentRanking.slice(startIndex, startIndex + rankingItemsPerPage);

        if (pageItems.length > 0) {
            rankingTableBody.innerHTML = pageItems.map(item => `
                <tr>
                    <td>${item.name}</td>
                    <td>${item.quantity}</td>
                </tr>
            `).join('');
        } else {
            rankingTableBody.innerHTML = '<tr><td colspan="2">No hay ranking para este período.</td></tr>';
        }

        renderRankingPagination();
    };
    
    const setDateLimits = () => {
        const today = new Date().toISOString().split('T')[0];
        startDateInput.max = today;
        endDateInput.max = today;
        endDateInput.value = today;
        
        const firstDayOfMonth = new Date(new Date().setDate(1)).toISOString().split('T')[0];
        startDateInput.value = firstDayOfMonth;
    };

    // --- Carga de Datos y Renderizado Principal ---
    const handleGenerateStats = async () => {
        const startDate = startDateInput.value;
        const endDate = endDateInput.value;

        if (!startDate || !endDate) {
            showAlert('Por favor, seleccione una fecha de inicio y fin.', 'warning');
            return;
        }
        
        statsResultsContainer.style.display = 'block';
        statsResultsContainer.innerHTML = '<div class="loading-message">Generando estadísticas...</div>';

        try {
            const statsData = await api.get(`stats?startDate=${startDate}&endDate=${endDate}`);
            
            statsResultsContainer.innerHTML = `
                <div class="stats-grid">
                    <div class="stat-card stat-card--primary">
                        <div class="stat-card__value">${statsData.summary.totalOrders}</div>
                        <div class="stat-card__label">Pedidos Totales</div>
                    </div>
                    <div class="stat-card stat-card--secondary">
                        <div class="stat-card__value">$${statsData.summary.totalRevenue}</div>
                        <div class="stat-card__label">Ingresos Totales</div>
                    </div>
                </div>

                <div class="payment-methods-section">
                    <h3>Desglose por Método de Pago</h3>
                    <div class="stats-grid" id="payment-methods-stats">
                        ${statsData.paymentMethods.length > 0 ? statsData.paymentMethods.map(method => `
                            <div class="stat-card stat-card--secondary">
                                <div class="stat-card__value">$${parseFloat(method.totalAmount).toFixed(2)}</div>
                                <div class="stat-card__label">${method.name}</div>
                            </div>
                        `).join('') : '<p>No hay datos de pago para este período.</p>'}
                    </div>
                </div>

                <div class="ranking-section">
                    <h3>Ranking de productos</h3>
                    <div class="table-container">
                        <table class="table" id="product-ranking-table">
                            <thead><tr><th>Producto</th><th>Cantidad Vendida</th></tr></thead>
                            <tbody></tbody>
                        </table>
                    </div>
                    <div class="pagination-container" id="product-ranking-pagination"></div>
                    <div class="stats-actions">
                        <button class="btn btn--primary" id="send-pdf-btn"><i class="fas fa-file-pdf"></i> Enviar Reporte por Correo</button>
                    </div>
                </div>
            `;
            
            currentRanking = statsData.productsRanking;
            currentRankingPage = 1;
            renderRankingTable();
            
            document.getElementById('send-pdf-btn').addEventListener('click', handleSendPdf);
        } catch (error) {
            statsResultsContainer.innerHTML = `<div class="error-message">${error.message}</div>`;
        }
    };
    
    const handleSendPdf = async () => {
        const startDate = startDateInput.value;
        const endDate = endDateInput.value;

        if (!startDate || !endDate) {
            showAlert('Por favor, seleccione un rango de fechas para generar el reporte.', 'warning');
            return;
        }

        try {
            showAlert('Generando y enviando PDF...', 'info');
            const response = await api.post('stats/send-report', { startDate, endDate });
            showAlert(response.message, 'success');
        } catch(error) {
            showAlert(error.message, 'error');
        }
    };
    
    const init = () => {
        setDateLimits();
        generateBtn.addEventListener('click', handleGenerateStats);
    };

    init();
};