const params = new URLSearchParams(window.location.search);
const evento = params.get('type');
const nomeSpan = document.getElementById('nome-span');
const textContainer = document.getElementById('text-container');

//Display event title
switch(evento){
    case "partita":
        nomeSpan.textContent="partita di calcio";
        renderPartita();
        break;
    case "proma":
        nomeSpan.textContent="chiusura di Piazza Roma";
        renderProma();
        break;
    case "centro":
        nomeSpan.textContent="chiusura del centro (via Emilia Centro)"
        renderCentro();
        break;
}

function renderPartita(){
    textContainer.innerHTML=`
        Chiusura al transito di via Monte Kosica, via Berengario e via Fontanelli. <br> 
        Sono interessate le linee seguenti: <strong>1, 3, 4, 6, 7, 9, 10, 11, 12, 13</strong> <br> <br>

        <strong>Linea 1:</strong> <br>
        <span style="color: red; font-weight:700;">Percorso sospeso:</span> Largo Garibaldi, Canalgrande, Piazza Roma, Vittorio Emanuele, Stazione FS. <br>
        <span style="color: lime; font-weight:700;">Percorso temporaneo:</span> Largo Garibaldi, viale Caduti in Guerra, Stazione FS. <br> <br>

        <strong>Linea 4:</strong> <br>
        <span style="color: red; font-weight:700;">Percorso sospeso:</span> Largo Garibaldi, Canalgrande, Piazza Roma, Vittorio Emanuele, Stazione FS. <br>
        <span style="color: lime; font-weight:700;">Percorso temporaneo:</span> Largo Garibaldi, viale Caduti in Guerra, Stazione FS. <br> <br>

        <strong>Linea 7:</strong> <br>
        <span style="color: red; font-weight:700;">Percorso sospeso:</span> Largo Garibaldi, Canalgrande, Piazza Roma, Vittorio Emanuele, Stazione FS. <br>
        <span style="color: lime; font-weight:700;">Percorso temporaneo:</span> Largo Garibaldi, viale Caduti in Guerra, Stazione FS. <br> <br>

        <strong>Linea 9:</strong> <br>
        <span style="color: red; font-weight:700;">Percorso sospeso:</span> Largo Garibaldi, Canalgrande, Piazza Roma, Vittorio Emanuele, Stazione FS. <br>
        <span style="color: lime; font-weight:700;">Percorso temporaneo:</span> Largo Garibaldi, viale Caduti in Guerra, Stazione FS. <br> <br>

        <strong>Linea 10:</strong> <br>
        <span style="color: red; font-weight:700;">Percorso sospeso:</span> Largo Garibaldi, Canalgrande, Piazza Roma, Vittorio Emanuele, Stazione FS. <br>
        <span style="color: lime; font-weight:700;">Percorso temporaneo:</span> Largo Garibaldi, viale Caduti in Guerra, Stazione FS. <br> <br>

        <strong>Linea 11:</strong> <br>
        <span style="color: red; font-weight:700;">Percorso sospeso:</span> Largo Garibaldi, Canalgrande, Piazza Roma, Vittorio Emanuele, Stazione FS. <br>
        <span style="color: lime; font-weight:700;">Percorso temporaneo:</span> Largo Garibaldi, viale Caduti in Guerra, Stazione FS. <br> <br>

        <strong>Linea 13:</strong> <br>
        <span style="color: red; font-weight:700;">Percorso sospeso:</span> Largo Garibaldi, Canalgrande, Piazza Roma, Vittorio Emanuele, Stazione FS. <br>
        <span style="color: lime; font-weight:700;">Percorso temporaneo:</span> Largo Garibaldi, viale Caduti in Guerra, Stazione FS. <br> <br>
    `;
}

function renderProma(){
    textContainer.innerHTML=`
        Chiusura al transito di Piazza Roma. <br> 
        Sono interessate le linee seguenti: <strong>7A, 11</strong> <br> <br>

        <strong>Linea 7A GRAMSCI:</strong> <br>
        <span style="color: red; font-weight:700;">Percorso sospeso:</span> Largo Garibaldi, Canalgrande, Piazza Roma, Vittorio Emanuele, Stazione FS. <br>
        <span style="color: lime; font-weight:700;">Percorso temporaneo:</span> Largo Garibaldi, viale Caduti in Guerra, Stazione FS. <br>
        Percorso inverso verso <strong>GOTTARDI</strong> <br> <br>
        
        <strong>Linea 11 SANT'ANNA:</strong> <br>
        <span style="color: red; font-weight:700;">Percorso sospeso:</span> "Emilia Centro posta", Canalgrande, Piazza Roma, Vittorio Emanuele, Stazione FS. <br>
        <span style="color: lime; font-weight:700;">Percorso temporaneo:</span> "Emilia Centro posta", viale Caduti in Guerra, Stazione FS. <br>
        Percorso inverso verso <strong>ZODIACO</strong> <br> <br>
    `;
}

function renderCentro(){
    textContainer.innerHTML=`
        Chiusura al transito di via Emilia Centro. <br> 
        Sono interessate le linee seguenti: <strong>7, 7A, 11</strong> <br> <br>

        <strong>Linea 7 GRAMSCI:</strong> <br>
        <span style="color: red; font-weight:700;">Percorso sospeso:</span> Largo Garibaldi, via Emilia Centro, Autostazione. <br>
        <span style="color: lime; font-weight:700;">Percorso temporaneo:</span> Largo Garibaldi, viale Delle Rimembranze, viale Martiri della Libertà, viale Vittorio Veneto, Autostazione. <br>
        Percorso inverso verso <strong>GOTTARDI</strong> <br> <br>
        
        <strong>Linea 7A GRAMSCI:</strong> <br>
        <span style="color: red; font-weight:700;">Percorso sospeso:</span> Largo Garibaldi, Canalgrande, Piazza Roma, Vittorio Emanuele, Stazione FS. <br>
        <span style="color: lime; font-weight:700;">Percorso temporaneo:</span> Largo Garibaldi, viale Caduti in Guerra, Stazione FS. <br>
        Percorso inverso verso <strong>GOTTARDI</strong> <br> <br>

        <strong>Linea 11 SANT'ANNA:</strong> <br>
        <span style="color: red; font-weight:700;">Percorso sospeso:</span> viale Vittorio Veneto, via Emilia Centro, Canalgrande, Piazza Roma, Vittorio Emanuele, Stazione FS. <br>
        <span style="color: lime; font-weight:700;">Percorso temporaneo:</span> viale Vittorio Veneto, Autostazione, via Monte Kosica, Stazione FS. <br>
        Percorso inverso verso <strong>ZODIACO</strong> <br> <br>
    `;
}