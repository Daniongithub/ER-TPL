const API_ENDPOINT = "https://ertpl-api.vercel.app/seta";

async function getApiUrl() {
  const res = await fetch(API_ENDPOINT);
  const cfg = await res.json();
  if (cfg.status !== "ok") return null;
  return cfg.url;
}
/*
const params = new URLSearchParams(window.location.search);
const num = params.get('routenum');
const lineaSpan = document.getElementById('linea-span');
const iframe = document.getElementById('iframe');
const messageDiv = document.getElementById('message');
const loadingDiv = document.getElementById('caricamento-div');

const date = new Date();
const todayDate=date.getDate()+"/"+(date.getMonth()+1)+"/"+date.getFullYear();

const asURL = "https://setaapi.serverissimo.freeddns.org/lineedyn_linea_dett_percorsi/?b=mo&l=MO"+num+"&dd="+todayDate+"&v=As";
const diURL = "https://setaapi.serverissimo.freeddns.org/lineedyn_linea_dett_percorsi/?b=mo&l=MO"+num+"&dd="+todayDate+"&v=Di";

//Display numero linea
lineaSpan.textContent=num;

//Schermata di caricamento, viene annullata da onload dell'iframe
loadingDiv.style.margin="12px";
loadingDiv.innerHTML="Caricamento in corso...";
iframe.style.display="none";

//Spawn iframe
iframe.setAttribute("src",asURL);
if(num==undefined||num==""){
    iframe.setAttribute("src","");
    messageDiv.innerHTML=`
    <p>Non hai specificato nessuna linea nei parametri dell'url</p>
    `;
}*/
const params = new URLSearchParams(window.location.search);
const num = params.get('routenum');

const lineaSpan = document.getElementById('linea-span');
const iframe = document.getElementById('iframe');
const messageDiv = document.getElementById('message');
const loadingDiv = document.getElementById('caricamento-div');

lineaSpan.textContent = num;

// Loading UI
loadingDiv.style.margin = "12px";
loadingDiv.innerHTML = "Caricamento in corso...";
iframe.style.display = "none";

// Date
const date = new Date();
const todayDate =
  date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();

// URLs built AFTER HA
let asURL = "";
let diURL = "";

// Init
(async function init() {
  if (!num) {
    loadingDiv.innerHTML = "";
    messageDiv.innerHTML =
      `<p>Non hai specificato nessuna linea nei parametri dell'url</p>`;
    return;
  }
  let baseUrl;
  try {
    baseUrl = await getApiUrl();
    if (!baseUrl) throw new Error("HA offline");
  } catch (e) {
    loadingDiv.innerHTML = "";
    messageDiv.innerHTML =
      `<p>Servizio temporaneamente non disponibile</p>`;
    console.error(e);
    return;
  }
  baseUrl = baseUrl.replace(/\/$/, "");
  asURL =
    `${baseUrl}/lineedyn_linea_dett_percorsi/?b=mo&l=MO${num}&dd=${todayDate}&v=As`;
  diURL =
    `${baseUrl}/lineedyn_linea_dett_percorsi/?b=mo&l=MO${num}&dd=${todayDate}&v=Di`;
  iframe.setAttribute("src", asURL);
})();

function setAs(){
    loadingDiv.style.margin="12px";
    loadingDiv.innerHTML="Caricamento in corso...";
    iframe.style.display="none";
    iframe.setAttribute("src",asURL);
}

function setDi(){
    loadingDiv.style.margin="12px";
    loadingDiv.innerHTML="Caricamento in corso...";
    iframe.style.display="none";
    iframe.setAttribute("src",diURL);
}

function removeLoading(){
    loadingDiv.style.margin="";
    loadingDiv.innerHTML="";
    iframe.style.display="";
}