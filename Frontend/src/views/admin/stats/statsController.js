// src/views/admin/stats/statsController.js

import { showAlert } from '../../../helpers/alerts.js'; // Asumiendo que este helper es Vanilla JS

export const statsController = (params) => {
    console.log("Statistics Overview Controller Initialized (Vanilla JS with fetch).", params);

    // --- Referencias a elementos del DOM ---
    const timeRangeSelect = document.getElementById('time-range');
    const customRangeDiv = document.getElementById('custom-range');
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');

    const totalOrdersSpan = document.getElementById('total-orders');
    const totalRevenueSpan = document.getElementById('total-revenue');
    const avgOrderSpan = document.getElementById('avg-order');

    const categoryChartCanvas = document.getElementById('category-chart');
    const dailySalesChartCanvas = document.getElementById('daily-sales-chart');
    const topItemsList = document.getElementById('top-items-list');

    // --- Funciones de Utilidad ---

    const toggleCustomRangeVisibility = () => {
        customRangeDiv.style.display = timeRangeSelect.value === 'custom' ? 'flex' : 'none';
    };

    // Función para obtener las fechas de inicio y fin basadas en la selección
    const getDateRange = () => {
        let startDate, endDate;
        const now = new Date();
        now.setHours(0, 0, 0, 0); // Reset time to start of day

        switch (timeRangeSelect.value) {
            case 'today':
                startDate = new Date(now);
                endDate = new Date(now);
                endDate.setDate(endDate.getDate() + 1); // Hasta el final del día de hoy
                break;
            case 'week':
                startDate = new Date(now);
                startDate.setDate(now.getDate() - now.getDay()); // Inicio de la semana (domingo)
                endDate = new Date(startDate);
                endDate.setDate(startDate.getDate() + 7); // Fin de la semana
                break;
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
                break;
            case 'year':
                startDate = new Date(now.getFullYear(), 0, 1);
                endDate = new Date(now.getFullYear() + 1, 0, 1);
                break;
            case 'custom':
                startDate = new Date(startDateInput.value);
                endDate = new Date(endDateInput.value);
                // Asegurarse de que endDate incluya todo el día final
                endDate.setDate(endDate.getDate() + 1); 
                break;
            default:
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        }
        
        // Formatear a 'YYYY-MM-DD' para la URL de la API (si fuera real)
        const formatISODate = (date) => {
            const y = date.getFullYear();
            const m = (date.getMonth() + 1).toString().padStart(2, '0');
            const d = date.getDate().toString().padStart(2, '0');
            return `${y}-${m}-${d}`;
        };

        return { 
            startDate: formatISODate(startDate),
            endDate: formatISODate(endDate)
        };
    };

    // Función para simular una llamada a la API usando fetch (sería real en un backend)
    const getStatsFromAPI = async (startDate, endDate) => {
        // En un escenario real, harías un fetch real:
        // const response = await fetch(`/api/stats?startDate=${startDate}&endDate=${endDate}`);
        // if (!response.ok) {
        //     throw new Error(`HTTP error! status: ${response.status}`);
        // }
        // return await response.json();

        // Datos simulados para demostración:
        return new Promise(resolve => {
            setTimeout(() => { // Simular latencia de red
                resolve({
                    totalOrders: 150,
                    totalRevenue: 5234.80,
                    avgOrder: 34.90,
                    categorySales: {
                        labels: ['Sushi Rolls', 'Burritos', 'Entradas', 'Bebidas', 'Postres'],
                        data: [1800, 1200, 800, 900, 534.80],
                    },
                    dailySales: {
                        labels: ['01 Jun', '02 Jun', '03 Jun', '04 Jun', '05 Jun', '06 Jun', '07 Jun'],
                        data: [250, 300, 280, 350, 400, 380, 420]
                    },
                    topItems: [
                        { name: 'Sushi Roll California', quantity: 80, revenue: 1000.00 },
                        { name: 'Burrito de Salmón Picante', quantity: 60, revenue: 750.00 },
                        { name: 'Gyoza de Cerdo', quantity: 45, revenue: 270.00 },
                        { name: 'Agua Embotellada', quantity: 120, revenue: 240.00 },
                        { name: 'Tarta de Mango', quantity: 30, revenue: 135.00 }
                    ]
                });
            }, 500); // 0.5 segundos de retraso simulado
        });
    };

    // --- Carga y Renderizado de Datos ---

    const fetchAndRenderStats = async () => {
        const { startDate, endDate } = getDateRange();
        console.log(`Cargando estadísticas desde ${startDate} hasta ${endDate} (Vanilla JS con fetch simulado)...`);

        // Mostrar "Cargando..."
        totalOrdersSpan.textContent = 'Cargando...';
        totalRevenueSpan.textContent = 'Cargando...';
        avgOrderSpan.textContent = 'Cargando...';
        topItemsList.innerHTML = '<tr><td colspan="3" class="loading-message">Cargando ítems populares...</td></tr>';
        
        if (categoryChartCanvas) categoryChartCanvas.innerHTML = '<p>Cargando gráfico de categorías...</p>';
        if (dailySalesChartCanvas) dailySalesChartCanvas.innerHTML = '<p>Cargando gráfico de ventas diarias...</p>';

        try {
            const statsData = await getStatsFromAPI(startDate, endDate);

            // Actualizar tarjetas de resumen
            totalOrdersSpan.textContent = statsData.totalOrders;
            totalRevenueSpan.textContent = `$${statsData.totalRevenue.toFixed(2)}`;
            avgOrderSpan.textContent = `$${statsData.avgOrder.toFixed(2)}`;

            // Renderizar gráficos con texto/HTML simple
            renderCategoryChart(statsData.categorySales);
            renderDailySalesChart(statsData.dailySales);

            // Renderizar tabla de ítems populares
            renderTopItems(statsData.topItems);

        } catch (error) {
            console.error("Error al cargar estadísticas (Vanilla JS con fetch):", error);
            totalOrdersSpan.textContent = 'Error';
            totalRevenueSpan.textContent = 'Error';
            avgOrderSpan.textContent = 'Error';
            topItemsList.innerHTML = '<tr><td colspan="3" class="error-message">Error al cargar ítems populares.</td></tr>';
            if (showAlert) showAlert('Error al cargar las estadísticas.', 'error');
        }
    };

    // Función para "renderizar" el gráfico de categorías en vanilla JS (como texto/descripción)
    const renderCategoryChart = (data) => {
        if (!categoryChartCanvas) return;
        
        let content = `<p><strong>Ventas por Categoría:</strong></p><ul>`;
        data.labels.forEach((label, index) => {
            content += `<li>${label}: $${data.data[index].toFixed(2)}</li>`;
        });
        content += `</ul>`;
        categoryChartCanvas.innerHTML = content;
    };

    // Función para "renderizar" el gráfico de ventas diarias en vanilla JS (como texto/descripción)
    const renderDailySalesChart = (data) => {
        if (!dailySalesChartCanvas) return;

        let content = `<p><strong>Ventas por Día:</strong></p><ul>`;
        data.labels.forEach((label, index) => {
            content += `<li>${label}: $${data.data[index].toFixed(2)}</li>`;
        });
        content += `</ul>`;
        dailySalesChartCanvas.innerHTML = content;
    };

    const renderTopItems = (items) => {
        if (!topItemsList) return;
        if (items.length === 0) {
            topItemsList.innerHTML = '<tr><td colspan="3">No hay ítems populares para el período seleccionado.</td></tr>';
            return;
        }

        topItemsList.innerHTML = items.map(item => `
            <tr>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>$${item.revenue.toFixed(2)}</td>
            </tr>
        `).join('');
    };

    // --- Event Listeners ---
    timeRangeSelect.addEventListener('change', () => {
        toggleCustomRangeVisibility();
        fetchAndRenderStats(); // Vuelve a cargar datos cuando cambia el rango
    });

    startDateInput.addEventListener('change', fetchAndRenderStats);
    endDateInput.addEventListener('change', fetchAndRenderStats);

    // --- Inicialización del controlador ---
    toggleCustomRangeVisibility(); // Establecer visibilidad inicial del rango personalizado
    fetchAndRenderStats(); // Cargar datos al iniciar la vista
};