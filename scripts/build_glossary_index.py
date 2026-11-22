#!/usr/bin/env python3
"""Write assets/glossary/index.json: the sorted ids of every glossary entry.

    python3 scripts/build_glossary_index.py

terms.js reads it for <div data-terms-list="all">. Rerun after adding a
term; scripts/check_terms.py fails when it is stale. Stdlib only.
"""

import json
from pathlib import Path

GLOSSARY = Path(__file__).resolve().parent.parent / "assets" / "glossary"


def ids() -> list[str]:
    return sorted(p.stem for p in GLOSSARY.glob("*.json") if p.name != "index.json")


def main() -> None:
    out = GLOSSARY / "index.json"
    out.write_text(json.dumps(ids(), indent=0) + "\n", encoding="utf-8")
    print(f"wrote {out.relative_to(GLOSSARY.parent.parent)}: {len(ids())} terms")


if __name__ == "__main__":
    main()
