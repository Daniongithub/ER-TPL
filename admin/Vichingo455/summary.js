
const STATUS_URL = "https://ertpl-ha.cfw.serverissimo.com/status";

const statusContainer = document.getElementById('status-container');

async function getStatus() {
    const response = await fetch(STATUS_URL, { cache: "no-store" });
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }
    return response.json();
}

async function initTestHA() {
    try {
        const data = await getStatus();
        render(data);
    } catch (err) {
        renderError(err);
    }
}

/* ---------- colore in base allo stato ---------- */
/* prefisso "ha-" per non entrare in conflitto con le classi globali
   span.red / span.yellow / span.green / span.blue già definite in style.css */

function colorClass(value) {
    if (typeof value === "string") {
        const v = value.toLowerCase();
        if (["ok", "up", "healthy", "online", "available"].includes(v)) return "ha-green";
        if (["degraded", "warning", "partial", "slow"].includes(v)) return "ha-yellow";
        if (["down", "error", "offline", "unavailable", "ko"].includes(v)) return "ha-red";
        return "ha-blue";
    }
    if (typeof value === "boolean") return value ? "ha-green" : "ha-red";
    return "ha-blue";
}

function statusBadge(value, label) {
    const cls = colorClass(value);
    const text = label !== undefined ? label : String(value);
    return `<span class="ha-badge ${cls}">${escapeHtml(text)}</span>`;
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

/* ---------- rendering dettagli generico (ricorsivo, qualsiasi campo) ---------- */

function renderDetails(value) {
    if (value === null || value === undefined) {
        return `<span class="ha-muted">—</span>`;
    }
    if (typeof value === "boolean") {
        return statusBadge(value, value ? "sì" : "no");
    }
    if (typeof value === "string" || typeof value === "number") {
        return escapeHtml(value);
    }
    if (Array.isArray(value)) {
        if (value.length === 0) return `<span class="ha-muted">—</span>`;
        return `<div class="ha-sublist">${value.map(v => `<div class="ha-subitem">${renderDetails(v)}</div>`).join("")}</div>`;
    }
    if (typeof value === "object") {
        const entries = Object.entries(value);
        if (entries.length === 0) return `<span class="ha-muted">—</span>`;
        return `<div class="ha-subobj">${entries.map(([k, v]) => `
            <div class="ha-field">
                <span class="ha-label">${escapeHtml(k)}</span>
                <span class="ha-value">${renderDetails(v)}</span>
            </div>`).join("")}</div>`;
    }
    return escapeHtml(String(value));
}

function field(label, valueHtml) {
    return `
        <div class="ha-field">
            <span class="ha-label">${escapeHtml(label)}</span>
            <span class="ha-value">${valueHtml}</span>
        </div>`;
}

/* ---------- stato sintetico di un nodo (riusato anche nel sommario) ---------- */

function nodeStatusClass(node) {
    return node.available === true
        ? "ha-green"
        : (node.reachable === true ? "ha-yellow" : "ha-red");
}

function nodesMiniSummary(nodes) {
    if (!nodes.length) return `<span class="ha-muted">nessun nodo</span>`;
    const counts = { "ha-green": 0, "ha-yellow": 0, "ha-red": 0 };
    nodes.forEach(n => counts[nodeStatusClass(n)]++);
    const parts = Object.entries(counts)
        .filter(([, n]) => n > 0)
        .map(([cls, n]) => `<span class="ha-mini-item"><span class="ha-dot ha-dot-sm ${cls}"></span>${n}</span>`);
    return `<span class="ha-mini-summary">${parts.join("")}</span>`;
}

/* ---------- rendering di un singolo nodo ---------- */

function renderNode(node) {
    const overallClass = nodeStatusClass(node);

    const serverLink = node.server
        ? `<a class="link ha-break" href="${escapeHtml(node.server)}" target="_blank" rel="noopener">${escapeHtml(node.server)}</a>`
        : `<span class="ha-muted">—</span>`;

    const healthLink = node.healthUrl
        ? `<a class="link ha-break" href="${escapeHtml(node.healthUrl)}" target="_blank" rel="noopener">${escapeHtml(node.healthUrl)}</a>`
        : `<span class="ha-muted">—</span>`;

    return `
        <div class="ha-node">
            <div class="ha-node-head">
                <span class="ha-dot ${overallClass}"></span>
                <strong>${escapeHtml(node.name ?? "?")}</strong>
                ${node.priority !== undefined ? `<span class="ha-priority">priorità ${escapeHtml(node.priority)}</span>` : ""}
            </div>
            <div class="ha-node-body">
                ${field("Server", serverLink)}
                ${field("Health URL", healthLink)}
                ${field("Raggiungibile", statusBadge(!!node.reachable, node.reachable ? "sì" : "no"))}
                ${field("Disponibile", statusBadge(!!node.available, node.available ? "sì" : "no"))}
                ${field("HTTP status", node.httpStatus !== null && node.httpStatus !== undefined ? escapeHtml(node.httpStatus) : `<span class="ha-muted">—</span>`)}
                ${field("Errore", node.error ? `<span class="ha-badge ha-red">${escapeHtml(node.error)}</span>` : `<span class="ha-muted">—</span>`)}
                ${field("Dettagli", renderDetails(node.details))}
            </div>
        </div>`;
}

/* ---------- rendering di un gruppo api (start, mezzi, cdn, seta, ...) ---------- */

function renderApiGroup(key, group) {
    const nodes = Array.isArray(group.nodes) ? [...group.nodes].sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0)) : [];

    return `
        <details class="ha-group">
            <summary class="ha-group-head">
                <span class="ha-chevron">›</span>
                <h2 class="ha-group-title">${escapeHtml(key)}</h2>
                ${nodesMiniSummary(nodes)}
                ${statusBadge(group.status)}
            </summary>
            <div class="ha-group-body">
                ${group.server ? `<div class="ha-group-server"><a class="link ha-break" href="${escapeHtml(group.server)}" target="_blank" rel="noopener">${escapeHtml(group.server)}</a></div>` : ""}
                <div class="ha-nodes">
                    ${nodes.map(renderNode).join("") || `<span class="ha-muted">Nessun nodo</span>`}
                </div>
            </div>
        </details>`;
}

/* ---------- rendering principale ---------- */

function render(data) {
    const checkedAt = data.checkedAt ? data.checkedAt.replace("T", " ").replace("Z", "") : "—";
    const apiEntries = data.apis && typeof data.apis === "object" ? Object.entries(data.apis) : [];

    statusContainer.innerHTML = `
        <div class="ha-page">
            <div class="ha-summary">
                <div class="ha-summary-row">
                    <span class="ha-dot ${colorClass(data.status)}"></span>
                    <span>Stato generale: ${statusBadge(data.status)}</span>
                </div>
                <div class="ha-summary-time">Ultimo controllo: ${escapeHtml(checkedAt)} UTC</div>
            </div>
            <div class="ha-groups">
                ${apiEntries.map(([key, group]) => renderApiGroup(key, group)).join("")}
            </div>
        </div>
    `;
}

function renderError(err) {
    statusContainer.innerHTML = `
        <div class="ha-page">
            <div class="ha-summary">
                <div class="ha-summary-row">
                    <span class="ha-dot ha-red"></span>
                    <span>Impossibile recuperare lo stato: ${escapeHtml(err.message || err)}</span>
                </div>
            </div>
        </div>`;
}