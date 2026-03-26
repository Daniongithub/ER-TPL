const dateInput = document.getElementById('date');

const y = new Date().getFullYear();
const m = new Date().getMonth()+1;
const d = new Date().getDate();

dateInput.setAttribute('value',y+"-"+m+"-"+d);