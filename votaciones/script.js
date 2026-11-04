
const API_URL = "https://leza-fest-api.lezafest.workers.dev";

const VOTER_KEY = "lezaFestVisitorId";
const VOTED_KEY = "lezaFestVoted";

const votingStatus = document.getElementById("votingStatus");
const worksSection = document.getElementById("worksSection");
const worksList = document.getElementById("worksList");
const emptySection = document.getElementById("emptySection");
const alreadyVoted = document.getElementById("alreadyVoted");

function getVisitorId() {
    let visitorId = localStorage.getItem(VOTER_KEY);

    if (!visitorId) {
        visitorId = crypto.randomUUID();
        localStorage.setItem(VOTER_KEY, visitorId);
    }

    return visitorId;
}

function showOnly(section) {
    votingStatus.hidden = section !== votingStatus;
    worksSection.hidden = section !== worksSection;
    emptySection.hidden = section !== emptySection;
    alreadyVoted.hidden = section !== alreadyVoted;
}

function createWorkCard(work) {
    const card = document.createElement("article");
    card.className = "work-card";

    const title = document.createElement("h2");
    title.textContent = work.titulo || "Obra sin título";

    const participant = document.createElement("p");
    participant.textContent =
        `Participante: ${work.participante || "No informado"}`;

    card.appendChild(title);
    card.appendChild(participant);

    if (work.enlace_publico) {
        try {
            const publicUrl = new URL(work.enlace_publico);

            if (["https:", "http:"].includes(publicUrl.protocol)) {
                const link = document.createElement("a");
                link.href = publicUrl.href;
                link.textContent = "Ver obra";
                link.target = "_blank";
                link.rel = "noopener noreferrer";
                card.appendChild(link);
            }
        } catch {
            // No mostrar enlaces inválidos.
        }
    }

    const voteButton = document.createElement("button");
    voteButton.className = "vote-button";
    voteButton.textContent = "VOTAR OBRA";

    voteButton.addEventListener("click", () => {
        registerVote(work.id, voteButton);
    });

    card.appendChild(voteButton);

    return card;
}

async function loadVoting() {
    try {
        const response = await fetch(`${API_URL}/votaciones/obras`);
        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.error || "No se pudieron cargar las obras.");
        }

        if (!data.votingOpen) {
            showOnly(votingStatus);
            return;
        }

        if (localStorage.getItem(VOTED_KEY) === "true") {
            showOnly(alreadyVoted);
            return;
        }

        if (!Array.isArray(data.works) || data.works.length === 0) {
            showOnly(emptySection);
            return;
        }

        worksList.replaceChildren();

        data.works.forEach(work => {
            worksList.appendChild(createWorkCard(work));
        });

        showOnly(worksSection);

    } catch (error) {
        console.error("Error al cargar votaciones:", error);

        votingStatus.querySelector("h2").textContent =
            "No se pudieron cargar las votaciones";

        votingStatus.querySelector("p").textContent =
            "Intentá nuevamente más tarde.";

        showOnly(votingStatus);
    }
}

async function registerVote(inscripcionId, button) {
    const confirmed = confirm(
        "¿Confirmás tu voto para esta obra? Solo podés votar una vez."
    );

    if (!confirmed) return;

    button.disabled = true;
    button.textContent = "REGISTRANDO...";

    try {
        const response = await fetch(`${API_URL}/votaciones/votar`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                inscripcionId,
                visitorId: getVisitorId()
            })
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            if (response.status === 409) {
                localStorage.setItem(VOTED_KEY, "true");
                showOnly(alreadyVoted);
                return;
            }

            throw new Error(data.error || "No se pudo registrar el voto.");
        }

        localStorage.setItem(VOTED_KEY, "true");
        showOnly(alreadyVoted);

    } catch (error) {
        console.error("Error al votar:", error);
        alert(error.message || "Ocurrió un error al registrar el voto.");

        button.disabled = false;
        button.textContent = "VOTAR OBRA";
    }
}

document.addEventListener("DOMContentLoaded", loadVoting);
