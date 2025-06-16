// src/views/admin/stats/statsController.js

import { showAlert } from '../../../helpers/alerts.js';
import { showConfirmModal } from '../../../helpers/modalHelper.js';

export const statsController = () => {
    console.log("Statistics Overview Controller Initialized.");

    // --- Referencias a elementos del DOM ---
    const timeRangeSelect = document.getElementById('time-range');
    const totalOrdersSpan = document.getElementById('total-orders');
    const totalRevenueSpan = document.getElementById('total-revenue');
    const avgOrderSpan = document.getElementById('avg-order');
    const topItemsList = document.getElementById('top-items-list');
    const sendPdfBtn = document.getElementById('send-pdf-btn');
    
    // Referencias para el rango personalizado
    const customRangeContainer = document.getElementById('custom-range-container');
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');


    // --- Lógica para Validación de Fecha ---
    const setDateLimits = () => {
        const today = new Date().toISOString().split('T')[0];
        // Establece la fecha máxima como hoy para ambos calendarios
        startDateInput.max = today;
        endDateInput.max = today;
    };

    // --- Lógica para mostrar/ocultar el rango de fechas ---
    const toggleCustomRangeVisibility = () => {
        if (timeRangeSelect.value === 'custom') {
            customRangeContainer.style.display = 'flex';
        } else {
            customRangeContainer.style.display = 'none';
        }
    };

    // --- API Simulada ---
    const getStatsFromAPI = async (range, startDate, endDate) => {
        console.log(`Fetching stats for:`, { range, startDate, endDate });
        return new Promise(resolve => {
            setTimeout(() => {
                // La lógica de simulación podría ser más compleja para reflejar las fechas
                resolve({
                    totalOrders: Math.floor(Math.random() * 200) + 50, // Datos aleatorios para ver el cambio
                    totalRevenue: Math.random() * 5000 + 1000,
                    avgOrder: Math.random() * 30 + 20,
                    topItems: [
                        { name: 'Sushi Roll California', quantity: 80, revenue: 1000.00 },
                        { name: 'Burrito de Salmón Picante', quantity: 60, revenue: 750.00 },
                        { name: 'Gyoza de Cerdo', quantity: 45, revenue: 270.00 },
                    ]
                });
            }, 500);
        });
    };

    // --- Carga y Renderizado de Datos ---
    const fetchAndRenderStats = async () => {
        const range = timeRangeSelect.value;
        let startDate = null;
        let endDate = null;

        if (range === 'custom') {
            startDate = startDateInput.value;
            endDate = endDateInput.value;
            if (!startDate || !endDate) {
                return; // No hacer nada si el rango personalizado está incompleto
            }
             // Validación para que la fecha de fin no sea anterior a la de inicio
            if (new Date(endDate) < new Date(startDate)) {
                showAlert('La fecha de fin no puede ser anterior a la fecha de inicio.', 'warning');
                return;
            }
        }
        
        totalOrdersSpan.textContent = '...';
        totalRevenueSpan.textContent = '...';
        avgOrderSpan.textContent = '...';
        topItemsList.innerHTML = '<tr><td colspan="3" class="loading-message">Cargando...</td></tr>';

        try {
            const statsData = await getStatsFromAPI(range, startDate, endDate);
            totalOrdersSpan.textContent = statsData.totalOrders;
            totalRevenueSpan.textContent = `$${statsData.totalRevenue.toFixed(2)}`;
            avgOrderSpan.textContent = `$${statsData.avgOrder.toFixed(2)}`;
            
            if (statsData.topItems.length > 0) {
                 topItemsList.innerHTML = statsData.topItems.map(item => `
                    <tr>
                        <td>${item.name}</td>
                        <td>${item.quantity}</td>
                        <td>$${item.revenue.toFixed(2)}</td>
                    </tr>
                `).join('');
            } else {
                topItemsList.innerHTML = '<tr><td colspan="3" class="text-center">No hay datos para este rango.</td></tr>';
            }

        } catch (error) {
            showAlert('Error al cargar las estadísticas.', 'error');
            console.error("Error fetching stats:", error);
        }
    };
    
    // --- Lógica para el botón de PDF ---
    const handleSendPdf = async () => {
        const adminEmail = "admin@sushi.com";
        try {
            await showConfirmModal(
                'Correo Enviado',
                `Las estadísticas en formato PDF han sido enviadas a: <strong>${adminEmail}</strong>`
            );
        } catch {
            console.log("PDF confirmation modal closed by user.");
        }
    };

    // --- Event Listeners ---
    timeRangeSelect.addEventListener('change', () => {
        toggleCustomRangeVisibility();
        if (timeRangeSelect.value !== 'custom') {
            fetchAndRenderStats();
        }
    });

    startDateInput.addEventListener('change', fetchAndRenderStats);
    endDateInput.addEventListener('change', fetchAndRenderStats);
    sendPdfBtn.addEventListener('click', handleSendPdf);

    // --- Inicialización ---
    setDateLimits(); // Establecer la fecha máxima en los inputs
    toggleCustomRangeVisibility();
    fetchAndRenderStats();
};
