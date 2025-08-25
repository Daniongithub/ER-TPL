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
            const result = document.createElement('a');
            result.setAttribute("class","bianco");
            result.innerHTML = `
                <div class="search-result"><h3>${element}</h3>
            `;
            uContainer.appendChild(option);
        });
    })
    .catch(error => console.error('Errore nel caricamento dei dati:', error));