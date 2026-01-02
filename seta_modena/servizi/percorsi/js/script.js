const API_ENDPOINT = "https://ertpl-api.vercel.app/seta";

async function getApiUrl() {
  const res = await fetch(API_ENDPOINT);
  const cfg = await res.json();
  if (cfg.status !== "ok") return null;
  return cfg.url;
}

const uContainer = document.getElementById('urbano-container');
const sContainer = document.getElementById('speciali-container');
const seContainer = document.getElementById('subextra-container');
const othContainer = document.getElementById('altri-container');
const schContainer = document.getElementById('scuola-container');

//const url = "https://setaapi.serverissimo.freeddns.org/routenumberslist";

//Elenco linee urbano
getApiUrl().then(url => {
fetch(url + "/routenumberslist")
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
                result.setAttribute("href","rcodes.html?routenum="+element);
                result.innerHTML = `
                    <div class="search-result"><h3>${element}</h3>
                `;
                uContainer.appendChild(result);
            }else if(element>390&&element<400){
                const result = document.createElement('a');
                result.setAttribute("class","bianco");
                if(element.includes("(")){
                    result.setAttribute("class","rosso");
                }
                result.setAttribute("href","rcodes.html?routenum="+element);
                result.innerHTML = `
                    <div class="search-result"><h3>${element}</h3>
                `;
                schContainer.appendChild(result);
            }else if(element=="5taxi"||element=="10tax"){
                const result = document.createElement('a');
                result.setAttribute("class","bianco");
                if(element.includes("(")){
                    result.setAttribute("class","rosso");
                }
                result.setAttribute("href","rcodes.html?routenum="+element);
                result.innerHTML = `
                    <div class="search-result"><h3>${element}</h3>
                `;
                sContainer.appendChild(result);
            }else if(/^[^A-Z].*[A-Z]/i.test(element)||element.includes("(")){
                const result = document.createElement('a');
                result.setAttribute("class","bianco");
                if(element.includes("(")){
                    result.setAttribute("class","rosso");
                }
                result.setAttribute("href","rcodes.html?routenum="+element);
                result.innerHTML = `
                    <div class="search-result"><h3>${element}</h3>
                `;
                uContainer.appendChild(result);
            }else if(!/^[A-Z]/i.test(element)){
                const result = document.createElement('a');
                result.setAttribute("class","bianco");
                if(element.includes("(")){
                    result.setAttribute("class","rosso");
                }
                result.setAttribute("href","rcodes.html?routenum="+element);
                result.innerHTML = `
                    <div class="search-result"><h3>${element}</h3>
                `;
                seContainer.appendChild(result);
            }else{
                const result = document.createElement('a');
                result.setAttribute("class","bianco");
                if(element.includes("(")){
                    result.setAttribute("class","rosso");
                }
                result.setAttribute("href","rcodes.html?routenum="+element);
                result.innerHTML = `
                    <div class="search-result"><h3>${element}</h3>
                `;
                othContainer.appendChild(result);
            }
        });
    })
    .catch(error => console.error('Errore nel caricamento dei dati:', error));})