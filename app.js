
const btn = document.getElementById("playBtn");
const radio = document.getElementById("radio");

const STREAM_URL = "https://srv10.streamingradio.ar/8352/stream";

// ========================================
// NAVEGACIÓN ENTRE SECCIONES
// ========================================

const botonesNavegacion = document.querySelectorAll(".nav-btn");
const secciones = document.querySelectorAll(".seccion");

botonesNavegacion.forEach(boton => {

    boton.addEventListener("click", () => {

        const destino = boton.dataset.seccion;

        // Ocultar todas las secciones.
        secciones.forEach(seccion => {
            seccion.classList.remove("activa");
        });

        // Mostrar la sección seleccionada.
        const seccionDestino = document.getElementById(destino);

        if (seccionDestino) {
            seccionDestino.classList.add("activa");
        }

        // Actualizar los botones inferiores.
        botonesNavegacion.forEach(item => {
            item.classList.remove("activo");
            item.removeAttribute("aria-current");
        });

        boton.classList.add("activo");
        boton.setAttribute("aria-current", "page");

        // Volver al inicio del contenido.
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    });

});


// ========================================
// REPRODUCTOR RADIO MASTER
// ========================================

let quiereEscuchar = false;
let reproduciendo = false;
let reconectando = false;

let intentos = 0;
let temporizadorReconexion = null;
let temporizadorVigilancia = null;

const ESPERA_INICIAL = 2000;
const ESPERA_MAXIMA = 30000;
const TIEMPO_SIN_AUDIO = 15000;


// Actualizar botón.
function actualizarBoton() {

    btn.textContent = quiereEscuchar ? "⏸" : "▶";

    btn.setAttribute(
        "aria-label",
        quiereEscuchar ? "Pausar radio" : "Escuchar radio"
    );

}


// Cancelar temporizadores.
function cancelarTemporizadores() {

    clearTimeout(temporizadorReconexion);
    clearTimeout(temporizadorVigilancia);

    temporizadorReconexion = null;
    temporizadorVigilancia = null;

}


// Vigilancia de la transmisión.
function iniciarVigilancia() {

    clearTimeout(temporizadorVigilancia);

    temporizadorVigilancia = setTimeout(() => {

        temporizadorVigilancia = null;

        if (!quiereEscuchar || reproduciendo) return;

        console.log("La transmisión sigue sin audio. Reconectando...");

        reconectar();

    }, TIEMPO_SIN_AUDIO);

}


// Reconectar con el servidor.
async function reconectar() {

    if (!quiereEscuchar || reconectando) return;

    reconectando = true;
    reproduciendo = false;

    clearTimeout(temporizadorVigilancia);

    console.log("Intentando conectar con Radio Master...");

    try {

        radio.pause();

        // Crear una nueva conexión al mismo stream.
        radio.src = STREAM_URL;
        radio.load();

        await radio.play();

        console.log("Solicitud de reproducción enviada.");

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


// Control de reproducción manual.
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


// Esperando datos.
radio.addEventListener("waiting", () => {

    if (!quiereEscuchar) return;

    reproduciendo = false;

    console.log("Esperando señal de audio...");

    iniciarVigilancia();

});


// Transmisión interrumpida.
radio.addEventListener("stalled", () => {

    if (!quiereEscuchar) return;

    reproduciendo = false;

    console.log("Se detectó una interrupción de la transmisión.");

    iniciarVigilancia();

});


// Error de conexión.
radio.addEventListener("error", () => {

    if (!quiereEscuchar) return;

    reproduciendo = false;

    console.log("Error en el reproductor:", radio.error);

    programarReconexion();

});


// Fin de transmisión.
radio.addEventListener("ended", () => {

    if (!quiereEscuchar) return;

    reproduciendo = false;

    programarReconexion();

});


// Recuperación de Internet.
window.addEventListener("online", () => {

    if (!quiereEscuchar) return;

    console.log("Conexión a Internet recuperada.");

    cancelarTemporizadores();

    reconectar();

});


// ========================================
// SERVICE WORKER
// ========================================

if ("serviceWorker" in navigator) {

    navigator.serviceWorker.register("service-worker.js")
        .catch(error => {
            console.log("Error registrando Service Worker:", error);
        });

}


// Estado inicial.
actualizarBoton();
