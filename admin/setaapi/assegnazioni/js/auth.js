//OAuth and backend config
const OIDC_ISSUER = "https://sso.serverissimo.com/application/o/ertpl-assegnazioni/";
const OIDC_CLIENT_ID = "vSjbxDWymiuVv4McKBDvq3FMesREl1dkeW7ExX5N";
const REDIRECT_URI = "https://ertpl.pages.dev/admin/setaapi/assegnazioni/callback.html";
//const REDIRECT_URI = "http://127.0.0.1:5500/admin/setaapi/assegnazioni/callback.html";
const API_BASE_URL = "https://setaapi.serverissimo.com";

function generateCodeVerifier() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array); // CSPRNG nativo del browser, non Math.random()
    return base64UrlEncode(array);
}

async function generateCodeChallenge(verifier) {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const digest = await crypto.subtle.digest("SHA-256", data); // ritorna un ArrayBuffer
    return base64UrlEncode(new Uint8Array(digest));
}

function base64UrlEncode(bytes) {
    let binary = "";
    bytes.forEach((b) => (binary += String.fromCharCode(b)));
    return btoa(binary)
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, ""); // PKCE richiede base64url SENZA padding
}

let discoveryCache = null;

async function getDiscovery() {
    if (discoveryCache) return discoveryCache;
    const response = await fetch(`${OIDC_ISSUER}.well-known/openid-configuration`);
    discoveryCache = await response.json();
    return discoveryCache;
}

async function redirectToLogin() {
    const discovery = await getDiscovery();
    const verifier = generateCodeVerifier();
    const challenge = await generateCodeChallenge(verifier);
    const state = generateCodeVerifier(); // riuso la stessa funzione, mi serve solo una stringa casuale

    localStorage.setItem("pkce_verifier", verifier);
    localStorage.setItem("oauth_state", state);

    const params = new URLSearchParams({
        client_id: OIDC_CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        response_type: "code",
        scope: "openid profile groups",
        code_challenge: challenge,
        code_challenge_method: "S256",
        state: state,
    });

    window.location.href = `${discovery.authorization_endpoint}?${params.toString()}`;
}

async function logoutUser() {
    const idToken = localStorage.getItem("id_token");

    localStorage.removeItem("access_token");
    localStorage.removeItem("id_token");
    localStorage.removeItem("token_expiry");

    const discovery = await getDiscovery();

    if (discovery.end_session_endpoint && idToken) {
        const params = new URLSearchParams({
            id_token_hint: idToken,
            post_logout_redirect_uri: window.location.origin + window.location.pathname.replace("index.html", "") + "index.html",
        });
        window.location.href = `${discovery.end_session_endpoint}?${params.toString()}`;
    } else {
        // Fallback: nessun end_session_endpoint disponibile o id_token mancante
        // (es. sessione già scaduta) — logout solo locale, poi torna alla pagina
        window.location.href = "index.html";
    }
}

//callback.html
async function handleCallback() {
    const statusEl = document.getElementById("status");
    const params = new URLSearchParams(window.location.search);

    const code = params.get("code");
    const returnedState = params.get("state");

    if (!code) {
        statusEl.textContent = "Richiesta non valida: parametro mancante.";
        cleanupPkceStorage();
        return;
    }

    const savedState = localStorage.getItem("oauth_state");
    const verifier = localStorage.getItem("pkce_verifier");

    if (!savedState || !verifier || returnedState !== savedState) {
        statusEl.textContent = "Sessione di accesso non valida. Riprova il login.";
        cleanupPkceStorage();
        setTimeout(() => { window.location.href = "index.html"; }, 2000);
        return;
    }

    try {
        const discovery = await getDiscovery();

        const body = new URLSearchParams({
            grant_type: "authorization_code",
            client_id: OIDC_CLIENT_ID,
            redirect_uri: REDIRECT_URI,
            code: code,
            code_verifier: verifier,
        });

        const response = await fetch(discovery.token_endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: body.toString(),
        });

        if (!response.ok) {
            statusEl.innerHTML = `Impossibile completare l'accesso. <a href="index.html">Riprova</a>. Errore: ` + err;
            cleanupPkceStorage();
            return;
        }

        const tokens = await response.json();
        localStorage.setItem("access_token", tokens.access_token);
        localStorage.setItem("id_token", tokens.id_token);
        localStorage.setItem("token_expiry", Date.now() + tokens.expires_in * 1000);
        cleanupPkceStorage();
        window.location.href = "index.html";
    } catch (err) {
        statusEl.textContent = "Errore di connessione durante l'accesso. Riprova.";
        cleanupPkceStorage();
    }
}

function cleanupPkceStorage() {
    localStorage.removeItem("pkce_verifier");
    localStorage.removeItem("oauth_state");
}