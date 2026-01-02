//High Availability
const API_ENDPOINT = "https://ertpl-api.vercel.app/seta";

async function getApiUrl() {
    const res = await fetch(API_ENDPOINT);
    const cfg = await res.json();
    if (cfg.status !== "ok") return null;
    return cfg.url;
}

const params = new URLSearchParams(window.location.search);
const num = params.get('routenum');
const lineaSpan = document.getElementById('linea-span');
const iframe = document.getElementById('iframe');
const messageDiv = document.getElementById('message');
const loadingDiv = document.getElementById('caricamento-div');
const asTh = document.getElementById('as-th')
const diTh = document.getElementById('di-th');

const date = new Date();
const todayDate=date.getDate()+"/"+(date.getMonth()+1)+"/"+date.getFullYear();

var asURL;
var diURL;

var state;

async function allJS(){
    const baseURL = await getApiUrl();
    if(baseURL==false){
        loadingDiv.innerHTML="";
        messageDiv.innerHTML="Servizio non disponibile: AWS irraggiungibile.";
        return; 
    }

    asURL = baseURL+"/lineedyn_linea_dett_percorsi/?b=mo&l=MO"+num+"&dd="+todayDate+"&v=As";
    diURL = baseURL+"/lineedyn_linea_dett_percorsi/?b=mo&l=MO"+num+"&dd="+todayDate+"&v=Di";

    //Display numero linea
    lineaSpan.textContent=num;

    //Set caricamento + Spawn iframe
    state="Di";
    setAs();
    if(num==undefined||num==""){
        iframe.setAttribute("src","");
        messageDiv.innerHTML=`
            <p>Non hai specificato nessuna linea nei parametri dell'url</p>
        `;
    }
}

allJS();

function setAs(){
    if(state=="Di"){
        diTh.style.backgroundColor="";
        asTh.style.backgroundColor="rgb(204, 132, 0)";
        loadingDiv.style.margin="12px";
        loadingDiv.innerHTML="Caricamento in corso...";
        iframe.style.display="none";
        iframe.setAttribute("src",asURL);
        state="As";
    }
}

function setDi(){
    if(state=="As"){
        asTh.style.backgroundColor="";
        diTh.style.backgroundColor="rgb(204, 132, 0)";
        loadingDiv.style.margin="12px";
        loadingDiv.innerHTML="Caricamento in corso...";
        iframe.style.display="none";
        iframe.setAttribute("src",diURL);
        state="Di";
    }
}

function removeLoading(){
    loadingDiv.style.margin="";
    loadingDiv.innerHTML="";
    iframe.style.display="";
}