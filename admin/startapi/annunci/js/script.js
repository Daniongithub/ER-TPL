const API_ENDPOINT = 'https://ertpl-api.vichingo455.com/start';
async function getApiUrl() {
    const res = await fetch(API_ENDPOINT);
    const cfg = await res.json();
    if (cfg.status !== "ok") return null;
    return cfg.url;
}

function getValidToken() {
    const token = localStorage.getItem('access_token');
    const expiry = Number(localStorage.getItem('token_expiry'));
    if (!token || !Number.isFinite(expiry) || Date.now() >= expiry) {
        return null;
    }
    return token;
}

function checkAuth() {
    if (!getValidToken()) {
        redirectToLogin();
        return false;
    }
    document.getElementById('loading-container').classList.add('d-none');
    document.getElementById('page-container').classList.remove('d-none');
    return true;
}

const currentMessageSpan = document.getElementById('current-message-span');

async function getMessages() {
    const url = await getApiUrl();
    const response = await fetch(url + "/announcements");
    if (!response.ok && response.status != 404) {
        const error = new Error('Errore nel caricamento dei dati. HTTP: ' + response.status);
        error.status = response.status;
        throw error;
    } else if (response.status == 404) {
        return false
    }
    return response.json();
}

async function displayMessage() {
    var response = await getMessages();
    if (!response) {
        currentMessageSpan.innerHTML = '<i class="opacity-50">Nessun messaggio impostato</i>';
        return;
    }
    currentMessageSpan.innerHTML = '';

    response.forEach(message => {
        currentMessageSpan.innerHTML = message;
    });
}

if (checkAuth()) {
    displayMessage();
}
