const lightbox = document.getElementById("lightbox");
const lightboxContent = document.getElementById("lightbox-content");
const lightboxClose = document.getElementById("lightbox-close");
const lightboxTriggers = document.querySelectorAll(".lightbox-trigger");
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

let activeLeafletMap = null;

function openImageLightbox(src, alt, note = "") {
    lightboxContent.innerHTML = `
        <div class="lightbox-media-wrap">
            <img class="lightbox-image" id="lightbox-image" src="${src}" alt="${alt}">
            ${note ? `<div class="lightbox-note">${note}</div>` : ""}
        </div>
    `;
    lightbox.classList.add("active");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
}

function openModelLightbox(modelSrc, posterSrc, alt) {
    lightboxContent.innerHTML = `
        <div class="lightbox-model-wrap">

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
                style="width: min(92vw, 1100px); height: min(80vh, 800px); background:#111; border-radius:12px;">
            </model-viewer>

            <div class="model-loading" id="model-loading">
                Loading 3D model…<br>
                <small>Click + Drag to rotate once loaded</small>
            </div>

        </div>

        <noscript>
            <img class="lightbox-image" src="${posterSrc}" alt="${alt}">
        </noscript>
    `;

    const modelViewer = lightboxContent.querySelector("model-viewer");
    const loadingEl = lightboxContent.querySelector("#model-loading");

    modelViewer.addEventListener("load", () => {
        loadingEl.style.display = "none";
    });

    lightbox.classList.add("active");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
}

function openMapLightbox(previewSrc, overlaySrc, bounds, alt) {
    lightboxContent.innerHTML = `
        <div class="lightbox-map-wrap">
            <button type="button" class="map-reset" id="map-reset-btn" aria-label="Reset map view">Reset View</button>

            <div class="map-hint" id="map-hint">
                Zoom out to view surrounding streets
            </div>

            <div class="map-loading" id="map-loading">
                <div class="map-loading-inner">
                    <img class="map-loading-preview" src="${previewSrc}" alt="${alt}">
                    <div class="map-loading-overlay">
                        <div class="map-loading-text">
                            Loading interactive map…
                            <small>Drag to pan • Scroll or pinch to zoom</small>
                        </div>
                    </div>
                </div>
            </div>

            <div class="lightbox-map" id="lightbox-map" aria-label="${alt}"></div>
        </div>
    `;

    lightbox.classList.add("active");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    const mapEl = document.getElementById("lightbox-map");
    const loadingEl = document.getElementById("map-loading");
    const resetBtn = document.getElementById("map-reset-btn");
    const hintEl = document.getElementById("map-hint");

    const leafletBounds = [
        [bounds.south, bounds.west],
        [bounds.north, bounds.east]
    ];

    activeLeafletMap = L.map(mapEl, {
        zoomControl: true,
        attributionControl: true
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 22,
        attribution: "&copy; OpenStreetMap contributors"
    }).addTo(activeLeafletMap);

    let currentOpacity = 0.82;

    const overlay = L.imageOverlay(overlaySrc, leafletBounds, {
        opacity: currentOpacity,
        interactive: false
    }).addTo(activeLeafletMap);

    // Create opacity control
    const opacityControl = document.createElement("div");
    opacityControl.className = "map-opacity-control";

    opacityControl.innerHTML = `
        <span>Opacity</span>
        <input type="range" min="0.4" max="1" step="0.01" value="${currentOpacity}">
    `;

    lightboxContent.appendChild(opacityControl);

    const slider = opacityControl.querySelector("input");

    slider.addEventListener("input", function(){
        currentOpacity = parseFloat(this.value);
        overlay.setOpacity(currentOpacity);
    });

    activeLeafletMap.fitBounds(leafletBounds, {
        padding: [20, 20]
    });

    let mapReady = false;

    function revealMap() {
        if (mapReady) return;
        mapReady = true;
        mapEl.classList.add("is-ready");
        loadingEl.style.opacity = "0";
        setTimeout(() => {
            loadingEl.style.display = "none";
        }, 250);

        setTimeout(() => {
            hintEl.classList.add("is-hidden");
            setTimeout(() => {
                if (hintEl) {
                    hintEl.style.display = "none";
                }
            }, 350);
        }, 2800);
    }

    overlay.once("load", revealMap);

    setTimeout(() => {
        activeLeafletMap.invalidateSize();
    }, 50);

    setTimeout(() => {
        activeLeafletMap.invalidateSize();
        if (!mapReady) {
            revealMap();
        }
    }, 700);

    resetBtn.addEventListener("click", () => {
        activeLeafletMap.fitBounds(leafletBounds, {
            padding: [20, 20]
        });
    });
}

lightboxTriggers.forEach(trigger => {
    trigger.addEventListener("click", function (e) {
        e.preventDefault();

        const type = this.dataset.lightboxType;
        const img = this.querySelector("img");
        const alt = this.dataset.alt || (img ? img.alt : "");
        const mobileFallback = this.dataset.mobileFallback === "true";

        if (type === "model") {
            if (isMobile && mobileFallback) {
                openImageLightbox(
                    this.href,
                    alt,
                    "You are viewing a 2D preview. For full interactive 3D, please open on a desktop or laptop."
                );
            } else {
                openModelLightbox(
                    this.dataset.modelSrc,
                    this.dataset.posterSrc || this.href,
                    alt
                );
            }
        } else if (type === "map") {
            openMapLightbox(
                this.dataset.mapPreview || this.href,
                this.dataset.mapOverlay,
                {
                    north: parseFloat(this.dataset.mapNorth),
                    south: parseFloat(this.dataset.mapSouth),
                    west: parseFloat(this.dataset.mapWest),
                    east: parseFloat(this.dataset.mapEast)
                },
                alt
            );
        } else {
            openImageLightbox(this.href, alt);
        }
    });
});

function destroyActiveMap() {
    if (activeLeafletMap) {
        activeLeafletMap.remove();
        activeLeafletMap = null;
    }
}

function closeLightbox() {
    destroyActiveMap();

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