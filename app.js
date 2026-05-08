//const radio = document.getElementById("radio");

/*function playRadio() {
  radio.play();
}

function stopRadio() {
  radio.pause();
}*/

const btn = document.getElementById("playBtn");
const radio = document.getElementById("radio");

let reproduciendo = false;

btn.addEventListener("click", () => {

    if(!reproduciendo){

        radio.play();
        btn.innerHTML = "⏸";
        reproduciendo = true;

    }else{

        radio.pause();
        btn.innerHTML = "▶";
        reproduciendo = false;

    }

});

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js");
}