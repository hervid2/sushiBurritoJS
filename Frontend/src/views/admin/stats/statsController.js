// src/views/admin/stats/statsController.js

import { showAlert } from '../../../helpers/alerts.js';
import { showConfirmModal } from '../../../helpers/modalHelper.js';

export const statsController = () => {
    console.log("Statistics Overview Controller Initialized.");

    // --- Referencias al DOM ---
    const timeRangeSelect = document.getElementById('time-range');
    const customRangeContainer = document.getElementById('custom-range-container');
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    const generateBtn = document.getElementById('generate-stats-btn');
    const statsResultsContainer = document.getElementById('stats-results-container');
    
    // --- Estado ---
    let allProductsRanking = [];
    let currentPage = 1;
    const itemsPerPage = 8;

    // --- Lógica de la Interfaz ---
    const setDateLimits = () => {
        const today = new Date().toISOString().split('T')[0];
        startDateInput.max = today;
        endDateInput.max = today;
    };

    const toggleCustomRangeVisibility = () => {
        if (timeRangeSelect.value === 'custom') {
            customRangeContainer.style.display = 'flex';
        } else {
            customRangeContainer.style.display = 'none';
        }
    };

    // --- API Simulada ---
    const getStatsFromAPI = async (range, startDate, endDate) => {
        return new Promise(resolve => {
            setTimeout(() => {
                const fullProductList = [ { name: 'Sushi Roll California', quantity: 85, revenue: 1062.50 }, { name: 'Burrito Teriyaki', quantity: 72, revenue: 1079.28 }, { name: 'Gyoza', quantity: 65, revenue: 455.00 }, { name: 'Coca-Cola', quantity: 150, revenue: 375.00 }, { name: 'Ramen', quantity: 40, revenue: 720.00 }, { name: 'Tarta de Matcha', quantity: 35, revenue: 157.50 }, { name: 'Agua Mineral', quantity: 90, revenue: 180.00 }, { name: 'Edamame', quantity: 55, revenue: 247.50 }, { name: 'Nigiri de Salmón', quantity: 78, revenue: 624.00 }, { name: 'Sopa Miso', quantity: 68, revenue: 272.00 } ];
                resolve({
                    totalOrders: Math.floor(Math.random() * 200) + 50,
                    totalRevenue: Math.random() * 5000 + 1000,
                    productsRanking: fullProductList.sort((a, b) => b.quantity - a.quantity)
                });
            }, 500);
        });
    };

    // --- Renderizado ---
    const renderRankingTable = () => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const pageItems = allProductsRanking.slice(startIndex, startIndex + itemsPerPage);
        
        const table = document.getElementById('product-ranking-table');
        if (!table) return;

        table.innerHTML = `
            <thead><tr><th>Producto</th><th>Cantidad Vendida</th><th>Ingresos Generados</th></tr></thead>
            <tbody>
                ${pageItems.map(item => `
                    <tr>
                        <td>${item.name}</td>
                        <td>${item.quantity}</td>
                        <td>$${item.revenue.toFixed(2)}</td>
                    </tr>
                `).join('')}
            </tbody>`;
        renderStatsPagination();
    };

    const renderStatsPagination = () => {
        const paginationContainer = document.getElementById('stats-pagination');
        if (!paginationContainer) return;

        const totalPages = Math.ceil(allProductsRanking.length / itemsPerPage);
        paginationContainer.innerHTML = '';
        if (totalPages <= 1) return;

        let buttonsHTML = '';
        for (let i = 1; i <= totalPages; i++) {
            buttonsHTML += `<li><button class="pagination-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button></li>`;
        }
        paginationContainer.innerHTML = `<ul>${buttonsHTML}</ul>`;

        paginationContainer.querySelectorAll('.pagination-btn').forEach(btn => {
            btn.onclick = () => {
                currentPage = parseInt(btn.dataset.page);
                renderRankingTable();
            };
        });
    };

    // --- Carga de Datos ---
    const handleGenerateStats = async () => {
        const range = timeRangeSelect.value;
        if (!range) {
            showAlert('Por favor, seleccione un rango de tiempo.', 'warning');
            return;
        }
        statsResultsContainer.innerHTML = '<div class="loading-message">Generando estadísticas...</div>';
        statsResultsContainer.style.display = 'block';

        try {
            const statsData = await getStatsFromAPI(range, startDateInput.value, endDateInput.value);
            statsResultsContainer.innerHTML = `
                <div class="stats-grid">
                    <div class="stat-card stat-card--primary"><div class="stat-card__value" id="total-orders"></div><div class="stat-card__label">Pedidos Totales</div></div>
                    <div class="stat-card stat-card--secondary"><div class="stat-card__value" id="total-revenue"></div><div class="stat-card__label">Ingresos Totales</div></div>
                </div>
                <div class="ranking-section">
                    <h3>Ranking de Productos</h3>
                    <div class="table-container"><table class="table" id="product-ranking-table"></table></div>
                    <div class="pagination-container" id="stats-pagination"></div>
                    <div class="stats-actions"><button class="btn btn--primary" id="send-pdf-btn"><i class="fas fa-file-pdf"></i> Enviar Reporte por Correo</button></div>
                </div>`;
            
            document.getElementById('total-orders').textContent = statsData.totalOrders;
            document.getElementById('total-revenue').textContent = `$${statsData.totalRevenue.toFixed(2)}`;
            allProductsRanking = statsData.productsRanking;
            currentPage = 1;
            renderRankingTable();
            
            document.getElementById('send-pdf-btn').onclick = handleSendPdf;
        } catch (error) {
            statsResultsContainer.innerHTML = '<div class="error-message">Error al generar estadísticas.</div>';
        }
    };
    
    const handleSendPdf = async () => {
        const adminEmail = "admin@sushi.com"; // Simulación
        try {
            await showConfirmModal('Correo Enviado', `Las estadísticas en formato PDF han sido enviadas a: <strong>${adminEmail}</strong>`);
        } catch {
            console.log("PDF confirmation modal closed by user.");
        }
    };
    
    // --- Inicialización ---
    const init = () => {
        if (timeRangeSelect) timeRangeSelect.onchange = toggleCustomRangeVisibility;
        if (generateBtn) generateBtn.onclick = handleGenerateStats;
        setDateLimits();
    };

    init();
};

