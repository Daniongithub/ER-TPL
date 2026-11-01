const API_ENDPOINT = "https://ertpl-api.vichingo455.com/start";

async function getApiUrl() {
    const res = await fetch(API_ENDPOINT);
    const cfg = await res.json();
    if (cfg.status !== "ok") return null;
    return cfg.url;
}

const basinSelect = document.getElementById('basin-select');
const messageP = document.getElementById('message-p');
const routesContainer = document.getElementById('routes-container');
const uContainer = document.getElementById('urbano-container');
const sContainer = document.getElementById('speciali-container');
const seContainer = document.getElementById('subextra-container');
const othContainer = document.getElementById('altri-container');
const schContainer = document.getElementById('scuola-container');

var selectedBasin;

basinSelect.addEventListener('change', (event) => {
    selectedBasin = event.target.value;
    loadRoutes();
})

//Controlla che non sia già stato autocompletato dal browser (es. freccia indietro)
if (basinSelect.value != "") {
    selectedBasin = basinSelect.value;
    loadRoutes();
}

//Elenco linee
function loadRoutes() {
    uContainer.innerHTML = '';
    messageP.style.display = '';
    messageP.textContent = 'Caricamento in corso...';
    getApiUrl().then(url => {
        fetch(url + "/static/routes/" + selectedBasin)
            .then(response => {
                if (!response.ok) throw new Error("Errore nel caricamento dei dati.");
                return response.json();
            })
            .then(data => {
                routesContainer.style.display = '';
                data.forEach(element => {
                    //Ordina le linee in categorie
                    //TODO
                    const result = document.createElement('a');
                    result.setAttribute("class", "bianco");
                    result.setAttribute("href", "tabella.html?basin=" + selectedBasin + "&routecode=" + element.route_id);
                    result.innerHTML = `
                        <div class="search-result"><h3>${element.route_id}</h3>
                    `;
                    uContainer.appendChild(result);
                });
                messageP.innerHTML = '';
                messageP.style.display = 'none';
            })
            .catch(error => console.error('Errore nel caricamento dei dati:', error));
    })
}