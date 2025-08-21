const lineaSelect = document.getElementById('linea');
const modelloSelect = document.getElementById('modello');
const contentBackground = document.getElementById('content-background');

let allresults = [];
const urlList="https://setaapi.serverissimo.freeddns.org/busesinservice";

//Reperire modelli e numeri linea

const urlRoutes = 'https://setaapi.serverissimo.freeddns.org/routenumberslist';
//const urlRoutes = 'http://localhost:5001/stoplist';
const urlModels = 'https://setaapi.serverissimo.freeddns.org/busmodels';
//const urlModels = 'http://localhost:5001/stoplist';

//Fetch routes and models and fill the select options
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
    .catch(error => console.error('Errore nel caricamento dei dati:', error));

fetch(urlModels)
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
        modelloSelect.appendChild(option);
    });
    })
    .catch(error => console.error('Errore nel caricamento dei dati:', error));
caricadati();
var refreshGeneraleID=setInterval(caricadati, 60000);
function caricadati(){
    fetch(urlList)
    .then(response => {
        if (!response.ok) throw new Error("Errore nel caricamento dei dati.");
        return response.json();
    })
    .then(data => {
        item = data.features;
    })
    .then(data => {
        
        const container = document.getElementById('tabella-container');
        container.innerHTML = '';

        // Creo tabella
        const table = document.createElement('table');

        // Intestazione
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

        // Corpo tabella
        const tbody = document.createElement('tbody');
        item.forEach(item => {
            const element = item.properties;
            const tr = document.createElement('tr');
            if(element.next_stop==null){
                var posizione="";
            }else{
                var posizione=element.next_stop;
            }
            tr.innerHTML = `
                <td>${element.linea}</td>
                <td>${element.route_desc}</td>
                <td><a href="infoveicolo.html?id=${element.vehicle_code}" class="bianco">${element.vehicle_code}</a></td>
                <td>${element.model}</td>
                <td>${posizione}</td>
            `;
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);

        container.appendChild(table);
    })
    .catch(err => {
        console.error('Errore nel caricamento dati:', err);
        document.getElementById('tabella-container').textContent = 'Errore nel caricamento dati.';
    });
}

//FILTRI
//Filtro per linea
lineaSelect.addEventListener('change', function(event) {
    const eventConst=event;
    caricaFiltratiLinea(eventConst);
    setInterval(function dummyFunc(){caricaFiltratiLinea(eventConst);}, 60000);
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

function caricaFiltratiLinea(event){
    fetch(urlList)
    .then(response => {
        if (!response.ok) throw new Error("Errore nel caricamento dei dati.");
        return response.json();
    })
    .then(data=>{
        const selectedOption = event.target.value;
        currentSelectedOption = selectedOption;
        const container = document.getElementById('tabella-container');
        container.innerHTML = '';

        // Creo tabella
        const table = document.createElement('table');

        // Intestazione
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
        data.features.forEach(elements => {
            // Extract only the numeric part
            const number = elements.properties.linea.match(/\d+/g);
            if(number==selectedOption){
                const tbody = document.createElement('tbody');
                const element = elements.properties;
                const tr = document.createElement('tr');
                if(element.next_stop==null){
                    var posizione="";
                }else{
                    var posizione=element.next_stop;
                }
                tr.innerHTML = `
                    <td>${element.linea}</td>
                    <td>${element.route_desc}</td>
                    <td><a href="infoveicolo.html?id=${element.vehicle_code}" class="bianco">${element.vehicle_code}</a></td>
                    <td>${element.model}</td>
                    <td>${posizione}</td>
                `;
                tbody.appendChild(tr);
                table.appendChild(tbody);

                container.appendChild(table);
            }else{
                container.appendChild(table);
            }
        });
    });
}