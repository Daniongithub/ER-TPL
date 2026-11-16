// =========================
// ROBE
// =========================

function tryParseJson(str) {
	try {
		return JSON.parse(str);
	} catch {
		return null;
	}
}

async function fetchJson(url) {
	const res = await fetch(url, { cache: "no-store" });

	if (!res.ok) {
		throw new Error(`HTTP ${res.status}`);
	}

	const text = await res.text();
	const data = tryParseJson(text);

	if (data === null) {
		throw new Error("Response is not valid JSON");
	}

	return data;
}


async function checkEndpoint(url, expectedContentType) {
	const res = await fetch(url, { cache: "no-store" });
	const header = res.headers.get("content-type") || "";

	if (!res.ok || !header.includes(expectedContentType)) {
		throw new Error();
	}
	if (expectedContentType == "application/json") {
		res.json();
	}
}

async function checkBrowser(services) {
	try {
		await checkEndpoint(services.cdn.url, "text/plain");
		await checkEndpoint(services.start.url, "application/json");
		await checkEndpoint(services.startsopp.url, "application/json");
		await checkEndpoint(services.seta.url, "text/plain");
		await checkEndpoint(services.tper.url, "application/json");
		return true;
	} catch {
		return false;
	}
}

// =========================
// CHIAMATE
// =========================
const HA_BASE_URL = 'https://ertpl-ha.cfw.serverissimo.com';

async function getCdnServer() {
	try {
		const info = await fetchJson(HA_BASE_URL + "/cdn");
		return {
			ok: true,
			server: info.server,
			url: info.url + "/health"
		};
	} catch {
		return { ok: false };
	}
}

async function getStartServer() {
	try {
		const info = await fetchJson(HA_BASE_URL + "/start");
		return {
			ok: true,
			server: info.server,
			url: info.url + "/health"
		};
	} catch {
		return { ok: false };
	}
}

async function getStartSoppServer() {
	try {
		const info = await fetchJson(HA_BASE_URL + "/startsopp");
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
		const info = await fetchJson(HA_BASE_URL + "/seta");
		return {
			ok: true,
			server: info.server,
			url: info.url + "/health"
		};
	} catch {
		return { ok: false };
	}
}

async function getTperServer() {
	try {
		const info = await fetchJson(HA_BASE_URL + "/tper");
		return {
			ok: true,
			server: info.server,
			url: info.url
		};
	} catch {
		return { ok: false };
	}
}

async function getMezziServer() {
	try {
		const info = await fetchJson(HA_BASE_URL + "/mezzi");
		return {
			ok: true,
			server: info.server,
			url: info.url + "/health"
		};
	} catch {
		return { ok: false };
	}
}

// =========================
// FUNZIONI UI
// =========================

function renderServer(id, label, result) {
	const el = document.getElementById(id);
	el.innerHTML = result.ok
		? `${label}: ${result.server} (<span class="green">TEST OK</span>)`
		: `${label}: non disponibile. (<span class="red">TEST FALLITO</span>)`;
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
		el.innerHTML = `
			<span style="font-weight:700;">Stato: </span>
			<span class="green">I servizi funzionano correttamente. Nessun problema riscontrato.</span>
			 - <a href="">Rifai il test</a>
		`;
	} else if (serverOk) {
		el.innerHTML = `
			<span style="font-weight:700;">Stato: </span>
			<span class="yellow">I servizi funzionano, ma la tua rete/browser potrebbe bloccare qualcosa.</span>
			 - <a href="#" onclick="hardReload(); return false;">Rifai il test</a>
		`;
	} else {
		el.innerHTML = `
			<span style="font-weight:700;">Stato: </span>
			<span class="red">Alcuni servizi hanno problemi. Riprova o contattaci.</span> +
			 - <a href="#" onclick="hardReload(); return false;">Rifai il test</a>
		`;
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
		cdn,
		start,
		startsopp,
		seta,
		tper,
		mezzi,
	] = await Promise.all([
		getCdnServer(),
		getStartServer(),
		getStartSoppServer(),
		getSetaServer(),
		getTperServer(),
		getMezziServer()
	]);

	// Render risultati singoli
	renderServer("apiCdnServer", "Server in uso (foto)", cdn);
	renderServer("apiStartServer", "Server in uso (START)", start);
	renderServer("apiStartSoppServer", "Server in uso (START Corse Soppresse)", startsopp);
	renderServer("apiSetaServer", "Server in uso (SETA)", seta);
	renderServer("apiTperServer", "Server in uso (TPER)", tper);
	renderServer("apiMezziServer", "Server in uso (Liste Mezzi)", mezzi);

	const serverOk = [
		cdn,
		start,
		startsopp,
		seta,
		tper,
		mezzi
	].every(r => r.ok);

	const clientOk = await checkBrowser({
		cdn,
		start,
		startsopp,
		seta,
		tper,
		mezzi
	});

	renderBrowser(clientOk);
	renderFinal(serverOk, clientOk);
}