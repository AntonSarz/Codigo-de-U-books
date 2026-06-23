/* --- Devuelve los datos del usuario logueado, o redirige al login si no hay sesion activa --- */
function obtenerUsuario() {
    const datos = sessionStorage.getItem('usuario');

    if (!datos) {
        window.location.href = 'login.html';
        return null;
    }

    return JSON.parse(datos);
}

// Cierra la sesion y redirige al login
function cerrarSesion() {
    sessionStorage.removeItem('usuario');
    window.location.href = 'login.html';
}