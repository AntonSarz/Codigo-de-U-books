/*──────────────────────────────────────────────────────────────────
 MÓDULO DE GESTIÓN DE SESIÓN
────────────────────────────────────────────────────────────────── */
//Este script actúa en el cliente para validar el estado de autenticacion
//Utiliza la API de Web Storage (sessionStorage) para garantizar el
//el aislamiento de la sesión por pestaña y proteger las vistas
//privadas (Catálogo y Perfil) de accesos no autorizados.

// Obtiene el objeto del usuario autenticado, si no existe este registro, redirige al login.
function obtenerUsuario() {

    // Recupera la cadena estructurada en JSON del objeto de sesión
    const datos = sessionStorage.getItem('usuario');

    // Si no hay sesión activa, redirige al login
    if (!datos) {
        window.location.href = 'login.html';
        return null;
    }

    // Si existe, convierte la cadena plana en un objeto JSON manipulable por JS,
    // permitiendo que los componentes puedan extraer el id_usuario
    return JSON.parse(datos);
}

// Cierra la sesion y redirige al login
function cerrarSesion() {
    // Remueve la clave 'usuario de la memoria
    sessionStorage.removeItem('usuario');

    // redirecciona al login
    window.location.href = 'login.html';
}