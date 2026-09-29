const API_ENDPOINT = "https://ertpl-api.vichingo455.com/seta";

async function getApiUrl() {
    const res = await fetch(API_ENDPOINT);
    const cfg = await res.json();
    if (cfg.status !== "ok") return null;
    return cfg.url;
}

const params = new URLSearchParams(window.location.search);
const container = document.getElementById('res-container');
const id = params.get('routenum');

//Elenco percorsi
getApiUrl().then(url => {
    fetch(url + "/routecodes")
        .then(response => {
            if (!response.ok) throw new Error("Errore nel caricamento dei dati.");
            return response.json();
        })
        .then(data => {
            allresults = data.lines;
            allresults.forEach(element => {
                if (id == element.line) {
                    element.route_codes.forEach(code => {
                        const result = document.createElement('a');
                        const hr = document.createElement('hr');
                        hr.setAttribute("class", "solid");
                        result.setAttribute("class", "bianco");
                        result.setAttribute("href", "percorso.html?routecode=" + code.route_code + "&routenum=" + id);
                        if (code.description == null) {
                            result.innerHTML = `
                            <div class="search-result"><h3 style="margin-left: 8px;margin-right: 8px;">${code.route_code}</h3>
                        `;
                        } else {
                            if (code.description.includes("[")) {
                                result.setAttribute("class", "giallo");
                            }
                            result.innerHTML = `
                            <div class="search-result"><h3 style="margin-left: 8px;margin-right: 8px;">${code.description} <br> (${code.route_code})</h3>
                        `;
                        }
                        if (!code.exists) {
                            result.setAttribute("class", "rosso");
                        }
                        container.appendChild(result);
                    })
                }
            });
        })
        .catch(error => console.error('Errore nel caricamento dei dati:', error));
})