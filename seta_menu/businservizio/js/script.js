const lineaSelect = document.getElementById('linea');
const modelloSelect = document.getElementById('modello');

let allresults = [];

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
        console.log(allresults);
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

const urlList="https://setaapi.serverissimo.freeddns.org/busesinservice";
caricadati();
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
                        <th class="orario">Veicolo</th>
                        <th class="stato">Modello veicolo</th>
                        <th class="linea">Linea</th>
                        <th class="direzione">Direzione</th>
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
                <td><a href="https://wimb.setaweb.it/qm/index.html?id=${element.vehicle_code}" class="bianco">${element.vehicle_code}</a></td>
                <td>${element.model}</td>
                <td>${element.linea}</td>
                <td>${element.route_desc}</td>
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