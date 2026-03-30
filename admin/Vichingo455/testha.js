// Variabili per controllo client-side
var NextCloudUri = '',StartBusUri = '', StartSoppUri = '', StartFermateUri = '', SetaUri = '';
// Funzione principale
async function initTestHA() {
  document.getElementById("risultatoFinale").innerHTML = `<span style="font-weight: 700;">Stato: </span><span class="blue">Test in corso, attendere prego...</span>`
  const serverResults = await Promise.all([
    getApiVersionHA(),
    getNextcloudServer(),
    getStartBusServer(),
    getStartSoppServer(),
    getStartFermateServer(),
    getSetaServer()
  ]);

  const serverOk = serverResults.every(r => r === true); // Controlla se i server sono online
  const clientOk = await checkBrowser(); // Controlla se il client può raggiungere i server

  if (serverOk && clientOk) {
    document.getElementById("risultatoFinale").innerHTML = `<span style="font-weight: 700;">Stato: </span><span class="green">I servizi funzionano correttamente. Nessun problema riscontrato.</span> - <a href="#" onclick="hardReload(); return false;">Rifai il test</a>`;
  } else if (serverOk) {
    document.getElementById("risultatoFinale").innerHTML = `<span style="font-weight: 700;">Stato: </span><span class="yellow">I servizi funzionano correttamente, ma la tua rete o il browser potrebbe bloccare alcuni dei nostri servizi. Per altre informazioni, contatta il tuo amministratore di rete.</span> - <a href="#" onclick="hardReload(); return false;">Rifai il test</a>`
  }
  else {
    document.getElementById("risultatoFinale").innerHTML = `<span style="font-weight: 700;">Stato: </span><span class="red">Alcuni dei nostri servizi stanno riscontrando problemi. Riprova o contattaci.</span> - <a href="#" onclick="hardReload(); return false;">Rifai il test</a>`;
  }
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
    NextCloudUri = info.url + "/status.php";
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
    StartBusUri = info.url;
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
    StartSoppUri = info.url;
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
    StartFermateUri = info.url + "/versione";
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
    SetaUri = info.url + "/allnews";
    return true;
  } catch {
    document.getElementById("apiSetaServer").innerHTML =
      `Server in uso (SETA): sconosciuto. (<span class="red">TEST FALLITO</span>)`;

    return false;
  }
}
// Controllo client-side (dal browser)
async function checkBrowser() {
  try {
    var res,header;
    if (NextCloudUri != '') {
      res = await fetch(NextCloudUri, { cache: "no-store" });
      header = res.headers.get('content-type');
      NextCloudUri = '';
      if (!res.ok || !header.includes('application/json')) {
        throw new Error();
      }
    }
    else {
      throw new Error();
    }
    if (StartBusUri != '') {
      res = await fetch(StartBusUri, { cache: "no-store" });
      header = res.headers.get('content-type');
      StartBusUri = '';
      if (!res.ok || !header.includes('application/json')) {
        throw new Error();
      }
    }
    else {
      throw new Error();
    }
    if (StartSoppUri != '') {
      res = await fetch(StartSoppUri, { cache: "no-store" });
      header = res.headers.get('content-type');
      StartSoppUri = '';
      if (!res.ok || !header.includes('application/json')) {
        throw new Error();
      }
    }
    else {
      throw new Error();
    }
    if (StartFermateUri != '') {
      res = await fetch(StartFermateUri, { cache: "no-store" });
      header = res.headers.get('content-type');
      StartFermateUri = '';
      if (!res.ok || !header.includes('text/html')) {
        throw new Error();
      }
    }
    else {
      throw new Error();
    }
    if (SetaUri != '') {
      res = await fetch(SetaUri, { cache: "no-store" });
      header = res.headers.get('content-type');
      SetaUri = '';
      if (!res.ok || !header.includes('application/json')) {
        throw new Error();
      }
    }
    else {
      throw new Error();
    }
    document.getElementById("browserCheck").innerHTML =
      `Raggiungibilità servizi: tutti i servizi sembrano raggiungibili. (<span class="green">TEST OK</span>)`;
    return true;
  } catch {
    document.getElementById("browserCheck").innerHTML =
      `Raggiungibilità servizi: alcuni servizi non sono raggiungibili. (<span class="red">TEST FALLITO</span>)`;
    return false;
  }
}
// Hard reload (bypassa la cache)
function hardReload() {
  const url = new URL(window.location.href);
  url.searchParams.set('t', Date.now()); // Usa ?t= per ingannare il browser e fargli pensare che sia sempre una pagina diversa e quindi bypassare la cache
  window.location.href = url.toString();
}