const API_ENDPOINT = "https://ertpl-api.vichingo455.com/seta";

async function getApiUrl() {
    const res = await fetch(API_ENDPOINT);
    const cfg = await res.json();
    if (cfg.status !== "ok") return null;
    return cfg.url;
}

const lineaSelect = document.getElementById('linea');
const modelloSelect = document.getElementById('modello');
const filterContainer = document.getElementById('filter-container');
const container = document.getElementById('tabella-container');

var allresults = [];
var urlList;
var httpcode;

//URLs

var urlRoutes;
var urlModels;
getApiUrl()
.catch(err => {
    console.error('Errore nel caricamento dati:', err);
    container.textContent = "Impossibile raggiungere il server alta disponibilità.";
})
.then(url => {
    urlList = url + "/busesinservice";
    urlRoutes = url + "/linelist";
    fillSelect();
    caricadati();
})

//Fetch routes and models and fill the selects
function fillSelect(){
    fetch(urlRoutes)
        .then(response => {
            if (!response.ok) throw new Error("Errore nel caricamento dei dati.");
            return response.json();
        })
        .then(data => {
            allresults = data;
            allresults.forEach(route => {
                const option = document.createElement('option');
                option.value = route;
                option.textContent = route;
                lineaSelect.appendChild(option);
            });
        })
        .catch(error => {console.error('Errore nel caricamento dei dati:', error)});
}

var refreshGeneraleID=setInterval(caricadati, 30000);

function fillModels() {
    const table = document.querySelector('#tabella-container table');
    console.log(table)

    if (!table || !modelloSelect) return;

    const currentModel = modelloSelect.value;
    const models = new Set();

    table.querySelectorAll('tbody tr').forEach(row => {
        const cells = row.getElementsByTagName('td');

        if (cells.length <= 4) return;

        // Il modello viene raccolto indipendentemente dal filtro modello
        const model = cells[3].textContent.trim();

        if (model && model !== "Sconosciuto") {
            models.add(model);
        }
    });

    // Ricrea le option
    modelloSelect.options.length = 1;

    [...models]
        .sort((a, b) => a.localeCompare(b, 'it', {
            sensitivity: 'base'
        }))
        .forEach(model => {
            const option = document.createElement('option');
            option.value = model;
            option.textContent = model;
            modelloSelect.appendChild(option);
        });
}

function caricadati(){
    //Catalogare errore di connessione HA
    if(urlList.includes("http")){
        fetch(urlList)
        .then(response => {
            httpcode=response.status;
            if (!response.ok) throw new Error("Errore nel caricamento dei dati.");
            return response.json();
        })
        .then(data => {
            item = data.buses;
            //Verifica se ci sono bus in servizio
            if(item.length==0){
                container.innerHTML = "<strong>Nessun bus in è servizio al momento.</strong>";
            }else{
                renderTable(item);
            }
        })
        .catch(err => {
            console.error('Errore nel caricamento dati:', err);
            //Errore di connessione
            if(httpcode>="300"){
                container.textContent = "Impossibile raggiungere l'API. (Codice HTTP:"+httpcode+")";
                return;
            }if(err.message=="NetworkError when attempting to fetch resource."){
                container.textContent = "Impossibile raggiungere l'API.";
                return;
            }
            container.textContent = 'Errore nel caricamento dati.';  
        });
    }
}

function renderTable(item,selectedOption){
    try{
        if(selectedOption==undefined){
            container.innerHTML = '';

            // Creo tabella
            const table = document.createElement('table');

            // Intestazione
            renderTH(table);

            // Corpo tabella
            const tbody = document.createElement('tbody');
            item.forEach((item, idx) => {
                renderElement(tbody, item, idx);
            });
            table.appendChild(tbody);

            container.appendChild(table);
            fillModels();
        }
    }catch(err){
        console.error('Errore nel caricamento dati:', err);
        container.textContent = 'Errore nel caricamento dati.';
    }   
}

function renderTH(table){
    const thead = document.createElement('thead');
    thead.innerHTML = `
            <tr>
                <th>Linea</th>
                <th>Direzione</th>
                <th>Veicolo</th>
                <th>Modello</th>
                <th>Prossima fermata</th>
            </tr>
        `;
    table.appendChild(thead);
}

function renderElement(tbody, element, idx){
    const tr = document.createElement('tr');
    if(element.next_stop==null){
        var posizione="";
    }else{
        var posizione=element.next_stop;
    }
    //Overflow tabella
    if(window.screen.width<=512){
        if(element.destination=="MONTEBARANZONE"){
            element.destination = "MONTEBA-<br>RANZONE";
        }
        if(element.destination=="MONTOMBRARO"){
            element.destination = "MONTOM-<br>BRARO";
        }
        if(element.destination=="CAMPOGALLIANO"){
            element.destination = "CAMPOGAL-<br>LIANO";
        }
        if(element.destination=="MONTEBONELLO"){
            element.destination = "MONTEBO-<br>NELLO";
        }
    }
    if(element.has_problems){
        tr.innerHTML = `
            <td class="bus-card-red cursor-pointer" onclick="window.location.href='/seta_modena/servizi/cercaorario/notizielinea.html?routenum=${element.official_line}'">${element.line}</td>
            <td class="bus-card-red cursor-pointer" onclick="window.location.href='/seta_modena/servizi/cercaorario/notizielinea.html?routenum=${element.official_line}'">${element.destination}</td>
        `;
    }else{
        tr.innerHTML = `
            <td>${element.line}</td>
            <td>${element.destination}</td>
        `;
    }
    if(element.has_AEP){
        tr.innerHTML += `
            <td class="bus-card-green cursor-pointer" onclick="window.location.href='/seta_modena/servizi/businservizio/infoveicolo.html?id=${element.vehicle}'">${element.vehicle}</td>
        `;
    }else{
        tr.innerHTML += `
            <td class="cursor-pointer" onclick="window.location.href='/seta_modena/servizi/businservizio/infoveicolo.html?id=${element.vehicle}'">${element.vehicle}</td>
        `;
    }
    tr.innerHTML += `
        <td>${element.model}</td>
        <td>${posizione}</td>
    `;
    if (idx % 2 != 0) {
        tr.className = "even";
    }
    tbody.appendChild(tr);
}

//FILTRI
var intervalFiltrati = 0;
//Filtro per linea
lineaSelect.addEventListener('change', function(event) {
    if(intervalFiltrati!=undefined){
        clearInterval(intervalFiltrati);
        modelloSelect.value="ph";
    }
    const selectedOption = event.target.value;
    caricaFiltratiLinea(selectedOption);
    intervalFiltrati = setInterval(function dummyFunc(){caricaFiltratiLinea(selectedOption);}, 30000);
    clearInterval(refreshGeneraleID);
    if(document.getElementById("reimposta-filtro")==undefined){
        const reimpostaFiltro = document.createElement('p');
        reimpostaFiltro.setAttribute("style","margin-bottom: 0; font-size: 20px;");
        reimpostaFiltro.setAttribute("id","reimposta-filtro");
        reimpostaFiltro.innerHTML = `
                <button onclick="window.location.reload()">Reimposta il filtro</a>
            `;
        filterContainer.appendChild(reimpostaFiltro);
    }
});

//Filtro per modello
modelloSelect.addEventListener('change', function(event) {
    if(intervalFiltrati!=undefined){
        clearInterval(intervalFiltrati);
        lineaSelect.value="ph";
    }
    const selectedOption = event.target.value;
    caricaFiltratiModello(selectedOption);
    intervalFiltrati = setInterval(function dummyFunc(){caricaFiltratiModello(selectedOption);}, 30000);
    clearInterval(refreshGeneraleID);
    if(document.getElementById("reimposta-filtro")==undefined){
        const reimpostaFiltro = document.createElement('p');
        reimpostaFiltro.setAttribute("style","margin-bottom: 0; font-size: 14px;");
        reimpostaFiltro.setAttribute("id","reimposta-filtro");
        reimpostaFiltro.innerHTML = `
                <button onclick="window.location.reload()">Reimposta il filtro</a>
            `;
        filterContainer.appendChild(reimpostaFiltro);
    }
});

function reloadFiltratiLinea() {
    caricaFiltratiLinea(lineaSelect.value);
}

function caricaFiltratiLinea(selectedOption) {
    container.innerHTML = 'Caricamento dati...';
    fetch(urlList)
    .then(response => {
        if (!response.ok) throw new Error("Errore nel caricamento dei dati.");
        return response.json();
    })
    .then(data => {
        container.innerHTML = '';
        //Sostituisco il pulsante aggiorna tutti col pulsante aggiorna filtrati
        const aggiornaNav = document.getElementById('nav-inservizio');
        aggiornaNav.innerHTML = `
            <ul>
                <li><a href="/index.html"><h1 style="font-size: 100%;font-weight: 500;">Home</h1></a></li>
                <li><a href="/seta_modena/menu/index.html"><h1 style="font-size: 100%;font-weight: 500;">SETA Modena</h1></a></li>
            </ul>
            <ul style="flex:1;justify-content: right;">
                <li><a href="javascript:reloadFiltratiLinea();"><h1 style="font-size: 16px;font-weight: 500;">Aggiorna</h1></a></li>
            </ul>
        `;
        //Create table
        const table = document.createElement('table');

        if(data.buses.length==0){
            container.innerHTML="<strong>Nessun bus è in servizio al momento.</strong>";
            return;
        }
        //Fill table
        renderTH(table);
        const tbody = document.createElement('tbody');
        var i = 0;
        data.buses.forEach(element => {
            if(element.official_line==selectedOption){
                renderElement(tbody, element, i);
                table.appendChild(tbody);

                container.appendChild(table);
                i++;
            }
        });
        //Controllo se c'è qualche elemento altrimenti errore
        if(table.childElementCount==1){
            container.innerHTML="<strong>Nessun bus trovato per la linea scelta.</strong>";
        }
    });
}

function caricaFiltratiModello(selectedOption){
    container.innerHTML = 'Caricamento dati...';
    fetch(urlList)
    .then(response => {
        if (!response.ok) throw new Error("Errore nel caricamento dei dati.");
        return response.json();
    })
    .then(data=>{
        container.innerHTML = '';
        //Sostituisco il pulsante aggiorna tutti col pulsante aggiorna filtrati
        const aggiornaNav = document.getElementById('nav-inservizio');
        aggiornaNav.innerHTML = `
            <ul>
                <li><a href="/index.html"><h1 style="font-size: 100%;font-weight: 500;">Home</h1></a></li>
                <li><a href="/seta_modena/menu/index.html"><h1 style="font-size: 100%;font-weight: 500;">SETA Modena</h1></a></li>
            </ul>
            <ul style="flex:1;justify-content: right;">
                <li><a href="javascript:reloadFiltratiModello();"><h1 style="font-size: 16px;font-weight: 500;">Aggiorna</h1></a></li>
            </ul>
        `;
        // Creo tabella
        const table = document.createElement('table');

        if(data.buses.length==0){
            container.innerHTML="<strong>Nessun bus è in servizio al momento.</strong>";
            return;
        }
        // Intestazione
        renderTH(table);
        const tbody = document.createElement('tbody');
        var i = 0;
        data.buses.forEach(element => {
            if(element.model==selectedOption){
                renderElement(tbody, element, i);
                table.appendChild(tbody);

                container.appendChild(table);
                i++;
            }
        });
        //Controllo se c'è qualche elemento altrimenti errore
        if(table.childElementCount==1){
            container.innerHTML="<strong>Nessun bus trovato per il modello scelto.</strong>";
        }
    });
}

function reloadFiltratiModello(){
    caricaFiltratiModello(modelloSelect.value);
}