/* SOFTWORKS — 교육 신청 양식 (support/training.html)
   1) 필수 항목을 확인하고, 틀린 칸 바로 아래에 안내를 띄웁니다.
   2) 입력 내용을 FormSubmit(formsubmit.co)으로 보내, form 의 action 에 적힌 주소로 메일이 갑니다.
      메일 제목에는 회사명·인원·제품이 들어가고, 본문은 한글 항목 이름의 표로 정리됩니다.
   3) 보내지 못하면 같은 내용을 채운 메일(mailto)을 열 수 있게 합니다.
   스크립트가 없어도 양식은 일반 POST로 FormSubmit에 접수됩니다. */
(function () {
  var form = document.getElementById('training-form');
  if (!form) return;
  var done = document.getElementById('training-done');
  var fail = document.getElementById('training-fail');
  var note = form.querySelector('.sw-form__note');
  var button = form.querySelector('button[type="submit"]');
  var fallbackMail = form.getAttribute('data-fallback-mail') || '';

  /* 메일·요약에 쓰는 항목 이름 (보이는 순서) */
  var LABELS = [
    ['company', '회사명'], ['department', '부서·직책'], ['name', '담당자'],
    ['phone', '연락처'], ['email', '이메일'],
    ['products', '교육 대상 제품'], ['program', '교육 유형'], ['adoption', '도입 상태'],
    ['headcount', '예상 인원'], ['frequency', '교육 횟수'], ['delivery', '진행 방식'],
    ['timing', '희망 시기'], ['duration', '희망 기간'], ['message', '요청 사항']
  ];
  
  /* 같은 이름의 체크박스 값은 ", "로 이어 한 칸에 담습니다. */
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

  function summaryText(d) {
    return LABELS.map(function (p) {
      return p[1] + ': ' + (d[p[0]] || '-');
    }).join('\n');
  }

  function subjectText(d) {
    var parts = [d.company || '회사명 없음'];
    if (d.headcount) parts.push(d.headcount);
    if (d.products) parts.push(d.products.split(', ').slice(0, 2).join('·') + (d.products.split(', ').length > 2 ? ' 외' : ''));
    return '[교육 신청] ' + parts.join(' · ');
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

  /* 한 번 틀렸던 칸은 고치는 즉시 안내를 지웁니다. */
  boxes.forEach(function (box) {
    var handler = function () { if (box.classList.contains('is-invalid')) checkBox(box); };
    box.addEventListener('change', handler);
    box.addEventListener('input', handler);
  });

  /* 연락처 형식 — 숫자·하이픈·공백·+ 만, 9자리 이상 */
  var phone = form.querySelector('#f-phone');
  if (phone) phone.setAttribute('pattern', '[0-9+\\(\\)\\s\\-]{9,}');

  /* ── 보내기 ──────────────────────────────── */
  /* 메일 본문 — 한글 항목 이름을 키로, 보이는 순서대로 담습니다. */
  function payload(d) {
    var out = {
      _subject: subjectText(d),
      _template: 'table',
      _captcha: 'false',
      _honey: d._honey || ''
    };
    if (d.email) out._replyto = d.email; /* 메일에서 '답장'을 누르면 신청자에게 갑니다. */
    LABELS.forEach(function (p) { out[p[1]] = d[p[0]] || '-'; });
    out['개인정보 수집·이용'] = d.privacy || '-';
    out['접수 경로'] = location.href.split('#')[0];
    return out;
  }

  function endpoint() {
    return form.getAttribute('action').replace('formsubmit.co/', 'formsubmit.co/ajax/');
  }

  function isPreview() {
    var h = location.hostname;
    return location.protocol === 'file:' || h === 'localhost' || h === '127.0.0.1' || h === '';
  }

  function showDone(d) {
    form.hidden = true;
    fail.hidden = true;
    var mail = done.querySelector('[data-done-email]');
    if (mail && d.email) mail.textContent = d.email;
    var link = done.querySelector('[data-done-mail]');
    if (link && fallbackMail) { link.href = 'mailto:' + fallbackMail; link.textContent = fallbackMail; }
    var dl = done.querySelector('[data-done-summary]');
    if (dl) {
      dl.innerHTML = '';
      ['products', 'program', 'headcount', 'delivery', 'timing', 'duration'].forEach(function (k) {
        if (!d[k]) return;
        var label = LABELS.filter(function (p) { return p[0] === k; })[0][1];
        var dt = document.createElement('dt'); dt.textContent = label;
        var dd = document.createElement('dd'); dd.textContent = d[k];
        dl.appendChild(dt); dl.appendChild(dd);
      });
    }
    if (isPreview()) {
      var p = document.createElement('p');
      p.className = 'sw-form-done__text caption';
      p.textContent = '미리보기 환경이라 실제로 보내지는 않았습니다. Netlify에 배포한 주소에서 전송됩니다.';
      done.appendChild(p);
    }
    done.hidden = false;
    done.focus();
  }

  function showFail(d) {
    var a = fail.querySelector('[data-fail-mail]');
    if (a) {
      a.href = 'mailto:' + fallbackMail +
        '?subject=' + encodeURIComponent(subjectText(d)) +
        '&body=' + encodeURIComponent(summaryText(d) + '\n\n개인정보 수집·이용: ' + (d.privacy || '-') + '\n');
    }
    fail.hidden = false;
    fail.focus();
  }

  var retry = fail && fail.querySelector('[data-fail-retry]');
  if (retry) retry.addEventListener('click', function () {
    fail.hidden = true;
    if (form.requestSubmit) form.requestSubmit(); else button.click();
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

    var d = collect();
    if (d._honey) return; /* 스팸 */

    note.textContent = '보내는 중입니다…';
    form.classList.add('is-sending');
    button.disabled = true;

    var finish = function () { form.classList.remove('is-sending'); button.disabled = false; note.textContent = ''; };

    if (isPreview()) { finish(); showDone(d); return; }

    fetch(endpoint(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload(d))
    }).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (j) {
        finish();
        var ok = res.ok && String(j.success) === 'true';
        /* 첫 신청은 받는 주소의 확인(Activate) 메일을 보내는 것으로 끝납니다. 신청자에게는 접수로 보입니다. */
        var activation = /activat/i.test(j.message || '');
        if (ok || activation) showDone(d); else showFail(d);
      });
    }).catch(function () {
      finish();
      showFail(d);
    });
  });

  /* 스크립트 없이 보낸 뒤 돌아온 경우(?sent=1) */
  if (/[?&]sent=1/.test(location.search)) {
    form.hidden = true;
    done.hidden = false;
  }
})();
