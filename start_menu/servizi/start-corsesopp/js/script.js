const API_ENDPOINT = "https://ertpl-api.vercel.app/startsopp";

async function getApiUrl() {
  const res = await fetch(API_ENDPOINT);
  const cfg = await res.json();
  if (cfg.status !== "ok") return null;
  return cfg.url;
}

// IMPORTANT!! DO NOT MODIFY BELOW //
let ultimaRichiesta = null;
let intervalloAggiornamento = null;
const delay = ms => new Promise(res => setTimeout(res, ms));

async function caricaDati(event = null, richiestaManuale = false) {
  if (event) event.preventDefault();

  let ApiUri = await getApiUrl();
  if (!ApiUri) {
    console.error("No API URI available");
    return;
  }

  ApiUri = ApiUri.replace(/\/$/, ""); // 🔧 normalize

  const Bacino = document.getElementById("stazione").value;
  const corpo = document.getElementById("corpoTabella");
  const tabella = document.getElementById("tabellaDati");

  ultimaRichiesta = { Bacino };

  const oggi = new Date();
  const Data = oggi.toISOString().slice(0, 10);

  const url = `${ApiUri}/?Bacino=${Bacino}&Data=${Data}`;

  try {
    if (richiestaManuale) {
      tabella.style.display = "table";
      corpo.innerHTML = `<tr><td colspan="6" class="loading-message">Caricamento in corso...</td></tr>`;
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Upstream error ${response.status}`);
    }

    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
      corpo.innerHTML = `<tr><td colspan="6" class="loading-message">Nessun dato disponibile.</td></tr>`;
      return;
    }

    corpo.innerHTML = data
      .map(row => `<tr>${row.map(col => `<td>${col}</td>`).join("")}</tr>`)
      .join("");

  } catch (error) {
    console.error("Errore durante la richiesta:", error);
    if (richiestaManuale) {
      corpo.innerHTML = `<tr><td colspan="6" class="loading-message">
        Errore durante il caricamento dei dati.<br>
        Controlla la console per i dettagli.
      </td></tr>`;
      await delay(7000);
      tabella.style.display = "none";
    }
  }
}

function avviaAggiornamentoAutomatico() {
  if (intervalloAggiornamento) clearInterval(intervalloAggiornamento);
  intervalloAggiornamento = setInterval(() => {
    if (ultimaRichiesta) caricaDati(null, false);
  }, 30000);
}

document.getElementById("formStazione").addEventListener("submit", e => {
  caricaDati(e, true);
  avviaAggiornamentoAutomatico();
});
