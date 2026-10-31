
const API_URL = "https://leza-fest-api.lezafest.workers.dev";

const formulario = document.getElementById("formulario");

const datosPublicos = document.getElementById("datos-publicos");
const plataforma = document.getElementById("plataforma");
const enlacePublico = document.getElementById("enlace-publico");

const datosProductora = document.getElementById("datos-productora");
const nombreProductora = document.getElementById("productora");

const enlaceDescarga = document.getElementById("enlace-descarga");
const estadoEnlace = document.getElementById("estado-enlace");
const resultado = document.getElementById("resultado");
const botonEnviar = document.getElementById("enviar");

function obtenerSeleccion(nombre) {
    return document.querySelector(
        `input[name="${nombre}"]:checked`
    )?.value || "";
}

// Mostrar u ocultar datos públicos
document.querySelectorAll('input[name="publico"]').forEach(input => {
    input.addEventListener("change", () => {
        const esPublico = obtenerSeleccion("publico") === "Sí";

        datosPublicos.hidden = !esPublico;
        plataforma.required = esPublico;
        enlacePublico.required = esPublico;

        if (!esPublico) {
            plataforma.value = "";
            enlacePublico.value = "";
        }
    });
});

// Mostrar u ocultar datos de productora
document.querySelectorAll('input[name="tieneProductora"]').forEach(input => {
    input.addEventListener("change", () => {
        const tieneProductora =
            obtenerSeleccion("tieneProductora") === "Sí";

        datosProductora.hidden = !tieneProductora;
        nombreProductora.required = tieneProductora;

        if (!tieneProductora) {
            nombreProductora.value = "";
        }
    });
});

// Reconocer proveedores permitidos
function reconocerProveedor(valor) {
    try {
        const url = new URL(valor);

        if (
            url.protocol !== "https:" ||
            url.username ||
            url.password ||
            url.port
        ) {
            return null;
        }

        const host = url.hostname.toLowerCase();

        if (
            host === "drive.google.com" ||
            host === "docs.google.com"
        ) {
            return "Google Drive";
        }

        if (
            host === "dropbox.com" ||
            host.endsWith(".dropbox.com")
        ) {
            return "Dropbox";
        }

        if (
            host === "1drv.ms" ||
            host === "onedrive.live.com" ||
            host.endsWith(".sharepoint.com")
        ) {
            return "OneDrive";
        }

        return null;

    } catch {
        return null;
    }
}

function esEnlaceSeguro(valor) {
    try {
        const url = new URL(valor);

        return (
            url.protocol === "https:" &&
            !url.username &&
            !url.password &&
            !url.port
        );
    } catch {
        return false;
    }
}

// Estado visual del enlace
enlaceDescarga.addEventListener("input", () => {
    const valor = enlaceDescarga.value.trim();

    estadoEnlace.className = "status";

    if (!valor) {
        estadoEnlace.textContent =
            "Se verificará el acceso al archivo antes de aceptar la inscripción.";
        return;
    }

    const proveedor = reconocerProveedor(valor);

    if (proveedor) {
        estadoEnlace.classList.add("success");
        estadoEnlace.textContent =
            "Proveedor reconocido: " + proveedor +
            ". El servidor verificará el acceso y la descarga.";
    } else {
        estadoEnlace.classList.add("error");
        estadoEnlace.textContent =
            "Utilizá un enlace HTTPS de Google Drive, Dropbox u OneDrive.";
    }
});

// Enviar inscripción real al Worker
formulario.addEventListener("submit", async (event) => {
    event.preventDefault();

    resultado.textContent = "";
    resultado.className = "result";

    if (!formulario.reportValidity()) return;

    const proveedor = reconocerProveedor(
        enlaceDescarga.value.trim()
    );

    if (!proveedor) {
        estadoEnlace.className = "status error";
        estadoEnlace.textContent =
            "El enlace debe ser de Google Drive, Dropbox u OneDrive.";
        enlaceDescarga.focus();
        return;
    }

    const publico = obtenerSeleccion("publico");
    const tieneProductora = obtenerSeleccion("tieneProductora");

    if (
        publico === "Sí" &&
        !esEnlaceSeguro(enlacePublico.value.trim())
    ) {
        resultado.textContent =
            "El enlace de visualización debe ser una dirección HTTPS válida.";
        enlacePublico.focus();
        return;
    }

    const datos = {
        participante: formulario.elements.participante.value.trim(),
        email: formulario.elements.email.value.trim(),
        titulo: formulario.elements.titulo.value.trim(),
        genero: formulario.elements.genero.value,
        publico,
        plataforma: publico === "Sí" ? plataforma.value : "",
        enlacePublico: publico === "Sí" ? enlacePublico.value.trim() : "",
        sinopsis: formulario.elements.sinopsis.value.trim(),
        tieneProductora,
        productora: tieneProductora === "Sí"
            ? nombreProductora.value.trim()
            : "",
        enlaceDescarga: enlaceDescarga.value.trim(),
        aceptaTerminos: document.getElementById("acepta-terminos").checked
    };

    botonEnviar.disabled = true;
    botonEnviar.textContent = "ENVIANDO INSCRIPCIÓN...";
    resultado.textContent =
        "Verificando el archivo y registrando tu inscripción...";

    try {
        const response = await fetch(
            `${API_URL}/inscripciones`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(datos)
            }
        );

        const respuesta = await response.json();

        if (!response.ok || !respuesta.success) {
            throw new Error(
                respuesta.error || "No se pudo registrar la inscripción."
            );
        }

        formulario.reset();

        datosPublicos.hidden = true;
        datosProductora.hidden = true;

        plataforma.required = false;
        enlacePublico.required = false;
        nombreProductora.required = false;

        estadoEnlace.className = "status";
        estadoEnlace.textContent =
            "Se verificará el acceso al archivo antes de aceptar la inscripción.";

        resultado.className = "result success";
        resultado.textContent =
            "¡Inscripción registrada correctamente! Tu número de inscripción es " +
            respuesta.id + ".";

    } catch (error) {
        resultado.className = "result error";
        resultado.textContent =
            error.message ||
            "No se pudo conectar con el servidor. Intentá nuevamente.";

    } finally {
        botonEnviar.disabled = false;
        botonEnviar.textContent = "ENVIAR INSCRIPCIÓN";
    }
});
