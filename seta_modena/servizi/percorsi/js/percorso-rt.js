const API_ENDPOINT = "https://ertpl-api.vercel.app/seta";

async function getApiUrl() {
  const res = await fetch(API_ENDPOINT);
  const cfg = await res.json();
  if (cfg.status !== "ok") return null;
  return cfg.url;
}

const params = new URLSearchParams(window.location.search);
const id = params.get('journeycode');
const codiceSpan = document.getElementById('codice-span');
const destSpan = document.getElementById('destinazione-span');
const ritSpan = document.getElementById('ritardo-span');

//Displays route code
codiceSpan.innerHTML = id;

function caricadati(){
    var item=[];
    getApiUrl().then(url => {
        const urlBackend = `${url}/nextstops/${id}`;
    fetch(urlBackend)
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
        //Testo destinazione
        //destSpan.innerHTML=item.arrivals[item.arrivals.length-1].desc;
        //Testo ritardo
        if(item.arrivals[0].delay>0){
            ritSpan.setAttribute("style","color:rgba(255, 50, 50, 1);")
            ritSpan.innerHTML="+"+item.arrivals[0].delay;
        }else{
            ritSpan.setAttribute("style","color:green;")
            ritSpan.innerHTML=item.arrivals[0].delay;
        }
        item.arrivals.forEach(element => {
            // Creo tabella
            const table = document.createElement('table');

            // Intestazione
            const thead = document.createElement('thead');
            thead.innerHTML = `
                <tr>
                    <th class="linea" style="text-align:center;" colspan="2"><a href="/seta_modena/servizi/cercaorario/fermata.html?code=${element.wp_code}&name=${element.desc}" class="bianco">${element.desc}</a></th>
                </tr>
            `;
            table.appendChild(thead);
            // Corpo tabella
            const tbody = document.createElement('tbody');
            var tr = document.createElement('tr');
            tr.innerHTML = `
                <tr>
                    <td class="uguale">Orario previsto:</td>
                    <td class="uguale">${element.planarrival}</td>
                </tr>
            `;
            tbody.appendChild(tr);
            var tr = document.createElement('tr');
            tr.innerHTML = `
                <tr>
                    <td class="uguale">Orario in tempo reale:</td>
                    <td class="uguale">${element.realarrival}</td>
                </tr>
            `;
            tbody.appendChild(tr);
            var tr = document.createElement('tr');
            tr.innerHTML = `
                <tr>
                    <td class="uguale">Codice fermata:</td>
                    <td class="uguale">${element.wp_code}</td>
                </tr>
            `;
            tbody.appendChild(tr);
            table.appendChild(tbody);
            container.appendChild(table);
            
        });
    })
    .catch(err => {
        console.error('Errore nel caricamento dati:', err);
        document.getElementById('tabella-container').textContent = "Errore nella sintassi dei dati ricevuti.";
    });})
}

caricadati();

setInterval(caricadati, 60000);