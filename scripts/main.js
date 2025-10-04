// Initialisation principale du document
document.addEventListener('DOMContentLoaded', function () {
    // ============ NAVIGATION MOBILE ============
    initializeMobileNavigation();

    // ============ SECTIONS PLIABLES/DÉPLIABLES ============
    initializeCollapsibleSections();

    // ============ SYSTÈME DE GALERIE UNIFIÉ ============
    initializeGallerySystem();
});

// =============== NAVIGATION ===============
function initializeMobileNavigation() {
    // Créer le bouton de menu pour mobile
    const menuToggle = document.createElement('div');
    menuToggle.className = 'menu-toggle';
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

    menuToggle.addEventListener('click', function () {
        sidebar.classList.toggle('active');
    });

    // Fermer le menu lorsqu'on clique sur un lien
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        link.addEventListener('click', function () {
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('active');
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
    
    // Gestion du bouton pour la section À propos
    const showMoreAboutBtn = document.getElementById('showMoreAbout');
    const aboutText = document.querySelector('.about-text');
    const hiddenAboutText = document.querySelector('.hidden-about-text');
    
    // Initialisation des éléments cachés
    if (hiddenAboutText) {
        hiddenAboutText.style.maxHeight = '0px';
        hiddenAboutText.style.opacity = '0';
        hiddenAboutText.style.overflow = 'hidden';
        hiddenAboutText.style.display = 'block';
    }
    
    if (showMoreAboutBtn && aboutText) {
        showMoreAboutBtn.addEventListener('click', function() {
            const isExpanded = aboutText.classList.contains('show-all-about');
            animateToggleSection(isExpanded, hiddenAboutText, aboutText, showMoreAboutBtn, 'show-all-about');
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

let currentImages = [];
let currentIndex = 0;
let inGalleryMode = true;

function initializeGallerySystem() {
    // Vérifier que les éléments existent avant de les utiliser
    if (!galleryModal || !modalImage || !closeBtn || !prevBtn || !nextBtn) {
        console.warn('Éléments de galerie manquants dans le DOM');
        return;
    }
    
    // Configuration des handlers pour les dessins avec catégories
    document.querySelectorAll('.drawing-item').forEach((item) => {
        item.addEventListener('click', () => {
            const category = item.getAttribute('data-category');
            currentImages = getImagesForCategory(category);
            currentIndex = 0;
            inGalleryMode = true;
            
            showImage();
            showModal();
        });
    });
    
    // Configuration des handlers pour les affiches d'exposition (sans navigation)
    document.querySelectorAll('.poster-item img').forEach((img) => {
        img.addEventListener('click', () => {
            inGalleryMode = false;
            showPosterImage(img.src);
        });
    });
    
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
    
    // Fermer le modal en cliquant en dehors de l'image
    galleryModal.addEventListener('click', (e) => {
        if (e.target === galleryModal) {
            hideModal();
        }
    });
    
    // Navigation au clavier
    document.addEventListener('keydown', (e) => {
        if (galleryModal.classList.contains('hidden')) return;
        
        if (e.key === 'Escape') {
            hideModal();
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
    galleryModal.classList.remove('hidden');
    galleryModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    document.body.classList.add('modal-open');
}

function hideModal() {
    galleryModal.classList.add('hidden');
    galleryModal.style.display = 'none';
    document.body.style.overflow = '';
    document.body.classList.remove('modal-open');
}

// Fonction pour obtenir la luminosité d'une image
function getImageBrightness(img) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = document.body.clientWidth < 600 ? 5 : 10;
    canvas.height = canvas.width;

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