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
}

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