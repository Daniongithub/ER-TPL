//Disables april fools
const params = new URLSearchParams(window.location.search);
const disable = params.get('noaf');

if(disable){
    const allLinks = document.querySelectorAll('a');
    allLinks.forEach(link => {
        //SETA
        if(link.innerHTML!='Monitor autobus in servizio'){
            link.setAttribute('href',link.getAttribute('href')+'?noaf=true');
        }
    })
    const promptAf = document.getElementById('prompt-af');
    promptAf.innerHTML = `<h1 style="font-size: 100%;font-weight: 500;">Abilita Pesce d'Aprile</h1>`;
    promptAf.setAttribute('href','index.html');
}else randomize();

function randomize(){
    const animatedObj = document.querySelectorAll('body *');
    const body = document.querySelector('body');
    const rnd = Math.random();

    if(rnd<0.1){
        animatedObj.forEach(obj =>{
            obj.style.setProperty('animation-name', "aprilfools");
        })
    }else if(rnd<0.2){
        animatedObj.forEach(obj =>{
            obj.style.setProperty('animation-name', "aprilfools2");
        })
    }else if(rnd<0.3){
        animatedObj.forEach(obj =>{
            obj.style.setProperty('animation-name', "aprilfools2");
        })
    }else if(rnd<0.4){
        animatedObj.forEach(obj =>{
            obj.style.setProperty('animation-name', "aprilfools3");
        })
    }else if(rnd<0.5){
        body.style.setProperty('animation-name', "aprilfools4");
    }else if(rnd<0.6){
        body.style.setProperty('animation-name', "aprilfools4");
    }else if(rnd<0.7){
        body.style.setProperty('animation-name', "aprilfools4");
    }else if(rnd<0.8){
        animatedObj.forEach(obj =>{
            obj.style.setProperty('animation-name', "aprilfools5");
            obj.style.setProperty('animation-duration', "4s");
        })
    }else if(rnd<0.9){
        animatedObj.forEach(obj =>{
            obj.style.setProperty('animation-name', "aprilfools5");
            obj.style.setProperty('animation-duration', "4s");
        })
    }else{
        animatedObj.forEach(obj =>{
            obj.style.setProperty('animation-name', "aprilfools5");
            obj.style.setProperty('animation-duration', "4s");
        })
    }
}