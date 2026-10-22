// MK Group Solution - scripts du site
document.addEventListener('DOMContentLoaded', () => {
  // Menu mobile
  const burger = document.querySelector('.burger'), menu = document.querySelector('.menu');
  burger && burger.addEventListener('click', () => menu.classList.toggle('open'));
  document.querySelectorAll('.has-sub > button').forEach(b =>
    b.addEventListener('click', () => b.parentElement.classList.toggle('open')));

  // Lien actif
  const here = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.menu a').forEach(a => { if (a.getAttribute('href') === here) a.classList.add('active'); });

  // Images manquantes (pas encore téléchargées) : on les masque proprement
  document.querySelectorAll('img[data-optional]').forEach(img => {
    img.addEventListener('error', () => img.remove());
    if (img.complete && img.naturalWidth === 0) img.remove();
  });

  // Lightbox : toutes les images avec data-lb="groupe"
  const lb = document.createElement('div');
  lb.className = 'lb';
  lb.innerHTML = '<button class="x" aria-label="Fermer"><i class="fa-solid fa-xmark"></i></button><button class="pv" aria-label="Précédente"><i class="fa-solid fa-chevron-left"></i></button><img alt=""><button class="nx" aria-label="Suivante"><i class="fa-solid fa-chevron-right"></i></button>';
  document.body.appendChild(lb);
  const lbImg = lb.querySelector('img');
  let list = [], idx = 0;
  const show = () => { lbImg.src = list[idx].dataset.full || list[idx].src; };
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-lb]');
    if (!t) return;
    const img = t.tagName === 'IMG' ? t : t.querySelector('img');
    if (!img) return;
    list = [...document.querySelectorAll(`[data-lb="${t.dataset.lb}"]`)]
      .map(el => el.tagName === 'IMG' ? el : el.querySelector('img'))
      .filter(i => i && i.isConnected && !i.closest('.hide'));
    idx = Math.max(0, list.indexOf(img)); show(); lb.classList.add('open');
  });
  const move = d => { idx = (idx + d + list.length) % list.length; show(); };
  lb.querySelector('.pv').onclick = e => { e.stopPropagation(); move(-1); };
  lb.querySelector('.nx').onclick = e => { e.stopPropagation(); move(1); };
  lb.querySelector('.x').onclick = () => lb.classList.remove('open');
  lb.addEventListener('click', e => { if (e.target === lb) lb.classList.remove('open'); });
  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') lb.classList.remove('open');
    if (e.key === 'ArrowLeft') move(-1);
    if (e.key === 'ArrowRight') move(1);
  });

  // Comparateur avant / après
  document.querySelectorAll('.compare').forEach(c => {
    const r = c.querySelector('input'), after = c.querySelector('.after'), h = c.querySelector('.handle');
    const set = v => { after.style.clipPath = `inset(0 0 0 ${v}%)`; h.style.left = v + '%'; };
    r.addEventListener('input', () => set(r.value)); set(r.value);
  });

  // Compteurs animés
  const counters = document.querySelectorAll('[data-count]');
  const io = new IntersectionObserver(entries => entries.forEach(en => {
    if (!en.isIntersecting) return;
    const el = en.target, end = +el.dataset.count, suf = el.dataset.suffix || '';
    let start = null;
    const step = ts => { start ??= ts; const p = Math.min((ts - start) / 1500, 1);
      el.textContent = Math.round(end * p) + suf; if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step); io.unobserve(el);
  }), { threshold: .4 });
  counters.forEach(c => io.observe(c));

  // Filtres du portfolio (Travaux)
  const items = [...document.querySelectorAll('.pitem')];
  const moreBtn = document.querySelector('.more button');
  let cat = '*', limit = 8;
  const render = () => {
    let shown = 0;
    items.forEach(it => {
      const ok = cat === '*' || it.dataset.cat === cat;
      const vis = ok && shown < limit; if (vis) shown++;
      it.classList.toggle('hide', !vis);
    });
    if (moreBtn) moreBtn.parentElement.style.display =
      items.filter(it => cat === '*' || it.dataset.cat === cat).length > limit ? '' : 'none';
  };
  document.querySelectorAll('.filters button').forEach(b => b.addEventListener('click', () => {
    document.querySelectorAll('.filters button').forEach(x => x.classList.remove('on'));
    b.classList.add('on'); cat = b.dataset.filter; limit = 8; render();
  }));
  moreBtn && moreBtn.addEventListener('click', () => { limit += 8; render(); });
  if (items.length) render();

  // Formulaire de contact (envoi par e-mail via FormSubmit)
  const form = document.querySelector('#contact-form');
  form && form.addEventListener('submit', async e => {
    e.preventDefault();
    const msg = form.querySelector('.form-msg'), btn = form.querySelector('button[type=submit]');
    btn.disabled = true; btn.textContent = 'Envoi en cours...';
    try {
      const res = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
      if (!res.ok) throw 0;
      msg.style.cssText = 'display:block;background:#2e7d32;color:#fff';
      msg.textContent = 'Merci ! Votre message a bien été envoyé. Nous vous répondrons rapidement.';
      form.reset();
    } catch {
      msg.style.cssText = 'display:block;background:#c62828;color:#fff';
      msg.textContent = "Erreur d'envoi. Appelez-nous au +212 663 389 070 ou écrivez à contact@mkgroupsolution.ma.";
    }
    btn.disabled = false; btn.textContent = 'Envoyer le Message';
  });
});
