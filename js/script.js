// Eainan Salsabila — Portfolio interactions
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Year
  $('#year').textContent = new Date().getFullYear();

  // ---------- Theme ----------
  const root = document.documentElement;
  try {
    const saved = localStorage.getItem('theme');
    if (saved) root.dataset.theme = saved;
  } catch (e) { /* storage unavailable */ }
  $('#themeToggle').addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'light' ? 'dark' : 'light';
    try { localStorage.setItem('theme', root.dataset.theme); } catch (e) {}
  });

  // ---------- Mobile menu ----------
  const burger = $('#burger'), navLinks = $('#navLinks');
  burger.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    burger.setAttribute('aria-expanded', open);
  });
  $$('#navLinks a').forEach(a => a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    burger.setAttribute('aria-expanded', false);
  }));

  // ---------- Scroll: nav state, progress, active link ----------
  const navWrap = $('.nav-wrap'), progress = $('.scroll-progress');
  const sections = $$('main section[id]');
  const onScroll = () => {
    const y = window.scrollY;
    navWrap.classList.toggle('scrolled', y > 30);
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
    let current = '';
    sections.forEach(s => { if (y >= s.offsetTop - 140) current = s.id; });
    $$('#navLinks a').forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + current));
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---------- Typing effect ----------
  const roles = [
    'Computer Scientist',
    'AI & Machine Learning Builder',
    'Data & BI Engineer',
    'Mobile App Developer',
    'Creative Technologist',
    'Leader & Public Speaker'
  ];
  const typed = $('#typed');
  if (!reduceMotion) {
    let r = 0, c = roles[0].length, deleting = true;
    const tick = () => {
      const word = roles[r];
      typed.textContent = word.slice(0, c);
      let delay = deleting ? 40 : 85;
      if (deleting) {
        c--;
        if (c < 0) { deleting = false; r = (r + 1) % roles.length; c = 0; delay = 300; }
      } else {
        c++;
        if (c > roles[r].length) { deleting = true; c = roles[r].length; delay = 1900; }
      }
      setTimeout(tick, delay);
    };
    setTimeout(tick, 2200);
  }

  // ---------- Reveal on scroll ----------
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal').forEach((el, i) => {
    // small stagger for siblings in grids
    const sibIndex = [...el.parentElement.children].indexOf(el);
    el.style.transitionDelay = Math.min(sibIndex, 6) * 70 + 'ms';
    io.observe(el);
  });

  // ---------- Count-up stats ----------
  const countIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target, target = parseFloat(el.dataset.count);
      const dec = parseInt(el.dataset.decimals || '0', 10), suf = el.dataset.suffix || '';
      const dur = 1600, start = performance.now();
      const step = now => {
        const p = Math.min((now - start) / dur, 1), eased = 1 - Math.pow(1 - p, 3);
        el.textContent = (target * eased).toFixed(dec) + suf;
        if (p < 1) requestAnimationFrame(step);
      };
      reduceMotion ? (el.textContent = target.toFixed(dec) + suf) : requestAnimationFrame(step);
      countIO.unobserve(el);
    });
  }, { threshold: 0.5 });
  $$('[data-count]').forEach(el => countIO.observe(el));

  // ---------- Project filter ----------
  $$('.filter').forEach(btn => btn.addEventListener('click', () => {
    $$('.filter').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const f = btn.dataset.filter;
    $$('.project').forEach(p => {
      const show = f === 'all' || p.dataset.cat.split(' ').includes(f);
      p.classList.toggle('hide', !show);
      if (show) p.classList.add('in');
    });
  }));

  // ---------- Card spotlight + tilt ----------
  const finePointer = window.matchMedia('(pointer: fine)').matches;
  if (finePointer && !reduceMotion) {
    $$('.project').forEach(card => {
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const x = e.clientX - r.left, y = e.clientY - r.top;
        card.style.setProperty('--mx', x + 'px');
        card.style.setProperty('--my', y + 'px');
        const rx = ((y / r.height) - .5) * -6, ry = ((x / r.width) - .5) * 6;
        card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
      });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });

    // Cursor glow
    const glow = $('.cursor-glow');
    addEventListener('mousemove', e => {
      glow.style.left = e.clientX + 'px';
      glow.style.top = e.clientY + 'px';
    }, { passive: true });
  }

  // ---------- Contact form (Formspree, AJAX) ----------
  const form = $('#contactForm'), status = $('#formStatus');
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = form.querySelector('button');
    btn.disabled = true;
    status.className = 'form-status';
    status.textContent = 'Sending…';
    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      });
      if (!res.ok) throw new Error();
      form.reset();
      status.classList.add('ok');
      status.textContent = 'Thank you! Your message is on its way 💜';
    } catch {
      status.classList.add('err');
      status.textContent = 'Oops, something went wrong. Please email me directly.';
    } finally {
      btn.disabled = false;
    }
  });
})();
