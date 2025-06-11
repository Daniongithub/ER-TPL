function genera() {
const matrda = document.getElementById("matrda").value.trim();
const matra = document.getElementById("matra").value.trim();
const selezione = document.getElementById("selezione").value.trim();
const modello = document.getElementById("modello").value.trim();
const link = document.getElementById("link").value.trim();
const startMatricola = parseInt(matrda);
const endMatricola = parseInt(matra);
let jsonArray = [];
for (let i = startMatricola; i <= endMatricola; i++) {
	link2 = link + "#" + i.toString();
    let baseJson = {
        "matricola": i.toString(),
        "settore": selezione,
        "modello": modello,
        "link": link2
    };

    jsonArray.push(baseJson);
}
document.getElementById("output").textContent = 
    jsonArray.map((item, index) => {
        const jsonStr = JSON.stringify(item, null, 2);
        return (index < jsonArray.length - 1) ? jsonStr + "," : jsonStr;
    }).join("\n");
}
function copiaOutput() {
    const code = document.getElementById("output").innerText;
    navigator.clipboard.writeText(code).then(() => {
    }).catch(() => {
        alert("Errore durante la copia.");
    });
}
function pulisci() {
    document.getElementById("matrda").value = "";
    document.getElementById("matra").value = "";
    document.getElementById("link").value = "";
    document.getElementById("output").innerHTML = "";
}