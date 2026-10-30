#!/usr/bin/env python3
"""
영문 페이지 만들기 — dist/ 의 국문 페이지에 번역 사전을 적용해 dist/en/ 을 만듭니다.

  python3 tools/build_en.py dist              영문 페이지를 만듭니다 (build.sh 가 부릅니다)
  python3 tools/build_en.py dist --extract    번역할 문구를 tools/i18n/_todo.json 으로 뽑습니다
  python3 tools/build_en.py dist --review     국문↔영문 대조표를 tools/i18n/en-review.csv 로 씁니다

원리
  - 국문 페이지는 그대로 두고, 같은 구조의 영문 페이지를 dist/en/ 아래에 만듭니다.
    국문을 고치면 다음 빌드 때 영문도 같은 구조로 다시 만들어집니다.
  - 문구 단위는 '문단'입니다. <p>·<li>·<h2> 처럼 글자와 인라인 태그(span·a·strong·br …)만 담은 덩어리 하나가
    사전의 한 항목입니다. 안쪽 태그는 ⟦0⟧ ⟦1⟧ … 자리표로 바꿔 사전에 담고, 적용할 때 원래 태그로 되돌립니다.
    (그래서 페이지마다 링크 주소가 달라도 같은 문구는 한 번만 번역하면 됩니다.)
  - alt·title·aria-label·placeholder·content 같은 속성값도 같은 사전으로 바꿉니다.
  - 사전에 없는 문구는 국문 그대로 두고, 빌드 끝에 '미번역 N곳'으로 알려 줍니다. 빌드를 멈추지는 않습니다.
  - 개인정보처리방침(privacy.html)과 404 는 국문만 둡니다. 영문 페이지의 링크는 국문 문서를 가리킵니다.

사전: tools/i18n/en.json  —  { "국문 문구(자리표 포함)": "English text (same placeholders)" }
"""
import csv
import glob
import html
import io
import json
import os
import re
import sys
from html.parser import HTMLParser

HERE = os.path.dirname(os.path.abspath(__file__))
DICT = os.path.join(HERE, "i18n", "en.json")
TODO = os.path.join(HERE, "i18n", "_todo.json")
REVIEW = os.path.join(HERE, "i18n", "en-review.csv")

KO_ONLY = {"privacy.html", "404.html"}          # 영문을 만들지 않는 페이지
HANGUL = re.compile(r"[가-힣ㄱ-ㆎ]")
VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param",
        "source", "track", "wbr"}
INLINE = {"a", "span", "strong", "em", "b", "i", "br", "small", "sup", "sub", "code", "abbr",
          "mark", "u", "s", "time", "wbr", "img", "q", "cite", "bdi", "data", "var", "kbd", "tspan"}
SKIP = {"script", "style", "template", "noscript"}   # 안쪽 글자를 문구로 보지 않습니다 (svg 의 text·title 은 번역합니다)
ATTRS = {"alt", "title", "aria-label", "placeholder", "content", "data-label", "label",
         "data-proof-name", "data-owner", "value", "aria-description", "data-title"}
PH = re.compile(r"⟦(\d+)⟧")


def tr_attr(name):
    """번역할 속성인지 — 목록에 있거나 data-ph-* (문의 유형별 입력 안내문)."""
    name = name.lower()
    return name in ATTRS or name.startswith("data-ph-")


# ── HTML 을 위치 정보와 함께 나무 구조로 읽기 ───────────────────────────
class Node:
    __slots__ = ("tag", "start", "tag_end", "end_start", "end", "children", "parent", "text")

    def __init__(self, tag, start=0, tag_end=0, parent=None, text=None):
        self.tag, self.start, self.tag_end, self.parent, self.text = tag, start, tag_end, parent, text
        self.end_start = self.end = (tag_end if tag in ("#text", "#comment") else None)
        self.children = []


class Tree(HTMLParser):
    def __init__(self, src):
        super().__init__(convert_charrefs=False)
        self.src = src
        self.lines = [0]
        for m in re.finditer("\n", src):
            self.lines.append(m.end())
        self.root = Node("#root", 0, 0)
        self.root.end_start = self.root.end = len(src)
        self.cur = self.root
        self.feed(src)
        self.close()
        # 닫히지 않은 요소는 부모 끝에서 닫힌 것으로 봅니다.
        n = self.cur
        while n is not self.root:
            n.end_start = n.end = n.parent.end_start if n.parent.end_start is not None else len(src)
            n = n.parent

    def off(self):
        line, col = self.getpos()
        return self.lines[line - 1] + col

    def handle_starttag(self, tag, attrs):
        s = self.off()
        e = s + len(self.get_starttag_text())
        node = Node(tag, s, e, self.cur)
        self.cur.children.append(node)
        if tag in VOID:
            node.end_start = node.end = e
        else:
            self.cur = node

    def handle_startendtag(self, tag, attrs):
        s = self.off()
        e = s + len(self.get_starttag_text())
        node = Node(tag, s, e, self.cur)
        node.end_start = node.end = e
        self.cur.children.append(node)

    def handle_endtag(self, tag):
        s = self.off()
        n = self.cur
        while n is not self.root and n.tag != tag:
            n = n.parent
        if n is self.root:
            return
        # 사이에 닫히지 않은 요소들은 여기서 닫습니다.
        m = self.cur
        while m is not n:
            m.end_start = m.end = s
            m = m.parent
        e = self.src.index(">", s) + 1
        n.end_start, n.end = s, e
        self.cur = n.parent

    def _text(self, data):
        s = self.off()
        self.cur.children.append(Node("#text", s, s + len(data), self.cur, data))

    handle_data = _text

    def handle_entityref(self, name):
        self._text("&%s;" % name)

    def handle_charref(self, name):
        self._text("&#%s;" % name)

    def handle_comment(self, data):
        s = self.off()
        self.cur.children.append(Node("#comment", s, s + len(data) + 7, self.cur))


def inline_only(n, memo):
    if n in memo:
        return memo[n]
    ok = True
    for c in n.children:
        if c.tag in ("#text", "#comment"):
            continue
        if c.tag not in INLINE or not inline_only(c, memo):
            ok = False
            break
    memo[n] = ok
    return ok


def segments(src):
    """문구 덩어리의 (시작, 끝) 위치 목록 — 한글이 들어 있는 것만."""
    tree = Tree(src)
    memo, out = {}, []

    def walk(n):
        if n.tag in SKIP:
            return
        run = []

        def flush():
            if run:
                s, e = run[0].start, run[-1].end
                if HANGUL.search(re.sub(r"<[^>]*>", "", src[s:e])):
                    out.append((s, e))
                run.clear()

        for c in n.children:
            if c.tag == "#text":
                run.append(c)
            elif c.tag == "#comment":
                if run:
                    run.append(c)
            elif c.tag in INLINE and c.tag not in SKIP and inline_only(c, memo):
                run.append(c)
            else:
                flush()
                walk(c)
        flush()

    walk(tree.root)
    return out


# ── 문구 ↔ 사전 열쇠 ─────────────────────────────────────────────
TAG = re.compile(r"<[^>]+>")
CMT = re.compile(r"<!--.*?-->", re.S)


def to_key(frag):
    """덩어리 HTML → (열쇠, 태그 목록, 앞뒤 공백). 열쇠는 태그를 ⟦n⟧ 으로 바꾸고 공백을 하나로 모은 문자열."""
    frag = CMT.sub("", frag)
    lead = re.match(r"\s*", frag).group(0)
    trail = re.search(r"\s*$", frag).group(0)
    body = frag.strip()
    tags = []

    def ph(m):
        tags.append(m.group(0))
        return "⟦%d⟧" % (len(tags) - 1)

    key = re.sub(r"\s+", " ", TAG.sub(ph, body))
    return key, tags, lead, trail


def from_key(en, tags):
    def back(m):
        i = int(m.group(1))
        return tags[i] if i < len(tags) else ""
    return PH.sub(back, en)


def attr_values(src):
    """한글이 든 속성값의 (시작, 끝, 값) 목록."""
    out = []
    for m in re.finditer(r"<[a-zA-Z][^>]*>", src):
        t = m.group(0)
        if t.startswith(("<script", "<style")):
            pass
        for a in re.finditer(r'\s([a-zA-Z:-]+)="([^"]*)"', t):
            if tr_attr(a.group(1)) and HANGUL.search(a.group(2)):
                out.append((m.start() + a.start(2), m.start() + a.end(2), a.group(2)))
    return out


# ── 번역 적용 ─────────────────────────────────────────────────────
def translate(src, d, missing, where):
    edits = []
    for s, e in segments(src):
        key, tags, lead, trail = to_key(src[s:e])
        if not HANGUL.search(key):
            continue
        en = d.get(key)
        if en is None:
            missing.setdefault(key, set()).add(where)
            continue
        edits.append((s, e, lead + from_key(en, tags) + trail))
    taken = [(s, e) for s, e, _ in edits]
    for s, e, v in attr_values(src):
        if any(a <= s < b for a, b in taken):
            continue      # 이미 문구 덩어리 안에 들어 있는 태그의 속성은 덩어리 번역이 맡습니다
        key = re.sub(r"\s+", " ", v.strip())
        en = d.get(key)
        if en is None:
            missing.setdefault(key, set()).add(where)
            continue
        edits.append((s, e, en.replace('"', "&quot;")))
    # 덩어리 안쪽 태그의 속성(alt 등)은 덩어리 번역 뒤에 한 번 더 바꿉니다.
    out = src
    for s, e, v in sorted(edits, key=lambda x: -x[0]):
        out = out[:s] + v + out[e:]
    def inner_attr(m):
        name, val = m.group(1), m.group(2)
        if tr_attr(name) and HANGUL.search(val):
            key = re.sub(r"\s+", " ", val.strip())
            if key in d:
                return ' %s="%s"' % (name, d[key].replace('"', "&quot;"))
            missing.setdefault(key, set()).add(where)
        return m.group(0)
    out = re.sub(r'\s([a-zA-Z:-]+)="([^"]*)"', inner_attr, out)
    return out


# ── 경로·언어 처리 ────────────────────────────────────────────────
def en_pages(dist):
    pages = []
    for p in sorted(glob.glob(os.path.join(dist, "**", "*.html"), recursive=True)):
        rel = os.path.relpath(p, dist).replace(os.sep, "/")
        if rel.startswith("en/") or rel in KO_ONLY:
            continue
        pages.append(rel)
    return pages


def fix_links(doc, rel, translated):
    """영문 페이지 위치(en/rel) 기준으로 링크를 고칩니다.
       번역한 페이지끼리는 그대로, 그 밖(assets·국문 전용 문서)은 한 단계 위(../)를 가리키게 합니다."""
    here = os.path.dirname(rel)

    def fix(m):
        attr, url = m.group(1), m.group(2)
        if url.startswith(("http:", "https:", "//", "#", "mailto:", "tel:", "data:", "javascript:")):
            return m.group(0)
        if url.startswith("/"):
            path = url.lstrip("/").split("#")[0].split("?")[0]
            if path in translated:
                return '%s="/en/%s"' % (attr, url.lstrip("/"))
            return m.group(0)
        path = url.split("#")[0].split("?")[0]
        if not path:
            return m.group(0)
        target = os.path.normpath(os.path.join(here, path)).replace(os.sep, "/")
        if target in translated:
            return m.group(0)
        return '%s="../%s"' % (attr, url)

    return re.sub(r'\b(href|src)="([^"]+)"', fix, doc)


def lang_switch(doc, rel, is_en):
    """KR | EN 전환 링크와 hreflang 대체 링크를 맞춥니다."""
    depth = rel.count("/")
    up = "../" * depth
    if is_en:
        ko_href, en_href = "../" * (depth + 1) + rel, os.path.basename(rel)
    else:
        ko_href, en_href = os.path.basename(rel), up + "en/" + rel

    def sw(m):
        block = m.group(0)
        block = re.sub(r'<a href="[^"]*"( aria-current="true")?>KR</a>',
                       '<a href="%s" hreflang="ko" lang="ko"%s>KR</a>' % (ko_href, "" if is_en else ' aria-current="true"'), block)
        block = re.sub(r'<a href="[^"]*" hreflang="en"( aria-current="true")?>EN</a>',
                       '<a href="%s" hreflang="en" lang="en"%s>EN</a>' % (en_href, ' aria-current="true"' if is_en else ""), block)
        return block

    doc = re.sub(r'<p class="sw-lang".*?</p>', sw, doc, flags=re.S)
    alt = ('<link rel="alternate" hreflang="ko" href="%s">\n<link rel="alternate" hreflang="en" href="%s">\n'
           % (ko_href, en_href))
    if 'hreflang="ko" href=' not in doc:
        doc = doc.replace("</head>", alt + "</head>", 1)
    return doc


def build(dist):
    d = json.load(io.open(DICT, encoding="utf-8")) if os.path.exists(DICT) else {}
    pages = en_pages(dist)
    translated = set(pages)
    missing = {}
    for rel in pages:
        src = io.open(os.path.join(dist, rel), encoding="utf-8").read()
        # 국문 페이지: EN 버튼이 영문 페이지를 가리키게 합니다.
        io.open(os.path.join(dist, rel), "w", encoding="utf-8").write(lang_switch(src, rel, False))
        doc = translate(src, d, missing, rel)
        doc = re.sub(r'<html lang="ko"', '<html lang="en"', doc, count=1)
        doc = fix_links(doc, rel, translated)
        doc = lang_switch(doc, rel, True)
        out = os.path.join(dist, "en", rel)
        os.makedirs(os.path.dirname(out), exist_ok=True)
        io.open(out, "w", encoding="utf-8").write(doc)
    n = sum(len(v) for v in missing.values())
    print("  영문 %d쪽 · 사전 %d항목 · 미번역 %d곳(%d문구)" % (len(pages), len(d), n, len(missing)))
    if missing:
        for k in list(missing)[:8]:
            print("    - %s  (%s)" % (k[:60], ", ".join(sorted(missing[k])[:2])))
    return missing


def extract(dist):
    d = json.load(io.open(DICT, encoding="utf-8")) if os.path.exists(DICT) else {}
    found = {}
    for rel in en_pages(dist):
        src = io.open(os.path.join(dist, rel), encoding="utf-8").read()
        for s, e in segments(src):
            key = to_key(src[s:e])[0]
            if HANGUL.search(key):
                found.setdefault(key, set()).add(rel)
        for s, e, v in attr_values(src):
            key = re.sub(r"\s+", " ", v.strip())
            found.setdefault(key, set()).add(rel)
    todo = {k: sorted(v) for k, v in found.items() if k not in d}
    os.makedirs(os.path.dirname(TODO), exist_ok=True)
    json.dump(todo, io.open(TODO, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    chars = sum(len(PH.sub("", k)) for k in todo)
    print("  문구 %d개 중 미번역 %d개 (%d자) → %s" % (len(found), len(todo), chars, TODO))


def review(dist):
    d = json.load(io.open(DICT, encoding="utf-8")) if os.path.exists(DICT) else {}
    where = {}
    for rel in en_pages(dist):
        src = io.open(os.path.join(dist, rel), encoding="utf-8").read()
        for s, e in segments(src):
            key = to_key(src[s:e])[0]
            if HANGUL.search(key):
                where.setdefault(key, []).append(rel)
        for s, e, v in attr_values(src):
            where.setdefault(re.sub(r"\s+", " ", v.strip()), []).append(rel)
    with io.open(REVIEW, "w", encoding="utf-8-sig", newline="") as f:
        w = csv.writer(f)
        w.writerow(["페이지", "국문", "영문"])
        for k, pages in sorted(where.items(), key=lambda kv: (sorted(set(kv[1]))[0], kv[0])):
            ko = html.unescape(PH.sub("", k))
            en = html.unescape(PH.sub("", d.get(k, "(미번역)")))
            w.writerow([", ".join(sorted(set(pages))), ko, en])
    print("  대조표 → %s" % REVIEW)


if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    dist = sys.argv[1]
    if "--extract" in sys.argv:
        extract(dist)
    elif "--review" in sys.argv:
        review(dist)
    else:
        build(dist)
