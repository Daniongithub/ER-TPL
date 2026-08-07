const API_ENDPOINT = "https://ertpl-api.vichingo455.com/startnews";

async function getApiUrl() {
    const res = await fetch(API_ENDPOINT);
    const cfg = await res.json();
    if (cfg.status !== "ok") return null;
    return cfg.url;
}

const params = new URLSearchParams(window.location.search);
const link = params.get('link');
const notiziaContainer = document.getElementById('notizia-container');

notiziaContainer.innerHTML="<p>Caricamento notizia...</p>";
getApiUrl().then(url => {
fetch(url + "/feed")
    .then(response => {
        if (!response.ok){
            notiziaContainer.innerHTML="<p>Impossibile raggiungere l'API.</p>";
            if(response.status=="404"){
                notiziaContainer.innerHTML="<p>Errore HTTP 404 Not Found. Impossibile leggere la notizia.</p>";
            }
            throw new Error("Errore nel caricamento dei dati.");
        } 
        return response.json();
    })
    .then(data => {
            notiziaContainer.innerHTML = "";

            // Cerca la notizia con il link passato nella query string
            const element = data.items.find(item => item.link === link);

            if (!element) {
                notiziaContainer.innerHTML = "Notizia non trovata.";
                return;
            }

            const h1 = document.createElement("h1");
            const p = document.createElement("p");
            const mainContent = document.createElement("div");

            p.textContent = "Pubblicato: " + formattaData(element.published);
            h1.textContent = element.title;
            mainContent.innerHTML = element.content;

            notiziaContainer.appendChild(p);
            notiziaContainer.appendChild(h1);
            notiziaContainer.appendChild(mainContent);
        })
        .catch(err => console.error(err));
});

function formattaData(dataString) {
    const data = new Date(dataString);

    return new Intl.DateTimeFormat("it-IT", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    }).format(data);
}