```javascript
// ========================================
// LEZA FEST
// JavaScript principal
// ========================================

document.addEventListener("DOMContentLoaded", () => {

    // Navegación suave entre las secciones
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(link => {

        link.addEventListener("click", event => {

            const targetId = link.getAttribute("href");

            // Ignorar enlaces que solamente tengan "#"
            if (targetId === "#") {
                return;
            }

            const target = document.querySelector(targetId);

            if (!target) {
                return;
            }

            event.preventDefault();

            target.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        });

    });


    // ========================================
    // NAVBAR AL HACER SCROLL
    // ========================================

    const navbar = document.querySelector(".navbar");

    window.addEventListener("scroll", () => {

        if (window.scrollY > 50) {
            navbar.classList.add("scrolled");
        } else {
            navbar.classList.remove("scrolled");
        }

    });


    // ========================================
    // ANIMACIÓN DE ELEMENTOS
    // ========================================

    const animatedElements = document.querySelectorAll(
        ".section-title, .festival-content, .rule, .registration-content"
    );

    const observer = new IntersectionObserver(
        entries => {

            entries.forEach(entry => {

                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                    observer.unobserve(entry.target);
                }

            });

        },
        {
            threshold: 0.15
        }
    );


    animatedElements.forEach(element => {
        element.classList.add("fade-in");
        observer.observe(element);
    });

});
```
