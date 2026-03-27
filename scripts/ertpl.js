// New fallback system (HA)
(() => {
    const API_ENDPOINT = "https://ertpl-api.vercel.app/nextcloud";
    let photoConfig = null;

    async function getConfig() {
        if (photoConfig) return photoConfig;

        const res = await fetch(API_ENDPOINT);
        photoConfig = await res.json();
        return photoConfig;
    }

    function buildPreviewUrl(cfg, path, x = 1920, y = 1080, isMenu = false, isLeo) {
        if(isLeo){
            return `${cfg.url}/apps/files_sharing/publicpreview/${cfg.share}` +
            `?file=${encodeURIComponent(path)}&x=${x}&y=${y}`;
        }
        return `${cfg.url}/apps/files_sharing/publicpreview/${cfg.share}` +
            `?file=${encodeURIComponent(path)}&x=${x}&y=${y}` + (isMenu ? "" : "&a=true");
    }

    async function initPhotos() {
        try {
            const cfg = await getConfig();
            let isOffline = false;
            if (cfg.status !== "ok") isOffline=true;

            document.querySelectorAll("img[data-path]").forEach(img => {
                if(isOffline){
                    img.setAttribute("alt","Server foto non raggiungibili.");
                    return;
                }
                const path = img.dataset.path;
                let isLeo = false;
                const pageUrl = document.location.href;
                if(pageUrl.includes("/seta_modena/")){
                    isLeo = true;
                }
                const link = img.closest("a");
                const isMenu = img.classList.contains("bus");

                const url = buildPreviewUrl(cfg, path, 1920, 1080, isMenu, false);
                const imglink = buildPreviewUrl(cfg, path, 1920, 1080, isMenu, isLeo);

                img.src = imglink;

                // aggiorna solo i link che NON finiscono con .html
                if (link && !link.href.endsWith(".html")) {
                    link.href = url;
                }
            });

        } catch (e) {
            console.error("Photo init failed", e);
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
        years + " anni " +
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
    fetch("https://ertpl-api.vercel.app/")
    .then(res => {
        if (!res.ok) {
            throw new Error(res.status);
        }
        return res.json();
    })
    .then(info => {
    document.getElementById("apiVersion").innerHTML =
        `Versione API Alta Disponibilità: v${info.version} (<a href="/admin/Vichingo455/testha.html">Controllo dettagliato</a>)`;
        /*fetch("https://ertpl-api.vercel.app/nextcloud").then(res => res.json()).then(info => {
            document.getElementById("apiServer").innerHTML = `Server in uso: ${info.server}`;
        }).catch(() => {
            document.getElementById("apiServer").innerHTML = "Server in uso: info non disponibile al momento";
        });*/
    })
    .catch(() => {
        document.getElementById("apiVersion").innerHTML = `Versione API Alta Disponibilità: API Alta Disponibilità non raggiungibile al momento. (<a href="/admin/Vichingo455/testha.html">Controllo dettagliato</a>)`;
    });
}