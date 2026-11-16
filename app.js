
const btn = document.getElementById("playBtn");
const radio = document.getElementById("radio");

const STREAM_URL = "https://srv10.streamingradio.ar/8352/stream";

let quiereEscuchar = false;
let reproduciendo = false;
let reconectando = false;

let intentos = 0;
let temporizadorReconexion = null;
let temporizadorVigilancia = null;

const ESPERA_INICIAL = 2000;
const ESPERA_MAXIMA = 30000;
const TIEMPO_SIN_AUDIO = 15000;

// Actualiza el botón según la intención del usuario.
// Durante una reconexión sigue mostrando Pausa.
function actualizarBoton() {
    btn.textContent = quiereEscuchar ? "⏸" : "▶";

    btn.setAttribute(
        "aria-label",
        quiereEscuchar ? "Pausar radio" : "Escuchar radio"
    );
}

// Cancela los temporizadores pendientes.
function cancelarTemporizadores() {
    clearTimeout(temporizadorReconexion);
    clearTimeout(temporizadorVigilancia);

    temporizadorReconexion = null;
    temporizadorVigilancia = null;
}

// Programa una vigilancia para detectar si el audio no vuelve.
function iniciarVigilancia() {
    clearTimeout(temporizadorVigilancia);

    temporizadorVigilancia = setTimeout(() => {
        temporizadorVigilancia = null;

        if (!quiereEscuchar || reproduciendo) return;

        console.log("La transmisión sigue sin audio. Reconectando...");

        reconectar();
    }, TIEMPO_SIN_AUDIO);
}

// Fuerza una nueva conexión al mismo servidor.
async function reconectar() {
    if (!quiereEscuchar || reconectando) return;

    reconectando = true;
    reproduciendo = false;

    clearTimeout(temporizadorVigilancia);

    console.log("Intentando conectar con Radio Master...");

    try {
        radio.pause();

        // Fuerza al navegador a crear una nueva conexión.
        radio.src = STREAM_URL;
        radio.load();

        await radio.play();

        console.log("Solicitud de reproducción enviada.");

        // No consideramos que funciona hasta recibir el evento playing.
        iniciarVigilancia();

    } catch (error) {
        console.log("Error al reconectar:", error);

        programarReconexion();

    } finally {
        reconectando = false;
    }
}

// Reintentos progresivos sin límite.
function programarReconexion() {
    if (!quiereEscuchar || temporizadorReconexion) return;

    const espera = Math.min(
        ESPERA_INICIAL * Math.pow(2, intentos),
        ESPERA_MAXIMA
    );

    intentos++;

    console.log(
        `Nuevo intento en ${espera / 1000} segundos. Intento ${intentos}`
    );

    temporizadorReconexion = setTimeout(() => {
        temporizadorReconexion = null;
        reconectar();
    }, espera);
}

// El usuario controla si quiere escuchar o no.
btn.addEventListener("click", () => {

    if (!quiereEscuchar) {
        quiereEscuchar = true;
        intentos = 0;

        actualizarBoton();
        reconectar();

    } else {
        quiereEscuchar = false;
        reproduciendo = false;

        cancelarTemporizadores();

        radio.pause();

        actualizarBoton();

        console.log("Reproducción pausada por el usuario.");
    }
});

// El navegador confirma que está llegando audio.
radio.addEventListener("playing", () => {
    if (!quiereEscuchar) return;

    reproduciendo = true;
    intentos = 0;

    clearTimeout(temporizadorVigilancia);
    temporizadorVigilancia = null;

    actualizarBoton();

    console.log("Radio Master está reproduciendo.");
});

// El audio se interrumpió y el navegador espera datos.
radio.addEventListener("waiting", () => {
    if (!quiereEscuchar) return;

    reproduciendo = false;

    console.log("Esperando señal de audio...");

    iniciarVigilancia();
});

// El navegador detecta que la descarga se detuvo.
radio.addEventListener("stalled", () => {
    if (!quiereEscuchar) return;

    reproduciendo = false;

    console.log("Se detectó una interrupción de la transmisión.");

    iniciarVigilancia();
});

// Error en la conexión o en el recurso de audio.
radio.addEventListener("error", () => {
    if (!quiereEscuchar) return;

    reproduciendo = false;

    console.log("Error en el reproductor:", radio.error);

    programarReconexion();
});

// Si el navegador informa que terminó el recurso,
// intentamos recuperar la transmisión.
radio.addEventListener("ended", () => {
    if (!quiereEscuchar) return;

    reproduciendo = false;

    programarReconexion();
});

// Si vuelve la conexión a Internet.
window.addEventListener("online", () => {
    if (!quiereEscuchar) return;

    console.log("Conexión a Internet recuperada.");

    cancelarTemporizadores();
    reconectar();
});

// Registro del Service Worker.
if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("service-worker.js")
        .catch(error => {
            console.log("Error registrando Service Worker:", error);
        });
}

actualizarBoton();
