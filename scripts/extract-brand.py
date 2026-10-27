"""Collect brand candidates from a company website: colours, fonts and logo files.

Uses only the Python standard library. Reads the home page and up to ten of its
stylesheets, then writes:
  <out>/brand.json   colour candidates (CSS custom properties, the most used colours,
                     theme-color), font families, Google Fonts links, logo candidates
  <out>/logo-*.*     downloaded logo candidates (img src, inline <svg>, icons)

Usage: python extract-brand.py https://www.example.com [--out brand-candidates]

The result is a list of candidates, not a decision. Look at the logo files and
the colours, pick the brand colours (usually: one dark, one main, one accent),
and confirm them with the person before you build.
"""
import json
import re
import sys
import urllib.parse
import urllib.request
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path

UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"}
HEX = re.compile(r"#(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b")
RGB = re.compile(r"rgba?\(\s*(\d{1,3})\s*[, ]\s*(\d{1,3})\s*[, ]\s*(\d{1,3})")
VAR = re.compile(r"(--[\w-]+)\s*:\s*([^;}{]+)")
FONT = re.compile(r"font-family\s*:\s*([^;}{]+)", re.I)


def fetch(url: str, binary: bool = False, limit: int = 3_000_000):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=20) as r:
        data = r.read(limit)
        ctype = r.headers.get("Content-Type", "")
    return (data, ctype) if binary else (data.decode("utf-8", "replace"), ctype)


def norm_hex(h: str) -> str:
    h = h.lower()
    return "#" + "".join(c * 2 for c in h[1:]) if len(h) == 4 else h


def is_grey(h: str) -> bool:
    r, g, b = (int(h[i:i + 2], 16) for i in (1, 3, 5))
    return max(r, g, b) - min(r, g, b) < 18


class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.css_links, self.styles, self.logos, self.icons, self.meta = [], [], [], [], {}
        self.inline_svgs, self._svg, self._svg_depth, self._svg_logo, self._in_style = [], [], 0, False, False

    def handle_starttag(self, tag, attrs):
        a = {k: (v or "") for k, v in attrs}
        hint = " ".join([a.get("class", ""), a.get("id", ""), a.get("alt", ""), a.get("aria-label", ""), a.get("src", ""), a.get("title", "")]).lower()
        if tag == "link":
            rel = a.get("rel", "").lower()
            if "stylesheet" in rel and a.get("href"):
                self.css_links.append(a["href"])
            if "icon" in rel and a.get("href"):
                self.icons.append(a["href"])
            if "fonts.googleapis.com" in a.get("href", ""):
                self.meta.setdefault("google_fonts", []).append(a["href"])
        elif tag == "meta" and a.get("name", "").lower() in ("theme-color", "msapplication-tilecolor"):
            self.meta[a["name"].lower()] = a.get("content", "")
        elif tag == "meta" and a.get("property", "").lower() == "og:image":
            self.meta["og_image"] = a.get("content", "")
        elif tag == "img" and "logo" in hint:
            self.logos.append(a.get("src") or a.get("data-src", ""))
        elif tag == "style":
            self._in_style = True
        if a.get("style"):
            self.styles.append(a["style"])
        if tag == "svg" and self._svg_depth == 0:
            self._svg, self._svg_logo = [], "logo" in hint
        if tag == "svg" or self._svg_depth:
            self._svg_depth += tag == "svg"
            self._svg.append(self.get_starttag_text() or "")
            self._svg_logo = self._svg_logo or "logo" in hint

    def handle_endtag(self, tag):
        if tag == "style":
            self._in_style = False
        if self._svg_depth:
            self._svg.append(f"</{tag}>")
            if tag == "svg":
                self._svg_depth -= 1
                if self._svg_depth == 0 and self._svg_logo:
                    self.inline_svgs.append("".join(self._svg))

    def handle_data(self, data):
        if self._in_style:
            self.styles.append(data)


def main() -> None:
    if len(sys.argv) < 2:
        raise SystemExit(__doc__)
    site = sys.argv[1]
    out = Path(sys.argv[sys.argv.index("--out") + 1]) if "--out" in sys.argv else Path("brand-candidates")
    out.mkdir(parents=True, exist_ok=True)
    html, _ = fetch(site)
    page = Page()
    page.feed(html)
    css_texts = list(page.styles)
    for href in page.css_links[:10]:
        try:
            css_texts.append(fetch(urllib.parse.urljoin(site, href))[0])
        except Exception as e:  # a stylesheet that does not load is skipped
            print(f"skipped stylesheet {href}: {e}")
    css = "\n".join(css_texts)

    colours = Counter()
    for h in HEX.findall(css):
        colours[norm_hex(h)] += 1
    for r, g, b in RGB.findall(css):
        if max(int(r), int(g), int(b)) <= 255:
            colours[f"#{int(r):02x}{int(g):02x}{int(b):02x}"] += 1
    variables = {}
    for name, value in VAR.findall(css):
        value = value.strip()
        if HEX.search(value) or RGB.search(value) or any(w in name.lower() for w in ("color", "colour", "brand", "primary", "secondary", "accent", "font")):
            variables.setdefault(name, value)
    fonts = Counter(f.strip().strip("'\"") for decl in FONT.findall(css) for f in [decl.split(",")[0]] if "var(" not in f and "inherit" not in f)

    saved = []
    candidates = [("img", u) for u in page.logos if u] + [("icon", u) for u in page.icons]
    if page.meta.get("og_image"):
        candidates.append(("og", page.meta["og_image"]))
    for k, (kind, src) in enumerate(candidates[:12]):
        url = urllib.parse.urljoin(site, src)
        try:
            data, ctype = fetch(url, binary=True)
        except Exception as e:
            print(f"skipped {url}: {e}")
            continue
        ext = ".svg" if "svg" in ctype or url.lower().split("?")[0].endswith(".svg") else Path(urllib.parse.urlparse(url).path).suffix or ".png"
        name = out / f"logo-{kind}-{k:02d}{ext}"
        name.write_bytes(data)
        saved.append({"file": str(name), "from": url})
    for k, svg in enumerate(page.inline_svgs[:5]):
        if "xmlns" not in svg:
            svg = svg.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"', 1)
        name = out / f"logo-inline-{k:02d}.svg"
        name.write_text(svg, encoding="utf-8")
        saved.append({"file": str(name), "from": "inline <svg> on the home page"})

    result = {
        "site": site,
        "theme_color": page.meta.get("theme-color"),
        "colour_variables": variables,
        "most_used_colours": [{"hex": h, "count": n} for h, n in colours.most_common(40) if not is_grey(h)][:16],
        "most_used_greys": [{"hex": h, "count": n} for h, n in colours.most_common(40) if is_grey(h)][:6],
        "fonts": [{"family": f, "count": n} for f, n in fonts.most_common(8)],
        "google_fonts_links": page.meta.get("google_fonts", []),
        "logo_files": saved,
    }
    (out / "brand.json").write_text(json.dumps(result, indent=2), encoding="utf-8")
    print(f"brand candidates in {out / 'brand.json'}")
    print("colours:", ", ".join(c["hex"] for c in result["most_used_colours"][:8]))
    print("fonts:", ", ".join(f["family"] for f in result["fonts"][:4]))
    print(f"logo files: {len(saved)}")


main()
