const params = new URLSearchParams(window.location.search);
const num = params.get('routenum');
const lineaSpan = document.getElementById('linea-span');
const descContainer = document.getElementById('desc-container');
const linkContainer = document.getElementById('link-a-seta');

const urlDesc = "https://setaapi.serverissimo.freeddns.org/frequencydescription/"+num;

//Display numero linea
lineaSpan.innerHTML=num;

//Contenuto del testo
fetch(urlDesc)
    .then(response => {
        if (!response.ok) throw new Error("Impossibile raggiungere il server.");
        return response.json();
    })
    .then(data =>{
        descContainer.innerHTML=`
        <table id="desc-table">
            <th>Destinazione</th>
            <th>Tempo di percorrenza</th>
            <th>Frequenza</th>
        </table>`;
        const table = document.getElementById('desc-table');
        if(data[0].linea==undefined){
            descContainer.innerHTML="La linea specificata non possiede nessuna descrizione valida.";
        }
        var i=0;
        data[0].destinazioni.forEach(element => {
            var tr = document.createElement('tr');
            var td = document.createElement('td');
            td.innerHTML=data[0].destinazioni[i];
            tr.appendChild(td);
            var td = document.createElement('td');
            td.innerHTML=data[0].percorrenza[i];
            tr.appendChild(td);
            var td = document.createElement('td');
            td.innerHTML=data[0].frequenze[i];
            tr.appendChild(td);
            table.appendChild(tr);
            i++;
        });
        linkContainer.innerHTML=`<a href="${data[0].linkseta}" class="biancosott">Visualizza sul sito seta</a>`;
    })
    .catch(error => {descContainer.innerHTML="La linea specificata non possiede nessuna descrizione valida.";console.error(error);})