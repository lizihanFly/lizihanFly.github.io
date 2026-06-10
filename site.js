const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");

if (navToggle && siteNav) {
    navToggle.addEventListener("click", () => {
        const open = siteNav.classList.toggle("open");
        navToggle.setAttribute("aria-expanded", String(open));
    });

    siteNav.addEventListener("click", () => {
        siteNav.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
    });
}

document.querySelectorAll("[data-year]").forEach((node) => {
    node.textContent = new Date().getFullYear();
});

const revealNodes = document.querySelectorAll("[data-reveal]");
if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("revealed");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });
    revealNodes.forEach((node) => observer.observe(node));
} else {
    revealNodes.forEach((node) => node.classList.add("revealed"));
}
