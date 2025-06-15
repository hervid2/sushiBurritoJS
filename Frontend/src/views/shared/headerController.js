// src/views/shared/headerController.js

import { navigateTo } from "../../router/router.js";
import { showAlert } from "../../helpers/alerts.js";

export const headerController = () => {
    const logoutButton = document.getElementById('logout-button');
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

    if (!logoutButton) {
        console.error("Logout button not found in header.");
        return;
    }

    // Lógica para mostrar u ocultar el botón
    if (isAuthenticated) {
        logoutButton.style.display = 'inline-block'; // <-- HACE VISIBLE EL BOTÓN

        // Se usa un clon para evitar añadir múltiples listeners en recargas
        const newLogoutButton = logoutButton.cloneNode(true);
        logoutButton.parentNode.replaceChild(newLogoutButton, logoutButton);
        
        newLogoutButton.addEventListener('click', () => {
            showAlert('Has cerrado sesión.', 'success');
            
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('userRole');
            localStorage.removeItem('userToken');
            
            // Refrescar la página después del logout asegura que todo el estado se reinicie limpiamente
            window.location.hash = '/login';
            window.location.reload();
        });
    } else {
        logoutButton.style.display = 'none'; // Se asegura de que esté oculto si no hay sesión
    }
};
