const API_ENDPOINT = "https://ertpl-api.vichingo455.com/seta";

async function getApiUrl() {
  const res = await fetch(API_ENDPOINT);
  const cfg = await res.json();
  if (cfg.status !== "ok") return null;
  return cfg.url;
}

const params = new URLSearchParams(window.location.search);
const id = params.get('id');

var httpcode;

const container = document.getElementById('tabella-container');

//Sets stop name
const numero_span = document.getElementById('numero-span');
numero_span.textContent=id;

function caricadati(){
    var item=[];
    getApiUrl().then(url => {
    fetch(url + "/vehicleinfo/" + id)
    .then(response => {
        httpcode = response.status;
        if (!response.ok&&httpcode!=404) throw new Error("Errore di risposta nel caricamento dei dati, probabilmente il server API è offline.");
        if (httpcode==404){
            container.innerHTML="<strong>Il veicolo non è operativo o non comunica dati.</strong>";
        }
        return response.json();
    })
    .then(data => {
        item = data;
    })
    .then(data => {
    container.innerHTML = '';
    // Creo tabella
    const table = document.createElement('table');

    // Intestazione
    const thead = document.createElement('thead');
    thead.innerHTML = `
                <tr>
                    <th class="linea" colspan="2" style="text-align:center;">Informazioni veicolo:</th>
                </tr>
            `;
    table.appendChild(thead);

    // Corpo tabella
    const tbody = document.createElement('tbody');
        var tr = document.createElement('tr');
        tr.innerHTML = `
            <tr>
                <td class="uguale">Linea:</td>
                <td class="uguale">${item.line}</td>
            </tr>
        `;
        tbody.appendChild(tr);
        tr = document.createElement('tr');
        tr.innerHTML = `
            <tr>
                <td>Direzione:</td>
                <td>${item.destination}</td>
            </tr>
        `;
        tbody.appendChild(tr);
        tr = document.createElement('tr');
        tr.innerHTML = `
            <tr>
                <td>Tipo linea:</td>
                <td>${item.line_type}</td>
            </tr>
        `;
        tbody.appendChild(tr);
        //Ritardo col +
        if(item.delay>0){
            item.delay="+"+item.delay;
        }
        tr = document.createElement('tr');
        tr.innerHTML = `
            <tr>
                <td>Ritardo/Anticipo: (+/-)</td>
                <td>${item.delay}</td>
            </tr>
        `;
        tbody.appendChild(tr);
        tr = document.createElement('tr');
        if(item.has_AEP){
            tr.innerHTML = `
                <tr>
                    <td class="bus-card-green">Numero mezzo:</td>
                    <td class="bus-card-green">${item.vehicle}</td>
                </tr>
            `;
        }else{
            tr.innerHTML = `
                <tr>
                    <td>Numero mezzo:</td>
                    <td>${item.vehicle}</td>
                </tr>
            `;
        }
        tbody.appendChild(tr);
        tr = document.createElement('tr');
        tr.innerHTML = `
            <tr>
                <td>Modello:</td>
                <td>${item.model}</td>
            </tr>
        `;
        tbody.appendChild(tr);
        tr = document.createElement('tr');
        tr.innerHTML = `
            <tr>
                <td>Targa:</td>
                <td>${item.plate_num}</td>
            </tr>
        `;
        tbody.appendChild(tr);
        //Si o no pedana
        if(item.ramp==1){
            item.ramp="Sì";
        }else{
            item.ramp="No";
        }
        tr = document.createElement('tr');
        tr.innerHTML = `
            <tr>
                <td>Pedana?:</td>
                <td>${item.ramp}</td>
            </tr>
        `;
        tbody.appendChild(tr);
        tr = document.createElement('tr');
        tr.innerHTML = `
            <tr>
                <td>Ora si trova a:</td>
                <td><a href="/seta_modena/servizi/cercaorario/fermata.html?code=${item.stop_code}" class="bianco">${item.next_stop}</a></td>
            </tr>
        `;
        tbody.appendChild(tr);
        tr = document.createElement('tr');
        tr.innerHTML = `
            <tr>
                <td>Tabella oraria N°:</td>
                <td>${item.vehicle_table}</td>
            </tr>
        `;
        tbody.appendChild(tr);
        tr = document.createElement('tr');
        tr.innerHTML = `
            <tr>
                <td>Codice percorso:</td>
                <td><a href="/seta_modena/servizi/percorsi/percorso.html?routecode=${item.route_code}&routenum=${item.official_service}" class="bianco">${item.route_code}</a></td>
            </tr>
        `;
        tbody.appendChild(tr);
        tr = document.createElement('tr');
        tr.innerHTML = `
            <tr>
                <td>Codice corsa:</td>
                <td><a href="/seta_modena/servizi/percorsi/prossimefermate.html?journeycode=${item.journey_code}" class="bianco">${item.journey_code}</a></td>
            </tr>
        `;
        tbody.appendChild(tr);
        //Colore sfondo conta passeggeri (NON FUNZIONA LATO SETA)
        /*
        if(bus.num_passeggeri<=bus.posti_totali/4){
            tr = document.createElement('tr');
            tr.innerHTML = `
                <tr>
                    <td class="bus-card-green">Numero passeggeri a bordo:</td>
                    <td class="bus-card-green">${bus.num_passeggeri}</td>
                </tr>
            `;
        }else if(bus.num_passeggeri<=bus.posti_totali/1.8){
            tr = document.createElement('tr');
            tr.innerHTML = `
                <tr>
                    <td class="bus-card-yellow">Numero passeggeri a bordo:</td>
                    <td class="bus-card-yellow">${bus.num_passeggeri}</td>
                </tr>
            `;
        }else{
            tr = document.createElement('tr');
            tr.innerHTML = `
                <tr>
                    <td class="bus-card-red">Numero passeggeri a bordo:</td>
                    <td class="bus-card-red">${bus.num_passeggeri}</td>
                </tr>
            `;
        }if(bus.num_passeggeri==null){
            tr = document.createElement('tr');
            tr.innerHTML = `
                <tr>
                    <td>Numero passeggeri a bordo:</td>
                    <td>Non disponibile</td>
                </tr>
            `;
        }
        */
        tbody.appendChild(tr);
        tr = document.createElement('tr');
        tr.innerHTML = `
            <tr>
                <td>Numero posti totali (in piedi + sedili):</td>
                <td>${item.total_room}</td>
            </tr>
        `;
        tbody.appendChild(tr);
        tr = document.createElement('tr');
        tr.innerHTML = `
            <tr>
                <td>Posizione:</td>
                <td><a href="https://wimb.setaweb.it/qm/index.html?id=${item.vehicle}">GPS</a></td>
            </tr>
        `;
        tbody.appendChild(tr);
        //ERRORS
        if(item==undefined){
            
        }else{
            table.appendChild(tbody);
            container.appendChild(table);
        }
        
    })
    .catch(err => {
        console.error('Errore nel caricamento dati:', err);
        if(httpcode==404){return;}
        //Errore di connessione
        if(httpcode>="300"){
            document.getElementById('tabella-container').textContent = "Impossibile raggiungere l'API. (Codice HTTP:"+httpcode+")";
            return;
        }if(err.message=="NetworkError when attempting to fetch resource."){
            document.getElementById('tabella-container').textContent = "Impossibile raggiungere l'API.";
            return;
        }
        document.getElementById('tabella-container').textContent = 'Errore nella sintassi dei dati ricevuti.';  
    });})
}

if(id==""||id==undefined){
    document.getElementById('tabella-container').textContent = "Non hai inserito l'id del mezzo nell'URL.";
}else{
    caricadati();

    setInterval(caricadati, 60000);
}