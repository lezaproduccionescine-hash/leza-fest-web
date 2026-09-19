const API_URL =
    "https://leza-fest-api.lezafest.workers.dev/config";

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
            document.getElementById("closed-next-event")
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
                formatearFecha(
                    config.nextEventDate
                );

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
        document.getElementById(
            "festival-title"
        );

    const estado =
        document.getElementById(
            "festival-status"
        );

    const informacion =
        document.getElementById(
            "festival-event-info"
        );


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
            formatearFecha(
                config.emissionDate
            );

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
                "HTTP " +
                respuesta.status
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
            configuracionAnterior ===
            nuevoEstado
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
                        document.querySelector(
                            targetId
                        );

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
        document.querySelector(
            ".navbar"
        );

    if (!navbar) {
        return;
    }

    window.addEventListener(
        "scroll",
        function () {

            if (window.scrollY > 50) {

                navbar.classList.add(
                    "scrolled"
                );

            } else {

                navbar.classList.remove(
                    "scrolled"
                );

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

    if (
        !("IntersectionObserver" in window)
    ) {

        elementos.forEach(
            function (elemento) {

                elemento.classList.add(
                    "fade-in"
                );

                elemento.classList.add(
                    "visible"
                );

            }
        );

        return;
    }


    const observer =
        new IntersectionObserver(
            function (entradas) {

                entradas.forEach(
                    function (entrada) {

                        if (
                            entrada.isIntersecting
                        ) {

                            entrada.target.classList.add(
                                "fade-in"
                            );

                            entrada.target.classList.add(
                                "visible"
                            );

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

            observer.observe(
                elemento
            );

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


        // Consultar nuevamente cada 10 segundos

        setInterval(
            function () {

                cargarEstadoFestival();

            },
            10000
        );

    }
);