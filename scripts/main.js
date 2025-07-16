// Menu toggle pour mobile
document.addEventListener('DOMContentLoaded', function () {
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

//scripts modal gallerie images
const galleryModal = document.getElementById('gallery-modal');
const modalImage = document.getElementById('modal-image');
const closeBtn = document.querySelector('.close-btn');
const prevBtn = document.querySelector('.prev-btn');
const nextBtn = document.querySelector('.next-btn');

let currentImages = [];
let currentIndex = 0;

document.querySelectorAll('.drawing-item').forEach((item, index) => {
item.addEventListener('click', () => {
    const category = item.getAttribute('data-category');
    currentImages = getImagesForCategory(category);
    currentIndex = 0;
    showImage();
    galleryModal.classList.remove('hidden');
    document.body.classList.add('modal-open');
});
});

closeBtn.addEventListener('click', () => {
galleryModal.classList.add('hidden');
document.body.classList.remove('modal-open');
});

prevBtn.addEventListener('click', () => {
currentIndex = (currentIndex - 1 + currentImages.length) % currentImages.length;
showImage();
});

nextBtn.addEventListener('click', () => {
currentIndex = (currentIndex + 1) % currentImages.length;
showImage();
});

function showImage() {
    modalImage.src = currentImages[currentIndex];
    modalImage.onload = () => {
        const brightness = getImageBrightness(modalImage);
        galleryModal.classList.toggle('light-image', brightness > 128);
        galleryModal.classList.toggle('dark-image', brightness <= 128);
  };
}

function getImageBrightness(img) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = canvas.height = 10;

  ctx.drawImage(img, 0, 0, 10, 10);

  const pixels = ctx.getImageData(0, 0, 10, 10).data;
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

function getImagesForCategory(category) {
const base = 'assets/images/';
const galleries = {
    'cat1': ['img001.webp', 'img002.webp', 'img003.webp', 'img004.webp', 'img005.webp', 'img006.webp', 'img007.webp'],
    'cat2': ['img008.webp', 'img009.webp', 'img010.webp', 'img011.webp', 'img012.webp', 'img013.webp', 'img014.webp'],
    'cat3': ['img015.webp', 'img016.webp']
};
return (galleries[category] || []).map(filename => base + filename);
}

document.addEventListener('keydown', (e) => {
  if (galleryModal.classList.contains('hidden')) return;

  if (e.key === 'ArrowRight') {
    currentIndex = (currentIndex + 1) % currentImages.length;
    showImage();
  } else if (e.key === 'ArrowLeft') {
    currentIndex = (currentIndex - 1 + currentImages.length) % currentImages.length;
    showImage();
  } else if (e.key === 'Escape') {
    galleryModal.classList.add('hidden');
    document.body.classList.remove('modal-open');
  }
});

galleryModal.addEventListener('click', (e) => {
  if (e.target === galleryModal) {
    galleryModal.classList.add('hidden');
    document.body.classList.remove('modal-open');
  }
});