/* Cosmo — fills each page from /content/site.json and /content/projects.json.
   You never need to edit this file to change images or text: use /admin. */
(function () {
  'use strict';

  var page = document.body.getAttribute('data-page');
  var params = new URLSearchParams(location.search);

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  // *text* -> italic, blank line -> new paragraph
  function inline(s) { return esc(s).replace(/\*([^*]+)\*/g, '<i>$1</i>'); }
  function paras(text) {
    return String(text || '').split(/\n\s*\n/).filter(function (p) { return p.trim(); })
      .map(function (p) { return '<p>' + inline(p.trim()).replace(/\n/g, '<br>') + '</p>'; }).join('');
  }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function $(sel) { return document.querySelector(sel); }
  function getJSON(url) {
    return fetch(url, { cache: 'no-cache' }).then(function (r) {
      if (!r.ok) throw new Error(url + ' ' + r.status);
      return r.json();
    });
  }
  function nameBlock(site) {
    return '<span class="name-cosmo">' + esc(site.name || 'Cosmo') + '</span>' +
           '<span class="name-pinyin">' + esc(site.pinyin || '') + '</span>';
  }
  function findProject(data, slug) {
    var list = (data && data.projects) || [];
    for (var i = 0; i < list.length; i++) if (list[i].slug === slug) return list[i];
    return list[0];
  }

  var ICON_BOOK = '<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4.5A1.5 1.5 0 0 1 5.5 3H19v15H5.5A1.5 1.5 0 0 0 4 19.5z"/><path d="M4 19.5A1.5 1.5 0 0 0 5.5 21H19v-3"/><path d="M8 7h7"/></svg>';
  var ICON_CAMERA = '<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8h4l2-3h6l2 3h4v11H3z"/><circle cx="12" cy="13" r="3.5"/></svg>';

  /* ---------------- HOME ---------------- */
  function renderHome(site, data) {
    $('#name').innerHTML = nameBlock(site);

    // small image: each click shows the next one
    var emblems = (site.emblems || []).filter(function (e) { return e && e.image; });
    var ei = 0;
    var emBtn = $('#emblem'), emImg = $('#emblem img');
    function showEmblem() {
      if (!emblems.length) { emBtn.hidden = true; return; }
      emImg.src = emblems[ei].image;
      emBtn.setAttribute('aria-label', 'Change the small image (now: ' + (emblems[ei].label || '') + ')');
    }
    // background/text colour: unchanged until the first click, then
    // navy -> dark green -> black -> back to the original white, and repeat
    var THEMES = ['', 'theme-navy', 'theme-green', 'theme-black'];
    var ti = 0;
    emBtn.addEventListener('click', function () {
      ei = (ei + 1) % emblems.length; showEmblem();
      if (THEMES[ti]) document.documentElement.classList.remove(THEMES[ti]);
      ti = (ti + 1) % THEMES.length;
      if (THEMES[ti]) document.documentElement.classList.add(THEMES[ti]);
    });
    showEmblem();

    $('#contact').href = 'mailto:' + (site.email || '');

    var projects = (data.projects || []);
    $('#projects').innerHTML = projects.map(function (p, i) {
      return '<a class="item" href="/project.html?p=' + encodeURIComponent(p.slug) + '" data-i="' + i + '">' +
        '<span class="item-title">' + esc(p.title) + '</span><span class="item-note">' + esc(p.note) + '</span></a>';
    }).join('');

    $('#books').innerHTML = (site.books || []).map(function (b) {
      var inner = '<span class="item-title">' + esc(b.title) + '</span><span class="item-note">' + esc(b.note) + '</span>';
      return b.project
        ? '<a class="item" href="/project.html?p=' + encodeURIComponent(b.project) + '">' + inner + '</a>'
        : '<div class="item">' + inner + '</div>';
    }).join('');

    var social = '';
    if (site.xiaohongshu) social += '<a href="' + esc(site.xiaohongshu) + '" target="_blank" rel="noopener">' + ICON_BOOK + '<span>Xiaohongshu</span></a>';
    if (site.instagram) social += '<a href="' + esc(site.instagram) + '" target="_blank" rel="noopener">' + ICON_CAMERA + '<span>Instagram</span></a>';
    if (site.email) social += '<a href="mailto:' + esc(site.email) + '">Email</a>';
    $('#social').innerHTML = social;
  }

  /* ---------------- PROJECT ---------------- */
  function renderProject(site, data) {
    var p = findProject(data, params.get('p'));
    if (!p) return;
    document.title = p.title + ' — ' + (site.name || 'Cosmo');
    $('#name').innerHTML = nameBlock(site);
    $('#emblem').href = '/statement.html?p=' + encodeURIComponent(p.slug);
    $('#emblem img').src = (site.emblems && site.emblems[0] && site.emblems[0].image) || '';
    $('#title').textContent = p.title + (p.year ? ' [' + p.year + ']' : '');

    var imgs = p.images || [];
    function cap(im, i) {
      var bits = [im.place, im.date].filter(Boolean).join(', ');
      return pad(i + 1) + '   ' + bits;
    }
    // tiles, laid out in reading order (left → right) into two columns, one column on phones
    var tiles = imgs.map(function (im, i) {
      var f = document.createElement('figure');
      f.className = 'tile';
      f.innerHTML = '<button type="button" data-i="' + i + '" aria-label="Open image ' + (i + 1) + '">' +
        '<img src="' + esc(im.image) + '" alt="' + esc(p.title + ', image ' + (i + 1)) + '"></button>' +
        '<figcaption>' + esc(cap(im, i)) + '</figcaption>';
      return f;
    });
    var grid = $('#grid'), lastCols = 0;
    function layout(force) {
      var n = window.innerWidth <= 700 ? 1 : 2;
      if (n === lastCols && !force) return;
      lastCols = n;
      var cols = [], h = [];
      grid.innerHTML = '';
      for (var c = 0; c < n; c++) { var d = document.createElement('div'); d.className = 'col'; grid.appendChild(d); cols.push(d); h.push(0); }
      tiles.forEach(function (t) {
        var img = t.querySelector('img');
        var r = img.naturalWidth ? img.naturalHeight / img.naturalWidth : 0.75;
        var k = h.indexOf(Math.min.apply(null, h));
        cols[k].appendChild(t);
        h[k] += r + 0.06;
      });
    }
    layout(true);
    var pending = tiles.length;
    tiles.forEach(function (t) {
      var img = t.querySelector('img');
      function done() { if (--pending === 0) layout(true); }
      if (img.complete) done(); else { img.addEventListener('load', done); img.addEventListener('error', done); }
    });
    window.addEventListener('resize', function () { layout(false); });

    // single image view — opens on top of the grid, so going back keeps your scroll position
    var viewer = $('#viewer'), cur = -1, lastBtn = null;
    function show(i) {
      cur = (i + imgs.length) % imgs.length;
      var im = imgs[cur];
      $('#v-img').src = im.image;
      $('#v-img').alt = p.title + ', image ' + (cur + 1);
      $('#v-text').innerHTML = inline(im.text || '');
      $('#v-cap').textContent = cap(im, cur);
      $('#v-num').textContent = pad(cur + 1) + ' / ' + pad(imgs.length);
    }
    function open(i, push) {
      show(i);
      viewer.hidden = false;
      document.documentElement.classList.add('lock');
      if (push) history.pushState({ img: cur }, '', '#' + (cur + 1));
      $('#v-back').focus({ preventScroll: true });
    }
    function close(fromHistory) {
      viewer.hidden = true;
      document.documentElement.classList.remove('lock');
      if (!fromHistory && location.hash) history.back();
      if (lastBtn) lastBtn.focus({ preventScroll: true });
    }
    $('#grid').addEventListener('click', function (e) {
      var b = e.target.closest('button[data-i]');
      if (!b) return;
      lastBtn = b;
      open(+b.getAttribute('data-i'), true);
    });
    $('#v-back').addEventListener('click', function () { close(false); });
    $('#v-prev').addEventListener('click', function () { show(cur - 1); history.replaceState({ img: cur }, '', '#' + (cur + 1)); });
    $('#v-next').addEventListener('click', function () { show(cur + 1); history.replaceState({ img: cur }, '', '#' + (cur + 1)); });
    document.addEventListener('keydown', function (e) {
      if (viewer.hidden) return;
      if (e.key === 'Escape') close(false);
      if (e.key === 'ArrowLeft') $('#v-prev').click();
      if (e.key === 'ArrowRight') $('#v-next').click();
    });
    window.addEventListener('popstate', function () {
      var n = parseInt(location.hash.slice(1), 10);
      if (n >= 1 && n <= imgs.length) open(n - 1, false); else if (!viewer.hidden) close(true);
    });
    var start = parseInt(location.hash.slice(1), 10);
    if (start >= 1 && start <= imgs.length) open(start - 1, false);
  }

  /* ---------------- STATEMENT / ABOUT (paged text) ---------------- */
  function renderPaged(site, pages, tail) {
    var n = pages.length + (tail ? 1 : 0), cur = 0;
    function draw() {
      var html = cur < pages.length ? '<div class="body">' + paras(pages[cur].text) + '</div>' : tail;
      $('#pages').innerHTML = html;
      $('#pgnum').textContent = pad(cur + 1) + ' / ' + pad(n);
      $('#prev').setAttribute('aria-disabled', cur === 0 ? 'true' : 'false');
      $('#next').setAttribute('aria-disabled', cur === n - 1 ? 'true' : 'false');
    }
    $('#prev').addEventListener('click', function () { if (cur > 0) { cur--; draw(); scrollTo(0, 0); } });
    $('#next').addEventListener('click', function () { if (cur < n - 1) { cur++; draw(); scrollTo(0, 0); } });
    draw();
  }

  function renderStatement(site, data) {
    var p = findProject(data, params.get('p'));
    if (!p) return;
    document.title = 'Statement — ' + p.title + ' — ' + (site.name || 'Cosmo');
    $('#name').innerHTML = nameBlock(site);
    $('#emblem').href = '/project.html?p=' + encodeURIComponent(p.slug);
    $('#emblem img').src = (site.emblems && site.emblems[0] && site.emblems[0].image) || '';
    $('#h-title').textContent = p.title;
    $('#h-year').textContent = p.year || '';
    var st = p.statement || {};
    var info = (st.info || []).map(function (r) { return '<dt>' + esc(r.label) + '</dt><dd>' + inline(r.value) + '</dd>'; }).join('');
    var notes = (st.notes || []).map(function (r) { return '<li>' + inline(r.text) + '</li>'; }).join('');
    var tail = '<div style="display:flex;flex-direction:column;gap:32px">' +
      (info ? '<dl class="info">' + info + '</dl>' : '') +
      (notes ? '<ol class="notes">' + notes + '</ol>' : '') +
      '<a href="/project.html?p=' + encodeURIComponent(p.slug) + '">← Back to the images</a></div>';
    renderPaged(site, st.pages && st.pages.length ? st.pages : [{ text: '' }], tail);
  }

  function renderAbout(site) {
    $('#name').innerHTML = nameBlock(site);
    $('#emblem img').src = (site.emblems && site.emblems[0] && site.emblems[0].image) || '';
    $('#about').innerHTML = paras(site.about);
    $('#about-email').href = 'mailto:' + (site.email || '');
    $('#about-email').textContent = site.email || '';
  }

  Promise.all([getJSON('/content/site.json'), getJSON('/content/projects.json')]).then(function (r) {
    var site = r[0], data = r[1];
    if (page === 'home') renderHome(site, data);
    if (page === 'project') renderProject(site, data);
    if (page === 'statement') renderStatement(site, data);
    if (page === 'about') renderAbout(site);
  }).catch(function (err) {
    console.error(err);
  });
})();
