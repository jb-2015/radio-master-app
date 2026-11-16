
const btn = document.getElementById("playBtn");
const radio = document.getElementById("radio");

let reproduciendo = false;
let reconexionAutomatica = false;
let reintentos = 0;
let temporizador = null;

const MAX_REINTENTOS = 20;

function actualizarBoton() {
    btn.innerHTML = reproduciendo ? "⏸" : "▶";
}

async function reproducir() {
    try {
        await radio.play();

        reproduciendo = true;
        reintentos = 0;
        actualizarBoton();

    } catch (error) {
        console.log("No se pudo reproducir:", error);

        reproduciendo = false;
        actualizarBoton();

        if (reconexionAutomatica) {
            programarReconexion();
        }
    }
}

function programarReconexion() {
    if (!reconexionAutomatica || temporizador) return;

    if (reintentos >= MAX_REINTENTOS) {
        console.log("Se alcanzó el máximo de reintentos.");
        return;
    }

    const espera = Math.min(3000 * (2 ** reintentos), 30000);

    reintentos++;

    console.log(`Reconectando en ${espera / 1000} segundos...`);

    temporizador = setTimeout(() => {
        temporizador = null;

        radio.pause();
        radio.load();

        reproducir();

    }, espera);
}

btn.addEventListener("click", () => {

    if (!reproduciendo && !reconexionAutomatica) {
        reconexionAutomatica = true;
        reintentos = 0;
        reproducir();

    } else {
        reconexionAutomatica = false;
        reproduciendo = false;

        clearTimeout(temporizador);
        temporizador = null;

        radio.pause();
        actualizarBoton();
    }

});

radio.addEventListener("playing", () => {
    reproduciendo = true;
    reintentos = 0;
    actualizarBoton();
});

radio.addEventListener("error", () => {
    reproduciendo = false;
    actualizarBoton();

    if (reconexionAutomatica) {
        programarReconexion();
    }
});

radio.addEventListener("stalled", () => {
    if (reconexionAutomatica && !radio.paused) {
        programarReconexion();
    }
});

radio.addEventListener("pause", () => {
    if (!reconexionAutomatica) {
        reproduciendo = false;
        actualizarBoton();
    }
});

if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("service-worker.js");
}
