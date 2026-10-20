/* SOFTWORKS — 문의 양식 (company/contact.html)
   1) 문의 유형(도입문의·제휴문의)을 고르면 받는 부서, 보이는 질문, 받는 메일 주소가 바뀝니다.
      담당 부서 정보는 라디오 버튼의 data-owner·data-mail 에서 읽습니다.
   2) 필수 항목을 확인하고, 틀린 칸 바로 아래에 안내를 띄웁니다.
   3) 메일로 받습니다. 입력 내용을 제목·본문에 채운 메일(mailto)을 해당 부서 주소로 엽니다.
      방문자가 메일 앱에서 보내기를 누르면 접수됩니다.
   스크립트가 없으면 브라우저 기본 방식(mailto, text/plain)으로 메일 앱을 엽니다. */
(function () {
  var form = document.getElementById('contact-form');
  if (!form) return;
  var done = document.getElementById('contact-done');
  var note = form.querySelector('.sw-form__note');
  var route = form.querySelector('[data-route]');
  var message = form.querySelector('#f-message');
  var radios = Array.prototype.slice.call(form.querySelectorAll('input[name="category"]'));

  var LABELS = [
    ['category', '문의 유형'],
    ['company', '회사명'], ['department', '부서·직책'], ['name', '이름'],
    ['phone', '연락처'], ['email', '이메일'],
    ['products', '관심 제품'], ['timing', '검토 시기'], ['partnership', '제휴 유형'],
    ['message', '문의 내용']
  ];

  function current() {
    return radios.filter(function (r) { return r.checked; })[0] || radios[0];
  }

  /* ── 문의 유형 전환 ───────────────────────── */
  function applyCategory() {
    var r = current();
    var key = r.getAttribute('data-key');
    form.setAttribute('action', 'mailto:' + r.getAttribute('data-mail'));
    if (route) route.textContent = '받는 곳 · ' + r.getAttribute('data-owner') + ' · ' + r.getAttribute('data-mail');
    Array.prototype.forEach.call(form.querySelectorAll('[data-show-for]'), function (box) {
      var on = box.getAttribute('data-show-for') === key;
      box.hidden = !on;
      box.disabled = !on; /* 숨긴 칸은 메일에 넣지 않습니다 */
    });
    var ph = message && message.getAttribute('data-ph-' + key);
    if (ph) message.setAttribute('placeholder', ph);
  }

  function pick(key) {
    radios.forEach(function (r) { r.checked = r.getAttribute('data-key') === key; });
    applyCategory();
  }

  radios.forEach(function (r) { r.addEventListener('change', applyCategory); });

  /* 문의 창구 블록의 "…남기기" 버튼 — 다시 불러오지 않고 유형만 골라 양식으로 갑니다. */
  Array.prototype.forEach.call(document.querySelectorAll('[data-pick]'), function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      pick(a.getAttribute('data-pick'));
      var target = document.getElementById('inquiry');
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (history.replaceState) history.replaceState(null, '', '?type=' + a.getAttribute('data-pick') + '#inquiry');
    });
  });

  /* 다른 페이지에서 ?type=partnership 으로 들어온 경우 */
  var m = /[?&]type=([a-z-]+)/.exec(location.search);
  if (m && radios.some(function (r) { return r.getAttribute('data-key') === m[1]; })) pick(m[1]);
  else applyCategory();

  /* ── 모으기 ───────────────────────────────── */
  function collect() {
    var data = {};
    Array.prototype.forEach.call(form.elements, function (el) {
      if (!el.name || el.disabled) return;
      if ((el.type === 'checkbox' || el.type === 'radio') && !el.checked) return;
      var v = (el.value || '').trim();
      if (!v && !(el.name in data)) { data[el.name] = ''; return; }
      if (!v) return;
      data[el.name] = data[el.name] ? data[el.name] + ', ' + v : v;
    });
    return data;
  }

  function bodyText(d) {
    var lines = LABELS.filter(function (p) { return p[0] in d && p[0] !== 'message'; }).map(function (p) {
      return p[1] + ': ' + (d[p[0]] || '-');
    });
    lines.push('', '[문의 내용]', d.message || '-', '', '개인정보 수집·이용: ' + (d.privacy || '-'), '— 소프트웍스 홈페이지 문의하기에서 작성');
    return lines.join('\n');
  }

  function subjectText(d) {
    var parts = [d.company || '회사명 없음'];
    if (d.products) {
      var list = d.products.split(', ');
      parts.push(list.slice(0, 2).join('·') + (list.length > 2 ? ' 외' : ''));
    }
    if (d.partnership) parts.push(d.partnership);
    return '[' + (d.category || '문의') + '] ' + parts.join(' · ');
  }

  function mailtoHref(d) {
    return 'mailto:' + current().getAttribute('data-mail') +
      '?subject=' + encodeURIComponent(subjectText(d)) +
      '&body=' + encodeURIComponent(bodyText(d));
  }

  /* ── 확인 ─────────────────────────────────── */
  function setError(box, show) {
    box.classList.toggle('is-invalid', show);
    var msg = box.querySelector('.sw-field__error');
    if (msg) msg.hidden = !show;
    Array.prototype.forEach.call(box.querySelectorAll('input,textarea'), function (i) {
      if (i.type === 'hidden') return;
      if (show) i.setAttribute('aria-invalid', 'true'); else i.removeAttribute('aria-invalid');
    });
  }

  function checkBox(box) {
    var ok;
    if (box.hasAttribute('data-required-group')) {
      ok = !!box.querySelector('input:checked');
    } else {
      var input = box.querySelector('input[required],textarea[required]');
      if (!input) return true;
      ok = input.type === 'checkbox' ? input.checked : input.checkValidity() && input.value.trim() !== '';
    }
    setError(box, !ok);
    return ok;
  }

  var boxes = Array.prototype.slice.call(form.querySelectorAll('[data-required-group], .sw-input, .sw-consent'))
    .filter(function (b) { return b.hasAttribute('data-required-group') || b.querySelector('[required]'); });

  boxes.forEach(function (box) {
    var handler = function () { if (box.classList.contains('is-invalid')) checkBox(box); };
    box.addEventListener('change', handler);
    box.addEventListener('input', handler);
  });

  var phone = form.querySelector('#f-phone');
  if (phone) phone.setAttribute('pattern', '^[0-9+\\-\\s()]{9,}$');

  /* ── 메일 열기 ─────────────────────────────── */
  var lastText = '';

  function showDone(d, href) {
    var r = current();
    var mail = r.getAttribute('data-mail');
    form.hidden = true;
    var cat = done.querySelector('[data-done-category]');
    if (cat) cat.textContent = d.category || '문의';
    var owner = done.querySelector('[data-done-owner]');
    if (owner) owner.textContent = r.getAttribute('data-owner');
    var link = done.querySelector('[data-done-mail]');
    if (link) { link.href = 'mailto:' + mail; link.textContent = mail; }
    var open = done.querySelector('[data-done-open]');
    if (open) open.href = href;
    var dl = done.querySelector('[data-done-summary]');
    if (dl) {
      dl.innerHTML = '';
      LABELS.forEach(function (p) {
        if (!d[p[0]]) return;
        var dt = document.createElement('dt'); dt.textContent = p[1];
        var dd = document.createElement('dd'); dd.textContent = d[p[0]];
        dd.style.whiteSpace = 'pre-line';
        dl.appendChild(dt); dl.appendChild(dd);
      });
    }
    lastText = '받는 곳: ' + mail + '\n제목: ' + subjectText(d) + '\n\n' + bodyText(d);
    done.hidden = false;
    done.focus();
  }

  var copyBtn = done && done.querySelector('[data-done-copy]');
  var doneNote = done && done.querySelector('[data-done-note]');
  if (copyBtn) copyBtn.addEventListener('click', function () {
    var ok = function () { doneNote.textContent = '내용을 복사했습니다. 메일 본문에 붙여 넣어 보내 주십시오.'; };
    var fallback = function () {
      var t = document.createElement('textarea');
      t.value = lastText; t.setAttribute('readonly', ''); t.style.position = 'absolute'; t.style.left = '-9999px';
      document.body.appendChild(t); t.select();
      try { document.execCommand('copy'); ok(); } catch (e) { doneNote.textContent = '복사하지 못했습니다. 위 내용을 직접 옮겨 주십시오.'; }
      document.body.removeChild(t);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(lastText).then(ok, fallback);
    else fallback();
  });

  var editBtn = done && done.querySelector('[data-done-edit]');
  if (editBtn) editBtn.addEventListener('click', function () {
    done.hidden = true;
    if (doneNote) doneNote.textContent = '';
    form.hidden = false;
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var firstBad = null;
    boxes.forEach(function (box) { if (!checkBox(box) && !firstBad) firstBad = box; });
    if (firstBad) {
      note.textContent = '빠진 항목이 있습니다. 표시된 칸을 확인해 주십시오.';
      var f = firstBad.querySelector('input:not([type="hidden"]),textarea');
      firstBad.scrollIntoView({ block: 'center', behavior: 'smooth' });
      if (f) f.focus({ preventScroll: true });
      return;
    }
    note.textContent = '';

    var d = collect();
    if (d['bot-field']) return; /* 스팸 */
    delete d['bot-field'];

    var href = mailtoHref(d);
    showDone(d, href);
    window.location.href = href;
  });
})();
