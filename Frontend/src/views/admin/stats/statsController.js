// =================================================================
// ARCHIVO: src/views/admin/stats/statsController.js
// ROL: Controlador para la vista de Estadísticas de Ventas.
//      Permite al administrador consultar datos de rendimiento
//      dentro de un rango de fechas específico.
// =================================================================

import { showAlert } from '../../../helpers/alerts.js';
import { api } from '../../../helpers/solicitudes.js';

/**
 * Controlador principal para la vista de Estadísticas.
 */
export const statsController = () => {
    // --- Referencias a Elementos del DOM ---
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    const generateBtn = document.getElementById('generate-stats-btn');
    const statsResultsContainer = document.getElementById('stats-results-container');
    
    // --- Estado Local del Controlador ---
    let currentRanking = [];      // Almacena la lista completa del ranking de productos.
    let currentRankingPage = 1;   // Rastrea la página actual de la tabla de ranking.
    const rankingItemsPerPage = 5; // Define cuántos productos mostrar por página.

    // --- Lógica de Renderizado y Paginación ---

    /**
     * Renderiza los controles de paginación para la tabla de ranking.
     */
    const renderRankingPagination = () => {
        // Se busca el contenedor aquí porque se crea dinámicamente.
        const rankingPaginationContainer = document.getElementById('product-ranking-pagination'); 
        if (!rankingPaginationContainer) return;// Si no existe, no hay nada que renderizar.

        rankingPaginationContainer.innerHTML = ''; // Limpia el contenedor antes de renderizar los botones. 
        const totalPages = Math.ceil(currentRanking.length / rankingItemsPerPage); // Calcula el total de páginas necesarias.
        if (totalPages <= 1) return;// Si solo hay una página, no se necesita paginación.

        let buttonsHTML = '<ul>';   // Comienza la lista de botones de paginación.
        for (let i = 1; i <= totalPages; i++) { // Itera desde la página 1 hasta la última.
            buttonsHTML += `<li><button class="pagination-btn ${i === currentRankingPage ? 'active' : ''}" data-page="${i}">${i}</button></li>`; // Crea un botón para cada página.
        }
        buttonsHTML += '</ul>'; // Cierra la lista de botones de paginación.
        rankingPaginationContainer.innerHTML = buttonsHTML;  // Inserta los botones en el contenedor.

        rankingPaginationContainer.querySelectorAll('.pagination-btn').forEach(btn => { // Asigna un evento a cada botón de paginación.
            btn.addEventListener('click', (e) => { // Al hacer clic en un botón de paginación...
                currentRankingPage = parseInt(e.target.dataset.page); // Actualiza la página actual con el número del botón.
                renderRankingTable(); // Vuelve a renderizar la tabla con la nueva página.
            });
        });
    };

    /**
     * Renderiza la tabla de ranking de productos, mostrando solo los ítems de la página actual.
     */
    const renderRankingTable = () => {
        const rankingTableBody = document.querySelector('#product-ranking-table tbody'); // Busca el cuerpo de la tabla de ranking.
        if (!rankingTableBody) return; // Si no existe, no hay nada que renderizar.

        const startIndex = (currentRankingPage - 1) * rankingItemsPerPage; // Calcula el índice de inicio para la página actual.
        const pageItems = currentRanking.slice(startIndex, startIndex + rankingItemsPerPage); // Obtiene los ítems que corresponden a la página actual.

        if (pageItems.length > 0) { // Si hay ítems para mostrar...
            rankingTableBody.innerHTML = pageItems.map(item => ` 
                <tr>
                    <td>${item.name}</td>
                    <td>${item.quantity}</td>
                </tr>
            `).join(''); // Une todas las filas en una sola cadena HTML.
        } else {
            rankingTableBody.innerHTML = '<tr><td colspan="2">No hay ranking para este período.</td></tr>'; // Si no hay ítems, muestra un mensaje en la tabla.
        }

        renderRankingPagination(); // Actualiza los botones de paginación.
    };
    
    /**
     * Establece los valores iniciales y los límites para los selectores de fecha.
     */
    const setDateLimits = () => {
        const today = new Date().toISOString().split('T')[0]; // Obtiene la fecha actual en formato YYYY-MM-DD.
        startDateInput.max = today; // Establece el máximo de la fecha de inicio como hoy.
        endDateInput.max = today; // Establece el máximo de la fecha de fin como hoy.
        endDateInput.value = today; // Por defecto, hasta hoy.
        
        // Por defecto, desde el primer día del mes actual.
        const firstDayOfMonth = new Date(new Date().setDate(1)).toISOString().split('T')[0]; // Obtiene el primer día del mes actual en formato YYYY-MM-DD.
        startDateInput.value = firstDayOfMonth; // Establece la fecha de inicio como el primer día del mes actual.
    };

    // --- Carga de Datos y Renderizado Principal ---

    /**
     * Función principal que se activa al hacer clic en "Generar Estadísticas".
     * Obtiene los datos de la API y renderiza toda la sección de resultados.
     */
    const handleGenerateStats = async () => {
        const startDate = startDateInput.value; // Obtiene el valor de la fecha de inicio.
        const endDate = endDateInput.value; // Obtiene el valor de la fecha de fin.

        if (!startDate || !endDate) { // Verifica que ambas fechas estén seleccionadas.
            showAlert('Por favor, seleccione una fecha de inicio y fin.', 'warning'); // Muestra una alerta si falta alguna fecha.
            return;
        }
        
        // Muestra un mensaje de carga mientras se obtienen los datos.
        statsResultsContainer.style.display = 'block'; // Asegura que el contenedor de resultados esté visible.
        statsResultsContainer.innerHTML = '<div class="loading-message">Generando estadísticas...</div>'; // Muestra un mensaje de carga.

        try {
            // Realiza la petición a la API con las fechas como parámetros de consulta.
            const statsData = await api.get(`stats?startDate=${startDate}&endDate=${endDate}`); //  Obtiene los datos de estadísticas desde la API.
            
            // Reconstruye dinámicamente todo el contenedor de resultados con los nuevos datos.
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
            
            // Guarda los datos del ranking y renderiza la primera página de la tabla.
            currentRanking = statsData.productsRanking; // Almacena el ranking de productos obtenido de la API.
            currentRankingPage = 1; // Reinicia la página actual del ranking a 1.
            renderRankingTable(); // Renderiza la tabla de ranking con los datos obtenidos.
            
            // Reasigna el listener al nuevo botón de PDF que se acaba de crear.
            document.getElementById('send-pdf-btn').addEventListener('click', handleSendPdf); // Asigna el evento para enviar el reporte PDF.
        } catch (error) {
            statsResultsContainer.innerHTML = `<div class="error-message">${error.message}</div>`; // Muestra un mensaje de error si la petición falla.
        }
    };
    
    /**
     * Maneja el clic en el botón para enviar el reporte PDF por correo.
     */
    const handleSendPdf = async () => {
        const startDate = startDateInput.value; // Obtiene el valor de la fecha de inicio.
        const endDate = endDateInput.value; // Obtiene el valor de la fecha de fin.

        if (!startDate || !endDate) { // Verifica que ambas fechas estén seleccionadas.
            showAlert('Por favor, seleccione un rango de fechas para generar el reporte.', 'warning'); // Muestra una alerta si falta alguna fecha.
            return;
        }

        try {
            showAlert('Generando y enviando PDF...', 'info'); // Muestra un mensaje de información mientras se genera el PDF.
            const response = await api.post('stats/send-report', { startDate, endDate }); // Realiza la petición a la API para enviar el reporte PDF.
            showAlert(response.message, 'success'); // Muestra un mensaje de éxito si el reporte se envía correctamente.
        } catch(error) {
            showAlert(error.message, 'error'); // Muestra un mensaje de error si la petición falla.
        }
    };
    
    // --- Inicialización del Controlador ---
    const init = () => {
        setDateLimits(); // Configura los filtros de fecha.
        generateBtn.addEventListener('click', handleGenerateStats); // Asigna el evento principal.
    };

    // Llama a la función de inicialización.
    init();
};
