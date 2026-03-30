// =========================
// ROBE
// =========================
async function fetchJson(url) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(res.status);
  return res.json();
}

async function checkEndpoint(url, expectedContentType) {
  const res = await fetch(url, { cache: "no-store" });
  const header = res.headers.get("content-type") || "";

  if (!res.ok || !header.includes(expectedContentType)) {
    throw new Error();
  }
}

async function checkBrowser(services) {
  try {
    await checkEndpoint(services.nextcloud.url, "application/json");
    await checkEndpoint(services.startbus.url, "application/json");
    await checkEndpoint(services.startsopp.url, "application/json");
    await checkEndpoint(services.startfermate.url, "text/html");
    await checkEndpoint(services.seta.url, "application/json");

    return true;
  } catch {
    return false;
  }
}

// =========================
// CHIAMATE
// =========================
async function getApiVersionHA() {
  try {
    const info = await fetchJson("https://ertpl-api.vercel.app/");
    return { ok: true, version: info.version };
  } catch {
    return { ok: false };
  }
}

async function getNextcloudServer() {
  try {
    const info = await fetchJson("https://ertpl-api.vercel.app/nextcloud");
    return {
      ok: true,
      server: info.server,
      url: info.url + "/status.php"
    };
  } catch {
    return { ok: false };
  }
}

async function getStartBusServer() {
  try {
    const info = await fetchJson("https://ertpl-api.vercel.app/startbus");
    return {
      ok: true,
      server: info.server,
      url: info.url
    };
  } catch {
    return { ok: false };
  }
}

async function getStartSoppServer() {
  try {
    const info = await fetchJson("https://ertpl-api.vercel.app/startsopp");
    return {
      ok: true,
      server: info.server,
      url: info.url
    };
  } catch {
    return { ok: false };
  }
}

async function getStartFermateServer() {
  try {
    const info = await fetchJson("https://ertpl-api.vercel.app/startfermate");
    return {
      ok: true,
      server: info.server,
      url: info.url + "/versione"
    };
  } catch {
    return { ok: false };
  }
}

async function getSetaServer() {
  try {
    const info = await fetchJson("https://ertpl-api.vercel.app/seta");
    return {
      ok: true,
      server: info.server,
      url: info.url + "/allnews"
    };
  } catch {
    return { ok: false };
  }
}

// =========================
// FUNZIONI UI
// =========================
function renderApiVersion(result) {
  const el = document.getElementById("apiVersion");
  el.innerHTML = result.ok
    ? `Versione API Alta Disponibilità: v${result.version} (<span class="green">TEST OK</span>)`
    : `Versione API Alta Disponibilità non raggiungibile. (<span class="red">TEST FALLITO</span>)`;
}

function renderServer(id, label, result) {
  const el = document.getElementById(id);
  el.innerHTML = result.ok
    ? `${label}: ${result.server} (<span class="green">TEST OK</span>)`
    : `${label}: sconosciuto. (<span class="red">TEST FALLITO</span>)`;
}

function renderBrowser(result) {
  const el = document.getElementById("browserCheck");
  el.innerHTML = result
    ? `Raggiungibilità servizi: tutti i servizi sembrano raggiungibili. (<span class="green">TEST OK</span>)`
    : `Raggiungibilità servizi: alcuni servizi non sono raggiungibili. (<span class="red">TEST FALLITO</span>)`;
}

function renderFinal(serverOk, clientOk) {
  const el = document.getElementById("risultatoFinale");

  if (serverOk && clientOk) {
    el.innerHTML =
      `<span style="font-weight:700;">Stato: </span>` +
      `<span class="green">I servizi funzionano correttamente. Nessun problema riscontrato.</span>` +
      ` - <a href="#" onclick="hardReload(); return false;">Rifai il test</a>`;
  } else if (serverOk) {
    el.innerHTML =
      `<span style="font-weight:700;">Stato: </span>` +
      `<span class="yellow">I servizi funzionano, ma la tua rete/browser potrebbe bloccare qualcosa.</span>` +
      ` - <a href="#" onclick="hardReload(); return false;">Rifai il test</a>`;
  } else {
    el.innerHTML =
      `<span style="font-weight:700;">Stato: </span>` +
      `<span class="red">Alcuni servizi hanno problemi. Riprova o contattaci.</span>` +
      ` - <a href="#" onclick="hardReload(); return false;">Rifai il test</a>`;
  }
}

function hardReload() {
  const url = new URL(window.location.href);
  url.searchParams.set("t", Date.now());
  window.location.href = url.toString();
}

// =========================
// MAIN
// =========================
async function initTestHA() {
  document.getElementById("risultatoFinale").innerHTML =
    `<span style="font-weight:700;">Stato: </span>` +
    `<span class="blue">Test in corso, attendere prego...</span>`;

  const [
    api,
    nextcloud,
    startbus,
    startsopp,
    startfermate,
    seta
  ] = await Promise.all([
    getApiVersionHA(),
    getNextcloudServer(),
    getStartBusServer(),
    getStartSoppServer(),
    getStartFermateServer(),
    getSetaServer()
  ]);

  // Render risultati singoli
  renderApiVersion(api);
  renderServer("apiNextcloudServer", "Server in uso (foto)", nextcloud);
  renderServer("apiStartBusServer", "Server in uso (START Autobus in tempo reale)", startbus);
  renderServer("apiStartSoppServer", "Server in uso (START Corse Soppresse)", startsopp);
  renderServer("apiStartFermateServer", "Server in uso (START Fermate)", startfermate);
  renderServer("apiSetaServer", "Server in uso (SETA)", seta);

  const serverOk = [
    api,
    nextcloud,
    startbus,
    startsopp,
    startfermate,
    seta
  ].every(r => r.ok);

  const clientOk = await checkBrowser({
    nextcloud,
    startbus,
    startsopp,
    startfermate,
    seta
  });

  renderBrowser(clientOk);
  renderFinal(serverOk, clientOk);
}