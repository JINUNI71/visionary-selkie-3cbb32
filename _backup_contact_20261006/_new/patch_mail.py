import io, re, sys
p = sys.argv[1]
s = io.open(p, encoding="utf-8").read()

def rep(a, b):
    global s
    assert s.count(a) == 1, a[:80]
    s = s.replace(a, b)

# 카테고리 추가 안내 주석
rep("(value·data-* 값을 블록과 맞춥니다). Netlify 감지용 숨은 양식도 하나 더 필요합니다(아래 참고). -->",
    "(value·data-* 값을 블록과 맞춥니다). -->")

# 양식 설명 주석 + 소개 문장 + form 머리
a = s.index("  <!-- 문의 양식")
b = s.index('<p class="sw-hp" aria-hidden="true">')
s = s[:a] + '''  <!-- 문의 양식
       〔설정〕 메일로 받습니다. 별도 서버나 Netlify 설정이 필요 없습니다.
       [메일로 보내기]를 누르면 입력 내용이 채워진 메일이 고른 유형의 부서 주소(data-mail)로
       방문자의 메일 앱에서 열리고, 방문자가 보내기를 누르면 그 주소로 접수됩니다.
       받는 주소를 바꾸려면 양식 01의 라디오 버튼 data-mail 값과 위 문의 창구의 이메일을 함께 고치십시오. -->
  <section class="sw-section" id="inquiry" aria-labelledby="inquiry-title">
    <div class="sw-container">
      <div class="sw-section-intro">
        <span class="sw-eyebrow sw-eyebrow--light">Send Inquiry</span>
        <h2 class="sw-h2" id="inquiry-title">문의 남기기</h2>
        <p class="sw-section-intro__text">양식을 채우고 [메일로 보내기]를 누르시면, 입력하신 내용이 채워진 메일이 해당 부서 주소로 열립니다. 메일 앱에서 보내기를 누르시면 접수됩니다. 정해지지 않은 항목은 비워 두셔도 됩니다. <span class="sw-req-mark" aria-hidden="true">*</span> 표시는 필수 항목입니다.</p>
      </div>

      <form class="sw-form" id="contact-form" method="POST" action="mailto:sales@softworks.co.kr" enctype="text/plain" novalidate>
        ''' + s[b:]

rep('<button class="sw-btn sw-btn--filled" type="submit">문의 보내기 →</button>',
    '<button class="sw-btn sw-btn--filled" type="submit">메일로 보내기 →</button>')

# Netlify 감지용 양식 ~ 실패 안내 → 메일 준비 안내 하나로
a = s.index("      <!-- Netlify 감지용")
b = s.index("    </div>\n  </section>", a)
s = s[:a] + '''      <!-- 메일 앱을 연 뒤 -->
      <div class="sw-form-done" id="contact-done" tabindex="-1" hidden>
        <p class="sw-form-done__label overline">Mail Ready</p>
        <h3 class="sw-form-done__title heading-lg">메일 앱에서 보내기를 눌러 주십시오</h3>
        <p class="sw-form-done__text body-lg">입력하신 <strong data-done-category>문의</strong> 내용이 채워진 메일이 <a class="sw-link" data-done-mail href="mailto:sales@softworks.co.kr">sales@softworks.co.kr</a> 주소로 열렸습니다. 보내기를 누르시면 접수되며, 영업일 기준 2일 안에 <strong data-done-owner>담당 부서</strong>에서 연락드립니다.</p>
        <p class="sw-form-done__text body-sm">메일 앱이 열리지 않았다면 [내용 복사]를 누른 뒤 위 주소로 직접 보내 주십시오.</p>
        <dl class="sw-form-done__summary" data-done-summary></dl>
        <div class="sw-actions">
          <a class="sw-btn sw-btn--filled" data-done-open href="mailto:sales@softworks.co.kr">메일 다시 열기 →</a>
          <button class="sw-btn sw-btn--line" type="button" data-done-copy>내용 복사</button>
          <button class="sw-btn sw-btn--line" type="button" data-done-edit>양식 고치기</button>
        </div>
        <p class="sw-form__note caption" data-done-note aria-live="polite"></p>
      </div>
''' + s[b:]

io.open(p, "w", encoding="utf-8").write(s)
print("ok")
