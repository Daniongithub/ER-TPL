// New fallback system (HA)
(() => {
    const API_ENDPOINT = "https://ertpl-api.vichingo455.com/cdn";
    let photoConfig = null;

    async function getConfig() {
        if (photoConfig) return photoConfig;

        const res = await fetch(API_ENDPOINT);
        photoConfig = await res.json();
        return photoConfig;
    }

    function buildPreviewUrl(cfg, path, isMenu = false, isLeo, original = false) {
        if (isLeo) {
            return `${cfg.url}/img?path=${encodeURIComponent(path)}&crop=true`;
        }

        if (original) {
            return `${cfg.url}/img?path=${encodeURIComponent(path)}`;
        }

        return `${cfg.url}/img?path=${encodeURIComponent(path)}` + (isMenu ? "&crop=true" : "&crop=resize");
    }

    async function initPhotos() {
        try {
            const cfg = await getConfig();
            let isOffline = false;
            if (cfg.status !== "ok") isOffline = true;

            document.querySelectorAll("img[data-path]").forEach(img => {
                img.addEventListener("error", () => { img.alt = "Errore nel caricamento delle foto."; });

                img.loading = "lazy"; // Implementazione del lazy-loading

                if (isOffline) {
                    img.setAttribute("alt", "Server foto non raggiungibili.");
                    return;
                }

                const path = img.dataset.path;

                if (!path) {
                    return;
                }

                let isLeo = false;
                const pageUrl = document.location.href;
                if (pageUrl.includes("/seta_modena/")) {
                    isLeo = true;
                }

                const link = img.closest("a");
                const isMenu = img.classList.contains("bus");
                const imglink = buildPreviewUrl(cfg, path, isMenu, isLeo);
                img.src = imglink;

                const url = buildPreviewUrl(cfg, path, false, false, true);

                // Aggiorna solo i link che NON finiscono con .html
                if (link && !link.href.endsWith(".html")) {
                    link.href = url;
                }

                // Pulisci il data-path
                img.removeAttribute("data-path");
            });

        } catch (e) {
            console.error("Photo init failed", e);
            document.querySelectorAll("img[data-path]").forEach(img => {img.setAttribute("alt", "Server foto non raggiungibili.");});
        }
    }

    document.addEventListener("DOMContentLoaded", initPhotos);
})();


// The functions below are used to display from how much time the project has been living
const startDate = new Date("2024-12-22T15:49:00");
function updateTimer() {
    const now = new Date();
    const diff = now - startDate;

    if (diff < 0) {
        document.getElementById("timer").innerHTML = "La data è nel futuro!";
        return;
    }

    const seconds = Math.floor(diff / 1000) % 60;
    const minutes = Math.floor(diff / 1000 / 60) % 60;
    const hours = Math.floor(diff / (1000 * 60 * 60)) % 24;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24) % 365);
    const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365));

    document.getElementById("timer").innerHTML =
        years + (years == 1 ? " anno " : " anni ") +
        days + " giorni " +
        hours + " ore " +
        minutes + " minuti " +
        seconds + " secondi";
}

function chisiamoInizializza() {
    updateTimer();
    getApiVersionHA();
    setInterval(updateTimer, 1000);
}

// This function below is just a simple obfuscator for the email address, in order to prevent bots invading the inbox.
function mostraemail() {
    document.getElementById("email").innerHTML = "";
    const baseMail = "aW5mby5lcnRwbEBwcm90b25tYWlsLmNvbQ==";
    const newMail = atob(baseMail);
    const link = document.getElementById("email").appendChild(document.createElement("a"));
    link.setAttribute("class", "novita")
    link.innerHTML = newMail;
    link.setAttribute("href", "mailto:" + newMail);
}

// This function below is to display the version of the HA API and the current server
function getApiVersionHA() {
    fetch("https://ertpl-api.vichingo455.com/")
        .then(res => {
            if (!res.ok) {
                throw new Error(res.status);
            }
            return res.json();
        })
        .then(info => {
            document.getElementById("apiVersion").innerHTML =`Versione API Alta Disponibilità: v${info.version} (<a href="/admin/Vichingo455/testha.html">Controllo dettagliato</a>)`})
        .catch(() => {
            document.getElementById("apiVersion").innerHTML = `Versione API Alta Disponibilità: API Alta Disponibilità non raggiungibile al momento. (<a href="/admin/Vichingo455/testha.html">Controllo dettagliato</a>)`;
        });
}