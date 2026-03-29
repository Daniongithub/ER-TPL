// Funzione principale
async function initTestHA() {
  document.getElementById("risultatoFinale").innerHTML = `<span style="font-weight: 700;">Stato: </span><span class="blue">Test in corso, attendere prego...</span>`
  const results = await Promise.all([
    getApiVersionHA(),
    getNextcloudServer(),
    getStartBusServer(),
    getStartSoppServer(),
    getStartFermateServer(),
    getSetaServer()
  ]);

  const allOk = results.every(r => r === true);

  document.getElementById("risultatoFinale").innerHTML = allOk
    ? `<span style="font-weight: 700;">Stato: </span><span class="green">I servizi funzionano correttamente. Nessun problema riscontrato.</span> - <a href="#" onclick="hardReload(); return false;">Rifai il test</a>`
    : `<span style="font-weight: 700;">Stato: </span><span class="red">Alcuni dei nostri servizi stanno riscontrando problemi. Riprova o contattaci.</span> - <a href="#" onclick="hardReload(); return false;">Rifai il test</a>`;
}

// API Version
async function getApiVersionHA() {
  try {
    const res = await fetch("https://ertpl-api.vercel.app/", {
  cache: "no-store"
});
if (!res.ok) {
    throw new Error(res.status);
  }
    const info = await res.json();

    document.getElementById("apiVersion").innerHTML =
      `Versione API Alta Disponibilità: v${info.version} (<span class="green">TEST OK</span>)`;

    return true;
  } catch {
    document.getElementById("apiVersion").innerHTML =
      `Versione API Alta Disponibilità: API Alta Disponibilità non raggiungibile al momento. (<span class="red">TEST FALLITO</span>)`;

    return false;
  }
}

// Nextcloud
async function getNextcloudServer() {
  try {
    const res = await fetch("https://ertpl-api.vercel.app/nextcloud", {
  cache: "no-store"
});
if (!res.ok) {
    throw new Error(res.status);
  }
    const info = await res.json();

    document.getElementById("apiNextcloudServer").innerHTML =
      //`Server in uso (NextCloud): ${info.server} (${info.url})`;
      `Server in uso (foto): ${info.server} (<span class="green">TEST OK</span>)`;

    return true;
  } catch {
    document.getElementById("apiNextcloudServer").innerHTML =
      `Server in uso (foto): sconosciuto. (<span class="red">TEST FALLITO</span>)`;

    return false;
  }
}

// START Bus
async function getStartBusServer() {
  try {
    const res = await fetch("https://ertpl-api.vercel.app/startbus", {
  cache: "no-store"
});
if (!res.ok) {
    throw new Error(res.status);
  }
    const info = await res.json();

    document.getElementById("apiStartBusServer").innerHTML =
      //`Server in uso (START Autobus in tempo reale): ${info.server} (${info.url})`;
      `Server in uso (START Autobus in tempo reale): ${info.server} (<span class="green">TEST OK</span>)`;

    return true;
  } catch {
    document.getElementById("apiStartBusServer").innerHTML =
      `Server in uso (START Autobus in tempo reale): sconosciuto. (<span class="red">TEST FALLITO</span>)`;

    return false;
  }
}

// START Soppresse
async function getStartSoppServer() {
  try {
    const res = await fetch("https://ertpl-api.vercel.app/startsopp", {
  cache: "no-store"
});
if (!res.ok) {
    throw new Error(res.status);
  }
    const info = await res.json();

    document.getElementById("apiStartSoppServer").innerHTML =
      //`Server in uso (START Corse Soppresse): ${info.server} (${info.url})`;
      `Server in uso (START Corse Soppresse): ${info.server} (<span class="green">TEST OK</span>)`;

    return true;
  } catch {
    document.getElementById("apiStartSoppServer").innerHTML =
      `Server in uso (START Corse Soppresse): sconosciuto. (<span class="red">TEST FALLITO</span>)`;

    return false;
  }
}

// START Fermate
async function getStartFermateServer() {
  try {
    const res = await fetch("https://ertpl-api.vercel.app/startfermate", {
  cache: "no-store"
});
if (!res.ok) {
    throw new Error(res.status);
  }
    const info = await res.json();

    document.getElementById("apiStartFermateServer").innerHTML =
      //`Server in uso (START Fermate): ${info.server} (${info.url})`;
      `Server in uso (START Fermate): ${info.server} (<span class="green">TEST OK</span>)`;

    return true;
  } catch {
    document.getElementById("apiStartFermateServer").innerHTML =
      `Server in uso (START Fermate): sconosciuto. (<span class="red">TEST FALLITO</span>)`;

    return false;
  }
}

// SETA
async function getSetaServer() {
  try {
    const res = await fetch("https://ertpl-api.vercel.app/seta", {
  cache: "no-store"
});
if (!res.ok) {
    throw new Error(res.status);
  }
    const info = await res.json();

    document.getElementById("apiSetaServer").innerHTML =
      //`Server in uso (SETA): ${info.server} (${info.url})`;
      `Server in uso (SETA): ${info.server} (<span class="green">TEST OK</span>)`;

    return true;
  } catch {
    document.getElementById("apiSetaServer").innerHTML =
      `Server in uso (SETA): sconosciuto. (<span class="red">TEST FALLITO</span>)`;

    return false;
  }
}
// Hard reload (bypassa la cache)
function hardReload() {
  const url = new URL(window.location.href);
  url.searchParams.set('t', Date.now()); // Usa ?t= per ingannare il browser e fargli pensare che sia sempre una pagina diversa e quindi bypassare la cache
  window.location.href = url.toString();
}