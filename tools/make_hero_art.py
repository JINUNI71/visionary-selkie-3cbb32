"""히어로 배경 선화 만들기 — assets/img/hero/*.svg

  python3 tools/make_hero_art.py

800x480, 흰 선 저투명. 왼쪽 텍스트 영역과 브레드크럼 자리는 site.css 의 mask 로 지웁니다.
페이지와 선화의 짝은 각 HTML 의 data-hero 값(솔루션 상세는 tools/build_solutions.py 의 PAGES[..]["hero"])입니다.
"""
import math, os, random, sys

OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "assets", "img", "hero")
os.makedirs(OUT, exist_ok=True)
W, H = 800, 480
LINE = 'stroke="#ffffff" stroke-opacity=".16" fill="none" stroke-width="1" vector-effect="non-scaling-stroke"'
FAINT = 'stroke="#ffffff" stroke-opacity=".09" fill="none" stroke-width="1" vector-effect="non-scaling-stroke"'
ACC = 'stroke="#b8c8e8" stroke-opacity=".42" fill="none" stroke-width="1" vector-effect="non-scaling-stroke"'
DOT = 'fill="#b8c8e8" fill-opacity=".45"'
DOTF = 'fill="#ffffff" fill-opacity=".18"'


def svg(name, body):
    s = ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %d %d" width="%d" height="%d" '
         'preserveAspectRatio="xMaxYMid slice" aria-hidden="true">\n%s\n</svg>\n') % (W, H, W, H, "\n".join(body))
    open(os.path.join(OUT, name + ".svg"), "w").write(s)


def f(x):
    return ("%.1f" % x).rstrip("0").rstrip(".")


def poly(pts, a=LINE, close=True):
    d = " ".join("%s,%s" % (f(x), f(y)) for x, y in pts)
    return '<%s points="%s" %s/>' % ("polygon" if close else "polyline", d, a)


def line(x1, y1, x2, y2, a=LINE):
    return '<line x1="%s" y1="%s" x2="%s" y2="%s" %s/>' % (f(x1), f(y1), f(x2), f(y2), a)


def circ(cx, cy, r, a=LINE):
    return '<circle cx="%s" cy="%s" r="%s" %s/>' % (f(cx), f(cy), f(r), a)


# 1. 사업영역 — 인프라에서 AI까지 쌓아 올린 계층
def layers():
    b = []
    cx, hw, hh = 540, 210, 66
    ys = [350, 280, 210, 140]
    for i, y in enumerate(ys):
        pts = [(cx - hw, y), (cx, y - hh), (cx + hw, y), (cx, y + hh)]
        b.append(poly(pts, ACC if i == len(ys) - 1 else LINE))
    for dx in (-hw, 0, hw):
        b.append(line(cx + dx, ys[0] + (hh if dx == 0 else 0), cx + dx, ys[-1] + (hh if dx == 0 else 0), FAINT))
    for y in ys:
        b.append(circ(cx, y - hh, 3, DOT))
    return b


# 2. Broadcom Private AI — 연결된 노드망
def network(seed=7, n=34, x0=330):
    random.seed(seed)
    pts = [(random.uniform(x0, 790), random.uniform(30, 450)) for _ in range(n)]
    b = []
    for i, p in enumerate(pts):
        near = sorted(range(n), key=lambda j: (pts[j][0] - p[0]) ** 2 + (pts[j][1] - p[1]) ** 2)[1:3]
        for j in near:
            if j > i or i not in sorted(range(n), key=lambda k: (pts[k][0] - pts[j][0]) ** 2 + (pts[k][1] - pts[j][1]) ** 2)[1:3]:
                b.append(line(p[0], p[1], pts[j][0], pts[j][1]))
    for i, (x, y) in enumerate(pts):
        b.append(circ(x, y, 4 if i % 6 == 0 else 2.2, DOT if i % 6 == 0 else DOTF))
    return b


# 3. AgentOn Security — 중심 위험에서 퍼지는 관계 그래프
def ontology():
    cx, cy = 560, 240
    b = [circ(cx, cy, 95, FAINT), circ(cx, cy, 190, FAINT)]
    r1 = [(cx + 95 * math.cos(math.radians(a)), cy + 95 * math.sin(math.radians(a))) for a in range(15, 375, 60)]
    r2 = [(cx + 190 * math.cos(math.radians(a)), cy + 190 * math.sin(math.radians(a))) for a in range(0, 360, 30)]
    for p in r1:
        b.append(line(cx, cy, *p, ACC))
    for q in r2:
        p = min(r1, key=lambda p: (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2)
        b.append(line(*p, *q))
    b.append(circ(cx, cy, 6, DOT))
    b.append(circ(cx, cy, 14, ACC))
    b += [circ(*p, 3.5, DOT) for p in r1] + [circ(*q, 2.4, DOTF) for q in r2]
    return b


# 4. GenWorks — GPU 칩 격자
def gpu():
    b = []
    s, g = 64, 92
    for r in range(4):
        for c in range(4):
            x, y = 400 + c * g, 70 + r * g
            hot = (r, c) in ((1, 2), (2, 1))
            b.append('<rect x="%d" y="%d" width="%d" height="%d" %s/>' % (x, y, s, s, ACC if hot else LINE))
            b.append('<rect x="%d" y="%d" width="%d" height="%d" %s/>' % (x + 18, y + 18, s - 36, s - 36, FAINT))
            for k in range(4):
                o = 12 + k * 13
                b.append(line(x + o, y, x + o, y - 7, FAINT))
                b.append(line(x + o, y + s, x + o, y + s + 7, FAINT))
            if hot:
                b.append('<rect x="%d" y="%d" width="%d" height="%d" %s/>' % (x + 26, y + 26, s - 52, s - 52, DOT))
    return b


# 5. Omnissa Horizon / CloudX — 겹쳐 놓은 가상 데스크톱 창
def windows(seed=0):
    b = []
    wins = [(360, 70, 260, 170), (430, 130, 260, 170), (500, 190, 260, 170), (570, 250, 200, 140), (330, 300, 190, 120)]
    if seed:
        wins = [(380, 60, 220, 150), (620, 60, 160, 150), (380, 230, 160, 190), (560, 230, 220, 190)]
    for i, (x, y, w, h) in enumerate(wins):
        a = ACC if i == (2 if not seed else 3) else LINE
        b.append('<rect x="%d" y="%d" width="%d" height="%d" %s/>' % (x, y, w, h, a))
        b.append(line(x, y + 20, x + w, y + 20, FAINT))
        for k in range(3):
            b.append(circ(x + 12 + k * 11, y + 10, 2.2, DOTF))
    return b


# 6. CloudV — 여러 클라우드를 한 궤도에서 관리
def orbit():
    cx, cy = 560, 240
    b = []
    for i, (rx, ry, rot) in enumerate([(230, 70, -18), (190, 110, 24), (130, 130, 0)]):
        b.append('<ellipse cx="%d" cy="%d" rx="%d" ry="%d" transform="rotate(%d %d %d)" %s/>' % (cx, cy, rx, ry, rot, cx, cy, ACC if i == 0 else LINE))
        for a in (30, 150, 260):
            t = math.radians(a + i * 40)
            x, y = rx * math.cos(t), ry * math.sin(t)
            r = math.radians(rot)
            b.append(circ(cx + x * math.cos(r) - y * math.sin(r), cy + x * math.sin(r) + y * math.cos(r), 4, DOT))
    b.append(circ(cx, cy, 22, LINE))
    b.append(circ(cx, cy, 6, DOT))
    return b


# 7. Veeam — 겹겹이 지키는 보호 링
def rings():
    cx, cy = 580, 240
    b = []
    for i, r in enumerate(range(40, 330, 36)):
        dash = ' stroke-dasharray="2 6"' if i % 2 else ""
        b.append('<circle cx="%d" cy="%d" r="%d" %s%s/>' % (cx, cy, r, ACC if i == 2 else LINE, dash))
    for a in range(0, 360, 15):
        t = math.radians(a)
        b.append(line(cx + 112 * math.cos(t), cy + 112 * math.sin(t), cx + 124 * math.cos(t), cy + 124 * math.sin(t), ACC))
    b.append(circ(cx, cy, 5, DOT))
    return b


# 8. Zerto — 두 사이트 사이의 연속 복제
def replicate():
    a, c, y = (390, 240), (690, 240), 240
    b = []
    for r in (26, 52):
        b += [circ(*a, r, LINE), circ(*c, r, LINE)]
    for k, h in enumerate((-150, -100, -50, 50, 100, 150)):
        d = 'M%d %d Q%d %d %d %d' % (a[0], y, (a[0] + c[0]) // 2, y + h * 1.6, c[0], y)
        b.append('<path d="%s" %s%s/>' % (d, ACC if k == 2 else LINE, ' stroke-dasharray="3 7"' if k % 2 else ""))
        for t in (0.3, 0.6):
            mx = (1 - t) ** 2 * a[0] + 2 * (1 - t) * t * (a[0] + c[0]) / 2 + t * t * c[0]
            my = (1 - t) ** 2 * y + 2 * (1 - t) * t * (y + h * 1.6) + t * t * y
            b.append(circ(mx, my, 2.4, DOTF))
    b += [circ(*a, 6, DOT), circ(*c, 6, DOT)]
    return b


# 9. 회사개요 — 시간이 쌓인 등고선
def contour():
    cx, cy = 600, 230
    b = []
    for i in range(1, 11):
        r = 22 * i
        pts = []
        for d in range(0, 360, 6):
            t = math.radians(d)
            k = 1 + 0.10 * math.sin(3 * t + i * 0.5) + 0.06 * math.cos(5 * t - i * 0.3)
            pts.append((cx + r * 1.35 * k * math.cos(t), cy + r * k * math.sin(t)))
        b.append(poly(pts, ACC if i == 6 else LINE))
    b.append(circ(cx, cy, 3, DOT))
    return b


# 10. 인재영입 — 점들이 모여 팀을 이루는 성좌
def constellation():
    b = []
    for gx in range(330, 800, 28):
        for gy in range(30, 470, 28):
            b.append(circ(gx, gy, 1.1, DOTF))
    groups = [[(470, 140), (526, 112), (582, 168), (526, 196)], [(610, 280), (666, 252), (722, 308), (666, 336), (610, 336)],
              [(414, 308), (470, 336), (442, 392)]]
    for i, gr in enumerate(groups):
        b.append(poly(gr, ACC if i == 1 else LINE))
        b += [circ(x, y, 4, DOT) for x, y in gr]
    b.append(line(582, 168, 610, 280, FAINT))
    b.append(line(470, 336, 610, 336, FAINT))
    return b


# 11. 문의하기 — 닿는 신호
def signal():
    cx, cy = 720, 240
    b = []
    for i, r in enumerate(range(40, 460, 42)):
        t0, t1 = math.radians(140), math.radians(220)
        x0, y0 = cx + r * math.cos(t0), cy + r * math.sin(t0)
        x1, y1 = cx + r * math.cos(t1), cy + r * math.sin(t1)
        b.append('<path d="M%s %s A%d %d 0 0 0 %s %s" %s/>' % (f(x0), f(y0), r, r, f(x1), f(y1), ACC if i == 3 else LINE))
    b.append(circ(cx, cy, 6, DOT))
    b.append(circ(cx, cy, 16, LINE))
    return b


# 12. 기술지원 — 상시 모니터링 파형
def pulse():
    b = []
    for i, y in enumerate(range(80, 440, 60)):
        x = 320
        pts = [(x, y)]
        spike = 470 + (i * 67) % 230
        pts += [(spike, y), (spike + 10, y - 8), (spike + 20, y + 8), (spike + 30, y - 36 if i == 3 else y - 22),
                (spike + 42, y + 18), (spike + 52, y), (800, y)]
        b.append(poly(pts, ACC if i == 3 else LINE, close=False))
        b.append(circ(spike + 30, y - 36 if i == 3 else y - 22, 3, DOT if i == 3 else DOTF))
    return b


# 13. 교육·트레이닝 — 단계를 밟아 오르는 계단
def steps():
    b = []
    x, y = 360, 420
    pts = [(x, y)]
    tops = []
    for k in range(6):
        y2 = y - 58
        pts += [(x, y2), (x + 70, y2)]
        tops.append((x + 70, y2))
        x, y = x + 70, y2
    b.append(poly(pts, ACC, close=False))
    for k, (tx, ty) in enumerate(tops):
        b.append(line(tx, ty, tx, 440, FAINT))
        b.append(circ(tx - 35, ty, 3.5, DOT if k == len(tops) - 1 else DOTF))
    b.append(line(320, 440, 800, 440, LINE))
    return b


# 14. 뉴스&인사이트 — 세로 타임라인 위에 연도마다 쌓이는 기사 행
def news():
    b = []
    tx = 420
    b.append(line(tx, 30, tx, 450, LINE))
    y = 62
    for k in range(6):
        acc = k == 1
        b.append(circ(tx, y, 4.5, DOT if acc else DOTF))
        b.append(line(tx + 18, y, tx + 44, y, FAINT))
        rows = 3 if k % 2 == 0 else 2
        for r in range(rows):
            ry = y - 14 + r * 15
            w = 300 - (r * 70 + (k * 37) % 90)
            b.append(line(tx + 60, ry, tx + 60 + w, ry, ACC if (acc and r == 0) else LINE))
        y += 70
    return b


ART = {"layers": layers(), "network": network(), "ontology": ontology(), "gpu": gpu(), "windows": windows(),
       "tiles": windows(1), "orbit": orbit(), "rings": rings(), "replicate": replicate(), "contour": contour(),
       "constellation": constellation(), "signal": signal(), "pulse": pulse(), "steps": steps(), "news": news()}
for k, v in ART.items():
    svg(k, v)
print(len(ART), "files")
