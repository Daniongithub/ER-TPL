const params = new URLSearchParams(window.location.search);
const bottoni = document.getElementById('buttons');
const posto = params.get('location');
const fermata_span = document.getElementById('fermata-span');

fermata_span.textContent=posto;

if(posto=="STAZIONE FS"){
    bottoni.innerHTML = `
        <a href="/seta_modena/servizi/cercaorario/fermata.html?code=MO6132&name=STAZIONE%20FS%20(Corsia%201)" class="bianco">
            <div class="search-result desc"><h3>Corsia 1</h3><p>Linee: 7</p></div>
        </a>
        <a href="/seta_modena/servizi/cercaorario/fermata.html?code=MO6133&name=STAZIONE%20FS%20(Corsia%202)" class="bianco">
            <div class="search-result desc"><h3>Corsia 2</h3><p>Linee: 1, 4, 9, 13</p></div>
        </a>
        <a href="/seta_modena/servizi/cercaorario/fermata.html?code=MO6134&name=STAZIONE%20FS%20(Corsia%203)" class="bianco">
            <div class="search-result desc"><h3>Corsia 3</h3><p>Linee: 1, 3, 4, 9</p></div>
        </a>
        <a href="/seta_modena/servizi/cercaorario/fermata.html?code=MO6119&name=STAZIONE%20FS%20(Corsia%204)" class="bianco">
            <div class="search-result desc"><h3>Corsia 4</h3><p>Linee: 3, 11, 13</p></div>
        </a>
    `;
}
if(posto=="MODENA AUTOSTAZIONE"){
    bottoni.innerHTML = `
        <a href="/seta_modena/servizi/cercaorario/fermata.html?code=MO6121&name=MODENA AUTOSTAZIONE (dir. Centro)" class="bianco">
            <div class="search-result desc"><h3>Direzione Centro</h3><p>Linee: 1, 2, 4, 5, 6, 7, 13</p></div>
        </a>
        <a href="/seta_modena/servizi/cercaorario/fermata.html?code=MO5003&name=MODENA AUTOSTAZIONE (lato Novi Park)" class="bianco">
            <div class="search-result desc"><h3>Lato Novi Park</h3><p>Linee: 1, 2, 4, 5, 7, 13</p></div>
        </a>
        <div></div>
        <a href="/seta_modena/servizi/cercaorario/fermata.html?code=MO6600&name=MODENA AUTOSTAZIONE (davanti biglietteria)" class="bianco">
            <div class="search-result desc"><h3>Davanti Biglietteria</h3><p>Linee: 6</p></div>
        </a>
        <a href="/seta_modena/servizi/cercaorario/fermata.html?code=MO10&name=MODENA AUTOSTAZIONE (fianco biglietteria)" class="bianco">
            <div class="search-result desc"><h3>Fianco Biglietteria</h3><p>Linee: 9, 10</p></div>
        </a>
        <a href="/seta_modena/servizi/cercaorario/fermata.html?code=MO6120&name=MODENA AUTOSTAZIONE (fianco biglietteria lato Novi Park)" class="bianco">
            <div class="search-result desc"><h3>Fianco Biglietteria lato Novi Park</h3><p>Linee: 9, 10</p></div>
        </a>
        <hr>
        <a href="/seta_modena/servizi/cercaorario/fermata.html?code=MO3&name=MODENA AUTOSTAZIONE (Corriere corsia 1)" class="bianco">
            <div class="search-result"><h3>Corriere corsia 1</h3></div>
        </a>
        <a href="/seta_modena/servizi/cercaorario/fermata.html?code=MO303&name=MODENA AUTOSTAZIONE (Corriere corsia 2)" class="bianco">
            <div class="search-result"><h3>Corriere corsia 2</h3></div>
        </a>
        <a href="/seta_modena/servizi/cercaorario/fermata.html?code=MO342&name=MODENA AUTOSTAZIONE (Corriere corsia 3)" class="bianco">
            <div class="search-result"><h3>Corriere corsia 3</h3></div>
        </a>
        <a href="/seta_modena/servizi/cercaorario/fermata.html?code=MO344&name=MODENA AUTOSTAZIONE (Corriere corsia 4)" class="bianco">
            <div class="search-result"><h3>Corriere corsia 4</h3></div>
        </a>
        <a href="/seta_modena/servizi/cercaorario/fermata.html?code=MO350&name=MODENA AUTOSTAZIONE (Corriere corsia 5)" class="bianco">
            <div class="search-result"><h3>Corriere corsia 5</h3></div>
        </a>
        <a href="/seta_modena/servizi/cercaorario/fermata.html?code=MO346&name=MODENA AUTOSTAZIONE (Corriere corsia 6)" class="bianco">
            <div class="search-result"><h3>Corriere corsia 6</h3></div>
        </a>
    `;
}
if(posto=="GARIBALDI"){
    bottoni.innerHTML = `
        <a href="/seta_modena/servizi/cercaorario/fermata.html?code=MO5900&name=GARIBALDI%20(dir.%20Centro)" class="bianco">
            <div class="search-result desc"><h3>Direzione Centro</h3><p>Linee: 4, 7, 8</p></div>
        </a>
        <a href="/seta_modena/servizi/cercaorario/fermata.html?code=MO30&name=GARIBALDI%20(dir.%20Trento%20Trieste)" class="bianco">
            <div class="search-result desc"><h3>Direzione Trento Trieste</h3><p>Linee: 4, 7, 8</p></div>
        </a>
        <a href="/seta_modena/servizi/cercaorario/fermata.html?code=MO9&name=GARIBALDI (lato Caduti in Guerra)" class="bianco">
            <div class="search-result desc"><h3>Lato Caduti in Guerra</h3><p>Linee: 3, 12</p></div>
        </a>
        <a href="/seta_modena/servizi/cercaorario/fermata.html?code=MO5111&name=GARIBALDI%20(Storchi%20dir.%20Trento%20Trieste)" class="bianco">
            <div class="search-result desc"><h3>Storchi direzione Trento Trieste</h3><p>Linee: 2, 3</p></div>
        </a>
        <a href="/seta_modena/servizi/cercaorario/fermata.html?code=MO5112&name=GARIBALDI%20(Storchi%20dir.%20Centro)" class="bianco">
            <div class="search-result desc"><h3>Storchi direzione Centro</h3><p>Linee: 2</p></div>
        </a>
    `;
}
if(posto=="POLO LEONARDO"){
    bottoni.innerHTML = `
        <a href="/seta_modena/servizi/cercaorario/fermata.html?code=MO6783&name=POLO LEONARDO (Strada)" class="bianco">
            <div class="search-result"><h3>POLO LEONARDO (Strada)</h3></div>
        </a>
        <a href="/seta_modena/servizi/cercaorario/fermata.html?code=MO2928&name=POLO LEONARDO 1" class="bianco">
            <div class="search-result"><h3>POLO LEONARDO 1</h3></div>
        </a>
    `;
}