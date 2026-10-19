/* SOFTWORKS — 사이트 스크립트.
   1) 넓은 화면: 대메뉴에 마우스를 올리거나 포커스가 들어오면 메가 메뉴를 엽니다.
   2) 좁은 화면: 메뉴 버튼과 섹션별 아코디언을 여닫습니다.
   스크립트가 없어도 모든 링크는 그대로 눌러 이동할 수 있습니다. */
(function () {
  var header = document.getElementById('header');
  if (!header) return;

  /* ── 메가 메뉴 ─────────────────────────────── */
  var triggers = Array.prototype.slice.call(header.querySelectorAll('[data-menu]'));
  var panels = {};
  triggers.forEach(function (t) {
    var panel = document.getElementById(t.getAttribute('aria-controls'));
    if (panel) panels[t.dataset.menu] = panel;
  });

  var openKey = null;
  var returningFocus = false; /* X 버튼으로 닫은 뒤 대메뉴로 포커스를 돌려줄 때는 다시 열지 않습니다. */

  function openMenu(key) {
    if (openKey === key) return;
    closeMenu();
    var panel = panels[key];
    if (!panel) return;
    panel.classList.add('is-open');
    triggers.forEach(function (t) {
      if (t.dataset.menu === key) t.setAttribute('aria-expanded', 'true');
    });
    openKey = key;
  }

  function closeMenu() {
    if (openKey === null) return;
    if (panels[openKey]) panels[openKey].classList.remove('is-open');
    triggers.forEach(function (t) { t.setAttribute('aria-expanded', 'false'); });
    openKey = null;
  }

  triggers.forEach(function (t) {
    /* 하위 메뉴가 있는 대메뉴는 링크가 아닌 버튼입니다. 누르면 하위 메뉴를 엽니다(마우스를 올려 이미 열렸으면 그대로 둡니다).
       닫기는 헤더 밖으로 나가거나, 헤더 밖을 누르거나, Esc 로 합니다. */
    t.addEventListener('click', function () { openMenu(t.dataset.menu); });
    t.addEventListener('mouseenter', function () { openMenu(t.dataset.menu); });
    t.addEventListener('focus', function () { if (!returningFocus) openMenu(t.dataset.menu); });
  });

  /* 하위 메뉴가 없는 대메뉴(사업영역)에 닿으면 열린 메뉴를 닫습니다. */
  Array.prototype.forEach.call(header.querySelectorAll('.sw-navlink:not([data-menu])'), function (l) {
    l.addEventListener('mouseenter', closeMenu);
    l.addEventListener('focus', closeMenu);
  });

  Object.keys(panels).forEach(function (key) {
    panels[key].addEventListener('mouseenter', function () { openMenu(key); });
  });

  header.addEventListener('mouseleave', closeMenu);

  /* 하위 메뉴 오른쪽 위 X 버튼 — 메뉴를 닫고 포커스를 해당 대메뉴로 돌려 줍니다. */
  Array.prototype.forEach.call(header.querySelectorAll('.sw-menu__close'), function (btn) {
    btn.addEventListener('click', function () {
      var key = openKey;
      closeMenu();
      returningFocus = true;
      triggers.forEach(function (t) { if (t.dataset.menu === key) t.focus({ preventScroll: true }); });
      returningFocus = false;
    });
  });

  document.addEventListener('click', function (e) {
    if (openKey !== null && !header.contains(e.target)) closeMenu();
  });

  header.addEventListener('focusout', function (e) {
    if (!header.contains(e.relatedTarget)) closeMenu();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (openKey !== null) {
      var key = openKey;
      closeMenu();
      triggers.forEach(function (t) { if (t.dataset.menu === key) t.focus(); });
    } else if (header.classList.contains('is-open')) {
      setMobile(false);
      var toggle = header.querySelector('.sw-navtoggle');
      if (toggle) toggle.focus();
    }
  });

  /* ── 좁은 화면 메뉴 ────────────────────────── */
  var toggle = header.querySelector('.sw-navtoggle');

  function setMobile(open) {
    header.classList.toggle('is-open', open);
    if (toggle) {
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
    }
  }

  if (toggle) {
    toggle.addEventListener('click', function () {
      setMobile(!header.classList.contains('is-open'));
    });
  }

  Array.prototype.forEach.call(header.querySelectorAll('.sw-mtop'), function (btn) {
    btn.addEventListener('click', function () {
      var sec = btn.closest('.sw-msec');
      var open = !sec.classList.contains('is-open');
      sec.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      var mark = btn.querySelector('.sw-mtop__mark');
      if (mark) mark.textContent = open ? '−' : '+';
    });
  });

  /* 넓은 화면으로 돌아가면 좁은 화면 메뉴 상태를 정리합니다. */
  var wide = window.matchMedia('(min-width: 761px)');
  var onChange = function (e) { if (e.matches) setMobile(false); };
  if (wide.addEventListener) wide.addEventListener('change', onChange);
  else wide.addListener(onChange);
})();


/* 뉴스&인사이트 연도 탭
   - 탭을 보이게 하고, 고른 연도의 묶음만 보여 줍니다. 처음에는 가장 최근 연도입니다.
   - 주소가 #year-2024 이거나 #글주소 이면 그 글이 있는 연도를 먼저 고릅니다(아래 펼침 스크립트보다 먼저 실행).
   - 좌우 화살표·Home·End 로 탭을 옮길 수 있습니다. */
(function () {
  var bar = document.querySelector('.sw-yeartabs');
  var wrap = document.querySelector('.sw-newsyears');
  if (!bar || !wrap) return;
  var tabs = Array.prototype.slice.call(bar.querySelectorAll('[role="tab"]'));
  var panels = tabs.map(function (t) { return document.getElementById(t.getAttribute('aria-controls')); });

  panels.forEach(function (p, i) {
    if (!p) return;
    p.setAttribute('role', 'tabpanel');
    p.setAttribute('aria-labelledby', tabs[i].id);
  });

  function select(i, focus) {
    tabs.forEach(function (t, k) {
      var on = k === i;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      if (panels[k]) panels[k].hidden = !on;
    });
    if (focus) tabs[i].focus();
    /* 좁은 화면에서 탭 줄이 가로로 넘칠 때, 고른 탭이 보이도록 탭 줄만 옮깁니다(페이지는 움직이지 않음). */
    var t = tabs[i], l = t.offsetLeft - bar.offsetLeft, r = l + t.offsetWidth;
    if (l < bar.scrollLeft) bar.scrollLeft = l;
    else if (r > bar.scrollLeft + bar.clientWidth) bar.scrollLeft = r - bar.clientWidth;
  }

  function fromHash() {
    var id = decodeURIComponent(location.hash.slice(1));
    if (!id) return -1;
    var el = document.getElementById(id);
    if (!el) return -1;
    for (var i = 0; i < panels.length; i++) if (panels[i] && panels[i].contains(el)) return i;
    return -1;
  }

  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () {
      select(i, false);
      if (history.replaceState) history.replaceState(null, '', location.pathname + location.search + '#' + panels[i].id);
    });
    t.addEventListener('keydown', function (e) {
      var n = tabs.length, to = null;
      if (e.key === 'ArrowRight') to = (i + 1) % n;
      else if (e.key === 'ArrowLeft') to = (i - 1 + n) % n;
      else if (e.key === 'Home') to = 0;
      else if (e.key === 'End') to = n - 1;
      if (to === null) return;
      e.preventDefault();
      select(to, true);
    });
  });

  bar.hidden = false;
  wrap.classList.add('is-tabbed');
  var start = fromHash();
  select(start < 0 ? 0 : start, false);
  window.addEventListener('hashchange', function () {
    var k = fromHash();
    if (k >= 0) select(k, false);
  });
})();

/* 뉴스&인사이트 펼침형 목록
   - 주소 끝의 #글주소 와 같은 항목을 펼치고 그 위치로 옮깁니다 (회사개요의 최신 소식에서 들어올 때).
   - 항목을 펼치면 주소에 #글주소 를 남겨 그대로 공유할 수 있게 하고, 접으면 지웁니다.
   스크립트가 없어도 <details> 로 열고 닫을 수 있습니다. */
(function () {
  var items = document.querySelectorAll('.sw-newsitem__details');
  if (!items.length) return;

  function openFromHash() {
    var id = decodeURIComponent(location.hash.slice(1));
    if (!id) return;
    var el = document.getElementById(id);
    if (!el || !el.classList.contains('sw-newsitem__details')) return;
    el.open = true;
    el.scrollIntoView({ block: 'start' });
    var bar = el.querySelector('summary');
    if (bar) bar.focus({ preventScroll: true });
  }

  Array.prototype.forEach.call(items, function (el) {
    el.addEventListener('toggle', function () {
      if (!history.replaceState) return;
      var base = location.pathname + location.search;
      if (el.open) history.replaceState(null, '', base + '#' + el.id);
      else if (location.hash === '#' + el.id) history.replaceState(null, '', base);
    });
  });

  openFromHash();
  window.addEventListener('hashchange', openFromHash);
})();

/* 로고 롤링 — 목록을 복제해 끊김 없이 흐르게 합니다. 마우스를 올리면 멈춥니다.
   로고 파일을 불러오지 못한 칸은 기업명을 글자로 보여줍니다. */
(function () {
  var boxes = document.querySelectorAll('.sw-logos');
  if (!boxes.length) return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function markText(img) { img.closest('.sw-logos__item').classList.add('is-text'); }
  Array.prototype.forEach.call(document.querySelectorAll('.sw-logos__item img'), function (img) {
    if (img.complete && img.naturalWidth === 0) markText(img);
    img.addEventListener('error', function () { markText(img); });
  });

  if (reduce) return;

  Array.prototype.forEach.call(boxes, function (box) {
    var track = box.querySelector('.sw-logos__track');
    if (!track) return;
    var originals = Array.prototype.slice.call(track.children);
    var setWidth = originals.reduce(function (w, li) { return w + li.offsetWidth; }, 0);
    if (!setWidth) return;

    function cloneSet() {
      originals.forEach(function (li) {
        var c = li.cloneNode(true);
        c.setAttribute('aria-hidden', 'true');
        var im = c.querySelector('img');
        if (im) {
          im.alt = '';
          im.addEventListener('error', function () { c.classList.add('is-text'); });
        }
        track.appendChild(c);
      });
    }
    /* 한 묶음이 상자 폭보다 넓어질 때까지 채운 뒤, 같은 양을 한 번 더 붙여 -50% 이동으로 이어지게 합니다. */
    var sets = Math.max(1, Math.ceil(box.clientWidth / setWidth));
    for (var i = 1; i < sets; i++) cloneSet();
    for (var j = 0; j < sets; j++) cloneSet();

    box.style.setProperty('--roll-duration', Math.round((setWidth * sets) / 40) + 's');
    box.classList.add('is-rolling');

  });
})();

/* 연혁 롤링 — 최근 연도부터 한 해씩 차례로 보여주고 마지막 해 다음에는 처음으로 돌아갑니다.
   ‹ › 버튼(또는 휴대폰에서 좌우로 밀기)으로 다른 해를 볼 수 있고, 직접 넘기면 자동 롤링은 멈춥니다.
   '전체 연혁 보기'를 누르면 모든 해를 한 번에 펼칩니다. 마우스를 올려도 멈춥니다.
   움직임 줄이기 설정이면 자동으로 넘기지 않고 버튼으로만 넘깁니다. 스크립트가 없으면 전체 연혁이 보입니다. */
(function () {
  var list = document.querySelector('.sw-history');
  if (!list) return;
  var items = Array.prototype.slice.call(list.children);
  if (items.length < 2) return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var DELAY = 4500;
  var current = 0, timer = null, hover = false, auto = !reduce, expanded = false;
  var box = list.parentNode;

  function pad(n) { return n < 10 ? '0' + n : String(n); }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text) e.textContent = text; return e; }

  var nav = el('div', 'sw-history-nav');
  var prev = el('button', 'sw-history-nav__btn sw-history-nav__btn--prev');
  prev.type = 'button'; prev.setAttribute('aria-label', '이전 연도(더 최근)');
  prev.innerHTML = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3 5 8l5 5"/></svg>';
  var next = el('button', 'sw-history-nav__btn sw-history-nav__btn--next');
  next.type = 'button'; next.setAttribute('aria-label', '다음 연도(더 이전)');
  next.innerHTML = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="m6 3 5 5-5 5"/></svg>';
  var count = el('span', 'sw-history-nav__count overline');
  var all = el('button', 'sw-history-nav__all', '전체 연혁 보기');
  all.type = 'button'; all.setAttribute('aria-expanded', 'false');
  nav.appendChild(prev); nav.appendChild(next); nav.appendChild(count); nav.appendChild(el('span', 'sw-history-nav__break')); nav.appendChild(all);
  box.classList.add('has-nav');
  box.insertBefore(nav, list);

  function render() {
    items.forEach(function (li, i) {
      var on = i === current;
      li.classList.toggle('is-active', on);
      if (on || expanded) li.removeAttribute('aria-hidden'); else li.setAttribute('aria-hidden', 'true');
    });
    count.textContent = pad(current + 1) + ' / ' + pad(items.length);
  }
  function show(i, byUser) {
    current = (i + items.length) % items.length;
    if (byUser) { auto = false; list.setAttribute('aria-live', 'polite'); }
    render();
    restart();
  }
  function restart() {
    clearInterval(timer);
    timer = (auto && !hover && !expanded) ? setInterval(function () { show(current + 1); }, DELAY) : null;
  }

  prev.addEventListener('click', function () { show(current - 1, true); });
  next.addEventListener('click', function () { show(current + 1, true); });
  all.addEventListener('click', function () {
    expanded = !expanded;
    list.classList.toggle('is-rolling', !expanded);
    box.classList.toggle('is-expanded', expanded);
    all.textContent = expanded ? '한 해씩 보기' : '전체 연혁 보기';
    all.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    if (expanded) auto = false;
    render(); restart();
  });

  /* 휴대폰: 좌우로 밀어 넘기기 */
  var sx = null, sy = null;
  list.addEventListener('touchstart', function (e) { var t = e.touches[0]; sx = t.clientX; sy = t.clientY; }, { passive: true });
  list.addEventListener('touchend', function (e) {
    if (sx === null || expanded) return;
    var t = e.changedTouches[0], dx = t.clientX - sx, dy = t.clientY - sy;
    sx = null;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) show(current + (dx < 0 ? 1 : -1), true);
  });

  box.addEventListener('mouseenter', function () { hover = true; restart(); });
  box.addEventListener('mouseleave', function () { hover = false; restart(); });

  list.classList.add('is-rolling');
  render();
  restart();
})();

/* 인증 마크 — 파일을 불러오지 못한 칸은 마크 자리를 접고 이름만 보여줍니다. */
(function () {
  Array.prototype.forEach.call(document.querySelectorAll('.sw-certs__mark'), function (img) {
    function miss() { img.parentNode.classList.add('no-mark'); }
    if (img.complete && img.naturalWidth === 0) miss();
    img.addEventListener('error', miss);
  });
})();

/* 고객사·파트너사 띠 — 두 벌을 번갈아 보여줍니다.
   마우스를 올리면 바뀌지 않습니다. 움직임 줄이기 설정이면 두 벌을 모두 펼쳐 둡니다. */
(function () {
  var band = document.querySelector('[data-proof-rotate]');
  if (!band) return;
  var decks = Array.prototype.slice.call(band.querySelectorAll('.sw-proof__deck'));
  var label = band.querySelector('[data-proof-label]');
  if (decks.length < 2 || !label) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var HOLD = 9000;   /* 한 벌을 보여 주는 시간 */
  var i = 0, timer = null, hover = false;

  decks.forEach(function (d, n) { d.classList.toggle('is-current', n === 0); });
  label.textContent = decks[0].dataset.proofName;

  function next() {
    if (hover) return;
    i = (i + 1) % decks.length;
    band.classList.add('is-swapping');
    decks.forEach(function (d, n) { d.classList.toggle('is-current', n === i); });
    setTimeout(function () {
      label.textContent = decks[i].dataset.proofName;
      band.classList.remove('is-swapping');
    }, 250);
  }

  function start() { if (!timer) timer = setInterval(next, HOLD); }
  function stop() { clearInterval(timer); timer = null; }

  band.addEventListener('mouseenter', function () { hover = true; });
  band.addEventListener('mouseleave', function () { hover = false; });
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stop(); else start();
  });
  start();
})();


/* 히어로 메인 카피 — 줄 단위로 드러내기
   지금 화면 폭에서 실제로 나뉜 줄을 찾아, 줄마다 가림막 안에서 아래에서 위로 올라오게 합니다(줄 간격 90ms).
   끝나면 원래 마크업으로 되돌려, 이후 창 크기를 바꿔도 줄바꿈이 자연스럽게 다시 잡힙니다.
   스크립트가 없거나 동작 줄이기 설정이면 이 효과 없이 CSS 의 '차례로 떠오르기'(또는 즉시 표시)만 적용됩니다. */
(function () {
  var title = document.querySelector('.sw-hero__title');
  if (!title || !window.matchMedia || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var original = title.innerHTML;

  /* 1) 단어마다 span 으로 감싸 위치를 잽니다(제목은 keep-all 이라 띄어쓰기에서만 줄이 바뀝니다). */
  var frag = document.createDocumentFragment();
  Array.prototype.slice.call(title.childNodes).forEach(function (n) {
    if (n.nodeType === 3) {
      n.textContent.split(/(\s+)/).forEach(function (part) {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
        var w = document.createElement('span'); w.className = 'sw-tword'; w.textContent = part; frag.appendChild(w);
      });
    } else frag.appendChild(n.cloneNode(true));
  });
  title.innerHTML = ''; title.appendChild(frag);

  var lines = [], top = null;
  Array.prototype.forEach.call(title.querySelectorAll('.sw-tword'), function (w) {
    var t = Math.round(w.offsetTop);
    if (top === null || Math.abs(t - top) > 4) { lines.push([]); top = t; }
    lines[lines.length - 1].push(w.textContent);
  });
  if (!lines.length) { title.innerHTML = original; return; }

  /* 2) 줄마다 가림막(.sw-tline)과 움직이는 안쪽(.sw-tline__in)을 만듭니다. */
  title.innerHTML = lines.map(function (ws, i) {
    return '<span class="sw-tline"><span class="sw-tline__in" style="animation-delay:' + (120 + i * 90) + 'ms">' + ws.join(' ') + '</span></span>';
  }).join('');
  title.classList.add('is-lines');

  /* 3) 마지막 줄이 끝나면 원래대로 되돌립니다. */
  var done = 120 + (lines.length - 1) * 90 + 700 + 50;
  setTimeout(function () { title.style.animation = 'none'; title.classList.remove('is-lines'); title.innerHTML = original; }, done);
})();
