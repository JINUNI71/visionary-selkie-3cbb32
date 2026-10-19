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
