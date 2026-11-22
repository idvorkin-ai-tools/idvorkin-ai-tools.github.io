#!/usr/bin/env python3
"""Lint shared term boxes (assets/terms.js) on a map, or on this hub.

    python3 scripts/check_terms.py [map-dir]     # default: this repo

Checks:
  - every assets/glossary/<id>.json is valid JSON with non-empty term,
    plain, eli5 and technical, and no keys beyond formula and m;
  - assets/glossary/index.json lists exactly the entries on disk
    (fix: python3 scripts/build_glossary_index.py);
  - in every .html under map-dir: each data-term id has a glossary entry,
    no id is boxed twice on one page, and a page using terms, a
    definitions list or a mode block loads terms.js.
Exit 1 on any problem. Stdlib only.
"""

import json
import re
import sys
from pathlib import Path

HUB = Path(__file__).resolve().parent.parent
GLOSSARY = HUB / "assets" / "glossary"
REQUIRED = ("term", "plain", "eli5", "technical")
OPTIONAL = ("formula", "m", "see")
SKIP = {".git", "node_modules", "tools", ".worktrees"}
MODE_BLOCK = re.compile(r'class="[^"]*\b(plain-only|tech-only|eli5-only|no-tech)\b')


def check_glossary() -> list[str]:
    errs, ids = [], []
    for p in sorted(GLOSSARY.glob("*.json")):
        if p.name == "index.json":
            continue
        ids.append(p.stem)
        if not re.fullmatch(r"[a-z0-9]+(-[a-z0-9]+)*", p.stem):
            errs.append(f"{p.name}: id must be lowercase-with-hyphens")
        try:
            d = json.loads(p.read_text(encoding="utf-8"))
        except ValueError as e:
            errs.append(f"{p.name}: not valid JSON: {e}")
            continue
        for k in REQUIRED:
            if not str(d.get(k, "")).strip():
                errs.append(f"{p.name}: missing {k!r}")
        extra = set(d) - set(REQUIRED) - set(OPTIONAL)
        if extra:
            errs.append(f"{p.name}: unknown keys {sorted(extra)}")
    try:
        index = json.loads((GLOSSARY / "index.json").read_text(encoding="utf-8"))
    except (OSError, ValueError):
        index = None
    if index != sorted(ids):
        errs.append("index.json is stale: run python3 scripts/build_glossary_index.py")
    return errs


def check_page(s: str, known: set[str]) -> list[str]:
    errs = []
    terms = re.findall(r'data-term="([^"]+)"', s)
    for t in sorted(set(terms)):
        if terms.count(t) > 1:
            errs.append(f"data-term={t!r} boxed {terms.count(t)} times; box only the first use")
        if t not in known:
            errs.append(f"data-term={t!r} has no assets/glossary/{t}.json")
    uses = terms or "data-terms-list" in s or MODE_BLOCK.search(s)
    if uses and "terms.js" not in s:
        errs.append("uses terms or mode blocks but does not load terms.js")
    return errs


def main() -> None:
    root = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else HUB
    errs = check_glossary()
    for e in errs:
        print("FAIL glossary:", e)
    known = {p.stem for p in GLOSSARY.glob("*.json")} - {"index"}
    bad = bool(errs)
    pages = 0
    for f in sorted(root.rglob("*.html")):
        if SKIP & set(f.relative_to(root).parts):
            continue
        page_errs = check_page(f.read_text(encoding="utf-8"), known)
        pages += 1
        for e in page_errs:
            print(f"FAIL {f.relative_to(root)}: {e}")
        bad |= bool(page_errs)
    print(f"{'FAILED' if bad else 'ok'}: {len(known)} glossary entries, {pages} pages under {root}")
    sys.exit(1 if bad else 0)


if __name__ == "__main__":
    main()
