// ============================================
// CONFIGURACIÓN DEL BACKEND
// ============================================
//
// IMPORTANTE: Edita este archivo con la URL de tu servidor backend (VPS)
// antes de subir el sitio web al hosting.
//
// Ejemplo:
// - Si tu backend está en: https://api.uftoken.cl
// - Cambia API_BASE_URL a: 'https://api.uftoken.cl'
//
// ============================================

const BACKEND_CONFIG = {
    // URL base del backend (VPS donde está UFToken_ICO)
    // Cambiar por la URL real de tu servidor backend
    API_BASE_URL: 'https://api.uftoken.cl', // ⚠️ CAMBIAR ESTA URL

    // Configuración opcional de CORS (si es necesario)
    // Si tu backend está en un dominio diferente, asegúrate de configurar CORS
    // en el servidor backend para permitir solicitudes desde tu dominio del frontend
};

// Exportar configuración para uso en otros scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BACKEND_CONFIG;
}

