const lightbox = document.getElementById("lightbox");
const lightboxContent = document.getElementById("lightbox-content");
const lightboxImage = document.getElementById("lightbox-image");
const lightboxClose = document.getElementById("lightbox-close");
const lightboxTriggers = document.querySelectorAll(".lightbox-trigger");

function openImageLightbox(src, alt) {
    lightboxContent.innerHTML = `
        <img class="lightbox-image" id="lightbox-image" src="${src}" alt="${alt}">
    `;
    lightbox.classList.add("active");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
}

function openModelLightbox(modelSrc, posterSrc, alt) {
    lightboxContent.innerHTML = `
        <model-viewer
            class="lightbox-model"
            src="${modelSrc}"
            poster="${posterSrc}"
            alt="${alt}"
            camera-controls
            shadow-intensity="1"
            exposure="1"
            min-camera-orbit="-70deg 5deg auto"
            max-camera-orbit="70deg auto auto"
            style="width: min(92vw, 1100px); height: min(80vh, 800px); background: #111; border-radius: 12px;">
        </model-viewer>
        <noscript>
            <img class="lightbox-image" src="${posterSrc}" alt="${alt}">
        </noscript>
    `;
    lightbox.classList.add("active");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
}

lightboxTriggers.forEach(trigger => {
    trigger.addEventListener("click", function (e) {
        e.preventDefault();

        const type = this.dataset.lightboxType;
        const img = this.querySelector("img");
        const alt = this.dataset.alt || (img ? img.alt : "");

        if (type === "model") {
            openModelLightbox(
                this.dataset.modelSrc,
                this.dataset.posterSrc || this.href,
                alt
            );
        } else {
            openImageLightbox(this.href, alt);
        }
    });
});

function closeLightbox() {
    lightbox.classList.remove("active");
    lightbox.setAttribute("aria-hidden", "true");
    lightboxContent.innerHTML = `
        <img class="lightbox-image" id="lightbox-image" src="" alt="">
    `;
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