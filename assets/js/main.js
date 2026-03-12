const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightbox-image");
const lightboxClose = document.getElementById("lightbox-close");
const lightboxTriggers = document.querySelectorAll(".lightbox-trigger");

lightboxTriggers.forEach(trigger => {
    trigger.addEventListener("click", function (e) {
        e.preventDefault();
        lightboxImage.src = this.href;
        lightboxImage.alt = this.querySelector("img").alt;
        lightbox.classList.add("active");
        document.body.style.overflow = "hidden";
    });
});

function closeLightbox() {
    lightbox.classList.remove("active");
    lightboxImage.src = "";
    document.body.style.overflow = "";
}

lightboxClose.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    closeLightbox();
});

lightbox.addEventListener("click", function (e) {
    if (e.target === lightbox) {
        closeLightbox();
    }
});

document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && lightbox.classList.contains("active")) {
        closeLightbox();
    }
});