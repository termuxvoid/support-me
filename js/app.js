/* ============================================
   TermuxVoid — Support Page
   Live stats, QR wallets, copy-to-clipboard.
   ============================================ */

const Support = (() => {
  const PACKAGES_URL =
    'https://raw.githubusercontent.com/termuxvoid/repo/refs/heads/gh-pages/dists/termuxvoid/main/binary-all/Packages';
  const REPO_API = 'https://api.github.com/repos/termuxvoid/repo';
  const CACHE_KEY_STARS = 'termuxvoid_stars';
  const CACHE_TTL = 1000 * 60 * 30; // 30 minutes

  function init() {
    setupMenuToggle();
    setupScrollChrome();
    setupReveal();
    setupCopy();
    setupQR();
    loadLiveStats();
  }

  /* --- Live stats: tool count from the Packages index --- */
  function parsePackages(text) {
    const blocks = text.split(/\n\n+/).filter((b) => b.trim());
    let count = 0;
    for (const block of blocks) {
      const name = block.split('\n').find((l) => l.startsWith('Package:')) || '';
      if (name.trim()) count++;
    }
    return count;
  }

  async function loadToolCount() {
    try {
      const res = await fetch(PACKAGES_URL);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const text = await res.text();
      const count = parsePackages(text);
      setNumber('toolCount', count);
      setNumber('toolCount2', count);

      const lastMod = res.headers.get('Last-Modified');
      const el = document.getElementById('syncStamp');
      if (el) el.textContent = lastMod ? formatStamp(lastMod) : nowStamp();
      const tools = document.getElementById('syncTools');
      if (tools) tools.textContent = count;
    } catch {
      const el = document.getElementById('syncStamp');
      if (el) el.textContent = 'UNREACHABLE — RETRY';
      const tools = document.getElementById('syncTools');
      if (tools) tools.textContent = '—';
    }
  }

  /* --- Live stats: stars / forks from the GitHub API --- */
  async function loadRepoStats() {
    let data = null;
    try {
      const cached = sessionStorage.getItem(CACHE_KEY_STARS);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Date.now() - parsed.ts < CACHE_TTL) data = parsed.data;
      }
    } catch {}

    if (!data) {
      try {
        const res = await fetch(REPO_API);
        if (!res.ok) throw new Error('HTTP ' + res.status);
        data = await res.json();
        try {
          sessionStorage.setItem(
            CACHE_KEY_STARS,
            JSON.stringify({ data, ts: Date.now() })
          );
        } catch {}
      } catch {
        data = null;
      }
    }

    if (data) {
      if (typeof data.stargazers_count === 'number') {
        setNumber('starCount', data.stargazers_count);
        setNumber('starCount2', data.stargazers_count);
      }
      if (typeof data.forks_count === 'number') {
        setNumber('forkCount2', data.forks_count);
      }
    }
  }

  async function loadLiveStats() {
    await Promise.all([loadToolCount(), loadRepoStats()]);
  }

  /* --- Set a stat number with count-up (respects reduced motion) --- */
  function setNumber(id, value) {
    const el = document.getElementById(id);
    if (!el) return;
    const reduce =
      window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !requestAnimationFrame) {
      el.textContent = value.toLocaleString('en-IN');
      return;
    }
    const start = performance.now();
    const dur = 700;
    const step = (t) => {
      const p = Math.min((t - start) / dur, 1);
      el.textContent = Math.round((1 - Math.pow(1 - p, 3)) * value).toLocaleString('en-IN');
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  function nowStamp() {
    return new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC';
  }

  function formatStamp(header) {
    const d = new Date(header);
    if (isNaN(d.getTime())) return nowStamp();
    return d.toISOString().replace('T', ' ').slice(0, 16) + ' UTC';
  }

  /* --- QR codes for wallet cards --- */
  function setupQR() {
    const imgs = document.querySelectorAll('.wallet__qr img[data-qr]');
    imgs.forEach((img) => {
      const addr = img.dataset.qr;
      if (!addr) return;
      try {
        if (typeof qrcode !== 'function') throw new Error('QR lib missing');
        const qr = qrcode(0, 'M');
        qr.addData(addr);
        qr.make();
        img.src = qr.createDataURL(6, 2);
      } catch {
        img.alt = 'QR unavailable';
        img.removeAttribute('src');
      }
    });
  }

  /* --- Copy wallet addresses --- */
  function setupCopy() {
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.wallet__copy');
      if (!btn) return;
      const addr = btn.dataset.address || '';
      if (!addr) return;

      const done = () => {
        const orig = btn.textContent;
        btn.textContent = 'Copied!';
        btn.classList.add('copied');
        setTimeout(() => {
          btn.textContent = orig;
          btn.classList.remove('copied');
        }, 1500);
      };

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(addr).then(done).catch(() => fallbackCopy(addr, done));
      } else {
        fallbackCopy(addr, done);
      }
    });
  }

  function fallbackCopy(text, done) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
    } catch {}
    document.body.removeChild(ta);
    done();
  }

  /* --- Menu toggle --- */
  function setupMenuToggle() {
    const btn = document.getElementById('menuBtn');
    const nav = document.getElementById('navLinks');
    if (!btn || !nav) return;
    btn.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(open));
    });
    nav.querySelectorAll('a').forEach((a) =>
      a.addEventListener('click', () => {
        nav.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      })
    );
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.masthead__inner')) {
        nav.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* --- Scroll chrome: back-to-top + scrollspy --- */
  function setupScrollChrome() {
    const btn = document.getElementById('backToTop');
    const navLinks = Array.prototype.slice.call(
      document.querySelectorAll('.masthead__nav a[href^="#"]')
    );
    const sections = navLinks
      .map((a) => document.querySelector(a.getAttribute('href')))
      .filter(Boolean);

    function onScroll() {
      const y = window.scrollY;
      if (btn) btn.classList.toggle('visible', y > 420);
      if (sections.length) {
        let current = sections[0];
        for (let i = 0; i < sections.length; i++) {
          if (sections[i].offsetTop - 160 <= y) current = sections[i];
        }
        navLinks.forEach((a, i) => a.classList.toggle('active', sections[i] === current));
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    onScroll();

    if (btn) {
      btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }
  }

  /* --- Reveal on scroll --- */
  function setupReveal() {
    const els = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    els.forEach((el) => io.observe(el));
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', Support.init);