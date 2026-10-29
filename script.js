(() => {
  const nav = document.querySelector('#navigation');
  const toggle = document.querySelector('.menu-toggle');
  const header = document.querySelector('.site-header');
  function closeMenu() {
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menu');
  }
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    nav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  });
  nav.addEventListener('click', e => { if (e.target.closest('a')) closeMenu(); });
  document.addEventListener('click', e => { if (!e.target.closest('.site-header')) closeMenu(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && nav.classList.contains('open')) { closeMenu(); toggle.focus(); }
  });
  window.addEventListener('resize', () => { if (innerWidth > 900) closeMenu(); });
  let scheduled = false;
  function headerState() { header.classList.toggle('is-scrolled', scrollY > 15); scheduled = false; }
  window.addEventListener('scroll', () => {
    if (!scheduled) { scheduled = true; requestAnimationFrame(headerState); }
  }, { passive: true });
  headerState();

  // The forms are deliberately local demonstrations: no fetch, storage or analytics.
  const dialog = document.querySelector('#demo-dialog');
  let lastSubmit;
  document.querySelectorAll('.demo-form').forEach(form => {
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      lastSubmit = event.submitter;
      form.querySelector('.form-status').textContent = 'Demonstração concluída. Nenhum dado foi enviado ou armazenado.';
      if (dialog && typeof dialog.showModal === 'function') dialog.showModal();
    });
  });
  if (dialog) {
    dialog.querySelectorAll('.dialog-close, .dialog-dismiss').forEach(button => button.addEventListener('click', () => dialog.close()));
    dialog.addEventListener('close', () => { if (lastSubmit) lastSubmit.focus(); });
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const box = dialog.getBoundingClientRect();
      if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
    });
  }

  const career = document.querySelector('#career-form');
  const params = new URLSearchParams(location.search);
  if (career) {
    const radios = career.querySelectorAll('input[name="perfil"]');
    function setProfile() {
      const checked = career.querySelector('input[name="perfil"]:checked');
      career.querySelectorAll('[data-profile]').forEach(group => {
        const active = group.dataset.profile === checked.value;
        group.hidden = !active;
        group.querySelectorAll('input, select, textarea').forEach(field => { field.disabled = !active; });
      });
    }
    if (params.get('perfil') === 'fornecedor') career.querySelector('input[value="fornecedor"]').checked = true;
    radios.forEach(radio => radio.addEventListener('change', setProfile));
    setProfile();
  }
  const topic = document.querySelector('#field-assunto');
  if (topic && [...topic.options].some(option => option.value === params.get('assunto'))) topic.value = params.get('assunto');

  // Reveal is progressive enhancement; no JavaScript means all content is visible.
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let observer;
  const revealItems = [...document.querySelectorAll('[data-reveal]')];
  const showAll = () => {
    document.documentElement.classList.remove('motion-ready');
    if (observer) observer.disconnect();
    revealItems.forEach(el => el.classList.add('visible'));
  };
  if (!motion.matches && 'IntersectionObserver' in window) {
    try {
      observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
        });
      }, { threshold: 0, rootMargin: '0px 0px -20px 0px' });
      document.querySelectorAll('[data-stagger]').forEach(group => {
        [...group.children].forEach((el, i) => el.style.setProperty('--delay', `${Math.min(i * 85, 255)}ms`));
      });
      document.documentElement.classList.add('motion-ready');
      void document.body.offsetWidth;
      revealItems.forEach(el => observer.observe(el));
      document.addEventListener('focusin', e => {
        const target = e.target.closest('[data-reveal]');
        if (target) target.classList.add('visible');
      });
      document.addEventListener('click', e => {
        const a = e.target.closest('a[href^="#"]');
        if (!a) return;
        const target = document.getElementById(a.getAttribute('href').slice(1));
        if (target) {
          target.classList.add('visible');
          target.querySelectorAll('[data-reveal]').forEach(el => el.classList.add('visible'));
        }
      });
    } catch (error) { showAll(); }
  }
  if (motion.addEventListener) motion.addEventListener('change', e => { if (e.matches) showAll(); });
})();