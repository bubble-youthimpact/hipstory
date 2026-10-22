/* HIPSTORY — renders header, page content, join form and footer from js/data.js */
(function () {
  'use strict';

  var D = window.HIPSTORY;
  // Site root, worked out from this script's own URL (js/app.js → ../)
  var PREVIEW = !!window.HIPSTORY_PREVIEW;
  var ROOT = PREVIEW ? new URL('./', location.href).href : new URL('../', document.currentScript.src).href;
  var page, current;

  /* ---------- language ---------- */
  var lang = 'en';
  try { lang = localStorage.getItem('hipstory-lang') || 'en'; } catch (e) {}
  if (lang !== 'en' && lang !== 'ko') lang = 'en';
  document.documentElement.lang = lang;

  function t(v) {
    if (v == null) return '';
    if (typeof v === 'string') return v;
    return v[lang] || v.en || '';
  }
  function setLang(l) {
    try { localStorage.setItem('hipstory-lang', l); } catch (e) {}
    lang = l; document.documentElement.lang = l; boot();
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function url(path) { return /^(https?:|mailto:|tel:)/.test(path) ? path : ROOT + path; }
  function img(src, alt, cls) {
    return '<img src="' + esc(url(src)) + '" alt="' + esc(alt || '') + '"' + (cls ? ' class="' + cls + '"' : '') + ' loading="lazy">';
  }
  // paragraphs for the current language; a paragraph written in only one language shows only there
  function paras(list) {
    return list.map(function (x) { return typeof x === 'string' ? x : (x[lang] != null ? x[lang] : x.en); })
      .filter(function (x) { return x && x.trim(); });
  }
  function excerpt(text, n) {
    return text.length > n ? text.slice(0, n).replace(/\s+\S*$/, '') + '…' : text;
  }

  /* ---------- icons ---------- */
  var ICON = {
    globe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>',
    apple: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16.4 12.6c0-2.6 2.1-3.8 2.2-3.9-1.2-1.8-3.1-2-3.7-2-1.6-.2-3.1.9-3.9.9-.8 0-2-.9-3.4-.9-1.7 0-3.3 1-4.2 2.6-1.8 3.1-.5 7.7 1.3 10.2.9 1.2 1.9 2.6 3.2 2.6 1.3-.1 1.8-.8 3.3-.8 1.6 0 2 .8 3.4.8 1.4 0 2.3-1.3 3.1-2.5 1-1.4 1.4-2.8 1.4-2.9 0 0-2.7-1-2.7-4.1zM13.9 4.9c.7-.9 1.2-2 1.1-3.2-1 0-2.3.7-3 1.6-.7.8-1.2 2-1.1 3.1 1.1.1 2.3-.6 3-1.5z"/></svg>',
    play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#00d7fe" d="M3.6 1.8 13.3 12l-9.7 10.2c-.4-.2-.6-.6-.6-1.1V2.9c0-.5.2-.9.6-1.1z"/><path fill="#ffce00" d="m16.6 15.3-3.3-3.3 3.3-3.3 3.8 2.2c1 .6 1 1.6 0 2.2z"/><path fill="#ff3a44" d="M16.6 15.3 13.3 12l-9.7 10.2c.4.2.9.2 1.4-.1z"/><path fill="#00f076" d="M16.6 8.7 5 1.9c-.5-.3-1-.3-1.4-.1L13.3 12z"/></svg>'
  };

  /* ---------- shared pieces ---------- */
  var NAV = [
    ['home', ''], ['project', 'project-information/'], ['members', 'members-and-partners/'],
    ['blog', 'blog/'], ['gallery', 'gallery/']
  ];

  function brand() {
    return '<a class="brand" href="' + ROOT + '">' + img('images/logo.webp', 'HIPSTORY logo') + '<span>HIPSTORY</span></a>';
  }

  function header() {
    var other = lang === 'en' ? 'ko' : 'en';
    var links = NAV.map(function (n) {
      return '<a href="' + ROOT + n[1] + '"' + (n[0] === current ? ' aria-current="page"' : '') + '>' + esc(t(D.ui.nav[n[0]])) + '</a>';
    }).join('');
    var mobileLinks = NAV.map(function (n) {
      return '<li><a href="' + ROOT + n[1] + '"' + (n[0] === current ? ' aria-current="page"' : '') + '><span>' + esc(t(D.ui.nav[n[0]])) + '</span>' + ICON.arrow + '</a></li>';
    }).join('');
    return '' +
      '<header class="site-header"><div class="wrap">' + brand() +
        '<nav class="nav" aria-label="Main">' + links +
          '<button class="lang-pill" type="button" data-lang="' + other + '" aria-label="Switch language">' + ICON.globe + other.toUpperCase() + '</button>' +
        '</nav>' +
        '<button class="menu-btn" type="button" aria-label="' + esc(t(D.ui.menu)) + '" aria-expanded="false">' + ICON.menu + '</button>' +
      '</div></header>' +
      '<div class="mobile-menu" role="dialog" aria-modal="true" aria-label="Menu">' +
        '<div class="mobile-menu-top">' + brand() +
          '<button class="close-btn" type="button" aria-label="' + esc(t(D.ui.close)) + '">' + ICON.close + '</button></div>' +
        '<div class="lang-seg" role="group" aria-label="Language">' +
          '<button type="button" data-lang="en"' + (lang === 'en' ? ' class="active" aria-pressed="true"' : ' aria-pressed="false"') + '>English</button>' +
          '<button type="button" data-lang="ko"' + (lang === 'ko' ? ' class="active" aria-pressed="true"' : ' aria-pressed="false"') + '>한국어</button>' +
        '</div>' +
        '<ul class="mobile-links">' + mobileLinks + '</ul>' +
      '</div>';
  }

  function storeBadges() {
    var s = D.site;
    function badge(href, icon, small, big, label) {
      var inner = icon + '<span><small>' + small + '</small><strong>' + big + '</strong></span>';
      if (!href) return '<span class="store-badge is-soon" aria-label="' + label + ' (' + esc(t(D.ui.soon)) + ')">' + inner + '<em class="soon-tag">' + esc(t(D.ui.soon)) + '</em></span>';
      return '<a class="store-badge" href="' + esc(href) + '" target="_blank" rel="noopener" aria-label="' + label + '">' + inner + '</a>';
    }
    return '<div class="store-badges">' +
      badge(s.appStoreUrl, ICON.apple, 'Download on the', 'App Store', 'Download on the App Store') +
      badge(s.googlePlayUrl, ICON.play, 'GET IT ON', 'Google Play', 'Get it on Google Play') +
    '</div>';
  }

  function joinSection() {
    var j = D.ui.join;
    return '<section class="join" id="join"><div class="wrap">' +
      '<div><h2>' + esc(t(j.title)) + '</h2><p class="lead">' + esc(t(j.text)) + '</p></div>' +
      '<form class="join-form" novalidate>' +
        '<label for="f-museum">' + esc(t(j.museum)) + '</label><input id="f-museum" name="Museum" type="text" required autocomplete="organization">' +
        '<label for="f-email">' + esc(t(j.email)) + '</label><input id="f-email" name="email" type="email" required autocomplete="email">' +
        '<label for="f-phone">' + esc(t(j.phone)) + '</label><input id="f-phone" name="Fax / Phone" type="tel" autocomplete="tel">' +
        '<input class="hp" type="text" name="_honey" tabindex="-1" autocomplete="off" aria-hidden="true">' +
        '<button type="submit">' + esc(t(j.submit)) + '</button>' +
        '<p class="form-msg" role="status" aria-live="polite"></p>' +
      '</form>' +
    '</div></section>';
  }

  function footer() {
    var s = D.site, f = D.ui.footer;
    var links = NAV.map(function (n) {
      return '<li><a href="' + ROOT + n[1] + '">' + esc(t(D.ui.nav[n[0]])) + '</a></li>';
    }).join('');
    var app = storeBadges();
    return '<footer class="site-footer"><div class="wrap">' +
      '<div class="footer-top">' +
        '<div class="footer-brand">' + brand() + '<p>' + esc(t(D.home.heroTitle)) + '</p></div>' +
        '<nav class="footer-col" aria-label="Footer"><h2>' + esc(t(f.pages)) + '</h2><ul>' + links + '</ul></nav>' +
        '<div class="footer-col"><h2>' + esc(t(f.contact)) + '</h2><ul>' +
          '<li><a href="mailto:' + esc(s.email) + '">' + esc(s.email) + '</a></li>' +
        '</ul></div>' +
        '<div class="footer-col"><h2>' + esc(t(f.app)) + '</h2>' + app + '</div>' +
      '</div>' +
      '<div class="footer-bottom"><p>' + esc(s.copyright) + '</p></div>' +
    '</div></footer>';
  }

  /* ---------- pages ---------- */
  function homePage() {
    var h = D.home;
    var feats = h.features.map(function (f, i) {
      var text = '<div class="feature-text">' +
        (i === 0 ? '<h2>' + esc(t(h.featuresTitle)) + '</h2>' : '') +
        '<h3><span class="num">' + String(i + 1).padStart(2, '0') + '</span>' + esc(t(f.title)) + '</h3>' +
        f.text.map(function (p) { return '<p>' + esc(t(p)) + '</p>'; }).join('') + '</div>';
      return '<div class="feature' + (i % 2 ? ' reverse' : '') + '">' + text + img(f.image, t(f.title), 'feature-img') + '</div>';
    }).join('');
    return '<section class="hero"><div class="wrap">' +
        '<div><h1>' + esc(t(h.heroTitle)) + '</h1>' + storeBadges() + '</div>' +
        img(h.heroImage, '', 'hero-img') +
      '</div></section>' +
      '<section class="features"><div class="wrap">' + feats + '</div></section>' +
      joinSection();
  }

  function projectPage() {
    var p = D.project;
    var res = p.resources.map(function (r) {
      var inner = img(r.image, '') + '<span>' + esc(t(r.label)) + '</span>';
      if (!r.link) return '<div class="res-card">' + inner + '</div>';
      var ext = /^https?:/.test(r.link);
      return '<a class="res-card" href="' + esc(url(r.link)) + '"' + (ext ? ' target="_blank" rel="noopener"' : '') + '>' + inner + '</a>';
    }).join('');
    return '<section class="timeline"><div class="wrap"><div class="timeline-scroll">' + img(p.timelineImage, 'HIPSTORY project timeline, September 2024 to September 2025') + '</div><p class="timeline-hint">' + esc(t(D.ui.swipe)) + '</p></div></section>' +
      '<section class="background-sec"><div class="wrap">' + img(p.backgroundImage, '') +
        '<div><h2>' + esc(t(p.backgroundTitle)) + '</h2>' + p.background.map(function (x) { return '<p>' + esc(t(x)) + '</p>'; }).join('') + '</div>' +
      '</div></section>' +
      '<section class="resources"><div class="wrap"><h2>' + esc(t(p.resourcesTitle)) + '</h2><div class="res-grid">' + res + '</div></div></section>' +
      joinSection();
  }

  function membersPage() {
    var m = D.members;
    var team = m.team.map(function (x) {
      return '<div class="member"><div class="member-photo">' + img(x.image, x.name) + '</div><h3>' + esc(x.name) + '</h3><p>' + esc(t(x.role)) + '</p></div>';
    }).join('');
    var partners = m.partners.map(function (x) {
      var logo = img(x.image, x.name);
      return x.link ? '<a href="' + esc(x.link) + '" target="_blank" rel="noopener">' + logo + '</a>' : logo;
    }).join('');
    return '<section class="team"><div class="wrap"><h2>' + esc(t(m.teamTitle)) + '</h2><div class="team-grid">' + team + '</div></div></section>' +
      '<section class="partners"><div class="wrap"><h2>' + esc(t(m.partnersTitle)) + '</h2><div class="partner-row">' + partners + '</div></div></section>' +
      joinSection();
  }

  function blogPage() {
    var cards = D.posts.map(function (p) {
      return '<a class="post-card" href="' + ROOT + 'blog/' + p.slug + '/">' + img(p.cover, '') +
        '<h2>' + esc(t(p.title)) + '</h2>' +
        '<p>' + esc(excerpt(paras(p.body)[0] || '', 210)) + '</p></a>';
    }).join('');
    return '<section class="blog-list"><div class="wrap"><h1>' + esc(t(D.blogTitle)) + '</h1><div class="post-grid">' + cards + '</div></div></section>';
  }

  function postPage() {
    var slug = document.body.getAttribute('data-slug');
    var p = D.posts.filter(function (x) { return x.slug === slug; })[0];
    if (!p) return notFoundPage();
    document.title = t(p.title) + ' | HIPSTORY';
    return '<article class="post"><div class="wrap">' +
      '<a class="back-btn" href="' + ROOT + 'blog/" aria-label="' + esc(t(D.ui.back)) + '">' + ICON.back + '</a>' +
      '<h1>' + esc(t(p.title)) + '</h1>' +
      '<div class="post-images">' + p.images.map(function (s) { return img(s, ''); }).join('') + '</div>' +
      '<div class="post-body">' + paras(p.body).map(function (x) { return '<p>' + esc(x) + '</p>'; }).join('') + '</div>' +
    '</div></article>';
  }

  function galleryPage() {
    var g = D.gallery;
    var items = g.images.map(function (x, i) {
      return '<button type="button" data-i="' + i + '" aria-label="' + esc(x.name) + '">' + img(x.src, x.name) + '</button>';
    }).join('');
    return '<section class="gallery"><div class="wrap"><h1>' + esc(t(g.title)) + '</h1><p class="sub">' + esc(t(g.subtitle)) + '</p>' +
        '<div class="gallery-grid">' + items + '</div></div></section>' +
      '<div class="lightbox" role="dialog" aria-modal="true" aria-labelledby="lb-name">' +
        '<div class="lb-panel">' +
          '<button class="close-btn lb-close" type="button" aria-label="' + esc(t(D.ui.close)) + '">' + ICON.close + '</button>' +
          '<div class="lb-media"><img alt=""></div>' +
          '<div class="lb-info"><p class="lb-count"></p><h2 id="lb-name"></h2><p class="lb-hanja" lang="zh-Hant"></p><div class="lb-text" lang="ko"></div>' +
            '<div class="lb-nav"><button type="button" class="lb-prev" aria-label="Previous">' + ICON.back + '</button><button type="button" class="lb-next" aria-label="Next">' + ICON.arrow + '</button></div>' +
          '</div>' +
        '</div>' +
      '</div>' +
      joinSection();
  }

  function notFoundPage() {
    var n = D.ui.notFound;
    document.title = '404 | HIPSTORY';
    return '<section class="notfound"><div class="wrap"><div class="code">404</div><h1>' + esc(t(n.title)) + '</h1><p>' + esc(t(n.text)) + '</p>' +
      '<a class="btn" href="' + ROOT + '">' + esc(t(n.button)) + '</a></div></section>';
  }

  var PAGES = { home: homePage, project: projectPage, members: membersPage, blog: blogPage, post: postPage, gallery: galleryPage, '404': notFoundPage };

  /* ---------- mount ---------- */
  var root = document.getElementById('app');
  function boot() {
  page = document.body.getAttribute('data-page');
  current = page === 'post' ? 'blog' : page;
  document.body.style.overflow = '';
  var TITLES = { home: 'HIPSTORY', project: 'Project Information | HIPSTORY', members: 'Members & Partners | HIPSTORY', blog: 'Blog | HIPSTORY', gallery: 'Gallery | HIPSTORY' };
  if (TITLES[page]) document.title = TITLES[page];
  root.innerHTML = header() + '<main>' + (PAGES[page] || notFoundPage)() + '</main>' + footer();

  // language buttons
  root.querySelectorAll('[data-lang]').forEach(function (b) {
    b.addEventListener('click', function () { if (b.getAttribute('data-lang') !== lang) setLang(b.getAttribute('data-lang')); });
  });

  // mobile menu
  var menu = root.querySelector('.mobile-menu');
  var menuBtn = root.querySelector('.menu-btn');
  function openMenu(open) {
    menu.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.body.style.overflow = open ? 'hidden' : '';
    (open ? menu.querySelector('.close-btn') : menuBtn).focus();
  }
  menuBtn.addEventListener('click', function () { openMenu(true); });
  menu.querySelector('.close-btn').addEventListener('click', function () { openMenu(false); });

  // gallery popup: image + description
  var lb = root.querySelector('.lightbox');
  if (lb) {
    var G = D.gallery.images, at = 0, opener = null;
    var lbImg = lb.querySelector('.lb-media img');
    var show = function (i) {
      at = (i + G.length) % G.length;
      var x = G[at];
      lbImg.src = url(x.src); lbImg.alt = x.name;
      lb.querySelector('.lb-count').textContent = (at + 1) + ' / ' + G.length;
      lb.querySelector('#lb-name').textContent = x.name;
      lb.querySelector('.lb-hanja').textContent = x.hanja || '';
      lb.querySelector('.lb-text').innerHTML = (x.text || []).map(function (p) { return '<p>' + esc(p).replace(/\n/g, '<br>') + '</p>'; }).join('');
      lb.querySelector('.lb-info').scrollTop = 0;
    };
    var closeLb = function () { lb.classList.remove('open'); document.body.style.overflow = ''; if (opener) opener.focus(); };
    root.querySelectorAll('.gallery-grid button').forEach(function (b) {
      b.addEventListener('click', function () {
        opener = b; show(+b.getAttribute('data-i'));
        lb.classList.add('open'); document.body.style.overflow = 'hidden';
        lb.querySelector('.lb-close').focus();
      });
    });
    lb.querySelector('.lb-close').addEventListener('click', closeLb);
    lb.querySelector('.lb-prev').addEventListener('click', function () { show(at - 1); });
    lb.querySelector('.lb-next').addEventListener('click', function () { show(at + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
    lb.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') show(at - 1);
      if (e.key === 'ArrowRight') show(at + 1);
    });
  }


  // join form → FormSubmit
  var form = root.querySelector('.join-form');
  if (form) {
    var j = D.ui.join;
    var msg = form.querySelector('.form-msg');
    var btn = form.querySelector('button[type="submit"]');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      if (PREVIEW) { msg.textContent = 'Preview only: on the live site this sends to ' + D.site.formEmail + '.'; return; }
      var data = new FormData(form);
      data.append('_subject', 'HIPSTORY — new museum wants to join');
      data.append('_template', 'table');
      data.append('_captcha', 'false');
      btn.disabled = true; btn.textContent = t(j.sending); msg.textContent = '';
      fetch('https://formsubmit.co/ajax/' + D.site.formEmail, {
        method: 'POST', headers: { Accept: 'application/json' }, body: data
      }).then(function (r) { return r.json().then(function (b) { return { ok: r.ok, b: b }; }); })
        .then(function (res) {
          if (!res.ok || String(res.b.success) === 'false') throw new Error(res.b.message || 'failed');
          form.reset(); msg.textContent = t(j.success);
        })
        .catch(function () { msg.textContent = t(j.error); })
        .then(function () { btn.disabled = false; btn.textContent = t(j.submit); });
    });
  }
  }

  // Escape closes the menu / lightbox (bound once)
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    var menu = root.querySelector('.mobile-menu'), lb = root.querySelector('.lightbox');
    if (menu && menu.classList.contains('open')) { menu.classList.remove('open'); document.body.style.overflow = ''; }
    if (lb && lb.classList.contains('open')) { var c = lb.querySelector('.lb-close'); if (c) c.click(); }
  });

  function toTop() {
    window.scrollTo(0, 0);
    if (document.scrollingElement) document.scrollingElement.scrollTop = 0;
    // also scrolls any outer frame the preview is embedded in
    try { root.scrollIntoView({ block: 'start' }); } catch (e) {}
  }

  // Preview mode: click through all pages inside a single file
  if (PREVIEW) {
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href]');
      if (!a || a.target === '_blank' || a.href.indexOf(ROOT) !== 0) return;
      var path = a.href.slice(ROOT.length).split('#')[0];
      var map = { '': 'home', 'project-information/': 'project', 'members-and-partners/': 'members', 'blog/': 'blog', 'gallery/': 'gallery' };
      var m = path.match(/^blog\/([^/]+)\/$/);
      e.preventDefault();
      document.body.setAttribute('data-page', map[path] || (m ? 'post' : '404'));
      if (m) document.body.setAttribute('data-slug', m[1]); else document.body.removeAttribute('data-slug');
      boot(); toTop();
    });
  }

  boot();
})();
