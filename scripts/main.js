// ── Chargement bandeau ──────────────────────────────────────────
async function loadBandeau() {
    const res = await fetch('data/artiste-bandeau.json');
    const data = await res.json();
    const items = data.items;
    const container = document.getElementById('marquee-content');
    if (!container) return;

    for (let i = 0; i < 4; i++) {
        const div = document.createElement('div');
        div.className = 'marquee-items';
        items.forEach(item => {
            const span = document.createElement('span');
            if (item.lien) {
                span.innerHTML = `<a href="${item.lien}" target="_blank" rel="noopener" class="marquee-link">${item.texte}</a>`;
            } else {
                span.textContent = item.texte;
            }
            div.appendChild(span);
            const sep = document.createElement('span');
            sep.className = 'separator';
            sep.textContent = '•';
            div.appendChild(sep);
        });
        container.appendChild(div);
    }
}

// ── Chargement expositions ──────────────────────────────────────
async function loadExpositions() {
    const res = await fetch('data/artiste-expositions.json');
    const data = await res.json();
    const expos = data.items;

    const postersContainer = document.getElementById('exhibition-posters');
    const listContainer = document.getElementById('exhibition-list');

    if (postersContainer) {
        expos.filter(e => e.affiche).forEach(e => {
            postersContainer.innerHTML += `
            <div class="poster-item gallery-item"
                data-title="${e.titre}"
                data-meta="${e.lieu} — ${e.date}">
                <img src="${e.affiche}" alt="Affiche ${e.titre}" />
            </div>`;
        });
        // Ré-initialiser les handlers sur les posters fraîchement injectés
        initializePosterHandlers();
    }

    if (listContainer) {
        expos.forEach(e => {
            listContainer.innerHTML += `
            <div class="exhibition-item">
                <div class="exhibition-date">${e.date}</div>
                <div class="exhibition-details">
                    <h3><strong>${e.titre}</strong> – ${e.lieu}</h3>
                </div>
            </div>`;
        });
    }
}

// Initialisation principale du document
document.addEventListener('DOMContentLoaded', function () {
    console.log('Version modal 2025-10-10');
    // ============ NAVIGATION MOBILE ============
    initializeMobileNavigation();

    // ============ SECTIONS PLIABLES/DÉPLIABLES ============
    initializeCollapsibleSections();

    // ============ SYSTÈME DE GALERIE UNIFIÉ ============
    initializeGallerySystem();

    // ============ CHARGEMENT CONTENU DYNAMIQUE ============
    loadBandeau();
    loadExpositions();
});

// =============== NAVIGATION ===============
function initializeMobileNavigation() {
    // Créer le bouton de menu pour mobile
    const menuToggle = document.createElement('div');
    menuToggle.className = 'menu-toggle';
    menuToggle.setAttribute('role', 'button');
    menuToggle.setAttribute('tabindex', '0');
    menuToggle.setAttribute('aria-controls', 'sidebar');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" 
             stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
    `;
    document.body.appendChild(menuToggle);

    const sidebar = document.querySelector('.sidebar');

    const toggleSidebar = () => {
        const isExpanded = sidebar.classList.toggle('active');
        menuToggle.setAttribute('aria-expanded', String(isExpanded));
    };

    menuToggle.addEventListener('click', toggleSidebar);
    menuToggle.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            toggleSidebar();
        }
    });

    // Fermer le menu lorsqu'on clique sur un lien
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        link.addEventListener('click', function () {
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
            }
        });
    });

    // Smooth scroll pour les ancres
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// =============== SECTIONS PLIABLES/DÉPLIABLES ===============
function initializeCollapsibleSections() {
    // Gestion du bouton "Voir plus d'expositions"
    const showMoreBtn = document.getElementById('showMoreExhibitions');
    const exhibitionList = document.querySelector('.exhibition-list');
    const hiddenExhibitions = document.querySelector('.hidden-exhibitions');
    
    // Initialisation des éléments cachés
    if (hiddenExhibitions) {
        hiddenExhibitions.style.maxHeight = '0px';
        hiddenExhibitions.style.opacity = '0';
        hiddenExhibitions.style.overflow = 'hidden';
        hiddenExhibitions.style.display = 'block';
    }
    
    if (showMoreBtn && exhibitionList) {
        showMoreBtn.addEventListener('click', function() {
            const isExpanded = exhibitionList.classList.contains('show-all-exhibitions');
            animateToggleSection(isExpanded, hiddenExhibitions, exhibitionList, showMoreBtn, 'show-all-exhibitions');
        });
    }
    
}

function animateToggleSection(isOpen, contentElement, containerElement, toggleButton, containerClass) {
    if (!isOpen) {
        // Animation d'ouverture
        containerElement.classList.add(containerClass);
        contentElement.style.display = 'block';
        
        // Animation fluide progressive
        let currentHeight = 0;
        const targetHeight = contentElement.scrollHeight;
        
        const showAnimation = setInterval(() => {
            if (currentHeight >= targetHeight) {
                clearInterval(showAnimation);
                contentElement.style.opacity = '1';
            } else {
                currentHeight += Math.min(50, (targetHeight - currentHeight) / 5 + 1);
                contentElement.style.maxHeight = currentHeight + 'px';
                contentElement.style.opacity = Math.min(0.8, currentHeight / targetHeight).toString();
            }
        }, 16);
    } else {
        // Animation de fermeture
        // Mémoriser la position initiale du bouton
        const initialButtonRect = toggleButton.getBoundingClientRect();
        const initialButtonTop = initialButtonRect.top;
        
        // Animation de fermeture avec suivi de la barre
        let currentHeight = contentElement.scrollHeight;
        const totalHeight = currentHeight;
        
        const closeAnimation = setInterval(() => {
            if (currentHeight <= 0) {
                clearInterval(closeAnimation);
                contentElement.style.opacity = '0';
                contentElement.style.maxHeight = '0px';
                containerElement.classList.remove(containerClass);
            } else {
                // Réduction rapide de la hauteur
                currentHeight -= Math.min(150, currentHeight / 2 + 5);
                contentElement.style.maxHeight = currentHeight + 'px';
                contentElement.style.opacity = Math.max(0, currentHeight / totalHeight - 0.2).toString();
                
                // Suivre la barre pendant l'animation
                const newButtonRect = toggleButton.getBoundingClientRect();
                const currentButtonTop = newButtonRect.top;
                const scrollOffset = currentButtonTop - initialButtonTop;
                
                if (Math.abs(scrollOffset) > 2) {
                    window.scrollBy({
                        top: scrollOffset,
                        behavior: 'auto'
                    });
                }
            }
        }, 8);
    }
}

// =============== SYSTÈME DE GALERIE ET MODAL D'IMAGES ===============
// Variables globales pour la galerie
const galleryModal = document.getElementById('gallery-modal');
const modalImage = document.getElementById('modal-image');
const closeBtn = document.querySelector('.close-btn');
const prevBtn = document.querySelector('.prev-btn');
const nextBtn = document.querySelector('.next-btn');
const modalContent = galleryModal ? galleryModal.querySelector('.modal-content') : null;
const infoToggle = document.getElementById('modal-info-toggle');
const infoPanel = document.getElementById('modal-info-panel');
const infoPanelTitle = infoPanel ? infoPanel.querySelector('.info-panel-title') : null;
const infoPanelList = infoPanel ? infoPanel.querySelector('.info-panel-list') : null;

let currentImages = [];
let currentIndex = 0;
let inGalleryMode = true;
let lastFocusedElement = null;
let currentInfoData = null;

const DETAIL_LABEL_OVERRIDES = {
    technique: 'Techniques',
    format: 'Format',
    support: 'Support',
    location: 'Lieu',
    meta: 'Lieu / Date',
    year: 'Année',
    notes: 'Notes',
    description: 'Description',
    dimensions: 'Dimensions',
    materials: 'Matériaux',
    pages: 'Nombre de pages'
};

function initializeGallerySystem() {
    // Vérifier que les éléments existent avant de les utiliser
    if (!galleryModal || !modalImage || !closeBtn || !prevBtn || !nextBtn) {
        console.warn('Éléments de galerie manquants dans le DOM');
        return;
    }

    if (infoPanel) {
        infoPanel.hidden = true;
        infoPanel.setAttribute('aria-hidden', 'true');
    }

    if (infoToggle) {
        infoToggle.setAttribute('aria-expanded', 'false');
        infoToggle.setAttribute('aria-label', 'Afficher les informations de l’œuvre');
    }

    if (infoToggle && infoPanel) {
        infoToggle.addEventListener('click', () => {
            if (infoPanel.hidden) {
                openInfoPanel();
            } else {
                closeInfoPanel();
            }
        });

        infoToggle.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                infoToggle.click();
            }
        });
    }
    
    // Configuration des handlers pour les dessins avec catégories
    document.querySelectorAll('.drawing-item').forEach((item) => {
        item.setAttribute('role', 'button');
        item.setAttribute('tabindex', '0');
        item.setAttribute('aria-haspopup', 'dialog');
        item.setAttribute('aria-controls', 'gallery-modal');

        const openCategoryGallery = () => {
            const category = item.getAttribute('data-category');
            currentImages = getImagesForCategory(category);
            currentIndex = 0;
            inGalleryMode = true;

            setModalInfo(buildInfoFromDrawingItem(item));

            showImage();
            showModal();
        };

        item.addEventListener('click', openCategoryGallery);
        item.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openCategoryGallery();
            }
        });
    });
    
    // Handlers posters : initialisés après injection dynamique via initializePosterHandlers()
    // ── Initialisation handlers posters (appelée après injection JSON) ──
function initializePosterHandlers() {
    document.querySelectorAll('.poster-item img').forEach((img) => {
        img.setAttribute('role', 'button');
        img.setAttribute('tabindex', '0');
        img.setAttribute('aria-haspopup', 'dialog');
        img.setAttribute('aria-controls', 'gallery-modal');

        const openPosterModal = () => {
            inGalleryMode = false;
            setModalInfo(buildInfoFromPosterItem(img.closest('.poster-item'), img));
            showPosterImage(img.src);
        };

        img.addEventListener('click', openPosterModal);
        img.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openPosterModal();
            }
        });
    });
}
    
    // Configuration des contrôles du modal
    closeBtn.addEventListener('click', hideModal);
    
    prevBtn.addEventListener('click', () => {
        if (inGalleryMode) {
            currentIndex = (currentIndex - 1 + currentImages.length) % currentImages.length;
            showImage();
        }
    });
    
    nextBtn.addEventListener('click', () => {
        if (inGalleryMode) {
            currentIndex = (currentIndex + 1) % currentImages.length;
            showImage();
        }
    });
    
    // Fermer le modal en cliquant en dehors du contenu principal
    galleryModal.addEventListener('click', (e) => {
        if (e.target === galleryModal || e.target === modalContent) {
            hideModal();
        }
    });
    
    // Navigation au clavier
    document.addEventListener('keydown', (e) => {
        if (galleryModal.classList.contains('hidden')) return;
        
        if (e.key === 'Escape') {
            if (infoPanel && !infoPanel.hidden) {
                closeInfoPanel();
            } else {
                hideModal();
            }
        } else if (e.key === 'ArrowLeft' && inGalleryMode) {
            currentIndex = (currentIndex - 1 + currentImages.length) % currentImages.length;
            showImage();
        } else if (e.key === 'ArrowRight' && inGalleryMode) {
            currentIndex = (currentIndex + 1) % currentImages.length;
            showImage();
        }
    });
}

// Fonctions utilitaires pour la galerie
function showImage() {
    if (!Array.isArray(currentImages) || currentImages.length === 0) {
        hideModal();
        return;
    }

    modalImage.src = currentImages[currentIndex];
    
    if (inGalleryMode) {
        prevBtn.style.display = 'block';
        nextBtn.style.display = 'block';
        
        const imageCounter = document.getElementById('image-counter');
        if (imageCounter) {
            imageCounter.textContent = `${currentIndex + 1}/${currentImages.length}`;
            imageCounter.classList.remove('hidden');
        }
    }
    
    modalImage.onload = () => {
        const brightness = getImageBrightness(modalImage);
        galleryModal.classList.toggle('light-image', brightness > 128);
        galleryModal.classList.toggle('dark-image', brightness <= 128);
    };
}

function showPosterImage(src) {
    modalImage.src = src;
    prevBtn.style.display = 'none';
    nextBtn.style.display = 'none';
    
    const imageCounter = document.getElementById('image-counter');
    if (imageCounter) {
        imageCounter.classList.add('hidden');
    }
    
    showModal();
}

function showModal() {
    if (!galleryModal.hasAttribute('role')) {
        galleryModal.setAttribute('role', 'dialog');
    }
    galleryModal.setAttribute('aria-modal', 'true');

    if (infoPanel) {
        closeInfoPanel(true);
    }

    lastFocusedElement = document.activeElement;
    galleryModal.classList.remove('hidden');
    galleryModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    document.body.classList.add('modal-open');
    if (closeBtn) {
        closeBtn.focus();
    }
}

function hideModal() {
    closeInfoPanel();
    galleryModal.classList.add('hidden');
    galleryModal.style.display = 'none';
    document.body.style.overflow = '';
    document.body.classList.remove('modal-open');
    if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
        lastFocusedElement.focus();
        lastFocusedElement = null;
    }
}

// Fonction pour obtenir la luminosité d'une image
function getImageBrightness(img) {
    if (typeof window !== 'undefined' && window.location && window.location.protocol === 'file:') {
        return 128;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        return 128;
    }

    canvas.width = document.body.clientWidth < 600 ? 5 : 10;
    canvas.height = canvas.width;

    try {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        let total = 0;

        for (let i = 0; i < pixels.length; i += 4) {
            // Luminance perceptuelle
            const r = pixels[i];
            const g = pixels[i + 1];
            const b = pixels[i + 2];
            total += 0.299 * r + 0.587 * g + 0.114 * b;
        }

        return total / (pixels.length / 4);
    } catch (error) {
        console.warn('Impossible de calculer la luminosité de l’image :', error);
        return 128;
    }
}

function setModalInfo(info) {
    if (!infoToggle || !infoPanel || !infoPanelTitle || !infoPanelList) {
        currentInfoData = null;
        return;
    }

    currentInfoData = info || null;

    infoPanelTitle.textContent = '';
    infoPanelTitle.hidden = true;
    infoPanelList.innerHTML = '';
    closeInfoPanel(true);

    if (!info || (!info.title && (!Array.isArray(info.details) || info.details.length === 0))) {
        infoToggle.classList.add('is-hidden');
        infoToggle.setAttribute('aria-hidden', 'true');
        infoToggle.setAttribute('aria-expanded', 'false');
        return;
    }

    infoToggle.classList.remove('is-hidden');
    infoToggle.setAttribute('aria-hidden', 'false');
    infoToggle.setAttribute('aria-expanded', 'false');
    infoToggle.setAttribute('aria-label', 'Afficher les informations de l’œuvre');

    if (info.title) {
        infoPanelTitle.textContent = info.title;
        infoPanelTitle.hidden = false;
    }

    if (Array.isArray(info.details)) {
        info.details.forEach((detail) => {
            if (!detail || !detail.label || !detail.value) return;

            const listItem = document.createElement('li');
            listItem.classList.add('info-panel-detail');

            const labelSpan = document.createElement('span');
            labelSpan.classList.add('detail-label');
            labelSpan.textContent = detail.label;

            const valueSpan = document.createElement('span');
            valueSpan.classList.add('detail-value');

            const segments = String(detail.value).split('\n');
            segments.forEach((segment, index) => {
                if (index > 0) {
                    valueSpan.appendChild(document.createElement('br'));
                }
                if (segment) {
                    valueSpan.appendChild(document.createTextNode(segment));
                }
            });

            listItem.appendChild(labelSpan);
            listItem.appendChild(valueSpan);
            infoPanelList.appendChild(listItem);
        });
    }
}

function openInfoPanel() {
    if (!infoPanel || !infoToggle || !currentInfoData) return;
    infoPanel.hidden = false;
    infoPanel.setAttribute('aria-hidden', 'false');
    infoToggle.setAttribute('aria-expanded', 'true');
    infoToggle.setAttribute('aria-label', 'Masquer les informations de l’œuvre');
    if (typeof infoPanel.focus === 'function') {
        infoPanel.focus();
    }
}

function closeInfoPanel(skipLabelReset = false) {
    if (!infoPanel) return;
    infoPanel.hidden = true;
    infoPanel.setAttribute('aria-hidden', 'true');
    if (!skipLabelReset && infoToggle) {
        infoToggle.setAttribute('aria-expanded', 'false');
        infoToggle.setAttribute('aria-label', 'Afficher les informations de l’œuvre');
    }
}

function buildInfoFromDrawingItem(item) {
    if (!item) return null;
    const titleElement = item.querySelector('.gallery-title');
    const infoTitle = titleElement ? normalizeText(titleElement.textContent) : '';
    const details = collectDatasetDetails(item, ['category']);
    return buildInfoPayload(infoTitle, details);
}

function buildInfoFromPosterItem(posterItem, imageElement) {
    const details = collectDatasetDetails(posterItem, ['category', 'title', 'src', 'meta', 'description']);

    const titleSources = [
        posterItem?.dataset?.title,
        posterItem?.querySelector('.poster-info .poster-title')?.textContent,
        imageElement?.alt
    ].map((value) => normalizeText(value)).filter(Boolean);

    const infoTitle = titleSources.length > 0 ? titleSources[0] : '';

    const metaAdded = addDetail(
        details,
        'Lieu / Date',
        posterItem?.dataset?.meta || posterItem?.querySelector('.poster-info .poster-meta')?.textContent
    );

    addDetail(
        details,
        'Notes',
        posterItem?.dataset?.notes,
        { preserveLineBreaks: true }
    );

    if (!metaAdded) {
        const fallbackMeta = normalizeText(posterItem?.querySelector('.poster-info .poster-meta')?.textContent);
        addDetail(details, 'Lieu / Date', fallbackMeta);
    }

    return buildInfoPayload(infoTitle, details);
}

function collectDatasetDetails(element, excludedKeys = []) {
    if (!element) return [];
    const details = [];
    const datasetEntries = Object.entries(element.dataset || {});

    datasetEntries.forEach(([key, value]) => {
        if (!value || excludedKeys.includes(key)) return;
        const label = formatDetailLabel(key);
        const preserveLineBreaks = ['description', 'notes', 'texte', 'resume'].includes(key);
        addDetail(details, label, value, { preserveLineBreaks });
    });

    return details;
}

function formatDetailLabel(key) {
    if (DETAIL_LABEL_OVERRIDES[key]) {
        return DETAIL_LABEL_OVERRIDES[key];
    }

    return key
        .replace(/([A-Z])/g, ' $1')
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

function addDetail(details, label, value, options = {}) {
    const normalizedLabel = label ? label.trim() : '';
    const normalizedValue = normalizeText(value, options);
    if (!normalizedLabel || !normalizedValue) return false;

    const exists = details.some((detail) => detail.label === normalizedLabel && detail.value === normalizedValue);
    if (exists) return false;

    details.push({ label: normalizedLabel, value: normalizedValue });
    return true;
}

function buildInfoPayload(title, detailItems) {
    const normalizedTitle = normalizeText(title);
    const filteredDetails = Array.isArray(detailItems) ? detailItems.filter((detail) => detail && detail.value) : [];

    if (!normalizedTitle && filteredDetails.length === 0) {
        return null;
    }

    return {
        title: normalizedTitle,
        details: filteredDetails
    };
}

function normalizeText(value, options = {}) {
    if (value === undefined || value === null) return '';

    const { preserveLineBreaks = false } = options;
    let text = String(value);

    if (!preserveLineBreaks) {
        return text.replace(/\s+/g, ' ').trim();
    }

    text = text.replace(/\r\n/g, '\n');

    const cleanedLines = [];
    text.split('\n').forEach((line) => {
        const cleanedLine = line.replace(/\s+/g, ' ').trim();
        if (cleanedLine) {
            cleanedLines.push(cleanedLine);
        } else if (cleanedLines.length && cleanedLines[cleanedLines.length - 1] !== '') {
            cleanedLines.push('');
        }
    });

    while (cleanedLines.length && cleanedLines[cleanedLines.length - 1] === '') {
        cleanedLines.pop();
    }

    return cleanedLines.join('\n');
}

// Fonction pour obtenir les images d'une catégorie
function getImagesForCategory(category) {
    const base = 'assets/images/';
    const galleries = {
        'gal01': ['dessins/gal01/gal01_01.webp', 'dessins/gal01/gal01_02.webp', 'dessins/gal01/gal01_03.webp', 'dessins/gal01/gal01_04.webp', 'dessins/gal01/gal01_05.webp'],
        'gal02': ['dessins/gal02/gal02_01.webp', 'dessins/gal02/gal02_02.webp', 'dessins/gal02/gal02_03.webp', 'dessins/gal02/gal02_04.webp', 'dessins/gal02/gal02_05.webp', 'dessins/gal02/gal02_06.webp', 'dessins/gal02/gal02_07.webp', 'dessins/gal02/gal02_08.webp', 'dessins/gal02/gal02_09.webp', 'dessins/gal02/gal02_10.webp'],
        'gal03': ['dessins/gal03/gal03_01.webp', 'dessins/gal03/gal03_02.webp', 'dessins/gal03/gal03_03.webp', 'dessins/gal03/gal03_04.webp', 'dessins/gal03/gal03_05.webp', 'dessins/gal03/gal03_06.webp', 'dessins/gal03/gal03_07.webp'],
        'gal04': ['dessins/gal04/gal04_01.webp', 'dessins/gal04/gal04_02.webp', 'dessins/gal04/gal04_03.webp', 'dessins/gal04/gal04_04.webp', 'dessins/gal04/gal04_05.webp', 'dessins/gal04/gal04_06.webp'],
        'gal05': ['dessins/gal05/gal05_01.webp', 'dessins/gal05/gal05_02.webp', 'dessins/gal05/gal05_03.webp', 'dessins/gal05/gal05_04.webp', 'dessins/gal05/gal05_05.webp', 'dessins/gal05/gal05_06.webp', 'dessins/gal05/gal05_07.webp', 'dessins/gal05/gal05_08.webp', 'dessins/gal05/gal05_09.webp', 'dessins/gal05/gal05_10.webp', 'dessins/gal05/gal05_11.webp', 'dessins/gal05/gal05_12.webp'],
        'gal06': ['dessins/gal06/gal06_01.webp', 'dessins/gal06/gal06_02.webp', 'dessins/gal06/gal06_03.webp', 'dessins/gal06/gal06_04.webp', 'dessins/gal06/gal06_05.webp', 'dessins/gal06/gal06_06.webp', 'dessins/gal06/gal06_07.webp'],
        'gal07': ['dessins/gal07/gal07_01.webp', 'dessins/gal07/gal07_02.webp', 'dessins/gal07/gal07_03.webp', 'dessins/gal07/gal07_04.webp'],
        'gal08': ['dessins/gal08/gal08_01.webp', 'dessins/gal08/gal08_02.webp', 'dessins/gal08/gal08_03.webp', 'dessins/gal08/gal08_04.webp'],

        'book01': ['livres/livre01/livre01_01.webp', 'livres/livre01/livre01_02.webp', 'livres/livre01/livre01_03.webp', 'livres/livre01/livre01_04.webp'],
        'book02': ['livres/livre02/livre02_01.webp', 'livres/livre02/livre02_02.webp', 'livres/livre02/livre02_03.webp'],
        'book03': ['livres/livre03/livre03_01.webp', 'livres/livre03/livre03_02.webp', 'livres/livre03/livre03_03.webp']
    };
    return (galleries[category] || []).map(filename => base + filename);
}
