// ── Chargement bandeau recherche ────────────────────────────────
async function loadBandeauRecherche() {
    const res = await fetch('data/recherche-bandeau.json');
    const { items } = await res.json();
    const container = document.getElementById('marquee-content-recherche');
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

// ── Chargement parcours ──────────────────────────────────────────
async function loadParcours() {
    const [diplomes, distinctions, experience] = await Promise.all([
        fetch('data/recherche-diplomes.json').then(r => r.json()),
        fetch('data/recherche-distinctions.json').then(r => r.json()),
        fetch('data/recherche-experience.json').then(r => r.json())
    ]);

    const diplomesContainer = document.getElementById('parcours-diplomes');
    if (diplomesContainer) {
        diplomesContainer.innerHTML = diplomes.items.map(d => `
            <li><span class="parcours-year">${d.annee}</span> ${d.intitule}</li>
        `).join('');
    }

    const distinctionsContainer = document.getElementById('parcours-distinctions');
    if (distinctionsContainer) {
        distinctionsContainer.innerHTML = distinctions.items.map(d => `
            <li><span class="parcours-year">${d.annee}</span> ${d.intitule}</li>
        `).join('');
    }

    const experienceContainer = document.getElementById('parcours-experience');
    if (experienceContainer) {
        experienceContainer.innerHTML = experience.items.map(e => `
            <li>
                <span class="parcours-year">${e.annee}</span>
                ${e.intitule}${e.etablissement ? ` – ${e.etablissement}` : ''}
            </li>
        `).join('');
    }
}

// ── Chargement publications ──────────────────────────────────────
async function loadPublications() {
    const [ouvrages, articles, entretiens, focus, catalogues] = await Promise.all([
        fetch('data/recherche-ouvrages.json').then(r => r.json()),
        fetch('data/recherche-articles.json').then(r => r.json()),
        fetch('data/recherche-entretiens.json').then(r => r.json()),
        fetch('data/recherche-focus.json').then(r => r.json()),
        fetch('data/recherche-catalogues.json').then(r => r.json())
    ]);

    function renderPublicationItem(item) {
        const titre = item.url
            ? `<a href="${item.url}" target="_blank" rel="noopener noreferrer" class="publication-title">${item.titre}</a>`
            : `<span class="publication-title">${item.titre}</span>`;

        const metas = [];
        if (item.revue) metas.push(`<span class="publication-meta"><em>${item.revue}</em></span>`);
        if (item.editeur) metas.push(`<span class="publication-meta">${item.editeur}</span>`);
        if (item.meta) metas.push(`<span class="publication-meta">${item.meta}</span>`);

        return `
        <li>
            <span class="publication-year">${item.annee}</span>
            <div class="publication-content">
                ${titre}
                ${metas.join('')}
            </div>
        </li>`;
    }

    const ouvragesContainer = document.getElementById('publications-ouvrages');
    if (ouvragesContainer) {
        ouvragesContainer.innerHTML = ouvrages.items.map(renderPublicationItem).join('');
    }

    const articlesContainer = document.getElementById('publications-articles');
    if (articlesContainer) {
        articlesContainer.innerHTML = articles.items.map(renderPublicationItem).join('');
    }

    const entretiensContainer = document.getElementById('publications-entretiens');
    if (entretiensContainer) {
        entretiensContainer.innerHTML = entretiens.items.map(renderPublicationItem).join('');
    }

    const focusContainer = document.getElementById('publications-focus');
    if (focusContainer) {
        focusContainer.innerHTML = focus.items.map(renderPublicationItem).join('');
    }

    const cataloguesContainer = document.getElementById('publications-catalogues');
    if (cataloguesContainer) {
        cataloguesContainer.innerHTML = catalogues.items.map(renderPublicationItem).join('');
    }
}

// ── Chargement communications ────────────────────────────────────
async function loadCommunications() {
    const res = await fetch('data/recherche-communications.json');
    const { items } = await res.json();

    const container = document.getElementById('communications-list');
    if (!container) return;

    container.innerHTML = items.map(item => {
        const texte = item.url
            ? item.texte.replace(
                /^(«[^»]+»|"[^"]+"|[^,]+)/,
                match => `<a href="${item.url}" target="_blank" rel="noopener">${match}</a>`
              )
            : item.texte;
        return `
        <li>
            <span class="publication-year">${item.annee}</span>
            <span class="communication-text"> ${texte}</span>
        </li>`;
    }).join('');
}

// ── Chargement À propos recherche ────────────────────────────────
async function loadAProposRecherche() {
    const res = await fetch('data/recherche-apropos.json');
    const data = await res.json();

    const container = document.getElementById('about-content-recherche');
    if (!container) return;

    container.innerHTML = `
        <div class="about-image">
            <img src="${data.portrait}" alt="Portrait de Vincent Lecomte" />
        </div>
        <div class="about-text">
            ${data.paragraphes.map(p => `<p>${p}</p>`).join('')}
        </div>
    `;
}

// ── Initialisation ───────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async function () {
    await loadBandeauRecherche();
    await loadParcours();
    await loadPublications();
    await loadCommunications();
    await loadAProposRecherche();
    initMobileNavRecherche();
});

// ── Navigation mobile ────────────────────────────────────────────
function initMobileNavRecherche() {
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
    if (!sidebar) return;

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

    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        link.addEventListener('click', function () {
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
            }
        });
    });

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({ top: targetElement.offsetTop, behavior: 'smooth' });
            }
        });
    });
}
