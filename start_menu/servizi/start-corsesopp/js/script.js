const API_ENDPOINT = "https://ertpl-api.vercel.app/startsopp";

async function getApiUrl() {
    const res = await fetch(API_ENDPOINT);
    const cfg = await res.json();
    if (cfg.status !== "ok") return null;
    return cfg.url;
}

const container = document.getElementById('tabella-container');
const message = document.getElementById('message-container');
let updateInt = null;

//IMPORTANT!! DO NOT MODIFY BELOW
//E io lo faccio lo stesso :D -SMF

async function loadVersion() {
    try {
        const testUri = await getApiUrl() + "/versione";
        const response = await fetch(testUri);
        const data = await response.json();
        document.getElementById("version").innerHTML = data.version;
    }
    catch {
        document.getElementById("version").innerHTML = "Errore";
    }
}

async function caricaDati() {
    const bacino = document.getElementById("stazione").value;
    const tbody = document.querySelector("tbody");

    //Loading screen
    message.innerHTML = `<tr>Caricamento in corso...</tr>`;

    //Date composing
    const date = new Date().toISOString().slice(0, 10);

    //URL creation
    const url = await getApiUrl() + `/?Bacino=${bacino}&Data=${date}`;
    console.log(url);

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Errore nella richiesta. Stato HTTP: ${response.status}`);
        }
        const data = await response.json();

        if (data.length == 0) {
            message.innerHTML = `<tr>Nessun dato disponibile.</tr>`;
            return;
        }

        //Fill table
        tbody.innerHTML = '';
        data.forEach(element => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${element[0]}</td>
                <td>${element[1]}</td>
                <td>${element[2]}</td>
                <td>${element[3]}</td>
                <td>${element[4]}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error("Errore durante il caricamento dati:", error);
        tbody.innerHTML = `
            <tr>
                Errore durante il caricamento dei dati.<br>
            </tr>`;
    }
    container.style.display = 'block';
    message.innerHTML = '<p>I dati si riferiscono alla giornata di oggi.</p>';
}

function startUpdate() {
    if (updateInt) clearInterval(updateInt);
    updateInt = setInterval(caricaDati, 30000);
}

function buttonPress(){
    startUpdate();
    caricaDati();
}

loadVersion();