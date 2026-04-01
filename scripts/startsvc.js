const btnFermate = document.getElementById("fermate");
const btnLive = document.getElementById("live");
const btnSopp = document.getElementById("sopp");
const outErr = document.getElementById("errori");

async function checkStato() {
  const [fermate, bus, sopp] = await Promise.all([
    getStartFermateServer(),
    getStartBusServer(),
    getStartSoppServer()
  ]);
  
  const fermateOk = fermate.ok;
  const busOk = bus.ok;
  const soppOk = sopp.ok;
  let conto = 0;
  let serviziDown = [];
  if(!fermateOk) {
    btnFermate.classList.replace("green", "wip");
    btnFermate.removeAttribute("href");
    btnFermate.setAttribute("href", "https://infobus.startromagna.it/");
    conto++;
    serviziDown.push("Visualizzatore fermate");
  }
  if(!busOk) {
    btnLive.classList.replace("green", "wip");
    btnLive.removeAttribute("href");
    btnLive.setAttribute("href", "https://infobus.startromagna.it/CapienzaAutobusTempoReale/");
    conto++;
    serviziDown.push("Bus in tempo reale");
  }
  if(!soppOk) {
    btnSopp.classList.replace("green", "wip");
    btnSopp.removeAttribute("href");
    btnSopp.setAttribute("href", "https://www.startromagna.it/corse-non-garantite/");
    conto++;
    serviziDown.push("Corse non garantite");
  }
  if(!fermateOk || !busOk || !soppOk) {
    outErr.appendChild(document.createElement("h3")).setAttribute("id", "testo");
    const testo = document.getElementById("testo");
      testo.setAttribute("style", "color: Orange");
      let messaggio = "";

      if (serviziDown.length === 1) {
          messaggio = `Il servizio ${serviziDown[0]} non è attualmente disponibile, il bottone rimanda al servizio originale di Start.`;
      } else {
          const lista = serviziDown.slice(0, -1).join(", ") + " e " + serviziDown.slice(-1);
          messaggio = `I servizi ${lista} non sono attualmente disponibili, i bottoni rimandano ai servizi originali di Start.`;
      }

      testo.innerHTML = messaggio;
  }
}