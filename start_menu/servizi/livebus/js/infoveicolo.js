// New fallback system (HA)
const API_ENDPOINT = "https://ertpl-api.vichingo455.com/startbus";

async function getApiUrl() {
    const res = await fetch(API_ENDPOINT);
    const cfg = await res.json();
    if (cfg.status !== "ok") return null;
    //return cfg.url;
    return "https://startapi.serverissimo.com/busesinservice";
}

