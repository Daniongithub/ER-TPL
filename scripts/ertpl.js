/*
The function(s) below are used to fall back to the second (not for importance) server if the first is not available
Swaps both links and images sources
aid = identifier for the anchor (a tag)
imgid = identifier for the image (img tag)
path = path for the image starting from the root, for example /Dani/10225.jpg
*/
function changeUrlToFallback(aid,imgid,path) {
    try {
        document.getElementById(imgid).src = "https://drive.vichingo455.freeddns.org/apps/files_sharing/publicpreview/w8Nr4jZN3g6z3pn?file=" + path + "&x=1920&y=1080&a=true";
    } catch {}
    try {
        document.getElementById(aid).href = "https://drive.vichingo455.freeddns.org/apps/files_sharing/publicpreview/w8Nr4jZN3g6z3pn?file=" + path + "&x=1920&y=1080&a=true";
    } catch {}
}

function changeUrlToFallbackNoTrue(aid,imgid,path) {
    try {
        document.getElementById(imgid).src = "https://drive.vichingo455.freeddns.org/apps/files_sharing/publicpreview/w8Nr4jZN3g6z3pn?file=" + path + "&x=1920&y=1080";
    } catch {}
    try {
        document.getElementById(aid).href = "https://drive.vichingo455.freeddns.org/apps/files_sharing/publicpreview/w8Nr4jZN3g6z3pn?file=" + path + "&x=1920&y=1080";
    } catch {}
}

// The functions below are used to display from how much time the project has been living

const startDate = new Date("2024-12-22T15:49:00");

function updateTimer() {
    const now = new Date();
    const diff = now - startDate;

    if (diff < 0) {
        document.getElementById("timer").innerHTML = "La data è nel futuro!";
        return;
    }

    const seconds = Math.floor(diff / 1000) % 60;
    const minutes = Math.floor(diff / 1000 / 60) % 60;
    const hours = Math.floor(diff / (1000 * 60 * 60)) % 24;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    document.getElementById("timer").innerHTML =
        days + " giorni " +
        hours + " ore " +
        minutes + " minuti " +
        seconds + " secondi";
}

function chisiamoInizializza() {
    updateTimer();
    setInterval(updateTimer, 1000);
}

// This function below is just a simple obfuscator for the email address, in order to prevent bots invading the inbox.

function mostraemail() {
    document.getElementById("email").innerHTML = "";
    const p1 = "info";
    const p2 = ".";
    const p3 = "ertpl";
    const p4 = "@";
    const p5 = "protonmail";
    const p6 = ".";
    const p7 = "com";
    const link = document.getElementById("email").appendChild(document.createElement("a"));
    link.innerHTML = p1+p2+p3+p4+p5+p6+p7;
    link.setAttribute("href", "mailto:" + p1+p2+p3+p4+p5+p6+p7);
}