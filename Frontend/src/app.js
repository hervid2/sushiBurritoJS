// Aquí se importa el CSS principal. Vite lo procesará y lo inyectará en el HTML.
import './assets/styles/main.css';

import { headerController } from './views/shared/headerController.js';
import { loadContent, navigateTo } from './router/router.js'; // Importa navigateTo también si lo usas aquí

/**
 * Función para cargar fragmentos HTML en un elemento específico del DOM.
 * Con Vite, las rutas de los fragmentos HTML deben ser absolutas desde la raíz del proyecto
 * o relativas al archivo JS que las importa si no están en `publicDir`.
 * @param {string} elementId - El ID del elemento donde se insertará el HTML.
 * @param {string} filePath - La ruta al archivo HTML del fragmento.
 */
async function loadFragment(elementId, filePath) {
    console.log(`Attempting to load fragment: ${filePath} into #${elementId}`);
    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`Failed to load fragment ${filePath}: ${response.statusText}`);
        }
        const html = await response.text();
        const targetElement = document.getElementById(elementId);
        if (targetElement) {
            targetElement.innerHTML = html;
            console.log(`Fragment loaded successfully: ${filePath}`);
        } else {
            console.error(`Element with ID "${elementId}" not found for fragment ${filePath}.`);
        }
    } catch (error) {
        console.error(`Error loading fragment ${filePath}:`, error);
        // Podrías mostrar un mensaje de error en la UI si lo deseas
    }
}

/**
 * Inicializa la aplicación cargando los componentes compartidos (header, nav, footer)
 * y luego inicia el router.
 */
async function initializeApp() {
    console.group('App.js InitializeApp');
    console.log('initializeApp started.');

    // Asume que 'app' es el ID de tu contenedor principal en index.html
    const appContainer = document.getElementById('app');
    console.log('App Main Container:', appContainer);

    // 1. Cargar los fragmentos HTML compartidos (header, navigation, footer)
    await loadFragment('header-container', '/src/views/shared/header.html');
    await loadFragment('navigation-container', '/src/views/shared/navigation.html');
    await loadFragment('footer-container', '/src/views/shared/footer.html');

    // 2. Inicializar el controlador del header/navigation
    // Asegúrate de que header.html esté cargado antes de inicializar su controlador
    if (document.getElementById('header-container').innerHTML !== '') {
        headerController();
        console.log('Header Controller initialized.');
    } else {
        console.warn('Header HTML not loaded, skipping headerController initialization.');
    }


    // 3. Iniciar el router
    // *** CORRECCIÓN CRÍTICA AQUÍ ***
    // Solo llama a loadContent() una vez al inicio, para manejar la ruta inicial.
    // El 'hashchange' listener en router.js se encargará de los cambios posteriores.
    console.log('Calling loadContent for initial route.');
    loadContent();

    // Puedes ocultar el mensaje de carga una vez que la app está lista
    const loadingMessage = document.querySelector('.loading-full-page');
    if (loadingMessage) {
        console.log('Hiding loading message.');
        loadingMessage.style.display = 'none'; // O usar un efecto de fade-out
    }
    console.groupEnd();
}

// Asegurarse de que la aplicación se inicialice una vez que el DOM esté completamente cargado.
document.addEventListener('DOMContentLoaded', initializeApp);
console.log('DOMContentLoaded event listener added in app.js');

// El window.addEventListener('hashchange', loadContent); ya está en router.js
// y es donde debe estar para los cambios de hash.
// No necesitas agregarlo de nuevo aquí.
