# idvorkin-ai-tools.github.io

The org front page: an index of every explainer, field map and interactive that has a live GitHub Pages site under this org.

Live: https://idvorkin-ai-tools.github.io/

## Search

Every explainer page loads `assets/annotate.js`, which draws a 🔍 button (and binds `/`) next to the 💬 comments and GitHub buttons. Its Maps and Pages results come from `search.json` here: the index's cards plus every page (title, h2/h3 headings) of every site a card links to.

`search.json` is generated, not hand-edited: `python3 scripts/build_search.py` (stdlib only) crawls the live sites. The `search index` Action reruns it nightly, on pushes that touch the HTML or the script, and by hand (`gh workflow run "search index"`), and commits only when the file changed. An unreachable site keeps its previous entries.
