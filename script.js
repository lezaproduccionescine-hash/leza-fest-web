
const API_BASE =
    "https://leza-fest-api.lezafest.workers.dev";

const API_URL =
    API_BASE + "/config";

let configuracionAnterior = null;


// ========================================
// ELEMENTOS
// ========================================

function obtenerElementos() {

    return {
        festivalClosed:
            document.getElementById("festival-closed"),

        festivalSite:
            document.getElementById("festival-site"),

        closedNextEvent:
            document.getElementById("closed-next-event"),

        broadcastStatus:
            document.getElementById("broadcast-status"),

        broadcastDate:
            document.getElementById("broadcast-date"),

        broadcastTime:
            document.getElementById("broadcast-time")
    };

}


// ========================================
// MOSTRAR FESTIVAL CERRADO
// ========================================

function mostrarFestivalCerrado(config) {

    const elementos =
        obtenerElementos();

    if (!elementos.festivalClosed ||
        !elementos.festivalSite) {

        return;
    }

    elementos.festivalClosed.style.display =
        "flex";

    elementos.festivalSite.style.display =
        "none";


    if (elementos.closedNextEvent) {

        if (config.nextEventDate) {

            elementos.closedNextEvent.textContent =
                formatearFecha(config.nextEventDate);

        } else {

            elementos.closedNextEvent.textContent =
                "Próximamente";

        }

    }

}


// ========================================
// MOSTRAR FESTIVAL ACTIVO
// ========================================

function mostrarFestival(config) {

    const elementos =
        obtenerElementos();

    if (!elementos.festivalClosed ||
        !elementos.festivalSite) {

        return;
    }

    elementos.festivalClosed.style.display =
        "none";

    elementos.festivalSite.style.display =
        "block";


    const titulo =
        document.getElementById("festival-title");

    const estado =
        document.getElementById("festival-status");

    const informacion =
        document.getElementById("festival-event-info");


    if (titulo) {

        titulo.innerHTML =
            "LEZA<br><span>FEST " +
            config.year +
            "</span>";

    }


    if (estado) {

        estado.textContent =
            "El festival se encuentra actualmente en emisión.";

    }


    if (informacion) {

        informacion.textContent =
            "Edición " +
            config.year +
            " · Emisión: " +
            formatearFecha(config.emissionDate);

    }

    // ACTUALIZAR INFORMACIÓN DE LEZA TV

    actualizarTransmision(config);

}


// ========================================
// TRANSMISIÓN LEZA TV
// ========================================

function actualizarTransmision(config) {

    const elementos =
        obtenerElementos();

    if (elementos.broadcastDate) {

        elementos.broadcastDate.textContent =
            config.broadcastDate
                ? formatearFecha(config.broadcastDate)
                : "Próximamente";

    }

    if (elementos.broadcastTime) {

        elementos.broadcastTime.textContent =
            config.broadcastTime
                ? config.broadcastTime + " hs"
                : "A confirmar";

    }

    if (elementos.broadcastStatus) {

        if (config.broadcastDate && config.broadcastTime) {

            elementos.broadcastStatus.textContent =
                "La transmisión de Leza Fest por Leza TV está programada.";

        } else {

            elementos.broadcastStatus.textContent =
                "La fecha y el horario de transmisión serán anunciados próximamente.";

        }

    }

}


// ========================================
// FORMATEAR FECHA
// ========================================

function formatearFecha(fecha) {

    if (!fecha) {
        return "";
    }

    const partes =
        fecha.split("-");

    if (partes.length !== 3) {
        return fecha;
    }

    const fechaLocal =
        new Date(
            Number(partes[0]),
            Number(partes[1]) - 1,
            Number(partes[2])
        );

    return fechaLocal.toLocaleDateString(
        "es-AR",
        {
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    );

}


// ========================================
// CONSULTAR ESTADO
// ========================================

async function cargarEstadoFestival() {

    try {

        const respuesta =
            await fetch(
                API_URL +
                "?t=" +
                Date.now(),
                {
                    cache: "no-store"
                }
            );

        if (!respuesta.ok) {

            throw new Error(
                "HTTP " + respuesta.status
            );

        }

        const config =
            await respuesta.json();


        console.log(
            "Estado actual de Leza Fest:",
            config
        );


        const nuevoEstado =
            JSON.stringify(config);


        if (
            configuracionAnterior === nuevoEstado
        ) {

            return;

        }


        configuracionAnterior =
            nuevoEstado;


        if (config.active === true) {

            mostrarFestival(config);

        } else {

            mostrarFestivalCerrado(config);

        }

    } catch (error) {

        console.error(
            "Error al consultar Leza Fest:",
            error
        );

    }

}


// ========================================
// FORMULARIO DE INSCRIPCIÓN
// ========================================

function configurarFormulario() {

    const formulario =
        document.getElementById("registration-form");

    const mensaje =
        document.getElementById("registration-message");

    const boton =
        document.getElementById("registration-submit");

    const productora =
        document.getElementById("productora");

    const nombreProductora =
        document.getElementById("nombre_productora");

    const grupoProductora =
        document.getElementById("producer-name-group");


    if (!formulario) {
        return;
    }


    // MOSTRAR U OCULTAR NOMBRE DE PRODUCTORA

    function actualizarCampoProductora() {

        if (!productora ||
            !nombreProductora ||
            !grupoProductora) {

            return;
        }

        const tieneProductora =
            productora.value === "Sí";

        grupoProductora.style.display =
            tieneProductora ? "block" : "none";

        nombreProductora.required =
            tieneProductora;

        if (!tieneProductora) {
            nombreProductora.value = "";
        }

    }


    if (productora) {

        productora.addEventListener(
            "change",
            actualizarCampoProductora
        );

        actualizarCampoProductora();

    }


    // MOSTRAR MENSAJES

    function mostrarMensaje(texto, tipo) {

        if (!mensaje) return;

        mensaje.textContent = texto;
        mensaje.className =
            "registration-message " + tipo;

        mensaje.style.display = "block";

    }


    // ENVIAR INSCRIPCIÓN

    formulario.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            if (!formulario.reportValidity()) {
                return;
            }


            const datos = {

                participante:
                    formulario.elements.participante.value.trim(),

                email:
                    formulario.elements.email.value.trim(),

                titulo:
                    formulario.elements.titulo.value.trim(),

                genero:
                    formulario.elements.genero.value,

                estreno_publico:
                    formulario.elements.estreno_publico.value,

                plataforma:
                    formulario.elements.plataforma.value.trim(),

                enlace_publico:
                    formulario.elements.enlace_publico.value.trim(),

                sinopsis:
                    formulario.elements.sinopsis.value.trim(),

                productora:
                    formulario.elements.productora.value,

                nombre_productora:
                    formulario.elements.nombre_productora.value.trim(),

                enlace_descarga:
                    formulario.elements.enlace_descarga.value.trim()

            };


            if (boton) {

                boton.disabled = true;
                boton.textContent = "ENVIANDO...";

            }


            mostrarMensaje(
                "Estamos enviando tu inscripción...",
                "info"
            );


            try {

                const respuesta =
                    await fetch(
                        API_BASE + "/inscripciones",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type": "application/json"
                            },

                            body: JSON.stringify(datos)
                        }
                    );


                let resultado = {};

                try {

                    resultado = await respuesta.json();

                } catch {

                    resultado = {};

                }


                if (
                    !respuesta.ok ||
                    resultado.success === false
                ) {

                    throw new Error(
                        resultado.error ||
                        resultado.message ||
                        "No se pudo registrar la inscripción."
                    );

                }


                formulario.reset();

                actualizarCampoProductora();


                mostrarMensaje(
                    "¡Tu cortometraje fue inscripto correctamente en Leza Fest!",
                    "success"
                );


                console.log(
                    "Inscripción registrada:",
                    resultado
                );


            } catch (error) {

                console.error(
                    "Error al enviar inscripción:",
                    error
                );


                mostrarMensaje(
                    error.message ||
                    "No se pudo enviar la inscripción. Intentá nuevamente.",
                    "error"
                );


            } finally {

                if (boton) {

                    boton.disabled = false;
                    boton.textContent = "ENVIAR INSCRIPCIÓN";

                }

            }

        }
    );

}


// ========================================
// NAVEGACIÓN
// ========================================

function configurarNavegacion() {

    const links =
        document.querySelectorAll(
            'a[href^="#"]'
        );

    links.forEach(
        function (link) {

            link.addEventListener(
                "click",
                function (event) {

                    const targetId =
                        link.getAttribute("href");

                    if (targetId === "#") {
                        return;
                    }

                    const target =
                        document.querySelector(targetId);

                    if (!target) {
                        return;
                    }

                    event.preventDefault();

                    target.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });

                }
            );

        }
    );

}


// ========================================
// NAVBAR
// ========================================

function configurarNavbar() {

    const navbar =
        document.querySelector(".navbar");

    if (!navbar) {
        return;
    }

    window.addEventListener(
        "scroll",
        function () {

            if (window.scrollY > 50) {

                navbar.classList.add("scrolled");

            } else {

                navbar.classList.remove("scrolled");

            }

        }
    );

}


// ========================================
// ANIMACIONES
// ========================================

function configurarAnimaciones() {

    const elementos =
        document.querySelectorAll(
            ".section-title, .festival-content, .rule, .registration-content"
        );

    if (!("IntersectionObserver" in window)) {

        elementos.forEach(
            function (elemento) {

                elemento.classList.add("fade-in");
                elemento.classList.add("visible");

            }
        );

        return;
    }


    const observer =
        new IntersectionObserver(
            function (entradas) {

                entradas.forEach(
                    function (entrada) {

                        if (entrada.isIntersecting) {

                            entrada.target.classList.add("fade-in");
                            entrada.target.classList.add("visible");

                            observer.unobserve(
                                entrada.target
                            );

                        }

                    }
                );

            },
            {
                threshold: 0.15
            }
        );


    elementos.forEach(
        function (elemento) {

            observer.observe(elemento);

        }
    );

}


// ========================================
// INICIO
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        cargarEstadoFestival();

        configurarNavegacion();

        configurarNavbar();

        configurarAnimaciones();

        configurarFormulario();


        // CONSULTAR NUEVAMENTE CADA 10 SEGUNDOS

        setInterval(
            function () {

                cargarEstadoFestival();

            },
            10000
        );

    }
);
