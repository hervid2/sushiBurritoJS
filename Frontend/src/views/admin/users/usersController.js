// =================================================================
// ARCHIVO: src/views/admin/users/usersController.js
// ROL: Controlador para la vista de Gestión de Usuarios.
//      Maneja la lógica CRUD (Crear, Leer, Actualizar, Eliminar)
//      para los usuarios del sistema.
// =================================================================

import { showAlert } from '../../../helpers/alerts.js';
import { showConfirmModal } from '../../../helpers/modalHelper.js';
import { validatePassword } from '../../../helpers/auth.js';
import { api } from '../../../helpers/solicitudes.js';

/**
 * Controlador principal para la vista de Gestión de Usuarios.
 */
export const usersController = () => {
    // --- Referencias a Elementos del DOM ---
    // Se capturan todos los elementos interactivos una sola vez para optimizar el rendimiento.
    const userFormSection = document.getElementById('user-form-section');
    const userForm = document.getElementById('user-form');
    const usersTableBody = document.querySelector('#users-table tbody');
    const formTitle = document.getElementById('form-title');
    const passwordGroup = document.getElementById('password').closest('.form-group'); // .closest() Agrupa el campo de contraseña para poder mostrarlo u ocultarlo fácilmente.
    const roleSelect = document.getElementById('role');
    
    // --- Lógica de la Interfaz de Usuario (UI) ---

    /**
     * Muestra y configura el formulario para añadir o editar un usuario.
     * @param {boolean} [isEditing=false] - Indica si el formulario está en modo de edición.
     * @param {object} [user={}] - El objeto de usuario para rellenar el formulario en modo de edición.
     */
    const showForm = (isEditing = false, user = {}) => { // Por defecto, no está en modo edición.
        userForm.reset(); // Resetea el formulario para evitar datos residuales.
        formTitle.textContent = isEditing ? 'Editar Usuario' : 'Añadir Nuevo Usuario'; // Cambia el título del formulario según el modo.
        
        // El campo de contraseña solo es visible y requerido al crear un nuevo usuario.
        passwordGroup.style.display = isEditing ? 'none' : 'block'; // Oculta el grupo de contraseña si se está editando.
        document.getElementById('password').required = !isEditing; // Requiere la contraseña solo al crear un usuario nuevo.

        // El rol no se puede cambiar al editar para evitar escalada de privilegios accidental.
        roleSelect.disabled = isEditing;

        // Si se está editando, se rellenan los campos con los datos del usuario.
        if(isEditing) {
            document.getElementById('user-id').value = user.usuario_id; // Asigna el ID del usuario al campo oculto.
            document.getElementById('name').value = user.nombre; // Asigna el nombre del usuario al campo correspondiente.
            document.getElementById('email').value = user.correo; // Asigna el correo del usuario al campo correspondiente.
            roleSelect.value = user.rol; // Asigna el rol del usuario al campo de selección.
        }

        userFormSection.style.display = 'block'; // Muestra la sección del formulario de usuario.
    };

    /**
     * Oculta y resetea el formulario de usuario.
     */
    const hideForm = () => {
        userFormSection.style.display = 'none'; // Oculta la sección del formulario de usuario.
        userForm.reset(); // Resetea el formulario para evitar datos residuales.
    };

    // --- Lógica de Negocio y Comunicación con la API ---

    /**
     * Carga la lista de usuarios desde la API y la renderiza en la tabla.
     */
    const loadUsers = async () => {
        try {
            const users = await api.get('usuarios'); // Obtiene la lista de usuarios desde la API.
            renderTable(users); // Renderiza la tabla con los usuarios obtenidos.
        } catch (error) {
            showAlert(error.message, 'error'); // Muestra un mensaje de error si la API falla.
            usersTableBody.innerHTML = `<tr><td colspan="5" class="text-center text-error">Error al cargar los usuarios.</td></tr>`;
        }
    };

    /**
     * Maneja el envío del formulario para crear o actualizar un usuario.
     * @param {Event} event - El objeto del evento de envío del formulario.
     */
    const handleSaveUser = async (event) => {
        event.preventDefault(); // Evita la recarga de la página.
        const id = document.getElementById('user-id').value; // Obtiene el ID del usuario del campo oculto.
        const userData = {
            nombre: document.getElementById('name').value, // Obtiene el nombre del usuario del campo correspondiente.
            correo: document.getElementById('email').value, // Obtiene el correo del usuario del campo correspondiente.
        };

        try {
            if (id) { // --- MODO EDICIÓN ---
                await api.put(`usuarios/${id}`, userData); // Envía la petición de actualización a la API.
                showAlert('Información de usuario actualizada exitosamente.', 'success'); // Muestra un mensaje de éxito.
            } else { // --- MODO CREACIÓN ---
                const password = document.getElementById('password').value; // Obtiene la contraseña del campo correspondiente.
                if (!validatePassword(password)) { // Valida la contraseña antes de enviarla.
                    showAlert('La contraseña no cumple los requisitos de seguridad. Debe tener minimo 8 dígitos, una mayúscula, una minúscula, un número y un caracter especial', 'warning'); // Muestra un mensaje de advertencia si la contraseña es inválida.
                    return;
                }
                userData.contraseña = password; // Añade la contraseña al objeto de datos del usuario.
                userData.rol = roleSelect.value; // Obtiene el rol del usuario del campo de selección.
                await api.post('usuarios', userData); // Envía la petición de creación a la API.
                showAlert(`Nuevo usuario ${userData.rol} creado exitosamente.`, 'success'); // Muestra un mensaje de éxito al crear un nuevo usuario.
            }
            hideForm();
            await loadUsers(); // Recarga la tabla para reflejar los cambios.
        } catch (error) {
            showAlert(error.message, 'error'); // Muestra un mensaje de error si la API falla al crear o actualizar el usuario.
        }
    };

    /**
     * Prepara y muestra el formulario para editar un usuario existente.
     * @param {object} user - El objeto del usuario a editar.
     */
    const handleEditClick = (user) => {
        // Se pasa el objeto de usuario completo para evitar una llamada extra a la API.
        showForm(true, user); 
    };

    /**
     * Maneja la lógica para eliminar un usuario, incluyendo la confirmación.
     * @param {number} userId - El ID del usuario a eliminar.
     * @param {string} userName - El nombre del usuario para mostrar en el modal de confirmación.
     */
    const handleDeleteClick = async (userId, userName) => {
        try {
            // Pide confirmación al administrador antes de proceder.
            await showConfirmModal('Confirmar Eliminación', `¿Está seguro de que desea eliminar a <strong>${userName}</strong>?`);
            // Si se confirma, se envía la petición de eliminación.
            await api.delete(`usuarios/${userId}`);
            showAlert('Usuario eliminado exitosamente.', 'success');
            await loadUsers(); // Recarga la tabla.
        } catch (error) {
            // El bloque catch se activa si el usuario cancela o si la API devuelve un error.
            if (error && error.message) {
                showAlert(error.message, 'error');
            } else {
                console.log("Eliminación cancelada por el usuario."); // Mensaje de depuración si el usuario cancela la acción.
            }
        }
    };

    // --- Renderizado de la Tabla ---

    /**
     * Renderiza las filas de la tabla de usuarios a partir de una lista de datos.
     * @param {Array<object>} users - La lista de objetos de usuario.
     */
    const renderTable = (users) => {
        usersTableBody.innerHTML = ''; // Limpia la tabla antes de añadir nuevo contenido.
        if (users.length === 0) { // Si no hay usuarios, muestra un mensaje en la tabla.
            usersTableBody.innerHTML = `<tr><td colspan="5" class="text-center">No hay usuarios registrados.</td></tr>`;
            return;
        }

        users.forEach(user => {
            const row = document.createElement('tr'); // Crea una nueva fila para cada usuario.
            row.innerHTML = `
                <td>${user.usuario_id}</td>
                <td>${user.nombre}</td>
                <td>${user.correo}</td>
                <td><span class="role-badge role-${user.rol.replace('administrador', 'admin')}">${user.rol}</span></td>
                <td class="table-actions">
                    <button class="btn btn--info btn--small edit-btn">Editar</button>
                    <button class="btn btn--danger btn--small delete-btn">Eliminar</button>
                </td>
            `;

            // Asigna los listeners directamente a los botones de esta fila.
            row.querySelector('.edit-btn').addEventListener('click', () => handleEditClick(user)); // Pasa el objeto de usuario completo para evitar una llamada extra a la API.
            row.querySelector('.delete-btn').addEventListener('click', () => handleDeleteClick(user.usuario_id, user.nombre)); // Pasa el ID y nombre del usuario para la confirmación de eliminación.
            usersTableBody.appendChild(row); // Añade la fila al cuerpo de la tabla.
        });
    };

    // --- Inicialización del Controlador ---
    const init = () => {
        // Asigna los listeners a los elementos principales de la interfaz.
        document.getElementById('add-user-btn').addEventListener('click', () => showForm(false)); // Muestra el formulario en modo creación.
        document.getElementById('cancel-user-form-btn').addEventListener('click', hideForm); // Oculta el formulario sin guardar cambios.
        userForm.addEventListener('submit', handleSaveUser); // Maneja el envío del formulario para crear o actualizar un usuario.
        
        // Carga la lista inicial de usuarios al entrar a la vista.
        loadUsers();
    };

    // Llama a la función de inicialización para arrancar el controlador.
    init();
};
