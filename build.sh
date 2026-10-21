#!/usr/bin/env bash
#
# SOFTWORKS 홈페이지 — 배포본 만들기
#
#   ./build.sh            검토용으로 만듭니다 (검색엔진 수집 차단)
#   ./build.sh --public   정식 공개용으로 만듭니다 (수집 허용)
#   ./build.sh --serve    만든 뒤 http://localhost:8080 으로 띄워 확인합니다
#
# 하는 일
#   0. md/news/*.md 로 뉴스&인사이트 펼침형 목록(company/news/*.html)을 만듭니다
#      md/Product/ 의 CARD 01~05 문서로 솔루션 상세 페이지(products/*.html)를 만듭니다
#   1. dist/ 를 비우고 HTML과 assets 만 새로 복사합니다 (md/ 등 내부 문서는 제외)
#   2. 검토용이면 각 페이지에 noindex 를 넣고 robots.txt 로 수집을 막습니다
#   3. CSS·JS 주소 뒤에 내용 기반 꼬리표(?v=…)를 붙여, 고친 파일을 브라우저가 바로 새로 받게 합니다
#      링크가 실제 파일을 가리키는지 확인합니다
#   4. softworks-homepage.zip 으로 묶습니다
#
set -euo pipefail

cd "$(dirname "$0")"
SRC="$(pwd)"
OUT="$SRC/dist"
ZIP="$SRC/softworks-homepage.zip"

PUBLIC=0
SERVE=0
for arg in "$@"; do
  case "$arg" in
    --public) PUBLIC=1 ;;
    --serve)  SERVE=1 ;;
    -h|--help) sed -n '2,20p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) echo "모르는 옵션: $arg  (--public, --serve, --help)" >&2; exit 1 ;;
  esac
done

echo "▸ 뉴스&인사이트 페이지를 만듭니다 (md/news/*.md → company/news/)"
python3 "$SRC/tools/build_news.py"

echo "▸ 솔루션 상세 페이지를 만듭니다 (md/Product/ CARD 01~05 → products/)"
python3 "$SRC/tools/build_solutions.py"

echo "▸ dist/ 를 새로 만듭니다"
rm -rf "$OUT"
mkdir -p "$OUT"
cp "$SRC"/*.html "$OUT"/
mkdir -p "$OUT/products"
cp "$SRC"/products/*.html "$OUT/products"/
mkdir -p "$OUT/company/news"
cp "$SRC"/company/*.html "$OUT/company"/
cp "$SRC"/company/news/*.html "$OUT/company/news"/
cp -R "$SRC/assets" "$OUT/assets"
find "$OUT" \( -name '.DS_Store' -o -name '.gitkeep' \) -delete

if [ "$PUBLIC" -eq 1 ]; then
  echo "▸ 정식 공개용 — 검색엔진 수집을 허용합니다"
  cat > "$OUT/robots.txt" <<'ROBOTS'
User-agent: *
Allow: /
ROBOTS
else
  echo "▸ 검토용 — 검색엔진 수집을 막습니다 (정식 공개는 --public)"
  cat > "$OUT/robots.txt" <<'ROBOTS'
# 검토용 초안입니다. 검색엔진 수집을 막습니다.
User-agent: *
Disallow: /
ROBOTS
  python3 - "$OUT" <<'PY'
import io, os, sys, glob
out = sys.argv[1]
tag = '<meta name="robots" content="noindex">\n'
anchor = '<meta name="viewport" content="width=device-width, initial-scale=1">\n'
for p in sorted(glob.glob(os.path.join(out, "**", "*.html"), recursive=True)):
    s = io.open(p, encoding="utf-8").read()
    if "noindex" in s:
        continue
    if anchor not in s:
        print("  ! viewport 태그를 찾지 못해 noindex 를 넣지 못했습니다:", os.path.basename(p))
        continue
    io.open(p, "w", encoding="utf-8").write(s.replace(anchor, anchor + tag, 1))
PY
fi

echo "▸ CSS·JS 에 버전 꼬리표를 붙입니다 (브라우저 캐시 대비)"
python3 - "$OUT" <<'PY'
import hashlib, io, os, re, sys, glob
out = sys.argv[1]
cache = {}
def tag(path):
    if path not in cache:
        cache[path] = hashlib.md5(open(path, "rb").read()).hexdigest()[:8]
    return cache[path]
pat = re.compile(r'((?:href|src)=")([^"?#]+\.(?:css|js))(")')
count = [0]
for p in sorted(glob.glob(os.path.join(out, "**", "*.html"), recursive=True)):
    s = io.open(p, encoding="utf-8").read()
    def rep(m):
        url = m.group(2)
        if url.startswith(("http:", "https:", "//")):
            return m.group(0)
        base = out if url.startswith("/") else os.path.dirname(p)
        f = os.path.join(base, url.lstrip("/"))
        if not os.path.isfile(f):
            return m.group(0)
        count[0] += 1
        return m.group(1) + url + "?v=" + tag(f) + m.group(3)
    t = pat.sub(rep, s)
    if t != s:
        io.open(p, "w", encoding="utf-8").write(t)
print("  %d 곳에 꼬리표를 붙였습니다" % count[0])
PY

echo "▸ 링크를 확인합니다"
python3 - "$OUT" <<'PY'
import io, os, re, sys, glob
out = sys.argv[1]
bad = []
for p in sorted(glob.glob(os.path.join(out, "**", "*.html"), recursive=True)):
    s = io.open(p, encoding="utf-8").read()
    for attr in re.findall(r'(?:href|src)="([^"]+)"', s):
        if attr.startswith(("http", "#", "mailto:", "tel:", "data:")):
            continue
        target = attr.split("#", 1)[0].split("?", 1)[0]
        if not target:
            continue
        base = out if target.startswith("/") else os.path.dirname(p)
        if not os.path.exists(os.path.join(base, target.lstrip("/"))):
            bad.append((os.path.relpath(p, out), attr))
if bad:
    for f, a in bad:
        print("  ! 끊어진 링크 %s → %s" % (f, a))
    sys.exit(1)
print("  링크 이상 없음")
PY

echo "▸ 압축합니다"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
cp -R "$OUT" "$TMP/softworks-homepage"
( cd "$TMP" && zip -rq softworks-homepage.zip softworks-homepage -x '*.DS_Store' )
rm -f "$ZIP"
cp "$TMP/softworks-homepage.zip" "$ZIP"

FILES=$(find "$OUT" -type f | wc -l | tr -d ' ')
SIZE=$(du -sh "$OUT" | cut -f1 | tr -d ' ')
echo
echo "완료 — $FILES 개 파일, $SIZE"
echo "  배포 폴더 : dist/"
echo "  압축 파일 : $(basename "$ZIP")"
echo
if [ "$PUBLIC" -eq 1 ]; then
  echo "정식 공개용입니다. app.netlify.com/drop 에 dist 폴더를 끌어다 놓으십시오."
else
  echo "검토용입니다. 정식 공개 때는 ./build.sh --public 로 다시 만드십시오."
fi

if [ "$SERVE" -eq 1 ]; then
  echo
  echo "http://localhost:8080 에서 확인하십시오. 멈추려면 Control-C."
  ( cd "$OUT" && python3 -m http.server 8080 )
fi
