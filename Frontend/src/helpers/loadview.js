// =================================================================
// ARCHIVO: src/helpers/loadview.js
// ROL: Helper para cargar dinámicamente el contenido de un archivo
//      HTML en un contenedor del DOM.
// =================================================================

/**
 * Carga una vista HTML desde una ruta y la inyecta en un contenedor del DOM.
 *
 * @param {string} viewPath - La ruta al archivo de la vista (ej. '/src/views/auth/login.html').
 * @param {HTMLElement} container - El elemento del DOM donde se renderizará la vista.
 * @throws {Error} - Lanza un error si el contenedor no existe o si la vista no se puede cargar.
 */
export const loadView = async (viewPath, container) => {
    // Validación inicial para asegurar que el contenedor existe.
    if (!container) {
        throw new Error("El contenedor para la vista no fue encontrado en el DOM.");
    }

    try {
        // Realiza la petición para obtener el archivo HTML.
        const response = await fetch(viewPath);

        // Si la respuesta no es exitosa (ej. error 404), lanza un error.
        if (!response.ok) {
            throw new Error(`No se pudo cargar la vista desde: ${viewPath}`);
        }

        // Convierte la respuesta a texto (el contenido HTML).
        const htmlContent = await response.text();
        
        // Inyecta el contenido HTML en el contenedor.
        container.innerHTML = htmlContent;

    } catch (error) {
        // Si cualquier parte del proceso falla, se muestra un error en la consola
        // y se lanza de nuevo para que el llamador (el router) pueda manejarlo.
        console.error("Error en loadView:", error);
        throw error;
    }
};
