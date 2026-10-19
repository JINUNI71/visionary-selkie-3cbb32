#!/usr/bin/env python3
"""문의하기 메뉴(회사소개 하위)를 사이트에 적용합니다. 한 번만 실행합니다."""
import io, os, re, sys, glob

ROOT = sys.argv[1]
NEW = os.path.join(ROOT, "_backup_contact_20261006", "_new")
os.chdir(ROOT)

def rd(p): return io.open(p, encoding="utf-8").read()
def wr(p, s): io.open(p, "w", encoding="utf-8").write(s)

# 1) company/contact.html — careers.html 껍데기 + 새 본문
shell = rd("company/careers.html")
a, b = shell.index('<main id="main">'), shell.index("</main>") + len("</main>")
main = rd(os.path.join(NEW, "contact_main.html")).strip()
page = shell[:a] + main + shell[b:]
page = re.sub(r"<title>.*?</title>", "<title>문의하기 — SOFTWORKS</title>", page, count=1)
page = re.sub(r'<meta name="description" content="[^"]*">',
              '<meta name="description" content="도입문의와 제휴문의 창구를 나누어 담당자 연락처를 안내합니다. 양식을 남기시면 해당 담당자가 영업일 기준 2일 안에 회신합니다.">',
              page, count=1)
page = page.replace('href="careers.html" aria-current="true">KR', 'href="contact.html" aria-current="true">KR')
page = page.replace('href="careers.html" hreflang="en"', 'href="contact.html" hreflang="en"')
page = page.replace('href="careers.html" aria-current="page"', 'href="careers.html"')
page = page.replace('<script src="../assets/js/site.js" defer></script>',
                    '<script src="../assets/js/site.js" defer></script>\n<script src="../assets/js/contact.js" defer></script>')
wr("company/contact.html", page)

# 2) 모든 페이지: 메뉴 정리와 도입 문의 링크 교체
pages = [p for p in glob.glob("**/*.html", recursive=True)
         if not p.startswith(("dist/", "_backup")) and "/.fuse" not in p]

NEWS = re.compile(
    r'(?P<ind>[ \t]*)(?P<blk><a class="(?P<cls>sw-menu__link|sw-mlink)" href="[^"]*"(?: aria-current="page")?>\s*'
    r'<span class="sw-menu__label proof">뉴스&amp;인사이트</span>\s*'
    r'<span class="sw-menu__sub caption">News &amp; Insight</span>\s*</a>)')
SALES = re.compile(
    r'\n[ \t]*<a class="(?:sw-menu__link|sw-mlink)" href="[^"]*"[^>]*>\s*'
    r'<span class="sw-menu__label proof">도입문의</span>\s*'
    r'<span class="sw-menu__sub caption">Contact Sales</span>\s*</a>')
CTA = re.compile(r'href="(?:\.\./)*support\.html#contact"')

report = []
for p in sorted(pages):
    s = rd(p)
    orig = s
    rel = os.path.relpath("company/contact.html", os.path.dirname(p) or ".").replace(os.sep, "/")
    s = SALES.sub("", s)
    if "문의하기</span>" not in s:
        def add(m):
            ind, cls = m.group("ind"), m.group("cls")
            cur = ' aria-current="page"' if p == "company/contact.html" else ""
            return (m.group(0) + "\n" + ind +
                    '<a class="%s" href="%s"%s>\n%s  <span class="sw-menu__label proof">문의하기</span>\n'
                    '%s  <span class="sw-menu__sub caption">Contact</span>\n%s</a>'
                    % (cls, rel, cur, ind, ind, ind))
        s = NEWS.sub(add, s)
    s = CTA.sub('href="%s"' % rel, s)
    if s != orig:
        wr(p, s)
        report.append(p)

# 3) 뉴스 생성기의 CTA (사이트 루트 기준 링크)
py = "tools/build_news.py"
s = rd(py)
s2 = s.replace('href="support.html#contact"', 'href="company/contact.html"')
if s2 != s: wr(py, s2); report.append(py)

# 4) 스타일 추가
css = "assets/css/site.css"
s = rd(css)
if "company/contact.html" not in s:
    wr(css, s.rstrip("\n") + "\n" + rd(os.path.join(NEW, "contact.css")))
    report.append(css)

# 5) training.html 의 중복 </form> 정리
t = "support/training.html"
s = rd(t)
s2 = s.replace("      </form>\n      </form>\n", "      </form>\n", 1)
if s2 != s: wr(t, s2); report.append(t + " (중복 </form>)")

print("\n".join(report))
left = [p for p in pages if "support.html#contact" in rd(p)]
print("남은 support.html#contact:", left or "없음")
