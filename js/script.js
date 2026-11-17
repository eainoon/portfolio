// Eainan Salsabila — Portfolio interactions
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const C = window.CONTENT;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const store = {
    get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  // ---------- Loader ----------
  const loader = $('#loader');
  const hideLoader = () => loader && loader.classList.add('done');
  if (reduceMotion) hideLoader();
  else {
    const started = performance.now();
    addEventListener('load', () => setTimeout(hideLoader, Math.max(0, 1100 - (performance.now() - started))));
    setTimeout(hideLoader, 2500); // safety net
  }

  $('#year').textContent = new Date().getFullYear();

  // ---------- Theme ----------
  const root = document.documentElement;
  const savedTheme = store.get('theme');
  if (savedTheme) root.dataset.theme = savedTheme;
  $('#themeToggle').addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'light' ? 'dark' : 'light';
    store.set('theme', root.dataset.theme);
  });

  // ---------- Language (EN / BM) ----------
  const i18nEls = $$('[data-i18n]');
  i18nEls.forEach(el => { el.dataset.en = el.innerHTML; });
  let lang = store.get('lang') === 'ms' ? 'ms' : 'en';

  const applyLang = () => {
    root.lang = lang;
    root.dataset.lang = lang;
    i18nEls.forEach(el => {
      const ms = C.ms[el.dataset.i18n];
      el.innerHTML = lang === 'ms' && ms ? ms : el.dataset.en;
    });
    restartTyping();
  };
  $('#langToggle').addEventListener('click', () => {
    lang = lang === 'en' ? 'ms' : 'en';
    store.set('lang', lang);
    applyLang();
  });

  // ---------- Mobile menu ----------
  const burger = $('#burger'), navLinks = $('#navLinks');
  const setMenu = open => { navLinks.classList.toggle('open', open); burger.setAttribute('aria-expanded', open); };
  burger.addEventListener('click', () => setMenu(!navLinks.classList.contains('open')));
  navLinks.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });

  // ---------- Scroll: nav state, progress, active link ----------
  const navWrap = $('.nav-wrap'), progress = $('.scroll-progress');
  const sections = $$('main section[id]');
  const navAnchors = $$('#navLinks a');
  const onScroll = () => {
    const y = window.scrollY;
    navWrap.classList.toggle('scrolled', y > 30);
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
    let current = '';
    sections.forEach(s => { if (y >= s.offsetTop - 140) current = s.id; });
    navAnchors.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + current));
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---------- Typing effect ----------
  const typed = $('#typed');
  let typeTimer = null;
  function restartTyping() {
    clearTimeout(typeTimer);
    const roles = C.roles[lang];
    typed.textContent = roles[0];
    if (reduceMotion) return;
    let r = 0, c = roles[0].length, deleting = true;
    const tick = () => {
      typed.textContent = roles[r].slice(0, c);
      let delay = deleting ? 40 : 85;
      if (deleting) {
        c--;
        if (c < 0) { deleting = false; r = (r + 1) % roles.length; c = 0; delay = 300; }
      } else {
        c++;
        if (c > roles[r].length) { deleting = true; c = roles[r].length; delay = 1900; }
      }
      typeTimer = setTimeout(tick, delay);
    };
    typeTimer = setTimeout(tick, 2200);
  }

  // ---------- Reveal on scroll ----------
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal').forEach(el => {
    const sibIndex = [...el.parentElement.children].indexOf(el);
    el.style.transitionDelay = Math.min(sibIndex, 6) * 70 + 'ms';
    io.observe(el);
  });

  // ---------- Count-up stats ----------
  const langCount = $('#langCount'), langChips = $$('#langChips li');
  if (langCount && langChips.length) langCount.dataset.count = langChips.length;
  const countIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target, target = parseFloat(el.dataset.count);
      const dec = parseInt(el.dataset.decimals || '0', 10), suf = el.dataset.suffix || '';
      const finish = () => { el.textContent = target.toFixed(dec) + suf; };
      if (reduceMotion) finish();
      else {
        const dur = 1600, start = performance.now();
        const step = now => {
          const p = Math.min((now - start) / dur, 1), eased = 1 - Math.pow(1 - p, 3);
          el.textContent = (target * eased).toFixed(dec) + suf;
          if (p < 1) requestAnimationFrame(step); else finish();
        };
        requestAnimationFrame(step);
      }
      countIO.unobserve(el);
    });
  }, { threshold: 0.5 });
  $$('[data-count]').forEach(el => countIO.observe(el));

  // ---------- Project filter ----------
  const filters = $$('.filter');
  filters.forEach(btn => btn.addEventListener('click', () => {
    filters.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-pressed', 'false'); });
    btn.classList.add('active');
    btn.setAttribute('aria-pressed', 'true');
    const f = btn.dataset.filter;
    $$('.project').forEach(p => {
      const show = f === 'all' || p.dataset.cat.split(' ').includes(f);
      p.classList.toggle('hide', !show);
      if (show) p.classList.add('in');
    });
  }));

  // ---------- Project modal ----------
  const modal = $('#projectModal');
  const esc = s => String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
  const openProject = id => {
    const p = C.projects[id];
    if (!p) return;
    const t = p[lang] || p.en;
    $('#mIcon').textContent = p.icon;
    $('#mKicker').textContent = t.kicker;
    $('#mTitle').textContent = t.title;
    $('#mTagline').textContent = t.tagline;
    $('#mProblem').textContent = t.problem;
    $('#mBuilt').textContent = t.built;
    $('#mHighlights').innerHTML = t.highlights.map(h => `<li>${esc(h)}</li>`).join('');
    $('#mTech').innerHTML = p.tech.map(x => `<li>${esc(x)}</li>`).join('');
    $('#mActions').innerHTML = p.link
      ? `<a class="btn btn-primary btn-sm" href="${esc(p.link)}" target="_blank" rel="noopener">${esc(C.ui[lang].viewCode)}</a>` : '';
    $('#modalClose').setAttribute('aria-label', C.ui[lang].close);
    modal.showModal();
    document.body.classList.add('modal-open');
  };
  $$('[data-project]').forEach(card => {
    card.addEventListener('click', e => { if (!e.target.closest('a')) openProject(card.dataset.project); });
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openProject(card.dataset.project); }
    });
  });
  $('#modalClose').addEventListener('click', () => modal.close());
  modal.addEventListener('click', e => { if (e.target === modal) modal.close(); }); // backdrop
  modal.addEventListener('close', () => document.body.classList.remove('modal-open'));

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
    const glow = $('.cursor-glow');
    addEventListener('mousemove', e => {
      glow.style.left = e.clientX + 'px';
      glow.style.top = e.clientY + 'px';
    }, { passive: true });
  }

  // ---------- Terminal ----------
  const out = $('#termOut'), tForm = $('#termForm'), tInput = $('#termInput'), tBody = $('#termBody');
  const link = (href, text) => `<a href="${href}" target="_blank" rel="noopener">${text}</a>`;
  const commands = {
    help: () => [
      'Available commands:',
      '  <b>whoami</b>      who is Eainan?',
      '  <b>about</b>       a short bio',
      '  <b>skills</b>      languages &amp; tools',
      '  <b>projects</b>    things I\'ve built',
      '  <b>project &lt;n&gt;</b> open project n in detail',
      '  <b>experience</b>  where I\'ve worked',
      '  <b>education</b>   where I study',
      '  <b>now</b>         what I\'m doing right now',
      '  <b>contact</b>     how to reach me',
      '  <b>resume</b>      download my résumé',
      '  <b>hire</b>        😉',
      '  <b>theme</b> · <b>lang</b> · <b>clear</b> · <b>date</b>'
    ],
    whoami: () => ['<span class="t-accent">Eainan Salsabila</span> — 21 · Computer Science undergraduate · Malaysia 🇲🇾', 'Coding since 2018 (age 13). CGPA 3.71 · Dean\'s List.'],
    about: () => ['I build AI systems, data platforms and apps with privacy and people at the centre.', 'Developer who designs. Data person who speaks on stage. Leader who has chaired teams to awards.'],
    skills: () => [
      '<span class="t-key">languages</span>  ' + langChips.map(li => li.textContent).join(', '),
      '<span class="t-key">ai/data  </span>  ML, neural networks, NLP, computer vision (YOLO/OpenCV), Random Forest, SHAP, multi-agent AI, Power BI',
      '<span class="t-key">eng      </span>  Flutter, Flask, Firebase, PostgreSQL, REST, Clean Architecture, OOAD/UML, Git'
    ],
    projects: () => Object.values(C.projects).map((p, i) => `  [${i + 1}] ${p.icon} ${p.en.title}`).concat(['Type <b>project 1</b> (or any number) to open one.']),
    experience: () => ['2025–now   Computer Science Tutor · Freelance', '2024–2025  Front Desk & Bouldering Guide · Camp5 Utropolis', '2023       Front Desk Staff · Kocek, Subang Parade'],
    education: () => ['2024–now   BSc Computer Science · Management and Science University · CGPA 3.71', '2023–2024  Physical Science · Malacca Matriculation College · CGPA 3.29', '2018–2022  Pure Science + Computer Science · SMK Tengku Ampuan Rahimah'],
    now: () => ['🛠️  Building MySecureBI, my final-year project', '🎓  Studying BSc Computer Science at MSU', '👩‍🏫  Tutoring SPM students in programming', '🔭  Exploring local, privacy-first AI'],
    contact: () => [
      'email     <a href="mailto:eainans5@gmail.com">eainans5@gmail.com</a>',
      'linkedin  ' + link('https://www.linkedin.com/in/eainan-salsabila-713628366/', 'Eainan Salsabila'),
      'github    ' + link('https://github.com/eainoon', 'eainoon'),
      'replit    ' + link('https://replit.com/@eainans07', 'eainans07')
    ],
    resume: () => { const a = document.createElement('a'); a.href = 'assets/Eainan-Salsabila-Resume.pdf'; a.download = ''; a.click(); return ['Downloading résumé… 📄']; },
    hire: () => ['<span class="t-accent">Excellent choice.</span> ✨', 'Running hire_eainan.sh ... ██████████ 100%', 'Next step: <a href="#contact">send me a message</a> or email <a href="mailto:eainans5@gmail.com">eainans5@gmail.com</a>.'],
    sudo: () => ['Nice try 😄 — but you don\'t need sudo to hire me. Type <b>hire</b>.'],
    theme: () => { $('#themeToggle').click(); return [`Theme switched to ${root.dataset.theme}.`]; },
    lang: () => { $('#langToggle').click(); return [`Site language: ${lang === 'ms' ? 'Bahasa Melayu' : 'English'}.`]; },
    date: () => [new Date().toString()],
    ls: () => ['about.txt  projects/  skills.json  resume.pdf  contact.md'],
    clear: () => { out.innerHTML = ''; return []; }
  };
  const history = []; let hIndex = 0;
  const print = (lines, cls = '') => {
    lines.forEach(l => { const d = document.createElement('div'); d.className = 'term-l ' + cls; d.innerHTML = l; out.appendChild(d); });
    tBody.scrollTop = tBody.scrollHeight;
  };
  const run = raw => {
    const input = raw.trim();
    print([`<span class="t-prompt">eainan@portfolio:~$</span> ${esc(input)}`]);
    if (!input) return;
    history.push(input); hIndex = history.length;
    const [cmd, arg] = input.toLowerCase().split(/\s+/);
    if (cmd === 'project') {
      const ids = Object.keys(C.projects), n = parseInt(arg, 10);
      if (n >= 1 && n <= ids.length) { print([`Opening ${C.projects[ids[n - 1]].en.title}…`]); openProject(ids[n - 1]); }
      else print([`Usage: project &lt;1-${ids.length}&gt;`], 't-err');
      return;
    }
    if (commands[cmd]) print(commands[cmd]());
    else print([`command not found: ${esc(cmd)} — type <b>help</b>`], 't-err');
  };
  print(['Welcome to Eainan\'s portfolio terminal 💜', 'Type <b>help</b> to see what I can do.'], 't-muted');
  tForm.addEventListener('submit', e => { e.preventDefault(); run(tInput.value); tInput.value = ''; });
  tInput.addEventListener('keydown', e => {
    if (e.key === 'ArrowUp' && history.length) { e.preventDefault(); hIndex = Math.max(0, hIndex - 1); tInput.value = history[hIndex]; }
    else if (e.key === 'ArrowDown') { e.preventDefault(); hIndex = Math.min(history.length, hIndex + 1); tInput.value = history[hIndex] || ''; }
    else if (e.key === 'Tab') {
      const match = Object.keys(commands).concat('project').find(c => c.startsWith(tInput.value.trim().toLowerCase()));
      if (match && tInput.value.trim()) { e.preventDefault(); tInput.value = match; }
    }
  });
  tBody.addEventListener('click', e => { if (!e.target.closest('a')) tInput.focus({ preventScroll: true }); });
  $$('#termSuggest button').forEach(b => b.addEventListener('click', () => run(b.dataset.cmd)));

  // ---------- Contact form (Formspree, AJAX) ----------
  const form = $('#contactForm'), status = $('#formStatus');
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = form.querySelector('button');
    btn.disabled = true;
    status.className = 'form-status';
    status.textContent = C.ui[lang].sending;
    try {
      const res = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error();
      form.reset();
      status.classList.add('ok');
      status.textContent = C.ui[lang].sent;
    } catch {
      status.classList.add('err');
      status.textContent = C.ui[lang].failed;
    } finally {
      btn.disabled = false;
    }
  });

  applyLang();
})();
