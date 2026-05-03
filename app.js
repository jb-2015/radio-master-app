const radio = document.getElementById("radio");

function playRadio() {
  radio.play();
}

function stopRadio() {
  radio.pause();
}

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js");
}