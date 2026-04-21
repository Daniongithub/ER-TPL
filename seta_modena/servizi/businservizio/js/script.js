const API_ENDPOINT = "https://ertpl-api.vercel.app/seta";

async function getApiUrl() {
    const res = await fetch(API_ENDPOINT);
    const cfg = await res.json();
    if (cfg.status !== "ok") return null;
    return cfg.url;
}

const lineaSelect = document.getElementById('linea');
const modelloSelect = document.getElementById('modello');
const contentBackground = document.getElementById('content-background');
const container = document.getElementById('tabella-container');

var allresults = [];
var urlList;

//URLs

var urlRoutes;
var urlModels;
getApiUrl().then(url => {
    urlList = url + "/busesinservice";
    urlRoutes = url + "/routenumberslist";
    urlModels = url + "/busmodels";
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
    fetch(urlModels)
        .then(response => {
            if (!response.ok) throw new Error("Errore nel caricamento dei dati.");
            return response.json();
        })
        .then(data => {
            allresults = data;
            allresults.forEach(model => {
                const option = document.createElement('option');
                if(
                    model!="CAM New Busotto"&&
                    model!="Iveco Cityclass CNG"&&
                    model!="Irisbus Cityclass CNG ex Pavia"&&
                    model!="Mercedes Integro O550 (Giallo)"&&
                    model!="Mercedes Citaro O530N Diesel"&&
                    model!="Mercedes Citaro O530Ü"
                ){
                    option.value = model;
                    option.textContent = model;
                    modelloSelect.appendChild(option);
                }
            });
        })
        .catch(error => {console.error('Errore nel caricamento dei dati:', error)});
}

var refreshGeneraleID=setInterval(caricadati, 60000);

function caricadati(){
    fetch(urlList)
    .then(response => {
        if (!response.ok) throw new Error("Errore nel caricamento dei dati.");
        return response.json();
    })
    .then(data => {
        item = data.features;
        renderTable(item);
    })
    .catch(err => {
        console.error('Errore nel caricamento dati:', err);
        document.getElementById('tabella-container').textContent = 'Errore nel caricamento dati.';
    });
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
            item.forEach(item => {
                renderElement(tbody, item);
            });
            table.appendChild(tbody);

            container.appendChild(table);
        }
    }catch(err){
        console.error('Errore nel caricamento dati:', err);
        document.getElementById('tabella-container').textContent = 'Errore nel caricamento dati.';
    }   
}

function renderTH(table){
    const thead = document.createElement('thead');
    thead.innerHTML = `
            <tr>
                <th class="linea">Linea</th>
                <th class="direzione">Direzione</th>
                <th class="orario">Veicolo</th>
                <th class="stato">Modello veicolo</th>
                <th class="veicolo">Ora si trova a</th>
            </tr>
        `;
    table.appendChild(thead);
}

function renderElement(tbody, item){
    const element = item.properties;
    const tr = document.createElement('tr');
    if(element.next_stop==null){
        var posizione="";
    }else{
        var posizione=element.next_stop;
    }
    if(element.br==true){
        var dest = element.destination1+"<br>"+element.destination2;
    }else{
        var dest = element.route_desc;
    }
    //Overflow tabella
    if(window.screen.width<=512){
        if(element.route_desc=="MONTEBARANZONE"){
            dest = "MONTEBA-<br>RANZONE";
        }
        if(element.route_desc=="MONTOMBRARO"){
            dest = "MONTOM-<br>BRARO";
        }
        if(element.route_desc=="CAMPOGALLIANO"){
            dest = "CAMPOGAL-<br>LIANO";
        }
        if(element.route_desc=="MONTEBONELLO"){
            dest = "MONTEBO-<br>NELLO";
        }
    }
    if(element.hasProblems==true){
        tr.innerHTML = `
            <td class="bus-card-red cursor-pointer" onclick="window.location.href='/seta_modena/servizi/cercaorario/notizielinea.html?routenum=${element.officialService}'">${element.linea}</td>
            <td class="bus-card-red cursor-pointer" onclick="window.location.href='/seta_modena/servizi/cercaorario/notizielinea.html?routenum=${element.officialService}'">${dest}</td>
        `;
    }else{
        tr.innerHTML = `
            <td>${element.linea}</td>
            <td>${dest}</td>
        `;
    }
    if(element.hasAEP){
        tr.innerHTML += `
            <td class="bus-card-green cursor-pointer" onclick="window.location.href='/seta_modena/servizi/businservizio/infoveicolo.html?id=${element.vehicle_code}'">${element.vehicle_code}</td>
        `;
    }else{
        tr.innerHTML += `
            <td class="cursor-pointer" onclick="window.location.href='/seta_modena/servizi/businservizio/infoveicolo.html?id=${element.vehicle_code}'">${element.vehicle_code}</td>
        `;
    }
    tr.innerHTML += `
        <td>${element.model}</td>
        <td>${posizione}</td>
    `;
    tbody.appendChild(tr);
}

//FILTRI
var intervalFiltrati = 0;
//Filtro per linea
lineaSelect.addEventListener('change', function(event) {
    if(intervalFiltrati!=undefined){
        //alert("Non è possibile usare due filtri allo stesso momento")
        clearInterval(intervalFiltrati);
    }
    const selectedOption = event.target.value;
    caricaFiltratiLinea(selectedOption);
    intervalFiltrati = setInterval(function dummyFunc(){caricaFiltratiLinea(selectedOption);}, 60000);
    clearInterval(refreshGeneraleID);
    if(document.getElementById("reimposta-filtro")==undefined){
        const reimpostaFiltro = document.createElement('p');
        reimpostaFiltro.setAttribute("style","margin-bottom: 0; font-size: 14px;");
        reimpostaFiltro.setAttribute("id","reimposta-filtro");
        reimpostaFiltro.innerHTML = `
                <a href="" class="biancosott">Reimposta il filtro</a>
            `;
        contentBackground.appendChild(reimpostaFiltro);
    }
});

//Filtro per modello
modelloSelect.addEventListener('change', function(event) {
    if(intervalFiltrati!=undefined){
        //alert("Non è possibile usare due filtri allo stesso momento")
        clearInterval(intervalFiltrati);
    }
    const selectedOption = event.target.value;
    caricaFiltratiModello(selectedOption);
    intervalFiltrati = setInterval(function dummyFunc(){caricaFiltratiModello(selectedOption);}, 60000);
    clearInterval(refreshGeneraleID);
    if(document.getElementById("reimposta-filtro")==undefined){
        const reimpostaFiltro = document.createElement('p');
        reimpostaFiltro.setAttribute("style","margin-bottom: 0; font-size: 14px;");
        reimpostaFiltro.setAttribute("id","reimposta-filtro");
        reimpostaFiltro.innerHTML = `
                <a href="" class="biancosott">Reimposta il filtro</a>
            `;
        contentBackground.appendChild(reimpostaFiltro);
    }
});

function reloadFiltratiLinea(){
    caricaFiltratiLinea(lineaSelect.value);
}

function caricaFiltratiLinea(selectedOption){
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
                <li><a href="javascript:reloadFiltratiLinea();"><h1 style="font-size: 16px;font-weight: 500;">Aggiorna</h1></a></li>
            </ul>
        `;
        // Creo tabella
        const table = document.createElement('table');

        // Intestazione
        renderTH(table);

        data.features.forEach(elements => {
            if(elements.properties.officialService==selectedOption){
                const tbody = document.createElement('tbody');
                renderElement(tbody, elements);
                table.appendChild(tbody);

                container.appendChild(table);
            }else{
                container.appendChild(table);
            }
        });
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

        // Intestazione
        renderTH(table);
        
        data.features.forEach(elements => {
            if(elements.properties.model==selectedOption){
                const tbody = document.createElement('tbody');
                renderElement(tbody, elements);
                table.appendChild(tbody);

                container.appendChild(table);
            }else{
                container.appendChild(table);
            }
        });
    });
}

function reloadFiltratiModello(){
    caricaFiltratiModello(modelloSelect.value);
}