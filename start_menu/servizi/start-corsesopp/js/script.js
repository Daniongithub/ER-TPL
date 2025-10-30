// VARIABILI DA MODIFICARE - VARIABLES TO MODIFY //
const ApiUri = 'https://startapi.serverissimo.freeddns.org/start-corsesopp.json'; //JSON Dinamico - Dynamic JSON

// IMPORTANTE!! NON MODIFICARE SOTTO!! - IMPORTANT!! DO NOT MODIFY THE CODE BELOW!! //
let ultimaRichiesta = null;
let intervalloAggiornamento = null;
const delay = ms => new Promise(res => setTimeout(res, ms));
async function caricaDati(event = null, richiestaManuale = false) {
    if (event) event.preventDefault();
    const Bacino = document.getElementById("stazione").value;
    const corpo = document.getElementById("corpoTabella");
    const tabella = document.getElementById("tabellaDati");
    // Salva la richiesta corrente per i refresh automatici
    ultimaRichiesta = { Bacino };
    // Ottieni la data e l'ora di oggi
    const oggi = new Date();
    const anno = oggi.getFullYear();
    const mese = String(oggi.getMonth() + 1).padStart(2, '0'); // i mesi partono da 0
    const giorno = String(oggi.getDate()).padStart(2, '0');
    const Data = `${anno}-${mese}-${giorno}`;
    // Scrivi l'URL
    const url = `${ApiUri}/?Bacino=${Bacino}&Data=${Data}`;
    try {
        if (richiestaManuale) {
            tabella.style.display = "table";
            corpo.innerHTML = `<tr><td colspan="6" class="loading-message">Caricamento in corso...</td></tr>`;
        }
        const response = await fetch(url);
        const data = await response.json();
        if (data.length === 0) {
            corpo.innerHTML = `<tr><td colspan="6" class="loading-message">Nessun dato disponibile.</td></tr>`;
            return;
        }
        corpo.innerHTML = data.map(row =>
            `<tr>${row.map(col => `<td>${col}</td>`).join('')}</tr>`
        ).join('');
    } catch (error) {
        console.error("Errore durante la richiesta:", error);
        if (richiestaManuale) {
            corpo.innerHTML = `<tr><td colspan="6" class="loading-message">Errore durante il caricamento dei dati. Per favore riprova.<br>PER GLI SVILUPPATORI: Controllare nella console del browser per i dettagli dell'errore.</td></tr>`;
            await delay(7000);
            tabella.style.display = "none";
        }
    }
}
function avviaAggiornamentoAutomatico() {
    if (intervalloAggiornamento) clearInterval(intervalloAggiornamento);
    intervalloAggiornamento = setInterval(() => {
        if (ultimaRichiesta) {
            caricaDati(null, false);
        }
    }, 30000); // ogni 30 secondi
}
document.getElementById("formStazione").addEventListener("submit", (e) => {
    caricaDati(e, true);
    avviaAggiornamentoAutomatico();
});