//OAuth and backend config
const OIDC_ISSUER = "https://sso.serverissimo.com/application/o/";
const OIDC_CLIENT_ID = "vSjbxDWymiuVv4McKBDvq3FMesREl1dkeW7ExX5N";
const REDIRECT_URI = "https://ertpl.pages.dev/admin/setaapi/assegnazioni/callback.html";
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

async function redirectToLogin() {
    const verifier = generateCodeVerifier();
    const challenge = await generateCodeChallenge(verifier);
    const state = generateCodeVerifier(); // riuso la stessa funzione, mi serve solo una stringa casuale

    sessionStorage.setItem("pkce_verifier", verifier);
    sessionStorage.setItem("oauth_state", state);

    const params = new URLSearchParams({
        client_id: OIDC_CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        response_type: "code",
        scope: "openid profile groups",
        code_challenge: challenge,
        code_challenge_method: "S256",
        state: state,
    });

    window.location.href = `${OIDC_ISSUER}authorize/?${params.toString()}`;
}