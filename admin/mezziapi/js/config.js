// Configurazione separata per la futura integrazione con l'autenticazione.
window.MEZZI_CONFIG = {
    apiEndpoint: 'https://ertpl-api.vichingo455.com/mezzi',
    // Solo per test locali: 'https://mezziapi.serverissimo.com'. In produzione lasciare null per HA.
    apiBaseUrl: null,
    // Collegare qui la funzione che restituisce il token (anche asincrona), senza il prefisso Bearer.
    getToken: null
};
