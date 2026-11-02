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
const uTextContainer = document.getElementById('urbano-text-container');
const subTextContainer = document.getElementById('sub-text-container');
const extraTextContainer = document.getElementById('extra-text-container');
const schTextContainer = document.getElementById('scuola-text-container');
const shuttleTextContainer = document.getElementById('navette-text-container');
const uContainer = document.getElementById('urbano-container');
const subContainer = document.getElementById('sub-container');
const extraContainer = document.getElementById('extra-container');
const schContainer = document.getElementById('scuola-container');
const shuttleContainer = document.getElementById('navette-container');

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
                //Urbano
                if (data.urban) {
                    uContainer.innerHTML = '';
                    uTextContainer.style.display = '';
                    data.urban.forEach(element => {
                        appendRoute(element, uContainer)
                    });
                } else {
                    uTextContainer.style.display = 'none';
                }
                //Suburbano
                if (data.suburban) {
                    subContainer.innerHTML = '';
                    subTextContainer.style.display = '';
                    data.suburban.forEach(element => {
                        appendRoute(element, subContainer)
                    });
                } else {
                    subTextContainer.style.display = 'none';
                }
                //Extraurbano
                if (data.exurban) {
                    extraContainer.innerHTML = '';
                    extraTextContainer.style.display = '';
                    data.exurban.forEach(element => {
                        appendRoute(element, extraContainer)
                    });
                } else {
                    extraTextContainer.style.display = 'none';
                }
                //Scolastico
                if (data.school) {
                    schContainer.innerHTML = '';
                    schTextContainer.style.display = '';
                    data.school.forEach(element => {
                        appendRoute(element, schContainer)
                    });
                } else {
                    schTextContainer.style.display = 'none';
                }
                //Navetta
                if (data.shuttle) {
                    shuttleContainer.innerHTML = '';
                    shuttleTextContainer.style.display = '';
                    data.shuttle.forEach(element => {
                        appendRoute(element, shuttleContainer)
                    });
                } else {
                    shuttleTextContainer.style.display = 'none';
                }
                messageP.innerHTML = '';
                messageP.style.display = 'none';
            })
            .catch(error => console.error('Errore nel caricamento dei dati:', error));
    })
}

function appendRoute(element, container) {
    const result = document.createElement('a');
    result.setAttribute("class", "bianco");
    result.setAttribute("href", "tabella.html?basin=" + selectedBasin + "&routecode=" + element.route_id);
    result.innerHTML = `
        <div class="search-result"><h3>${element.route_id}</h3>
    `;
    container.appendChild(result);
}