const API_ENDPOINT = "https://ertpl-api.vercel.app/seta";

async function getApiUrl() {
  const res = await fetch(API_ENDPOINT);
  const cfg = await res.json();
  if (cfg.status !== "ok") return null;
  return cfg.url;
}

const params = new URLSearchParams(window.location.search);
const id = params.get('id');

//Sets stop name
const numero_span = document.getElementById('numero-span');
numero_span.textContent=id;

function caricadati(){
    var item=[];
    getApiUrl().then(url => {
    fetch(url + "/vehicleinfo/" + id)
    .then(response => {
        if (!response.ok) throw new Error("Errore di risposta nel caricamento dei dati, probabilmente il server API è offline.");
        return response.json();
    })
    .then(data => {
        item = data;
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
                        <th class="linea" colspan="2" style="text-align:center;">Informazioni veicolo:</th>
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
                    <td class="uguale">Linea:</td>
                    <td class="uguale">${bus.linea} ${bus.route_desc}</td>
                </tr>
            `;
            tbody.appendChild(tr);
            //Ritardo col +
            if(bus.delay>0){
                bus.delay="+"+bus.delay;
            }
            tr = document.createElement('tr');
            tr.innerHTML = `
                <tr>
                    <td>Ritardo/Anticipo: (+/-)</td>
                    <td>${bus.delay}</td>
                </tr>
            `;
            tbody.appendChild(tr);
            tr = document.createElement('tr');
            tr.innerHTML = `
                <tr>
                    <td>Prossima fermata:</td>
                    <td><a href="/seta_modena/servizi/cercaorario/fermata.html?code=${bus.waypoint_code}&name=${bus.next_stop}" class="bianco">${bus.next_stop}</a></td>
                </tr>
            `;
            tbody.appendChild(tr);
            tr = document.createElement('tr');
            tr.innerHTML = `
                <tr>
                    <td>Codice percorso:</td>
                    <td><a href="/seta_modena/servizi/percorsi/percorso.html?routecode=${bus.route_code}&routenum=${bus.officialService}" class="bianco">${bus.route_code}</a></td>
                </tr>
            `;
            tbody.appendChild(tr);
            tr = document.createElement('tr');
            tr.innerHTML = `
                <tr>
                    <td>Codice corsa:</td>
                    <td><a href="/seta_modena/servizi/percorsi/prossimefermate.html?journeycode=${bus.journey_code}" class="bianco">${bus.journey_code}</a></td>
                </tr>
            `;
            tbody.appendChild(tr);            
        });
        table.appendChild(tbody);
        container.appendChild(table);
    })
    .catch(err => {
        console.error('Errore nel caricamento dati:', err);
        document.getElementById('tabella-container').textContent = "Errore nella sintassi dei dati ricevuti.";
    });})
}

caricadati();

setInterval(caricadati, 60000);