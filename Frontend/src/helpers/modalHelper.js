// src/helpers/modalHelper.js

/**
 * Muestra un modal de confirmación genérico y devuelve una promesa que se resuelve
 * cuando el usuario hace clic en 'confirmar' o se rechaza al 'cancelar'.
 * @param {string} title - El título del modal.
 * @param {string} message - El mensaje principal del cuerpo del modal.
 * @returns {Promise<void>}
 */
export const showConfirmModal = (title, message) => {
    return new Promise((resolve, reject) => {
        // Crear el HTML del modal dinámicamente
        const modalHTML = `
            <div class="modal is-active" id="generic-confirm-modal">
                <div class="modal__content">
                    <div class="modal__header">
                        <h4 class="modal__title">${title}</h4>
                        <button class="modal__close-btn">&times;</button>
                    </div>
                    <div class="modal__body">
                        <p>${message}</p>
                    </div>
                    <div class="modal__footer">
                        <button class="btn btn--secondary" id="modal-cancel-btn">Cancelar</button>
                        <button class="btn btn--danger" id="modal-confirm-btn">Confirmar</button>
                    </div>
                </div>
            </div>
        `;

        // Añadir el modal al body
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        const modalElement = document.getElementById('generic-confirm-modal');
        const confirmBtn = document.getElementById('modal-confirm-btn');
        const cancelBtn = document.getElementById('modal-cancel-btn');
        const closeBtn = modalElement.querySelector('.modal__close-btn');
        
        const closeModal = () => {
            modalElement.remove();
            reject(); // Rechazar la promesa si se cierra sin confirmar
        };

        confirmBtn.onclick = () => {
            modalElement.remove();
            resolve(); // Resolver la promesa al confirmar
        };
        
        cancelBtn.onclick = closeModal;
        closeBtn.onclick = closeModal;
    });
};
