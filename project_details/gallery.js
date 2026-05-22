// Shared Lightbox State
let lightboxImagesList = [];
let lightboxCurrentIndex = 0;
let lightboxInitialized = false;

// Helper to check if image exists
function checkImageExists(url) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
    });
}

// Fullscreen Lightbox Shared Setup
function setupLightbox() {
    if (lightboxInitialized) return;
    
    const lightbox = document.getElementById('lightbox-overlay');
    if (!lightbox) return;

    const lightboxImg = document.getElementById('lightbox-image');
    const lightboxClose = document.getElementById('lightbox-close');
    const lightboxPrev = document.getElementById('lightbox-prev');
    const lightboxNext = document.getElementById('lightbox-next');

    function openLightbox(index) {
        lightboxCurrentIndex = index;
        lightboxImg.src = lightboxImagesList[lightboxCurrentIndex];
        lightbox.classList.add('active');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden'; // Lock background scrolling
        
        if (lightboxImagesList.length <= 1) {
            lightboxPrev.style.display = 'none';
            lightboxNext.style.display = 'none';
        } else {
            lightboxPrev.style.display = 'flex';
            lightboxNext.style.display = 'flex';
        }
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        lightbox.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = ''; // Restore scrolling
    }

    function lightboxNextImg() {
        lightboxCurrentIndex = (lightboxCurrentIndex + 1) % lightboxImagesList.length;
        lightboxImg.src = lightboxImagesList[lightboxCurrentIndex];
    }

    function lightboxPrevImg() {
        lightboxCurrentIndex = (lightboxCurrentIndex - 1 + lightboxImagesList.length) % lightboxImagesList.length;
        lightboxImg.src = lightboxImagesList[lightboxCurrentIndex];
    }

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightboxNext) lightboxNext.addEventListener('click', lightboxNextImg);
    if (lightboxPrev) lightboxPrev.addEventListener('click', lightboxPrevImg);

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowRight' && lightboxImagesList.length > 1) lightboxNextImg();
        if (e.key === 'ArrowLeft' && lightboxImagesList.length > 1) lightboxPrevImg();
    });

    window.openLightbox = openLightbox;
    lightboxInitialized = true;
}

// Parametrized Carousel Init
async function initProjectGallery({ projectName, folderPath }) {
    const gallerySection = document.getElementById('project-gallery-section');
    const track = document.getElementById('carousel-track');
    const prevBtn = document.getElementById('carousel-prev');
    const nextBtn = document.getElementById('carousel-next');
    const dotsContainer = document.getElementById('carousel-dots');
    const currentIndexLabel = document.getElementById('carousel-current-index');
    const totalCountLabel = document.getElementById('carousel-total-count');
    const viewport = document.getElementById('carousel-viewport');

    if (!gallerySection || !track) return;

    // Probe sequential images
    const carouselImages = [];
    const exts = ['jpg', 'png', 'jpeg', 'webp'];
    let index = 1;
    
    while (true) {
        let found = false;
        for (const ext of exts) {
            const url = `${folderPath}/${index}.${ext}`;
            const exists = await checkImageExists(url);
            if (exists) {
                carouselImages.push(url);
                found = true;
                break;
            }
        }
        if (!found) break;
        index++;
    }

    if (carouselImages.length === 0) {
        gallerySection.style.display = 'none';
        return;
    }

    // Initialize Lightbox engine
    setupLightbox();

    // Map starting index in global lightbox image list for this carousel
    const startIndexInLightbox = lightboxImagesList.length;
    lightboxImagesList.push(...carouselImages);

    // Build Slides and Dots
    gallerySection.style.display = 'block';
    const total = carouselImages.length;
    totalCountLabel.textContent = total;

    const originalSlides = [];

    carouselImages.forEach((url, i) => {
        // Slide
        const slide = document.createElement('div');
        slide.className = 'carousel-slide';
        slide.innerHTML = `
            <img class="carousel-bg-blur" src="${url}" alt="" loading="lazy">
            <img class="carousel-fg-image" src="${url}" alt="Project slide ${i + 1}" loading="lazy">
        `;
        slide.addEventListener('click', () => {
            if (window.openLightbox) window.openLightbox(startIndexInLightbox + i);
        });
        originalSlides.push(slide);
        track.appendChild(slide);

        // Dot
        const dot = document.createElement('div');
        dot.className = `carousel-dot ${i === 0 ? 'active' : ''}`;
        dot.addEventListener('click', () => goToSlide(i));
        dotsContainer.appendChild(dot);
    });

    let currentSlideIndex = 0;
    let isTransitioning = false;
    let autoplayTimer;

    // Set up infinite loops clones if there are multiple slides
    if (total > 1) {
        const firstClone = originalSlides[0].cloneNode(true);
        const lastClone = originalSlides[total - 1].cloneNode(true);

        // Re-bind click event to cloned slides
        firstClone.addEventListener('click', () => {
            if (window.openLightbox) window.openLightbox(startIndexInLightbox + 0);
        });
        lastClone.addEventListener('click', () => {
            if (window.openLightbox) window.openLightbox(startIndexInLightbox + total - 1);
        });

        track.appendChild(firstClone);
        track.insertBefore(lastClone, originalSlides[0]);

        currentSlideIndex = 1;
        track.style.transition = 'none';
        track.style.transform = `translateX(-100%)`;

        track.addEventListener('transitionend', () => {
            isTransitioning = false;
            if (currentSlideIndex === 0) {
                currentSlideIndex = total;
                updateCarousel(false);
            } else if (currentSlideIndex === total + 1) {
                currentSlideIndex = 1;
                updateCarousel(false);
            }
        });
    }

    function updateCarousel(transition = true) {
        if (total > 1) {
            if (transition) {
                track.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
                isTransitioning = true;
            } else {
                track.style.transition = 'none';
                track.offsetHeight; // Force reflow to flush transition: none before transform change
            }
            track.style.transform = `translateX(-${currentSlideIndex * 100}%)`;

            let activeIdx = currentSlideIndex - 1;
            if (currentSlideIndex === 0) {
                activeIdx = total - 1;
            } else if (currentSlideIndex === total + 1) {
                activeIdx = 0;
            }

            currentIndexLabel.textContent = activeIdx + 1;

            const dots = dotsContainer.querySelectorAll('.carousel-dot');
            dots.forEach((dot, idx) => {
                dot.classList.toggle('active', idx === activeIdx);
            });
        } else {
            track.style.transform = 'translateX(0%)';
            currentIndexLabel.textContent = 1;
        }
    }

    function nextSlide() {
        if (total <= 1) return;
        if (isTransitioning) return;
        currentSlideIndex++;
        updateCarousel();
    }

    function prevSlide() {
        if (total <= 1) return;
        if (isTransitioning) return;
        currentSlideIndex--;
        updateCarousel();
    }

    function goToSlide(slideIdx) {
        if (total <= 1) return;
        if (isTransitioning) return;
        currentSlideIndex = slideIdx + 1;
        updateCarousel();
        resetAutoplay();
    }

    if (prevBtn) prevBtn.addEventListener('click', () => { prevSlide(); resetAutoplay(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { nextSlide(); resetAutoplay(); });

    function startAutoplay() {
        if (total <= 1) return;
        autoplayTimer = setInterval(nextSlide, 4000);
    }

    function resetAutoplay() {
        if (total <= 1) return;
        clearInterval(autoplayTimer);
        startAutoplay();
    }

    if (viewport) {
        viewport.addEventListener('mouseenter', () => clearInterval(autoplayTimer));
        viewport.addEventListener('mouseleave', startAutoplay);
    }

    startAutoplay();
}

// Parametrized Certificate Init
async function initProjectCertificate({ projectName, folderPath, heroContainerId, sidebarContainerId }) {
    const heroContainer = document.getElementById(heroContainerId);
    const sidebarContainer = document.getElementById(sidebarContainerId);
    if (!heroContainer && !sidebarContainer) return;

    // Probe certificate
    let certificateUrl = null;
    const exts = ['png', 'jpg', 'jpeg', 'webp'];
    
    for (const ext of exts) {
        const url = `${folderPath}/certificate.${ext}`;
        const exists = await checkImageExists(url);
        if (exists) {
            certificateUrl = url;
            break;
        }
    }

    if (!certificateUrl) {
        if (heroContainer) heroContainer.style.display = 'none';
        if (sidebarContainer) sidebarContainer.style.display = 'none';
        return;
    }

    // Initialize Lightbox engine
    setupLightbox();

    // Push certificate image into lightbox list
    const certificateIndexInLightbox = lightboxImagesList.length;
    lightboxImagesList.push(certificateUrl);

    // Build Hero Certificate Badge HTML
    if (heroContainer) {
        heroContainer.innerHTML = `
            <div class="hero-certificate-badge" id="hero-certificate-badge">
                <div class="cert-badge-icon">
                    <i data-lucide="award"></i>
                </div>
                <div class="cert-badge-content">
                    <span class="cert-badge-title">Verified Credential</span>
                    <span class="cert-badge-action">View Certificate</span>
                </div>
            </div>
        `;
        const badge = document.getElementById('hero-certificate-badge');
        if (badge) {
            badge.addEventListener('click', () => {
                if (window.openLightbox) window.openLightbox(certificateIndexInLightbox);
            });
        }
    }

    // Build Sidebar Certificate Preview HTML
    if (sidebarContainer) {
        sidebarContainer.innerHTML = `
            <div class="sidebar-certificate-card" id="sidebar-certificate-card">
                <h4 class="sidebar-cert-title">
                    <i data-lucide="award"></i> Verified Certificate
                </h4>
                <div class="sidebar-cert-preview" id="sidebar-cert-preview-click">
                    <img src="${certificateUrl}" alt="${projectName} certificate preview" loading="lazy">
                    <div class="sidebar-cert-overlay">
                        <i data-lucide="maximize-2"></i>
                        <span>Enlarge Credential</span>
                    </div>
                </div>
            </div>
        `;
        const sidebarPreview = document.getElementById('sidebar-cert-preview-click');
        if (sidebarPreview) {
            sidebarPreview.addEventListener('click', () => {
                if (window.openLightbox) window.openLightbox(certificateIndexInLightbox);
            });
        }
    }

    // Re-init Lucide Icons
    if (window.lucide) {
        window.lucide.createIcons();
    }
}
