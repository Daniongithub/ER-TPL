const uContainer = document.getElementById('urbano-container');

const url = "https://setaapi.serverissimo.freeddns.org/routenumberslist";

//Elenco linee urbano
fetch(url)
    .then(response => {
        if (!response.ok) throw new Error("Errore nel caricamento dei dati.");
        return response.json();
    })
    .then(data => {
        allresults = data;
        allresults.forEach(element => {
            if(element<100){
                const result = document.createElement('a');
                result.setAttribute("class","bianco");
                if(element.includes("(")){
                    result.setAttribute("class","rosso");
                }
                result.setAttribute("href","infolinea.html?routenum="+element);
                result.innerHTML = `
                    <div class="search-result"><h3>${element}</h3>
                `;
                uContainer.appendChild(result);
            }
        });
    })
    .catch(error => console.error('Errore nel caricamento dei dati:', error));