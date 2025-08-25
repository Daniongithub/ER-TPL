const params = new URLSearchParams(window.location.search);
const id = params.get('routecode');
const codiceSpan = document.getElementById('codice-span');
const destSpan = document.getElementById('destinazione-span');

//Displays route code
codiceSpan.innerHTML = id;

const urlBackend = `https://setaapi.serverissimo.freeddns.org/routestops/${id}`;
//const urlBackend = `http://localhost:5001/arrivals/${codice}`;
function caricadati(){
    var item=[];
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
        item.features.forEach(item => {
            const element = item.properties;
            var tr = document.createElement('tr');
            tr.innerHTML = `
                <tr>
                    <td class="uguale"><a href="/seta_menu/cercaorario/fermata.html?code=${element.code}&name=${element.desc}" class="bianco">${element.desc}</a></td>
                    <td class="uguale"><a href="/seta_menu/cercaorario/fermata.html?code=${element.code}&name=${element.desc}" class="bianco">${element.code}</a></td>
                </tr>
            `;
            tbody.appendChild(tr);
            if(element.islast==true){
                destSpan.innerHTML=element.desc;
            }
        });
        table.appendChild(tbody);
        container.appendChild(table);
    })
    .catch(err => {
        console.error('Errore nel caricamento dati:', err);
        document.getElementById('tabella-container').textContent = "Errore nella sintassi dei dati ricevuti.";
    });
}

caricadati();