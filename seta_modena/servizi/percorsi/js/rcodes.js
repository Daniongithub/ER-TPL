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
const nav = document.getElementById('rcodes-nav')

//Spawn iframeorari
if(id!=undefined&&id!=""){
    const ul = document.createElement('ul');
    ul.setAttribute("style","flex:1;justify-content: right;");
    ul.innerHTML=`<li><a href="/seta_modena/servizi/percorsi/iframeorari.html?routenum=${id}"><h1 style="font-size: 100%;font-weight: 500;">Orari e mappa di oggi</h1></a></li>`;
    nav.appendChild(ul);
}

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
            if(id==element.line){
                element.route_codes.forEach(code =>{
                    const result = document.createElement('a');
                    const hr = document.createElement('hr');
                    hr.setAttribute("class","solid");
                    result.setAttribute("class","bianco");
                    result.setAttribute("href","percorso.html?routecode="+code.route_code+"&routenum="+id);
                    if(code.description==null){
                        result.innerHTML = `
                            <div class="search-result"><h3 style="margin-left: 8px;margin-right: 8px;">${code.route_code}</h3>
                        `;
                    }else{
                        if(code.description.includes("[")){
                            result.setAttribute("class","giallo");
                        }
                        if(code.description.includes("(")){
                            result.setAttribute("class","rosso");
                        }
                        result.innerHTML = `
                            <div class="search-result"><h3 style="margin-left: 8px;margin-right: 8px;">${code.description} <br> (${code.route_code})</h3>
                        `;
                    }
                    container.appendChild(result);
                })
            }
        });
    })
    .catch(error => console.error('Errore nel caricamento dei dati:', error));})