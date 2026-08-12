const API_ENDPOINT = "https://ertpl-api.vichingo455.com/seta";

async function getApiUrl() {
  const res = await fetch(API_ENDPOINT);
  const cfg = await res.json();
  if (cfg.status !== "ok") return null;
  return cfg.url;
}

const params = new URLSearchParams(window.location.search);
const id = params.get('routecode');
const num = params.get('routenum');
const codiceSpan = document.getElementById('codice-span');
const destSpan = document.getElementById('destinazione-span');
const pNav = document.getElementById('percorso-nav');
const existP = document.getElementById('esiste-p');
const mapContainer = document.getElementById('map-container');

//Short id per mappa
const shortId = id.split('-')[2];

//Displays route code
codiceSpan.textContent = id;
//Nav per tornare indietro
pNav.innerHTML = `            
        <ul>
            <li><a href="/index.html"><h1 style="font-size: 100%;font-weight: 500;">Home</h1></a></li>
            <li><a href="/seta_modena/servizi/percorsi/index.html"><h1 style="font-size: 100%;font-weight: 500;">Selettore linea</h1></a></li>
            <li><a href="/seta_modena/servizi/percorsi/rcodes.html?routenum=${num}"><h1 style="font-size: 100%;font-weight: 500;">Selettore percorso</h1></a></li>
        </ul>
    `;

function caricadati(){
    var item=[];
    getApiUrl().then(url => {
        const urlBackend = `${url}/routestops/${id}`;
        const baseURL = url;
    fetch(urlBackend)
    .then(response => {
        if (!response.ok) throw new Error("Errore di risposta nel caricamento dei dati, probabilmente il server API è offline.");
        return response.json();
    })
    .then(data => {
        item = data;
    })
    .then(data => {
        //Display testo esiste o no + mappa se esiste
        if(item.still_exists==true){
            existP.setAttribute("class","green-bold");
            existP.innerHTML="Questo percorso esiste ancora"

            //Mappa
            const mapIFR = document.createElement('iframe');
            mapIFR.src=baseURL+"/routemap/"+shortId;
            mapIFR.height="600px";
            mapContainer.appendChild(mapIFR);

            mapContainer.innerHTML+="<br>";

            //Bottone fullscreen
            const fullscreenA = document.createElement('a');

            fullscreenA.href=baseURL+"/routemap/"+shortId;
            fullscreenA.textContent="Espandi a tutto schermo";
            fullscreenA.className="biancosott"

            mapContainer.appendChild(fullscreenA);
        }else{
            existP.setAttribute("class","red-bold");
            existP.innerHTML="Questo percorso non esiste più"
            //No mappa
        }

        const container = document.getElementById('tabella-container');
        container.innerHTML = '';
        // Creo tabella
        const table = document.createElement('table');

        // Intestazione
        const thead = document.createElement('thead');
        thead.innerHTML = `
                    <tr>
                        <th class="linea" style="text-align:center;">Nome:</th>
                        <th class="linea" style="text-align:center;">Codice:</th>
                    </tr>
                `;
        table.appendChild(thead);

        // Corpo tabella
        const tbody = document.createElement('tbody');
        item.stops.forEach(item => {
            const element = item;
            var tr = document.createElement('tr');
            tr.innerHTML = `
                <tr>
                    <td class="uguale"><a href="/seta_modena/servizi/cercaorario/fermata.html?code=${item.code}&name=${item.name}" class="bianco">${item.name}</a></td>
                    <td class="uguale"><a href="/seta_modena/servizi/cercaorario/fermata.html?code=${item.code}&name=${item.name}" class="bianco">${item.code}</a></td>
                </tr>
            `;
            tbody.appendChild(tr);
            if(element.is_last){
                destSpan.innerHTML=element.name.toUpperCase();
            }
        });
        table.appendChild(tbody);
        container.appendChild(table);
    })
    .catch(err => {
        if(item.error=="Percorso non trovato"){
            document.getElementById('tabella-container').textContent = "Percorso non trovato.";
        }else{
            console.error('Errore nel caricamento dati:', err);
            document.getElementById('tabella-container').textContent = "Errore nella sintassi dei dati ricevuti.";
        }
    });})
}

caricadati();