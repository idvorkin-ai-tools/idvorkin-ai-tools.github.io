#!/usr/bin/env python3
"""Build search.json: the index behind the 🔍 search on every explainer page.

    python3 scripts/build_search.py              # writes ./search.json
    python3 scripts/build_search.py --maps-only  # cards only, no crawl

Stdlib only, so the nightly Action needs no installs. Two parts:

  maps  - every card on index.html: title, description, URL, kind.
  pages - every live Pages site a card links to, crawled from its front
          page through same-site links, plus the org's own pages: each
          page's URL, title and h2/h3 headings.

URLs are stored host-relative ("/yegge-field-map/x.html"). A site that
404s or times out keeps its entries from the previous search.json (a
blip must not delete it from search), and the build refuses to write if
the crawl comes back with under half the previous page count.

ponytail: a crawl of the live sites (not the repos), capped at MAX_PAGES a
site and MAX_HEADS a page. Fine for ~40 sites; if search.json passes ~1 MB,
drop h3s or index only each site's front page.
"""

from __future__ import annotations

import json
import re
import sys
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from html import unescape
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin, urldefrag, urlparse

ROOT = Path(__file__).resolve().parent.parent
HOST = "https://idvorkin-ai-tools.github.io/"
MAX_PAGES = 150
MAX_HEADS = 40
MAX_TEXT = 90
UA = "idvorkin-ai-tools-search-index"


def clean(s: str, n: int = MAX_TEXT) -> str:
    s = re.sub(r"\s+", " ", unescape(s)).strip()
    return s if len(s) <= n else s[: n - 1].rstrip() + "…"


class Cards(HTMLParser):
    """The <a class="card"> tiles on index.html, with their .t/.d/.m spans."""

    def __init__(self) -> None:
        super().__init__()
        self.cards: list[dict] = []
        self.card: dict | None = None
        self.field: str | None = None
        self.depth = 0

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        cls = (a.get("class") or "").split()
        if tag == "a" and "card" in cls:
            self.card = {"u": urljoin(HOST, a.get("href") or ""), "t": "", "d": "", "k": ""}
            return
        if self.card is None:
            return
        if tag == "span" and self.field is None and cls[:1] in (["t"], ["d"]):
            self.field, self.depth = cls[0], 0
        elif tag == "b" and self.field is None:
            self.field, self.depth = "k", 0
        elif self.field and tag in ("span", "b"):
            self.depth += 1

    def handle_endtag(self, tag):
        if self.card is None:
            return
        if tag == "a":
            self.cards.append(self.card)
            self.card = None
            self.field = None
        elif self.field and tag in ("span", "b"):
            if self.depth:
                self.depth -= 1
            else:
                self.field = None

    def handle_data(self, data):
        if self.card is not None and self.field:
            self.card[self.field] += data


class Page(HTMLParser):
    """One page's <title>, first <h1>, h2/h3 text and <a href>s."""

    SKIP = {"script", "style", "noscript", "svg"}

    def __init__(self) -> None:
        super().__init__()
        self.title = ""
        self.h1 = ""
        self.heads: list[str] = []
        self.links: list[str] = []
        self.cur: str | None = None
        self.buf = ""
        self.skip = 0

    def handle_starttag(self, tag, attrs):
        if tag in self.SKIP:
            self.skip += 1
        elif tag == "a":
            href = dict(attrs).get("href")
            if href:
                self.links.append(href)
        elif tag in ("title", "h1", "h2", "h3") and self.cur is None:
            self.cur, self.buf = tag, ""

    def handle_endtag(self, tag):
        if tag in self.SKIP:
            self.skip = max(0, self.skip - 1)
        elif tag == self.cur:
            text = clean(self.buf)
            if tag == "title":
                self.title = self.title or text
            elif tag == "h1":
                self.h1 = self.h1 or text
            elif text and text not in self.heads:
                self.heads.append(text)
            self.cur = None

    def handle_data(self, data):
        if self.cur and not self.skip:
            self.buf += data


def fetch(url: str) -> str | None:
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    try:
        with urllib.request.urlopen(req, timeout=20) as r:
            if "html" not in (r.headers.get("Content-Type") or ""):
                return None
            return r.read().decode("utf-8", "replace")
    except (urllib.error.URLError, TimeoutError, ValueError, OSError):
        return None


def crawl(site: str) -> list[dict]:
    """Breadth-first over same-site .html / directory links from `site`."""
    seen, queue, out = {site}, [site], []
    while queue and len(out) < MAX_PAGES:
        url = queue.pop(0)
        html = fetch(url)
        if html is None:
            continue
        p = Page()
        p.feed(html)
        out.append(
            {
                "u": url,
                "t": clean(p.title or p.h1 or url),
                "h": p.heads[:MAX_HEADS],
            }
        )
        for href in p.links:
            nxt = urldefrag(urljoin(url, href.strip()))[0].split("?")[0]
            if not nxt.startswith(site) or nxt in seen:
                continue
            last = urlparse(nxt).path.rsplit("/", 1)[-1]
            if last and not last.endswith(".html"):
                continue  # pdf, png, md, ... not a page
            if nxt.endswith("/index.html"):
                nxt = nxt[: -len("index.html")]
                if nxt in seen:
                    continue
            seen.add(nxt)
            queue.append(nxt)
    return out


def rel(url: str) -> str:
    return "/" + url[len(HOST) :] if url.startswith(HOST) else url


def main() -> int:
    out = ROOT / "search.json"
    try:
        prev = json.loads(out.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        prev = {"pages": []}
    cards = Cards()
    cards.feed((ROOT / "index.html").read_text(encoding="utf-8"))
    maps, urls = [], []
    for c in cards.cards:
        if c["u"] in urls:
            continue  # a card listed under two tabs
        urls.append(c["u"])
        m = {k: clean(v, 400 if k == "d" else MAX_TEXT) for k, v in c.items()}
        m["u"] = rel(m["u"])
        maps.append(m)

    # Each card on this host ending in "/" is a site to crawl. The org's
    # own pages (kinds.html, ...) are single pages, not sites.
    sites = [u for u in urls if u.startswith(HOST) and u.endswith("/") and u != HOST]
    sites += [HOST + f.name for f in sorted(ROOT.glob("*.html")) if f.name != "index.html"]
    if "--maps-only" in sys.argv:
        sites, prev = [], {"pages": []}
    with ThreadPoolExecutor(max_workers=6) as pool:
        crawled = list(pool.map(lambda u: crawl(u) if u.endswith("/") else crawl_one(u), sites))
    pages, skipped = [], []
    for site, got in zip(sites, crawled):
        if not got:
            skipped.append(site)
            r = rel(site)
            got = [p for p in prev["pages"] if p["u"] == r or (r.endswith("/") and p["u"].startswith(r))]
        else:
            for p in got:
                p["u"] = rel(p["u"])
        pages.extend(got)

    if sites and len(skipped) == len(sites):
        print("refusing to write: no site was reachable", file=sys.stderr)
        return 1
    if len(pages) < len(prev["pages"]) // 2:
        print(
            f"refusing to write: {len(pages)} pages vs {len(prev['pages'])} before",
            file=sys.stderr,
        )
        return 1
    data = {"v": 1, "maps": maps, "pages": pages}
    text = json.dumps(data, ensure_ascii=False, separators=(",", ":")) + "\n"
    out.write_text(text, encoding="utf-8")
    print(
        f"search.json: {len(maps)} maps, {len(pages)} pages from "
        f"{len(sites) - len(skipped)}/{len(sites)} sites, {len(text.encode()) // 1024} KB"
    )
    for s in skipped:
        print(f"  unreachable, kept previous entries: {s}", file=sys.stderr)
    return 0


def crawl_one(url: str) -> list[dict]:
    html = fetch(url)
    if html is None:
        return []
    p = Page()
    p.feed(html)
    return [{"u": url, "t": clean(p.title or p.h1 or url), "h": p.heads[:MAX_HEADS]}]


if __name__ == "__main__":
    sys.exit(main())
