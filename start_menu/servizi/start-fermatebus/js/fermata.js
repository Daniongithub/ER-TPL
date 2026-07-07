// API source code: https://github.com/Daniongithub/startfermate-api

// New fallback system (HA)
const API_ENDPOINT = "https://ertpl-api.vercel.app/startfermate";

async function getApiUrl() {
  const res = await fetch(API_ENDPOINT);
  const cfg = await res.json();
  if (cfg.status !== "ok") return null;
  return cfg.url;
}

const params = new URLSearchParams(window.location.search);
const cod = params.get('cod');
const tID = params.get('tID');
const prov = params.get('prov');
/*
Anche se det e' null non c'e' problema: la API aspetta sia "true", altrimenti la visualizzazione non cambia.
det impostato a "true" dice all'API di fornire l'output in maniera intera, senza applicare un filtro che scarta schifezze,
ergo, visualizzazione dettagliata, che comunque all'utente finale non serve.
*/
const det = params.get('det');
function caricadati(){
    getApiUrl().then(url => {
        fetch(`${url}/fermata?param=${tID}&param2=${prov}&palina=${cod}&det=${det}`)
    .then(res => res.json())
    .then(data => {
        const fermata_span = document.getElementById('fermata-span');
        if (data && data.fermata.length !== 0) {
            fermata_span.innerHTML = `"${data.fermata}"`;
            document.title = `Fermata ${data.fermata}`
        }
        const container = document.getElementById('tabella-container');
        container.innerHTML = '';

        fetch(`${url}/versione`)
        .then(res => res.text())
        .then(versione => document.getElementById("ver").innerHTML = versione);
        
        /*
        Se capita una fermata pulita dall'API, perche' contiene solo spazzatura, bus[] fa creare al JS la thead
        anche se non ci sono risultati effettivi.
        */
        if (!data || data.bus.length === 0) {
            container.innerHTML = '<h3>Nessuna linea in arrivo.</h3>';
            return;
        }

        // Creo tabella
        const table = document.createElement('table');

        // Intestazione
        const thead = document.createElement('thead');
        thead.innerHTML = `
                    <tr>
                        <th>Linea</th>
                        <th>Destinazione</th>
                        <th>Orario previsto</th>
                        <th>Stato attuale</th>
                        <th>Veicolo</th>
                    </tr>
                `;
        table.appendChild(thead);

        // Corpo tabella
        const tbody = document.createElement('tbody');
        data.bus.forEach(corsa => {
            const tr = document.createElement('tr');
            if (corsa.soppressa) {
                tr.classList.add('bus-card-red');
            }
            tr.innerHTML = `
                        <td>${corsa.linea}</td>
                        <td>${corsa.destinazione}</td>
                        <td>${corsa.orario}</td>
                        <td>${corsa.stato}</td>
                        <td>${corsa.mezzo}</td>
            `;
            
            const statoTd = tr.children[3];

            if (/^\+(?:[4-9]|\d{2,})\s*minuti$/i.test(corsa.stato) || /^\-(?:[4-9]|\d{2,})\s*minuti$/i.test(corsa.stato)) {
                statoTd.classList.add("ritardo");
            } /*else if (/^[-]\d+\s+minuti$/i.test(corsa.stato)) {
                statoTd.classList.add("anticipo");
            }*/
            
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);

        container.appendChild(table);
    })
    .catch(err => {
        console.error('Errore nel caricamento dati:', err);
        document.getElementById('tabella-container').textContent = 'Errore nel caricamento dati.';
    });
    });
}

caricadati();


setInterval(caricadati, 30000);
