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
    t.addEventListener('mouseenter', function () { openMenu(t.dataset.menu); });
    t.addEventListener('focus', function () { openMenu(t.dataset.menu); });
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
      toggle.textContent = open ? '닫기' : '메뉴';
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

/* 로고 롤링 — 목록을 복제해 끊김 없이 흐르게 하고, 멈춤 버튼을 붙입니다.
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

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'sw-logos__toggle';
    btn.setAttribute('aria-pressed', 'false');
    btn.textContent = '멈춤';
    btn.addEventListener('click', function () {
      var paused = box.classList.toggle('is-paused');
      btn.setAttribute('aria-pressed', paused ? 'true' : 'false');
      btn.textContent = paused ? '재생' : '멈춤';
    });
    var meta = box.parentNode.firstElementChild;
    if (meta && meta !== box) meta.appendChild(btn);
  });
})();
