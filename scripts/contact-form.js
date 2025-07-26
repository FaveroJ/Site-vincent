document.addEventListener('DOMContentLoaded', function() {
  const contactForm = document.getElementById('contactForm');
  const successMessage = document.getElementById('successMessage');

  if (!contactForm || !successMessage) return;

  // Vérifie si l'URL contient ?success=true
  const params = new URLSearchParams(window.location.search);
  if (params.get('success') === 'true') {
    // Affiche le message de succès
    successMessage.classList.remove('hidden');

    // Vide les champs du formulaire
    contactForm.reset();

    // Scroll jusqu'au formulaire
    document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });

    // Masque le message après 5 secondes et nettoie l'URL
    setTimeout(() => {
      successMessage.classList.add('hidden');
      const url = new URL(window.location);
      url.searchParams.delete('success');
      window.history.replaceState({}, document.title, url.toString());
    }, 5000);
  }

  // Ajoute dynamiquement le champ _next pour la redirection
  contactForm.addEventListener('submit', function() {
    const redirectInput = document.createElement('input');
    redirectInput.type = 'hidden';
    redirectInput.name = '_next';
    redirectInput.value = window.location.href.split('?')[0] + '?success=true';
    contactForm.appendChild(redirectInput);
  });
});