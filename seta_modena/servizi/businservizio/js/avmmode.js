const API_ENDPOINT = "https://ertpl-api.vercel.app/seta";

async function getApiUrl() {
    const res = await fetch(API_ENDPOINT);
    const cfg = await res.json();
    if (cfg.status !== "ok") return null;
    return cfg.url;
}

const params = new URLSearchParams(window.location.search);
const id = params.get('id');

var httpcode;

//Sets stop name
const numero_span = document.getElementById('numero-span');
numero_span.textContent=id;

function caricadati(){
    getApiUrl().then(url => {
    fetch(url + "/vehicleinfo/" + id)
    .then(response => {
        httpcode = response.status;
        if (!response.ok) throw new Error("Errore di risposta nel caricamento dei dati, probabilmente il server API è offline.");
        return response.json();
    })
    .then(data => {
        var item=data;
        const container = document.getElementById('tabella-container');
        container.innerHTML = '';
        // Creo tabella
        const table = document.createElement('table');

        // Intestazione
        const thead = document.createElement('thead');
        var h = new Date().getHours();
        if(h<10){
            h = "0"+h;
        }
        var m = new Date().getMinutes();
        if(m<10){
            m = "0"+m;
        }
        var sec = new Date().getSeconds();
        //Aggiunge uno 0 ai secondi se serve
        if(sec<10){
            sec = "0"+sec;
        }
        thead.innerHTML = `
                <tr>
                    <th class="linea" colspan="2" style="text-align:center;">Ultimo aggiornamento: ${h}:${m}:${sec}</th>
                </tr>
            `;
        table.appendChild(thead);

        // Corpo tabella
        const tbody = document.createElement('tbody');
        item.features.forEach(element => {
            const bus = element.properties;
            var tr = document.createElement('tr');
            tr.innerHTML = `
                <tr>
                    
                    <td colspan="2">${bus.linea} ${bus.route_desc}</td>
                </tr>
            `;
            tbody.appendChild(tr);
            //Ritardo col +
            var rit = "";
            if(bus.delay>=0){
                rit="RIT:"
            }else{
                rit="ANT:"
            }bus.delay=Math.abs(bus.delay);
            if(bus.delay<10){
                bus.delay="0"+bus.delay;
            }
            //Fuori percorso
            var nextStop;
            if(bus.next_stop==""){
                nextStop='<span style="color: red; font-weight:700;">FUORI PERCORSO</span>';
            }
            tr = document.createElement('tr');
            tr.innerHTML = `
                <tr>
                    <td colspan="2">${rit}${bus.delay}</td>
                </tr>
            `;
            tbody.appendChild(tr);
            tr = document.createElement('tr');
            tr.innerHTML = `
                <tr>
                    <td colspan="2"><a href="/seta_modena/servizi/cercaorario/fermata.html?code=${bus.waypoint_code}&name=${bus.next_stop}" class="bianco">${nextStop}</a></td>
                </tr>
            `;
            tbody.appendChild(tr);
            tr = document.createElement('tr');
            tr.innerHTML = `
                <tr>
                    <td>Percorso:</td>
                    <td><a href="/seta_modena/servizi/percorsi/percorso.html?routecode=${bus.route_code}&routenum=${bus.officialService}" class="bianco">${bus.route_code}</a></td>
                </tr>
            `;
            tbody.appendChild(tr);
            tr = document.createElement('tr');
            tr.innerHTML = `
                <tr>
                    <td>Corsa:</td>
                    <td class="uguale"><a href="/seta_modena/servizi/percorsi/prossimefermate.html?journeycode=${bus.journey_code}" class="bianco">${bus.journey_code}</a></td>
                </tr>
            `;
            tbody.appendChild(tr);            
        });
        if(item.features.length==0){
            container.innerHTML="<strong>Il veicolo non è operativo o non comunica dati.</strong>";
        }else{
            table.appendChild(tbody);
            container.appendChild(table);
        }
    })
    .catch(err => {
        console.error('Errore nel caricamento dati:', err);
        //Errore di connessione
        if(httpcode>="300"){
            document.getElementById('tabella-container').textContent = "Impossibile raggiungere l'API. (Codice HTTP:"+httpcode+")";
            return;
        }if(err.message=="NetworkError when attempting to fetch resource."){
            document.getElementById('tabella-container').textContent = "Impossibile raggiungere l'API.";
            return;
        }
        document.getElementById('tabella-container').textContent = "Errore nella sintassi dei dati ricevuti.";
    });})
}

caricadati();

setInterval(caricadati, 10000);