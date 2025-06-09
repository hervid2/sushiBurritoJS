import { showAlert } from '../../helpers/alerts.js'; 

export const dashboardController = (params) => {
    console.log("Dashboard Controller Initialized (Vanilla JS with fetch).", params);

    // --- Referencias a los elementos del DOM que se actualizarán ---
    const pendingOrdersCount = document.getElementById('pending-orders-count');
    const registeredUsersCount = document.getElementById('registered-users-count');
    const menuItemsCount = document.getElementById('menu-items-count');
    const dailySalesAmount = document.getElementById('daily-sales-amount');
    const activityList = document.getElementById('activity-list');
    
    const salesChartPlaceholder = document.getElementById('sales-chart');
    const popularItemsChartPlaceholder = document.getElementById('popular-items-chart');

    // --- Funciones para simular llamadas a la API usando fetch ---

    const getSummaryDataFromAPI = async () => {
        // En un escenario real:
        // const response = await fetch('/api/dashboard/summary');
        // if (!response.ok) throw new Error('Failed to fetch summary data');
        // return await response.json();

        // Datos simulados:
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    pendingOrders: 15,
                    registeredUsers: 87,
                    menuItems: 45,
                    dailySales: 1250.75
                });
            }, 300); // Simular latencia
        });
    };

    const getRecentActivityFromAPI = async () => {
        // En un escenario real:
        // const response = await fetch('/api/dashboard/activity');
        // if (!response.ok) throw new Error('Failed to fetch activity data');
        // return await response.json();

        // Datos simulados:
        return new Promise(resolve => {
            setTimeout(() => {
                resolve([
                    { date: '2025-06-08 11:45 AM', description: 'Pedido #1235 completado por Cocina' },
                    { date: '2025-06-08 10:10 AM', description: 'Nuevo usuario "ana_m" registrado' },
                    { date: '2025-06-08 09:00 AM', description: 'Promoción de verano activada' }
                ]);
            }, 400); // Simular latencia
        });
    };

    const loadSummaryData = async () => {
        console.log("Cargando datos del dashboard (Vanilla JS con fetch)...");
        try {
            const data = await getSummaryDataFromAPI();

            if (pendingOrdersCount) pendingOrdersCount.textContent = data.pendingOrders;
            if (registeredUsersCount) registeredUsersCount.textContent = data.registeredUsers;
            if (menuItemsCount) menuItemsCount.textContent = data.menuItems;
            if (dailySalesAmount) dailySalesAmount.textContent = `$ ${data.dailySales.toFixed(2)}`;

        } catch (error) {
            console.error("Error al cargar datos del resumen (Vanilla JS con fetch):", error);
            if(pendingOrdersCount) pendingOrdersCount.textContent = 'Error';
            if(registeredUsersCount) registeredUsersCount.textContent = 'Error';
            if(menuItemsCount) menuItemsCount.textContent = 'Error';
            if(dailySalesAmount) dailySalesAmount.textContent = 'Error';
            if (showAlert) showAlert('Error al cargar datos del dashboard.', 'error');
        }
    };

    const loadRecentActivity = async () => {
        console.log("Cargando actividad reciente (Vanilla JS con fetch)...");
        try {
            const activityData = await getRecentActivityFromAPI();

            if (activityList) {
                activityList.innerHTML = activityData.map(activity => `
                    <li><span class="activity-date">${activity.date}:</span> ${activity.description}</li>
                `).join('');
            }
        } catch (error) {
            console.error("Error al cargar actividad reciente (Vanilla JS con fetch):", error);
            if(activityList) activityList.innerHTML = '<li>Error al cargar actividad.</li>';
            if (showAlert) showAlert('Error al cargar actividad reciente.', 'error');
        }
    };

    // --- "Inicialización" de gráficos en Vanilla JS (como texto) ---
    const initializeCharts = () => {
        if (salesChartPlaceholder) {
            salesChartPlaceholder.innerHTML = '<p>Gráfico de Ventas Mensuales: Datos simulados (Ene: $1200, Feb: $1500, Mar: $1300, etc.)</p>';
        }
        if (popularItemsChartPlaceholder) {
            popularItemsChartPlaceholder.innerHTML = '<p>Gráfico de Productos Más Populares: Datos simulados (Sushi Roll: 300, Burrito: 200, etc.)</p>';
        }
    };

    // --- Event Listeners ---
    const loadMoreActivityBtn = document.querySelector('.dashboard-recent-activity .btn');
    if (loadMoreActivityBtn) {
        loadMoreActivityBtn.addEventListener('click', () => {
            console.log("Se hizo clic en 'Cargar más actividad' (Vanilla JS con fetch).");
            if (showAlert) showAlert('Cargando más actividad (simulado)...', 'info');
        });
    }

    // --- Inicialización del controlador ---
    loadSummaryData();
    loadRecentActivity();
    initializeCharts();
};