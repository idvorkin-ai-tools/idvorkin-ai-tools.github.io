/*
  annotate.js — private Comments mode for the explainer sites.

  One copy, hosted here, loaded by every explainer page with

    <script src="https://idvorkin-ai-tools.github.io/assets/annotate.js" defer></script>

  It is a port of the blog's _includes/annotate.html (idvorkin.github.io)
  with no Jekyll in it: page identity comes from the URL, not from Liquid.
  Left out on purpose: the blog's rendered-diff view and its "open PRs touch
  this page" badge, both specific to the blog repo. The blog puts the 💬
  toggle in its navbar, next to the navbar's own GitHub link; here, with no
  shared header, it is the floating top-right pair.

  KEEP IN SYNC (Igor 2026-11-21): this file and the blog's
  _includes/annotate.html are double-written. A fix or feature in one is
  ported to the other in the same change, or filed against the other the
  same day. The blog copy is the spec. One exception: SEARCH (the 🔍
  button, `/` and search.json) is explainer-only and is not ported; the
  blog has its own search.

  NO NETWORK UNTIL USED. Every reader gets three small buttons, fixed top
  right (Igor 2026-11-21: "everyone can see the chat box"): a 🔍 search
  (see SEARCH), a GitHub link to this page's source and a 💬 toggle that
  turns Comments mode on and off live (no reload; aria-pressed and a blue
  fill say it is on; the tooltip names the page path). Building them is DOM
  only: no request until the reader opens search (one GET of search.json)
  or sends something, and none ever to a Cockpit this browser has not
  saved, except when the reader clicks Connect.

  SEARCH (explainer-only, Igor 2026-11-21): the 🔍 button, or `/` when
  focus is not in a field and the page has not bound `/` itself (the org
  index's own box keeps `/`), opens a small overlay. Results come in three
  groups: This page (its h1-h4 headings; picking one scrolls there), Maps
  (the org index's cards) and Pages (every page of every map, by title and
  h2/h3 headings; a heading hit links with a #:~:text= fragment). Arrows
  move, Enter opens, Esc or a tap outside closes. Maps and Pages come from
  /search.json on the host that serves this script, fetched on the first
  open only; it is built by scripts/build_search.py in the org repo,
  nightly and on index changes, by the "search index" Action. If it fails
  to load, This page still works.

  OWNER vs READER. The setup prompts (Cockpit address, GitHub token), the
  `#larry-cockpit=` fragment and the status dot are the owner's alone. A
  browser is the owner's once ?annotate=1 or the shortcut has been used
  there (localStorage `blogAnnotateOwner`), or it has a saved token or
  Cockpit address, or it already had Comments on before the toggle shipped.
  A reader without Larry can still comment and chat; Send opens the review
  card with "Copy for Igor" (readable text led by the page URL), plus
  "Upload to gist" only when a token is saved. The chat panel's Copy does
  the same for a chat message.

  Enable  : open any explainer page with ?annotate=1  (persists; marks owner)
  Disable : open any explainer page with ?annotate=0
  Toggle  : the 💬 button, or Cmd/Ctrl+Shift+A on desktop (marks owner)

  localStorage is per origin, so one ?annotate=1 turns it on for every
  explainer on this host (they all share it), and none of this touches the
  blog's own setting.

  Once enabled: select text -> a small "Comment" bubble appears near the
  selection -> tap it (or press Enter) -> type a note -> pick an intent -> Save (or
  Cmd/Ctrl+Enter, or Enter twice at the end of the note; Escape cancels).
  Notes buffer in localStorage across pages. "Review (N)" opens the list;
  "Send to Larry" posts one batch per page.

  INTENT: one tap, seven choices (fix / cut / rewrite / expand / check /
  question / note), default `note`, the same list as the blog.

  PAGE IDENTITY, read from the URL (GitHub Pages project sites):
    * site repo   = first path segment, owner = the `<owner>.github.io` host
                    (override with data-repo="owner/name" on the script tag)
    * source file = the rest of the path; a trailing "/" means index.html and
                    an extension-less last segment means "<name>.html"
    * branch      = data-branch on the script tag, for a site that publishes
                    from a branch other than main; else not sent
  PAGE VERSION: GitHub Pages' Last-Modified (document.lastModified, the
  site's deploy time) plus a length and FNV-1a digest of the page's text, as
  the blog does.

  SEND TO LARRY: where a batch goes depends on the host.
    * A tailnet host (`*.ts.net`) or localhost (a local preview): the Cockpit
      on the SAME hostname over https at the default port (`/blog-review`),
      plus a status dot from `/larry/status`.
    * Anywhere else (the public explainer host): the origin saved in
      localStorage `blogLarryCockpit`, set once by the prompt on the first
      Send or by opening any page with `#larry-cockpit=<origin>` (a fragment,
      so it stays out of server logs; it strips itself and asks before
      replacing a different saved address). The fragment is saved only in
      the owner's browser (see OWNER vs READER); on a new device use
      Connect (below) or open `?annotate=1#larry-cockpit=<origin>`. Only an https origin on a
      tailnet name or localhost is accepted. That Cockpit must allow CORS
      from this origin (its `cors_origins`).
    * CONNECT (Cockpit story 196): with no address, the pill shows "Connect
      to Larry". It gets a challenge from
      `<Cockpit>/pair/start` (bound to this origin), Igor types it into the
      Cockpit's "Pair a page" and types the 6-digit number it shows back here
      (`/pair/redeem`; 5 min, single use). Then the address is saved as the
      fragment saves it. The same box offers one-click `#larry-cockpit=` links
      for a browser that has the Cockpit open. DEFAULT_COCKPIT names the Cockpit
      Connect pairs with (published with Igor's OK); the address box shows it
      and takes another if that one can't be reached.
    * If the POST fails, errors or hangs past COCKPIT_TIMEOUT_MS: one SECRET
      gist per batch (token asked for only then), description
      `blog-review: <path>`, file review.json. The review card also offers
      Copy to clipboard and Upload to gist by hand.
  The POST body is the blog's {id, permalink, page_url, title, annotations}
  plus `source_repo`, `source_path` and, when known, `branch`, so the chat
  says which repo and file to edit.

  NOTES STRAIGHT TO CHAT: with a Cockpit, the note box has "Send straight
  to chat", ticked by default and remembered per browser (localStorage
  `blogAnnotateToChat`, "0" when unticked). A ticked note is posted at once
  to `/blog-review` (the page's thread) and the Send button reads "Sent to
  chat ✓"; if the Cockpit can't be reached it stays on the Review list
  ("Chat unreachable: saved to Review") and goes on the next status or chat
  poll that answers. Unticked, a note waits on the Review list for Send to
  Larry. With no Cockpit there is no box.

  CHAT PANEL: "Chat" in the pill opens a small panel (bottom right) for
  talking to Larry about this page, typed or dictated (Enter sends,
  Shift+Enter is a line break, two trailing newlines also send). Each
  message goes to `<Cockpit>/page-chat`, the page's own Cockpit thread (made
  on its first message), so the same conversation is in the Cockpit; his
  replies there show in the panel, polled every CHAT_POLL_MS while it is
  open and the tab is visible. Same Cockpit address as SEND TO LARRY. A
  Cockpit that predates the route looks the same as one out of reach (its 404 has no CORS header):
  the panel says "can't reach the Cockpit, or it has no page chat yet"
  and keeps the text; a resend of the same text reuses its id. URLs in
  messages render as links (built as nodes, never innerHTML). After the
  first send on a brand-new thread the panel re-reads it from the start, so
  the Cockpit's page-details opener sits above that message. Copy puts the
  message and the page URL on the clipboard, for a reader without Larry.

  TALK WHILE POINTING (Cockpit story 317, cockpit-86l): "🎙 Talk" in the
  pill, shown only with a Cockpit address and a browser that records
  (MediaRecorder + getUserMedia). Press it, talk while pointing with the
  mouse, a finger or the Pencil, press Stop (or it stops at TALK_MAX_MS).
  The block under the pointer gets a faint red outline meanwhile. One POST
  to `<Cockpit>/point-review` carries the recording (base64) and the
  pointer trace on the recorder's clock: each sample is ms since the
  recorder's start event, both from event.timeStamp, with the block under
  the point (tag, nearest heading, its text) and the word under it,
  resolved here because the Cockpit sees only the trace. The Cockpit
  transcribes it with word timings, pins each word to what was under the
  pointer when it was said, and posts one message on the page's thread
  (the chat panel's). Mic and pointer listeners exist only while
  recording; Comments off mid-recording stops the mic and sends nothing.
  A failed send keeps the recording for "↻ Retry talk" (same id, so a
  duplicate wakes nobody) until the page reloads. There is no gist
  fallback for audio.

  SECURITY: the GitHub token lives ONLY in this browser's localStorage under
  `blogAnnotateToken` and is sent only to api.github.com. Use one with the
  `gist` scope only.
*/
(function () {
  "use strict";

  var FLAG_KEY = "blogAnnotate";
  var TOKEN_KEY = "blogAnnotateToken";
  var BUF_KEY = "blogAnnotateBuffer";
  var COCKPIT_KEY = "blogLarryCockpit"; // saved Cockpit origin, off-tailnet
  var TO_CHAT_KEY = "blogAnnotateToChat"; // "0": notes wait on the Review list
  // The Cockpit Connect pairs with, published with Igor's OK (2026-11-22,
  // Cockpit story 196): pairing is only a challenge and a number. Only a click on
  // Connect sends to it; Send and Chat use the saved address alone.
  var DEFAULT_COCKPIT = "https://c-5004.squeaker-teeth.ts.net";
  var COCKPIT_TIMEOUT_MS = 8000; // a hung POST off the tailnet falls back
  var CTX = 30; // chars of prefix/suffix context (W3C TextQuoteSelector)
  var ENTER_SAVE_MS = 400; // two trailing Enters this close together save the note

  // Read while the script is executing; null after (and in some old browsers).
  var SCRIPT = document.currentScript;

  // Enter-Enter save rule, decided from the textarea's value before and
  // after one input event (not keydown: dictation and phone keyboards often
  // send no usable Enter key). Same rule as the blog.
  function noteEnterStep(prev, next, caretAtEnd, lastAt, now) {
    if (!caretAtEnd || next.slice(0, prev.length) !== prev) {
      return { save: false, lastAt: null };
    }
    var tail = /\s*$/.exec(next.slice(prev.length))[0];
    var enters = tail.split("\n").length - 1;
    var hasText = next.trim() !== "";
    if (enters >= 2) return { save: hasText, lastAt: null };
    if (enters === 0) return { save: false, lastAt: null };
    if (hasText && lastAt !== null && now - lastAt <= ENTER_SAVE_MS) {
      return { save: true, lastAt: null };
    }
    return { save: false, lastAt: now };
  }

  // Should this keydown open the composer for the selection's bubble?
  // Plain Enter only, bubble showing, composer shut, focus not in a field.
  // Same rule as the blog.
  function enterOpensComposer(e, isLive, composerOpen, bubbleShown) {
    if (!isLive || composerOpen || !bubbleShown) return false;
    if (e.key !== "Enter" || e.repeat || e.isComposing || e.defaultPrevented)
      return false;
    if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return false;
    var t = e.target;
    if (t && t.nodeType === 1) {
      if (t.isContentEditable) return false;
      if (/^(INPUT|TEXTAREA|SELECT|BUTTON|A)$/.test(t.tagName)) return false;
    }
    return true;
  }

  // {repo: "owner/name" | "", path: "file in that repo" | ""} for a page on a
  // GitHub Pages project site. `override` is the script tag's data-repo.
  // ponytail: assumes the site is served from the repo root with no build
  // step, true of every explainer today; a site with a build output folder
  // would need data-repo plus a data-path prefix.
  function pageSource(hostname, pathname, override) {
    var segs = String(pathname || "/").split("/").filter(function (s) {
      return s !== "";
    });
    var repo = String(override || "").trim();
    if (!repo) {
      var m = /^([a-z0-9-]+)\.github\.io$/i.exec(String(hostname || ""));
      if (!m || !segs.length) return { repo: "", path: "" };
      repo = m[1] + "/" + segs[0];
    }
    // With data-repo the site is served from the host root (the org index
    // itself), so no path segment names the repo.
    var rest = override ? segs : segs.slice(1);
    var path;
    if (!rest.length || /\/$/.test(pathname)) {
      path = rest.concat(["index.html"]).join("/");
    } else {
      var last = rest[rest.length - 1];
      if (last.indexOf(".") < 0) rest[rest.length - 1] = last + ".html";
      path = rest.join("/");
    }
    try {
      path = decodeURIComponent(path);
    } catch (e) {
      /* keep it encoded */
    }
    return { repo: repo, path: path };
  }

  // ------------------------------------------------- talk while pointing
  // Pure pieces of TALK WHILE POINTING (see the header), on
  // window.blogAnnotate for the tests. The browser resolves what the
  // pointer is over, since the Cockpit only ever sees the trace.
  var TALK_MAX_MS = 5 * 60 * 1000; // a recording stops itself here
  var TALK_TIMEOUT_MS = 90000; // the Cockpit transcribes before it answers
  var TALK_MOVE_MS = 250; // a move on the same word is kept this often
  var TALK_MAX_SAMPLES = 4000;
  var TALK_MAX_TARGETS = 2000;
  var TALK_BLOCKS =
    "p,li,dt,dd,h1,h2,h3,h4,h5,h6,pre,blockquote,figure,img,svg,video," +
    "canvas,td,th,table";
  var TALK_CHROME = '[id^="blog-annot-"],#dev-info-banner';
  var TALK_INLINE = /^(A|ABBR|B|CODE|EM|I|KBD|MARK|S|SMALL|SPAN|STRONG|SUB|SUP|U)$/;
  var TALK_WORD = /[^\s.,;:!?()"“”[\]{}<>]/;

  // The block an element sits in, or null on the tool's own UI, the local
  // dev banner, and anything that is not inside one (margins).
  function talkBlock(el) {
    if (el && el.nodeType !== 1) el = el.parentElement;
    if (!el || !el.closest) return null;
    if (el.closest(TALK_CHROME)) return null;
    var block = el.closest(TALK_BLOCKS);
    if (block) return block;
    // a page built of divs (an explainer's cards): the nearest element,
    // past inline ones, that holds text of its own
    for (var n = el; n && n.nodeType === 1; n = n.parentElement) {
      if (n === document.body || n === document.documentElement) break;
      if (TALK_INLINE.test(n.tagName)) continue;
      for (var c = n.firstChild; c; c = c.nextSibling)
        if (c.nodeType === 3 && /\S/.test(c.data)) return n;
    }
    return null;
  }

  function talkClean(s, cap) {
    return String(s || "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, cap);
  }

  // What the agent is told a block is: tag, the nearest h1-h4 above it,
  // and its text (an image's alt, a diagram's label).
  function talkDescribe(el) {
    var tag = el.tagName.toLowerCase();
    var heading = "";
    if (!/^h[1-6]$/.test(tag)) {
      var hs = document.querySelectorAll("h1,h2,h3,h4");
      for (var i = 0; i < hs.length; i++) {
        if (hs[i].compareDocumentPosition(el) & 4) heading = hs[i];
        else break;
      }
      heading = heading ? talkClean(heading.textContent, 200) : "";
    }
    var quote;
    if (tag === "img")
      quote =
        el.getAttribute("alt") ||
        el.getAttribute("title") ||
        String(el.getAttribute("src") || "").split("/").pop();
    else if (tag === "svg")
      quote =
        el.getAttribute("aria-label") ||
        (el.querySelector("title") || {}).textContent ||
        el.textContent;
    else quote = el.textContent;
    var out = { tag: tag, heading: heading, quote: talkClean(quote, 160) };
    if (el.id) out.id = talkClean(el.id, 100);
    return out;
  }

  // The word under (x, y), or "" when there is none or it is not in the
  // block the pointer is over (caret APIs snap to the nearest text).
  function talkWordAt(x, y, el) {
    if (x === null || x === undefined) return "";
    var node, off;
    try {
      if (document.caretPositionFromPoint) {
        var cp = document.caretPositionFromPoint(x, y);
        if (!cp) return "";
        node = cp.offsetNode;
        off = cp.offset;
      } else if (document.caretRangeFromPoint) {
        var r = document.caretRangeFromPoint(x, y);
        if (!r) return "";
        node = r.startContainer;
        off = r.startOffset;
      } else return "";
    } catch (e) {
      return "";
    }
    if (!node || node.nodeType !== 3) return "";
    var block = talkBlock(node);
    if (!block || block !== talkBlock(el)) return "";
    var text = node.data;
    var a = off;
    var b = off;
    while (a > 0 && TALK_WORD.test(text[a - 1])) a--;
    while (b < text.length && TALK_WORD.test(text[b])) b++;
    return text.slice(a, b).slice(0, 60);
  }

  // The trace one recording builds: `targets` (each block once) and
  // `samples` ({t, k, p, x, y, i, w}: ms since the recorder started, kind,
  // pointer type, viewport point, target index or null, word). A move that
  // changes neither target nor word is dropped within TALK_MOVE_MS: the
  // target in force at any moment is the last sample's either way.
  function pointTrace() {
    var els = [];
    var targets = [];
    var samples = [];
    var last = null;
    return {
      targets: targets,
      samples: samples,
      elementOf: function (i) {
        return i === null || i === undefined ? null : els[i];
      },
      add: function (k, p, x, y, t, el, w) {
        if (samples.length >= TALK_MAX_SAMPLES) return null;
        var b = talkBlock(el);
        var i = b ? els.indexOf(b) : -1;
        if (b && i < 0 && targets.length < TALK_MAX_TARGETS) {
          i = els.push(b) - 1;
          targets.push(talkDescribe(b));
        }
        i = i < 0 ? null : i;
        w = w || "";
        if (
          (k === "move" || k === "hover") &&
          last &&
          last.i === i &&
          last.w === w &&
          t - last.t < TALK_MOVE_MS
        )
          return null;
        var s = { t: Math.round(t), k: k, p: p || "", i: i, w: w };
        if (x !== null && x !== undefined) {
          s.x = Math.round(x);
          s.y = Math.round(y);
        }
        samples.push(s);
        last = s;
        return s;
      },
    };
  }

  // ---------------------------------------------------------------- flag
  function readQueryFlag() {
    try {
      var v = new URLSearchParams(window.location.search).get("annotate");
      if (v === null) return null;
      return v === "1" || v === "true" || v === "on";
    } catch (e) {
      return null;
    }
  }

  function enabled() {
    try {
      return localStorage.getItem(FLAG_KEY) === "1";
    } catch (e) {
      return false;
    }
  }

  function setEnabled(on) {
    try {
      if (on) localStorage.setItem(FLAG_KEY, "1");
      else localStorage.removeItem(FLAG_KEY);
    } catch (e) {
      /* private mode: nothing we can do */
    }
  }

  function lsGet(k) {
    try {
      return localStorage.getItem(k);
    } catch (e) {
      return null;
    }
  }
  function lsSet(k, v) {
    try {
      localStorage.setItem(k, v);
    } catch (e) {
      /* private mode */
    }
  }

  // See OWNER vs READER. TOGGLE_SEEN_KEY is written on the first toggle
  // click, so a flag set before the toggle existed (only the owner could)
  // still counts, and one set by a reader's click does not.
  var OWNER_KEY = "blogAnnotateOwner";
  var TOGGLE_SEEN_KEY = "blogAnnotateToggleSeen";
  function owner() {
    var h = String(window.location.hostname || "").toLowerCase();
    return (
      lsGet(OWNER_KEY) === "1" ||
      (enabled() && lsGet(TOGGLE_SEEN_KEY) === null) ||
      !!lsGet(TOKEN_KEY) ||
      !!savedCockpit() ||
      h === "localhost" ||
      /\.ts\.net$/.test(h)
    );
  }

  var q = readQueryFlag();
  if (q === true) lsSet(OWNER_KEY, "1");
  if (q !== null) setEnabled(q);

  // ------------------------------------------------- saved Cockpit address
  // One validator for the prompt, the fragment and every read: an https
  // origin on a tailnet name or localhost, origin only.
  function cockpitOrigin(raw) {
    var s = String(raw || "").trim();
    if (!s) return "";
    if (s.indexOf("://") < 0) s = "https://" + s;
    var u;
    try {
      u = new URL(s);
    } catch (e) {
      return "";
    }
    var h = u.hostname.toLowerCase();
    if (u.protocol !== "https:") return "";
    if (h !== "localhost" && !/\.ts\.net$/.test(h)) return "";
    return u.origin;
  }

  function savedCockpit() {
    try {
      return cockpitOrigin(localStorage.getItem(COCKPIT_KEY));
    } catch (e) {
      return "";
    }
  }

  function saveCockpit(origin) {
    try {
      localStorage.setItem(COCKPIT_KEY, origin);
    } catch (e) {
      /* private mode: used for this page load only */
    }
  }

  // #larry-cockpit=<origin> saves the address and strips itself. Replacing a
  // DIFFERENT saved address asks first: anyone can own a tailnet name, so a
  // crafted link must not silently redirect the notes.
  (function readCockpitFragment() {
    var hash = String(window.location.hash || "");
    var prefix = "#larry-cockpit=";
    if (hash.indexOf(prefix) !== 0) return;
    var raw = hash.slice(prefix.length);
    try {
      raw = decodeURIComponent(raw);
    } catch (e) {
      /* keep it raw; the validator rejects junk */
    }
    try {
      history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search
      );
    } catch (e) {
      /* the address is still read; the hash just stays visible */
    }
    // A reader's browser never takes an address from a link: anyone can own
    // a tailnet name, and a crafted link must not route their notes there.
    if (!owner()) return;
    var origin = cockpitOrigin(raw);
    if (!origin) {
      // Fixed text, never the link's.
      if (enabled())
        window.alert("That is not a Cockpit address, so nothing was saved.");
      return;
    }
    var prev = savedCockpit();
    if (
      prev &&
      prev !== origin &&
      !window.confirm(
        "Send to Larry now posts to " + prev + ". Switch to " + origin + "?"
      )
    )
      return;
    saveCockpit(origin);
  })();

  // The keyboard toggle and the `/` search key are the only listeners a
  // normal reader ever pays for.
  document.addEventListener("keydown", function (e) {
    var key = e.key || "";
    if ((e.metaKey || e.ctrlKey) && e.shiftKey && key.toLowerCase() === "a") {
      e.preventDefault();
      lsSet(OWNER_KEY, "1");
      setEnabled(!enabled());
      window.location.reload();
    }
  });

  // `/` opens search unless focus is in a field or the page already took
  // the key: on `window`, so a page's own `/` handler on document (the org
  // index's search box) runs first, calls preventDefault, and wins.
  window.addEventListener("keydown", function (e) {
    if (e.key !== "/" || e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return;
    var t = e.target;
    if (t && t.nodeType === 1 && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)))
      return;
    if (!bar) return;
    e.preventDefault();
    openSearch();
  });

  var live = false;
  var started = false;
  var stop = null; // set by start(): closes the bubble and any open card
  window.blogAnnotate = {
    enabled: function () {
      return live;
    },
    ENTER_SAVE_MS: ENTER_SAVE_MS,
    noteEnterStep: noteEnterStep,
    enterOpensComposer: enterOpensComposer,
    cockpitOrigin: cockpitOrigin,
    pointTrace: pointTrace,
    talkDescribe: talkDescribe,
    talkWordAt: talkWordAt,
    pageSource: pageSource,
    searchRank: searchRank,
    search: {
      open: function () {
        openSearch();
      },
      close: function () {
        closeSearch();
      },
    },
    set: function (on) {
      live = !!on;
      setEnabled(live);
      document.documentElement.classList.toggle("blog-annot-off", !live);
      renderBar();
      if (live && !started) {
        started = true;
        whenBody(start);
      }
      if (!live && stop) stop();
    },
  };

  // Loaded with `defer` the body exists; without it (in <head>) wait for it.
  function whenBody(fn) {
    if (document.body) fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  // ------------------------------------------------- toggle + source link
  // Shown to every reader; DOM only, no request. Kept out of the
  // .blog-annot-off rule so it stays visible when Comments are off.
  var bar = null;
  var GITHUB_SVG =
    '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" fill="currentColor">' +
    '<path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z"></path></svg>';

  // https://github.com/<repo>/blob/<branch>/<path>, or "" when the page has
  // no known source. ponytail: a site without data-branch is assumed to
  // publish from main; one on master or gh-pages needs data-branch.
  function sourceUrl() {
    var ds = (SCRIPT && SCRIPT.dataset) || {};
    var src = pageSource(window.location.hostname, window.location.pathname, ds.repo);
    if (!src.repo || !src.path) return "";
    return (
      "https://github.com/" +
      src.repo +
      "/blob/" +
      encodeURIComponent(ds.branch || "main") +
      "/" +
      src.path.split("/").map(encodeURIComponent).join("/")
    );
  }

  function renderBar() {
    if (!bar) return;
    var t = document.getElementById("blog-annot-toggle");
    t.setAttribute("aria-pressed", String(live));
    t.title =
      (live
        ? "Comments on: select text to comment. Click to turn off."
        : "Comments off: click to comment on this page.") +
      "\n" +
      window.location.pathname;
  }

  // The header band under (right edge, y), or null: anything fixed or
  // sticky, or a <nav>/<header> (the blog's navbar scrolls with the page).
  function headerAt(x, y) {
    var el = document.elementFromPoint(x, y);
    var best = null; // the outermost band, so a nav inside a header counts as the header
    for (; el && el !== document.body && el !== document.documentElement; el = el.parentElement) {
      var pos = window.getComputedStyle(el).position;
      var band = el.tagName === "NAV" || el.tagName === "HEADER";
      if (pos !== "fixed" && pos !== "sticky" && !band) continue;
      var r = el.getBoundingClientRect();
      if (r.top <= y && r.bottom > y && r.bottom < window.innerHeight / 3) best = r;
    }
    return best;
  }

  // The lowest header band under any point of the bar's footprint (each
  // button's centre, at two heights), or null.
  function bandUnderBar(top) {
    var best = null;
    var w = window.innerWidth;
    var xs = [w - 24, w - 60, w - 96];
    var ys = [top + 12, top + 28];
    for (var i = 0; i < xs.length; i++)
      for (var j = 0; j < ys.length; j++) {
        var r = headerAt(xs[i], ys[j]);
        if (r && (!best || r.bottom > best.bottom)) best = r;
      }
    return best;
  }

  // Top right, but under the page's own fixed or sticky headers, so the
  // buttons never sit on its title or nav links.
  function placeBar() {
    bar.style.display = "none";
    var bottom = 0;
    for (var i = 0, r; i < 3 && (r = bandUnderBar(bottom)); i++) bottom = r.bottom;
    bar.style.display = "";
    bar.style.top = bottom ? Math.round(bottom + 6) + "px" : "";
  }

  // -------------------------------------------------------------- search
  // See SEARCH in the header. Explainer-only: the blog has its own search,
  // so none of this is double-written into _includes/annotate.html.
  var SEARCH_MAX = { here: 8, maps: 6, pages: 10 };
  var searchData = null; // promise of search.json, made on the first open
  var ov = null; // the overlay, built on the first open
  var ovItems = []; // the result rows now shown, in keyboard order
  var ovActive = -1;
  var ovReturn = null; // focus goes back here on close

  // search.json sits at the root of the host that serves this script, so a
  // tailnet or localhost preview still reads the live index.
  function searchUrl() {
    var base = (SCRIPT && SCRIPT.src) || "https://idvorkin-ai-tools.github.io/assets/annotate.js";
    try {
      return new URL("../search.json", base).href;
    } catch (e) {
      return "https://idvorkin-ai-tools.github.io/search.json";
    }
  }

  // Items whose text holds every word of `query`, best first: the whole
  // query in the title, then every word in the title, then the rest, each
  // in the given order. item = {t: title, x: other searchable text}.
  // ponytail: substring match, fine for ~500 pages; past a few thousand,
  // swap in MiniSearch over the same search.json.
  function searchRank(query, items) {
    var q = String(query || "").toLowerCase().trim();
    var words = q.split(/\s+/).filter(Boolean);
    if (!words.length) return [];
    var out = [];
    for (var i = 0; i < items.length; i++) {
      var t = String(items[i].t || "").toLowerCase();
      var all = t + " " + String(items[i].x || "").toLowerCase();
      var hit = true;
      for (var w = 0; w < words.length && hit; w++) hit = all.indexOf(words[w]) >= 0;
      if (!hit) continue;
      var inTitle = words.every(function (x) {
        return t.indexOf(x) >= 0;
      });
      out.push({ item: items[i], score: (t.indexOf(q) >= 0 ? 0 : 1) + (inTitle ? 0 : 2), i: i });
    }
    out.sort(function (a, b) {
      return a.score - b.score || a.i - b.i;
    });
    return out.map(function (r) {
      return r.item;
    });
  }

  // The first heading that holds a query word, for a page result's subtitle.
  function firstHeading(heads, query) {
    var words = String(query).toLowerCase().split(/\s+/).filter(Boolean);
    for (var i = 0; i < heads.length; i++) {
      var h = heads[i].toLowerCase();
      for (var w = 0; w < words.length; w++) if (h.indexOf(words[w]) >= 0) return heads[i];
    }
    return "";
  }

  function pageHeadings() {
    var out = [];
    var hs = document.querySelectorAll("h1,h2,h3,h4");
    for (var i = 0; i < hs.length; i++) {
      var h = hs[i];
      if (h.closest("#blog-annot-bar,#blog-annot-search,.blog-annot-ui")) continue;
      if (!h.getClientRects().length) continue; // hidden (another tab)
      var t = (h.textContent || "").replace(/\s+/g, " ").trim();
      if (t) out.push({ t: t, el: h });
    }
    return out;
  }

  // The page's own colours, so the overlay looks like part of it.
  function pageColors() {
    function opaque(c) {
      return c && !/^rgba\(.*,\s*0\)$/.test(c) && c !== "transparent";
    }
    var b = getComputedStyle(document.body);
    var bg = opaque(b.backgroundColor) ? b.backgroundColor : getComputedStyle(document.documentElement).backgroundColor;
    if (!opaque(bg)) bg = "";
    return { bg: bg, fg: b.color };
  }

  function buildOverlay() {
    var css = document.createElement("style");
    css.textContent = [
      "#blog-annot-search{position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.45);",
      "display:flex;justify-content:center;align-items:flex-start;",
      "padding:calc(56px + env(safe-area-inset-top,0px)) 16px 16px;box-sizing:border-box}",
      "#blog-annot-search[hidden]{display:none}",
      "#bas-box{width:100%;max-width:560px;max-height:100%;display:flex;flex-direction:column;",
      "background:#fff;color:#111;border:1px solid rgba(128,128,128,.45);border-radius:10px;",
      "box-shadow:0 12px 40px rgba(0,0,0,.35);overflow:hidden;font:15px/1.35 system-ui,sans-serif}",
      "@media (prefers-color-scheme:dark){#bas-box{background:#1c1e22;color:#e6e6e6}}",
      "#bas-q{box-sizing:border-box;width:100%;font:inherit;font-size:16px;color:inherit;",
      "background:transparent;border:0;border-bottom:1px solid rgba(128,128,128,.35);",
      "padding:12px 14px;outline:none;-webkit-appearance:none;appearance:none;border-radius:0}",
      "#bas-list{overflow-y:auto;overscroll-behavior:contain;padding:4px 0 8px}",
      "#bas-list .bas-g{font:600 11px/1 system-ui,sans-serif;letter-spacing:.06em;",
      "text-transform:uppercase;opacity:.6;padding:12px 14px 4px}",
      "#bas-list a{display:block;padding:7px 14px;color:inherit;text-decoration:none;",
      "border-left:3px solid transparent;overflow-wrap:anywhere}",
      "#bas-list a .s{display:block;font-size:13px;opacity:.65;margin-top:2px;",
      "overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
      "#bas-list a[aria-selected='true']{background:rgba(11,94,215,.16);border-left-color:#0b5ed7}",
      "#bas-status{font-size:13px;opacity:.65;padding:8px 14px 10px}",
      "#bas-status:empty{display:none}",
      "@media print{#blog-annot-search{display:none}}",
    ].join("");
    document.head.appendChild(css);
    ov = document.createElement("div");
    ov.id = "blog-annot-search";
    ov.hidden = true;
    ov.innerHTML =
      '<div id="bas-box" role="dialog" aria-modal="true" aria-label="Search">' +
      '<input id="bas-q" type="search" autocomplete="off" spellcheck="false" ' +
      'placeholder="Search this page and every map" aria-label="Search" ' +
      'role="combobox" aria-expanded="true" aria-controls="bas-list" aria-autocomplete="list" />' +
      '<div id="bas-list" role="listbox" aria-label="Results"></div>' +
      '<div id="bas-status" role="status"></div></div>';
    document.body.appendChild(ov);
    var input = document.getElementById("bas-q");
    input.addEventListener("input", renderResults);
    // Esc, arrows and Enter belong to the overlay: stop them here so the
    // page's own handlers (its search box, Comments mode) never see them.
    ov.addEventListener("keydown", function (e) {
      var k = e.key;
      if (k === "Escape" || k === "Esc") {
        e.preventDefault();
        e.stopPropagation();
        closeSearch();
      } else if (k === "ArrowDown" || k === "ArrowUp") {
        e.preventDefault();
        e.stopPropagation();
        if (ovItems.length)
          setActive((ovActive + (k === "ArrowDown" ? 1 : -1) + ovItems.length) % ovItems.length);
      } else if (k === "Enter" && e.target === input) {
        e.preventDefault();
        e.stopPropagation();
        if (ovItems[ovActive]) ovItems[ovActive].click();
      }
    });
    ov.addEventListener("mousedown", function (e) {
      if (e.target === ov) closeSearch();
    });
  }

  function setActive(n) {
    if (ovItems[ovActive]) ovItems[ovActive].setAttribute("aria-selected", "false");
    ovActive = n;
    var input = document.getElementById("bas-q");
    var a = ovItems[n];
    if (!a) {
      input.removeAttribute("aria-activedescendant");
      return;
    }
    a.setAttribute("aria-selected", "true");
    input.setAttribute("aria-activedescendant", a.id);
    a.scrollIntoView({ block: "nearest" });
  }

  function row(list, title, sub, href, onPick) {
    var a = document.createElement("a");
    a.id = "bas-r" + ovItems.length;
    a.setAttribute("role", "option");
    a.setAttribute("aria-selected", "false");
    a.href = href;
    a.textContent = title;
    if (sub) {
      var s = document.createElement("span");
      s.className = "s";
      s.textContent = sub;
      a.appendChild(s);
    }
    a.addEventListener("click", function (e) {
      if (onPick) {
        e.preventDefault();
        onPick();
      } else closeSearch(true);
    });
    a.addEventListener("mousemove", function () {
      var i = ovItems.indexOf(a);
      if (i !== ovActive) setActive(i);
    });
    list.appendChild(a);
    ovItems.push(a);
  }

  function group(list, name) {
    var g = document.createElement("div");
    g.className = "bas-g";
    g.textContent = name;
    list.appendChild(g);
  }

  function renderResults() {
    var input = document.getElementById("bas-q");
    var list = document.getElementById("bas-list");
    var status = document.getElementById("bas-status");
    var q = input.value;
    list.textContent = "";
    ovItems = [];
    ovActive = -1;
    var data = ov.data; // set when search.json arrives
    if (!q.trim()) {
      status.textContent = ov.failed
        ? "Couldn't load the map index; only this page is searchable."
        : "Type to search this page's headings" + (data ? ", every map and its pages." : ".");
      setActive(-1);
      return;
    }
    var here = searchRank(q, ov.heads).slice(0, SEARCH_MAX.here);
    if (here.length) group(list, "This page");
    here.forEach(function (h) {
      row(list, h.t, "", "#", function () {
        closeSearch(true);
        // Instant, not the page's smooth scroll-behavior, and clear of any
        // fixed header (the bar sits just under it).
        var off = (bar && parseInt(bar.style.top, 10)) || 0;
        function jump() {
          var y = h.el.getBoundingClientRect().top + window.scrollY - off - 8;
          window.scrollTo({ top: Math.max(0, y), behavior: "instant" });
        }
        jump();
        // Scroll-reveal animations shift the layout as sections come into
        // view; land again once they have settled.
        setTimeout(jump, 450);
      });
    });
    var n = here.length;
    if (data) {
      var maps = searchRank(q, data.maps).slice(0, SEARCH_MAX.maps);
      if (maps.length) group(list, "Maps");
      maps.forEach(function (m) {
        row(list, m.t, m.d, m.u);
      });
      var self = window.location.pathname.replace(/index\.html$/, "");
      var pages = searchRank(
        q,
        data.pages.filter(function (p) {
          return p.rel !== self;
        })
      ).slice(0, SEARCH_MAX.pages);
      if (pages.length) group(list, "Pages");
      pages.forEach(function (p) {
        var h = firstHeading(p.h, q);
        // A text fragment lands on the matching heading where supported;
        // elsewhere it is ignored and the page opens at the top.
        row(list, p.t, h || (p.site !== p.t ? p.site : ""), p.u + (h ? "#:~:text=" + encodeURIComponent(h) : ""));
      });
      n += maps.length + pages.length;
    }
    status.textContent = ov.failed
      ? "Couldn't load the map index; only this page is searchable."
      : n
        ? ""
        : "Nothing matches “" + q.trim() + "”" + (data ? "." : " on this page; loading the maps…");
    setActive(ovItems.length ? 0 : -1);
  }

  function loadIndex() {
    if (searchData) return searchData;
    var url = searchUrl();
    searchData = fetch(url)
      .then(function (r) {
        if (!r.ok) throw new Error(r.status);
        return r.json();
      })
      .then(function (d) {
        var origin = new URL(url).origin;
        var abs = function (u) {
          return /^\//.test(u) ? origin + u : u;
        };
        var sites = {}; // a site's front-page title names its other pages
        (d.pages || []).forEach(function (p) {
          if (/\/$/.test(p.u)) sites[p.u] = p.t;
        });
        return {
          maps: (d.maps || []).map(function (m) {
            return { t: m.t, x: m.d + " " + m.u, d: m.d, u: abs(m.u) };
          }),
          pages: (d.pages || []).map(function (p) {
            var root = (/^\/[^/]+\//.exec(p.u) || [""])[0];
            return { t: p.t, x: (p.h || []).join(" \u2022 "), h: p.h || [], u: abs(p.u), rel: p.u, site: sites[root] || "" };
          }),
        };
      });
    return searchData;
  }

  function openSearch() {
    if (!document.body) return;
    if (!ov) buildOverlay();
    ovReturn = document.activeElement;
    ov.heads = pageHeadings();
    var c = pageColors();
    var box = document.getElementById("bas-box");
    box.style.background = c.bg;
    box.style.color = c.bg ? c.fg : "";
    ov.hidden = false;
    var input = document.getElementById("bas-q");
    input.focus();
    input.select();
    renderResults();
    if (!ov.data) {
      ov.failed = false;
      loadIndex().then(
        function (d) {
          ov.data = d;
          if (!ov.hidden) renderResults();
        },
        function () {
          ov.failed = true;
          searchData = null; // the next open tries again
          if (!ov.hidden) renderResults();
        }
      );
    }
  }

  function closeSearch(navigating) {
    if (!ov || ov.hidden) return;
    ov.hidden = true;
    if (!navigating && ovReturn && ovReturn.focus) ovReturn.focus();
  }

  function mountBar() {
    if (bar || !document.body) return;
    var css = document.createElement("style");
    css.textContent = [
      "#blog-annot-bar{position:fixed;z-index:99998;display:flex;gap:6px;",
      "top:calc(8px + env(safe-area-inset-top,0px));",
      "right:calc(8px + env(safe-area-inset-right,0px));opacity:.7}",
      "#blog-annot-bar:hover,#blog-annot-bar:focus-within{opacity:1}",
      "#blog-annot-bar>*{box-sizing:border-box;width:30px;height:30px;padding:0;",
      "display:inline-flex;align-items:center;justify-content:center;",
      "border-radius:50%;border:1px solid rgba(128,128,128,.45);",
      "background:rgba(128,128,128,.18);color:inherit;cursor:pointer;",
      "font:14px/1 system-ui,sans-serif;text-decoration:none;",
      "-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px)}",
      "#blog-annot-toggle[aria-pressed='true']{background:#0b5ed7;",
      "border-color:#0b5ed7;box-shadow:0 0 0 2px rgba(11,94,215,.35)}",
      "@media print{#blog-annot-bar{display:none}}",
    ].join("");
    document.head.appendChild(css);
    bar = document.createElement("div");
    bar.id = "blog-annot-bar";
    var href = sourceUrl();
    bar.innerHTML =
      (href
        ? '<a id="blog-annot-src" target="_blank" rel="noopener" ' +
          'aria-label="This page on GitHub" title="This page\'s source on GitHub">' +
          GITHUB_SVG +
          "</a>"
        : "") +
      '<button type="button" id="blog-annot-toggle" aria-label="Comments">💬</button>';
    bar.insertAdjacentHTML(
      "afterbegin",
      '<button type="button" id="blog-annot-find" aria-label="Search" ' +
        'title="Search this page and every map (/)">🔍</button>'
    );
    if (href) bar.querySelector("#blog-annot-src").href = href;
    document.body.appendChild(bar);
    placeBar();
    window.addEventListener("resize", placeBar);
    // A page that builds its header in script (the Moses atlas) may not
    // have it yet: place again once everything has loaded.
    if (document.readyState !== "complete") window.addEventListener("load", placeBar);
    setTimeout(placeBar, 1500);
    document.getElementById("blog-annot-find").onclick = openSearch;
    document.getElementById("blog-annot-toggle").onclick = function () {
      if (owner()) lsSet(OWNER_KEY, "1");
      lsSet(TOGGLE_SEEN_KEY, "1");
      window.blogAnnotate.set(!live);
    };
    renderBar();
  }
  whenBody(mountBar);

  if (enabled()) window.blogAnnotate.set(true); // <-- readers stop here
  return;

  function start() {
    // --------------------------------------------------------- page identity
    var PERMALINK = window.location.pathname;
    var TITLE = document.title || "";
    var ORIGIN =
      window.location.origin ||
      window.location.protocol + "//" + window.location.host;
    var SRC = pageSource(
      window.location.hostname,
      window.location.pathname,
      SCRIPT && SCRIPT.dataset ? SCRIPT.dataset.repo : ""
    );
    var BRANCH = (SCRIPT && SCRIPT.dataset && SCRIPT.dataset.branch) || "";
    var HOST = String(window.location.hostname || "").toLowerCase();
    var SAME_HOST = HOST === "localhost" || /\.ts\.net$/.test(HOST);
    var LARRY = SAME_HOST ? "https://" + HOST : savedCockpit();

    // ------------------------------------------------------------- storage
    function loadBuffer() {
      try {
        var raw = localStorage.getItem(BUF_KEY);
        if (!raw) return [];
        var parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        return [];
      }
    }

    function saveBuffer(list) {
      try {
        localStorage.setItem(BUF_KEY, JSON.stringify(list));
      } catch (e) {
        alert("Could not save annotation (localStorage full or blocked).");
      }
    }

    // ------------------------------------------------------------- selector
    // W3C TextQuoteSelector: the exact quote plus ~30 chars either side,
    // taken from the text of the page's main content.
    function articleRoot() {
      return (
        document.querySelector("main") ||
        document.querySelector("article") ||
        document.body
      );
    }

    function selectorFromRange(range) {
      var root = articleRoot();
      var quote = range.toString();
      if (!quote.trim()) return null;
      var prefix = "";
      var suffix = "";
      try {
        var pre = range.cloneRange();
        pre.selectNodeContents(root);
        pre.setEnd(range.startContainer, range.startOffset);
        var preText = pre.toString();
        prefix = preText.slice(Math.max(0, preText.length - CTX));

        var post = range.cloneRange();
        post.selectNodeContents(root);
        post.setStart(range.endContainer, range.endOffset);
        suffix = post.toString().slice(0, CTX);
      } catch (e) {
        // Selection escaped the content root (e.g. started in a nav bar). A
        // bare quote still locates most of the time.
      }
      return { quote: quote, prefix: prefix, suffix: suffix };
    }

    // ------------------------------------------------------- page versioning
    // FNV-1a, 32-bit: a cheap, stable fingerprint, not a security hash.
    function fnv1a(str) {
      var h = 0x811c9dc5;
      for (var i = 0; i < str.length; i++) {
        h ^= str.charCodeAt(i);
        h =
          (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
      }
      return ("0000000" + h.toString(16)).slice(-8);
    }

    // On a page with no <main> the root is <body>, which holds this tool's
    // own pill. Hide the tool for the synchronous read (no paint in
    // between) so its "Review (N)" never changes the digest.
    function pageText() {
      var html = document.documentElement;
      var wasOff = html.classList.contains("blog-annot-off");
      html.classList.add("blog-annot-off");
      var root = articleRoot();
      var text = root.innerText || root.textContent || "";
      if (!wasOff) html.classList.remove("blog-annot-off");
      return text.replace(/\s+/g, " ").trim();
    }

    function pageVersion() {
      var text = pageText();
      return {
        url: ORIGIN + window.location.pathname,
        capturedAt: new Date().toISOString(),
        // The site's deploy time, from GitHub Pages' Last-Modified header.
        lastModified: document.lastModified || "",
        contentLength: text.length,
        contentDigest: fnv1a(text),
      };
    }

    // ------------------------------------------------------------------ UI
    var style = document.createElement("style");
    style.textContent = [
      "#blog-annot-btn{position:absolute;z-index:99999;display:none;",
      "padding:6px 12px;font:600 14px/1.2 system-ui,sans-serif;color:#fff;",
      "background:#0b5ed7;border:0;border-radius:16px;cursor:pointer;",
      "box-shadow:0 2px 8px rgba(0,0,0,.3);touch-action:manipulation}",
      "#blog-annot-pill{position:fixed;right:14px;bottom:14px;z-index:99999;",
      "display:flex;gap:6px;align-items:center;padding:8px 12px;",
      "font:600 13px/1.2 system-ui,sans-serif;color:#fff;background:#212529;",
      "border-radius:20px;box-shadow:0 2px 10px rgba(0,0,0,.35);",
      "flex-wrap:wrap;max-width:calc(100vw - 28px);box-sizing:border-box}",
      "#blog-annot-pill button{font:600 12px/1.2 system-ui,sans-serif;",
      "padding:5px 9px;border:0;border-radius:12px;cursor:pointer;",
      "background:#495057;color:#fff}",
      "#blog-annot-pill button:disabled{opacity:.45;cursor:default}",
      "#blog-annot-pill #blog-annot-talk[hidden]{display:none}",
      "#blog-annot-pill #blog-annot-talk[data-state='rec']{background:#e03131}",
      "#blog-annot-pill #blog-annot-talk[data-state='retry']{background:#f59f00;color:#212529}",
      ".blog-annot-pointing{outline:2px solid rgba(224,49,49,.55)!important;",
      "outline-offset:3px;border-radius:2px}",
      "#blog-annot-larry-dot{width:10px;height:10px;border-radius:50%;",
      "background:#868e96;display:inline-block}",
      "#blog-annot-larry-dot[data-state='idle']{background:#2f9e44}",
      "#blog-annot-larry-dot[data-state='busy']{background:#f59f00}",
      "#blog-annot-larry-dot[data-state='down']{background:#e03131}",
      "#blog-annot-modal{position:fixed;inset:0;z-index:100000;display:none;",
      "align-items:center;justify-content:center;background:rgba(0,0,0,.45);",
      "padding:16px}",
      "#blog-annot-card{width:100%;max-width:520px;background:#fff;color:#111;",
      "border-radius:12px;padding:16px;font:14px/1.45 system-ui,sans-serif;",
      "max-height:85vh;overflow:auto;box-sizing:border-box;text-align:left}",
      "#blog-annot-card blockquote{margin:0 0 10px;padding:8px 10px;",
      "background:#f1f3f5;color:#111;border-left:3px solid #0b5ed7;",
      "font-style:italic;max-height:9em;overflow:auto}",
      "#blog-annot-card textarea{width:100%;min-height:110px;padding:8px;",
      "font:14px/1.4 system-ui,sans-serif;border:1px solid #ced4da;",
      "border-radius:8px;box-sizing:border-box;background:#fff;color:#111}",
      "#blog-annot-intents{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px}",
      "#blog-annot-intents button{padding:7px 12px;border:1px solid #ced4da;",
      "border-radius:14px;background:#f8f9fa;color:#495057;",
      "font:600 13px/1.2 system-ui,sans-serif;cursor:pointer;",
      "touch-action:manipulation}",
      "#blog-annot-intents button[aria-pressed='true']{background:#0b5ed7;",
      "border-color:#0b5ed7;color:#fff}",
      "#blog-annot-card .blog-annot-row{display:flex;gap:8px;justify-content:flex-end;",
      "margin-top:10px;flex-wrap:wrap;align-items:center}",
      "#blog-annot-card .blog-annot-hint{margin-right:auto;font-size:12px;color:#868e96}",
      "#blog-annot-tochat-row{display:flex;gap:6px;align-items:center;margin-top:10px;",
      "font-size:12px;color:#495057;cursor:pointer}",
      "#blog-annot-card button{padding:8px 14px;border:0;border-radius:8px;",
      "font:600 13px/1.2 system-ui,sans-serif;cursor:pointer}",
      "#blog-annot-card .blog-annot-primary{background:#0b5ed7;color:#fff}",
      "#blog-annot-card .blog-annot-ghost{background:#e9ecef;color:#212529}",
      "#blog-annot-list{margin:10px 0 0;padding:0;list-style:none;",
      "font-size:13px}",
      "#blog-annot-list li{padding:6px 0;border-top:1px solid #e9ecef}",
      "#blog-annot-note{margin-top:10px;font-size:12px;color:#495057;",
      "word-break:break-all}",
      "#blog-annot-chat{position:fixed;right:14px;bottom:72px;z-index:99999;",
      "width:360px;max-width:calc(100vw - 28px);max-height:min(60vh,480px);",
      "display:flex;flex-direction:column;box-sizing:border-box;background:#fff;",
      "color:#111;border:1px solid #dee2e6;border-radius:12px;text-align:left;",
      "box-shadow:0 4px 18px rgba(0,0,0,.25);font:14px/1.4 system-ui,sans-serif}",
      "#blog-annot-chat[hidden]{display:none}",
      "#blog-annot-chat .bac-head{display:flex;align-items:center;",
      "justify-content:space-between;padding:8px 12px;border-bottom:1px solid #dee2e6}",
      "#blog-annot-chat .bac-head button{border:0;background:none;color:inherit;",
      "font-size:20px;line-height:1;cursor:pointer;padding:0 4px}",
      "#blog-annot-chat-log{flex:1;overflow-y:auto;padding:8px 12px;min-height:60px;",
      "display:flex;flex-direction:column;gap:6px}",
      "#blog-annot-chat-log:empty::before{content:'Larry answers here and on this page\\'s Cockpit thread.';",
      "color:#868e96;font-size:12px}",
      "#blog-annot-chat .bac-msg{max-width:85%;padding:6px 10px;border-radius:12px;",
      "white-space:pre-wrap;overflow-wrap:anywhere}",
      "#blog-annot-chat .bac-msg[data-who='igor']{align-self:flex-end;background:#0b5ed7;color:#fff}",
      "#blog-annot-chat .bac-msg[data-who='larry']{align-self:flex-start;background:#f1f3f5;color:#111}",
      "#blog-annot-chat .bac-msg[data-state='sending']{opacity:.6}",
      "#blog-annot-chat .bac-msg[data-mark]::after{content:attr(data-mark);display:block;",
      "text-align:right;font-size:11px;line-height:1;margin-top:3px}",
      "#blog-annot-chat .bac-msg a{color:inherit;text-decoration:underline}",
      "#blog-annot-chat .bac-day{display:flex;align-items:center;gap:8px;",
      "color:#868e96;font-size:10px}",
      "#blog-annot-chat .bac-day::before,#blog-annot-chat .bac-day::after{",
      "content:'';flex:1;border-top:1px solid #dee2e6}",
      "#blog-annot-chat-status{padding:0 12px 4px;font-size:12px;color:#868e96}",
      "#blog-annot-chat-status:empty{display:none}",
      "#blog-annot-chat .bac-row{display:flex;gap:6px;padding:8px 12px;",
      "border-top:1px solid #dee2e6}",
      "#blog-annot-chat textarea{flex:1;min-width:0;resize:none;padding:6px 8px;",
      "font:16px/1.35 system-ui,sans-serif;border:1px solid #ced4da;border-radius:8px;",
      "background:#fff;color:#111;box-sizing:border-box}",
      "#blog-annot-chat .bac-row button{padding:6px 12px;border:0;border-radius:8px;",
      "background:#0b5ed7;color:#fff;font:600 13px/1.2 system-ui,sans-serif;cursor:pointer}",
      "#blog-annot-chat .bac-row button:disabled{opacity:.5;cursor:default}",
      "#blog-annot-chat #blog-annot-chat-copy{background:#495057}",
      "@media (prefers-color-scheme:dark){#blog-annot-chat{background:#1e1f22;",
      "color:#e9ecef;border-color:#3a3d42}",
      "#blog-annot-chat .bac-head,#blog-annot-chat .bac-row{border-color:#3a3d42}",
      "#blog-annot-chat .bac-msg[data-who='larry']{background:#2c2f33;color:#e9ecef}",
      "#blog-annot-chat .bac-day::before,#blog-annot-chat .bac-day::after{border-color:#495057}",
      "#blog-annot-chat textarea{background:#2c2f33;color:#e9ecef;border-color:#495057}}",
      ".blog-annot-off #blog-annot-btn,.blog-annot-off #blog-annot-pill,",
      ".blog-annot-off #blog-annot-modal,.blog-annot-off #blog-annot-chat{display:none!important}",
    ].join("");
    document.head.appendChild(style);

    var btn = document.createElement("button");
    btn.id = "blog-annot-btn";
    btn.type = "button";
    btn.textContent = "💬 Comment";
    document.body.appendChild(btn);

    var pill = document.createElement("div");
    pill.id = "blog-annot-pill";
    pill.innerHTML =
      '<span id="blog-annot-count">Review (0)</span>' +
      '<button type="button" id="blog-annot-open">Open</button>' +
      (LARRY
        ? '<span id="blog-annot-larry-dot" data-state="unknown" title="Larry: checking…"></span>'
        : "") +
      '<button type="button" id="blog-annot-send">Send to Larry</button>' +
      '<button type="button" id="blog-annot-chat-toggle">Chat</button>' +
      '<button type="button" id="blog-annot-talk" hidden ' +
      'title="Talk while pointing: what you say goes to Larry with what you point at">🎙 Talk</button>' +
      (LARRY || SAME_HOST
        ? ""
        : '<button type="button" id="blog-annot-connect">Connect to Larry</button>');
    document.body.appendChild(pill);

    var modal = document.createElement("div");
    modal.id = "blog-annot-modal";
    modal.innerHTML = '<div id="blog-annot-card"></div>';
    document.body.appendChild(modal);
    var card = modal.firstChild;

    function showModal(html) {
      card.innerHTML = html;
      modal.style.display = "flex";
    }
    function hideModal() {
      modal.style.display = "none";
      card.innerHTML = "";
      composerKeys = null;
    }
    modal.addEventListener("click", function (e) {
      if (e.target === modal) hideModal();
    });

    // Keyboard submit/cancel for the composer; inert unless it is open.
    var composerKeys = null;
    var IS_MAC = /Mac|iPhone|iPad|iPod/.test(navigator.platform || "");
    document.addEventListener("keydown", function (e) {
      if (!composerKeys) return;
      if (e.key === "Escape" || e.key === "Esc") {
        e.preventDefault();
        composerKeys.cancel();
        return;
      }
      var isEnter = e.key === "Enter" || e.keyCode === 13;
      if (isEnter && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        composerKeys.save();
      }
    });

    // Enter with the Comment bubble up opens the composer, as a tap would
    // (Igor 2026-11-21). Never while typing in a field or the composer.
    document.addEventListener("keydown", function (e) {
      var shown = btn.style.display === "block";
      if (!enterOpensComposer(e, live, !!composerKeys, shown)) return;
      e.preventDefault();
      if (pending) openComposer(pending);
    });

    var sending = false;
    function refreshPill() {
      var n = loadBuffer().length;
      document.getElementById("blog-annot-count").textContent =
        "Review (" + n + ")";
      document.getElementById("blog-annot-send").disabled = sending || !n;
    }
    refreshPill();

    function escapeHtml(s) {
      return String(s).replace(/[&<>"']/g, function (c) {
        return {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        }[c];
      });
    }

    // --------------------------------------------------------- capture flow
    var pending = null;

    function hideBtn() {
      btn.style.display = "none";
    }

    function positionBtn(range) {
      var rects = range.getClientRects();
      var r = rects.length
        ? rects[rects.length - 1]
        : range.getBoundingClientRect();
      if (!r || (!r.width && !r.height)) return hideBtn();
      var top = r.bottom + window.scrollY + 8;
      var left = r.left + window.scrollX;
      var maxLeft = window.scrollX + document.documentElement.clientWidth - 130;
      btn.style.top = top + "px";
      btn.style.left =
        Math.max(window.scrollX + 8, Math.min(left, maxLeft)) + "px";
      btn.style.display = "block";
    }

    function insideTool(node) {
      var el = node && node.nodeType === 1 ? node : node && node.parentNode;
      return !!(
        el &&
        el.closest &&
        el.closest(
          "#blog-annot-pill,#blog-annot-modal,#blog-annot-btn,#blog-annot-chat," +
            "#blog-annot-bar,#blog-annot-search"
        )
      );
    }

    function onSelectionSettled() {
      if (!live) return hideBtn();
      if (composerKeys) return; // typing a note: leave the bubble alone
      var sel = window.getSelection();
      if (!sel || sel.isCollapsed || sel.rangeCount === 0) return hideBtn();
      var range = sel.getRangeAt(0);
      if (!range.toString().trim()) return hideBtn();
      if (insideTool(range.commonAncestorContainer)) return hideBtn();
      var info = selectorFromRange(range);
      if (!info) return hideBtn();
      pending = info;
      positionBtn(range);
    }

    // mouseup covers desktop; selectionchange (debounced) covers iOS Safari
    // touch selection, where mouseup fires unreliably.
    document.addEventListener("mouseup", function () {
      setTimeout(onSelectionSettled, 10);
    });
    var selTimer = null;
    document.addEventListener("selectionchange", function () {
      if (selTimer) clearTimeout(selTimer);
      selTimer = setTimeout(onSelectionSettled, 350);
    });

    // Both, so a tap on the bubble registers before iOS drops the selection.
    ["click", "touchend"].forEach(function (evt) {
      btn.addEventListener(evt, function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (pending) openComposer(pending);
      });
    });

    // Keep in sync with the blog's INTENTS (scripts/blog_review.py there).
    var INTENTS = ["fix", "cut", "rewrite", "expand", "check", "question", "note"];
    var DEFAULT_INTENT = "note";

    function openComposer(info) {
      hideBtn();
      var chips = INTENTS.map(function (name) {
        return (
          '<button type="button" data-intent="' +
          name +
          '" aria-pressed="' +
          (name === DEFAULT_INTENT ? "true" : "false") +
          '">' +
          name +
          "</button>"
        );
      }).join("");

      showModal(
        "<blockquote>" +
          escapeHtml(info.quote) +
          "</blockquote>" +
          '<textarea id="blog-annot-text" placeholder="What about this line?"></textarea>' +
          '<div id="blog-annot-intents">' +
          chips +
          "</div>" +
          (LARRY
            ? '<label id="blog-annot-tochat-row">' +
              '<input type="checkbox" id="blog-annot-tochat"' +
              (lsGet(TO_CHAT_KEY) === "0" ? "" : " checked") +
              "> Send straight to chat</label>"
            : "") +
          '<div class="blog-annot-row">' +
          '<span class="blog-annot-hint">' +
          (IS_MAC ? "⌘" : "Ctrl") +
          "+Enter or Enter twice saves · Esc cancels</span>" +
          '<button type="button" class="blog-annot-ghost" id="blog-annot-cancel">Cancel</button>' +
          '<button type="button" class="blog-annot-primary" id="blog-annot-save">Save</button>' +
          "</div>"
      );

      var ta = document.getElementById("blog-annot-text");
      ta.focus();
      var toChatBox = document.getElementById("blog-annot-tochat");
      if (toChatBox)
        toChatBox.onchange = function () {
          lsSet(TO_CHAT_KEY, toChatBox.checked ? "1" : "0");
        };

      var intent = DEFAULT_INTENT;
      var chipBox = document.getElementById("blog-annot-intents");
      chipBox.addEventListener("click", function (e) {
        var hit = e.target.closest
          ? e.target.closest("button[data-intent]")
          : null;
        if (!hit) return;
        e.preventDefault();
        intent = hit.getAttribute("data-intent");
        var all = chipBox.querySelectorAll("button[data-intent]");
        for (var i = 0; i < all.length; i++) {
          all[i].setAttribute("aria-pressed", all[i] === hit ? "true" : "false");
        }
        ta.focus();
      });

      function save() {
        var list = loadBuffer();
        var entry = {
          permalink: PERMALINK,
          origin: ORIGIN,
          title: TITLE,
          source: SRC.path,
          source_repo: SRC.repo,
          branch: BRANCH,
          quote: info.quote,
          prefix: info.prefix,
          suffix: info.suffix,
          comment: ta.value,
          intent: intent,
          ts: new Date().toISOString(),
          version: pageVersion(),
        };
        if (toChatBox && toChatBox.checked) entry.toChat = true;
        list.push(entry);
        saveBuffer(list);
        refreshPill();
        hideModal();
        // Saved first, so a failed send leaves it on the Review list.
        if (entry.toChat)
          flushToCockpit().then(function (ok) {
            if (ok) return;
            var b = document.getElementById("blog-annot-send");
            b.textContent = "Chat unreachable: saved to Review";
            setTimeout(function () {
              if (!sending) b.textContent = "Send to Larry";
            }, 4000);
          });
        var s = window.getSelection();
        if (s && s.removeAllRanges) s.removeAllRanges();
      }

      document.getElementById("blog-annot-cancel").onclick = hideModal;
      document.getElementById("blog-annot-save").onclick = save;
      composerKeys = { save: save, cancel: hideModal };

      var prevText = ta.value;
      var lastEnterAt = null;
      ta.addEventListener("input", function () {
        var next = ta.value;
        var atEnd =
          ta.selectionStart === next.length && ta.selectionEnd === next.length;
        var step = noteEnterStep(prevText, next, atEnd, lastEnterAt, Date.now());
        prevText = next;
        lastEnterAt = step.lastAt;
        if (step.save) {
          ta.value = next.replace(/\s+$/, "");
          save();
        }
      });
    }

    stop = function () {
      hideBtn();
      hideModal();
    };

    // ---------------------------------------------------------- review flow
    var OWNER = owner();

    // Clipboard write with the execCommand fallback; resolves or rejects.
    function copyText(text) {
      function fallback() {
        var ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        var ok = false;
        try {
          ok = document.execCommand("copy");
        } catch (e) {
          ok = false;
        }
        document.body.removeChild(ta);
        return ok ? Promise.resolve() : Promise.reject(new Error("copy failed"));
      }
      if (navigator.clipboard && navigator.clipboard.writeText)
        return navigator.clipboard.writeText(text).then(null, fallback);
      return fallback();
    }

    // The buffer as a reader pastes it to Igor: page link first, then each
    // note under its quote, one block per page.
    function readableNotes(list) {
      return reviewBatches(list)
        .map(function (batch) {
          var head =
            "Comments on " +
            batch.body.page_url +
            (batch.body.title ? " (" + batch.body.title + ")" : "");
          var lines = batch.items.map(function (a, i) {
            return (
              i + 1 + ". [" + (a.intent || DEFAULT_INTENT) + '] "' + a.quote + '"' +
              (a.comment ? "\n   " + a.comment : "")
            );
          });
          return head + "\n\n" + lines.join("\n");
        })
        .join("\n\n");
    }

    document.getElementById("blog-annot-open").onclick = openReview;

    function openReview() {
      var list = loadBuffer();
      var items = list.length
        ? list
            .map(function (a, i) {
              return (
                "<li><b>" +
                (i + 1) +
                ".</b> [" +
                escapeHtml(a.intent || DEFAULT_INTENT) +
                "] " +
                escapeHtml(a.quote.slice(0, 90)) +
                (a.quote.length > 90 ? "…" : "") +
                "<br><i>" +
                escapeHtml(a.comment || "(no comment)") +
                "</i></li>"
              );
            })
            .join("")
        : "<li>Nothing captured yet.</li>";

      showModal(
        "<b>Annotations (" +
          list.length +
          ")</b>" +
          '<ul id="blog-annot-list">' +
          items +
          "</ul>" +
          '<div class="blog-annot-row">' +
          '<button type="button" class="blog-annot-ghost" id="blog-annot-clear">Clear all</button>' +
          (OWNER
            ? '<button type="button" class="blog-annot-ghost" id="blog-annot-copy">Copy to clipboard</button>'
            : '<button type="button" class="blog-annot-primary" id="blog-annot-copy">Copy for Igor</button>') +
          (OWNER || lsGet(TOKEN_KEY)
            ? '<button type="button" class="blog-annot-primary" id="blog-annot-gist">Upload to gist</button>'
            : "") +
          '<button type="button" class="blog-annot-ghost" id="blog-annot-close">Close</button>' +
          "</div>" +
          '<div id="blog-annot-note"></div>'
      );

      var note = document.getElementById("blog-annot-note");
      document.getElementById("blog-annot-close").onclick = hideModal;

      document.getElementById("blog-annot-clear").onclick = function () {
        if (!confirm("Discard all " + list.length + " annotations?")) return;
        saveBuffer([]);
        refreshPill();
        hideModal();
      };

      document.getElementById("blog-annot-copy").onclick = function () {
        copyText(OWNER ? payloadJson(list) : readableNotes(list)).then(
          function () {
            note.textContent = OWNER
              ? "Copied " + list.length + " annotations."
              : "Copied " + list.length + " notes with the page link. Paste them to Igor.";
          },
          function () {
            note.textContent = "Copy failed. Select the text by hand.";
          }
        );
      };

      var gistBtn = document.getElementById("blog-annot-gist");
      if (gistBtn) gistBtn.onclick = function () {
        if (!list.length) {
          note.textContent = "Nothing to upload.";
          return;
        }
        uploadGist(list, note);
      };
    }

    // ------------------------------------------------------ send to Larry
    var LARRY_TITLES = {
      idle: "Larry: idle, ready",
      busy: "Larry: busy",
      down: "Larry: down",
      unreachable: "Larry: unreachable (not on the tailnet?)",
    };

    function setDot(state, status) {
      var dot = document.getElementById("blog-annot-larry-dot");
      if (!dot) return;
      dot.setAttribute("data-state", state === "unreachable" ? "down" : state);
      var t = LARRY_TITLES[state] || "Larry: " + state;
      if (state === "busy" && status && status.queued)
        t += ", " + status.queued + " queued";
      if (state === "down" && status && status.why) t += " (" + status.why + ")";
      dot.title = t;
    }

    function refreshLarry() {
      if (!LARRY || !live) return Promise.resolve();
      return fetch(LARRY + "/larry/status", { cache: "no-store" })
        .then(function (res) {
          if (!res.ok) throw new Error("status " + res.status);
          return res.json();
        })
        .then(function (s) {
          setDot(s && s.state ? s.state : "down", s);
          return flushToCockpit();
        })
        .catch(function () {
          setDot("unreachable");
        });
    }

    // One POST per page: the buffer can span pages (and sites), and each
    // review lands on its own page's thread. The id lets the Cockpit spot a
    // resend whose first answer was lost.
    function reviewBatches(list) {
      var groups = {};
      var order = [];
      list.forEach(function (a) {
        var key = (a.origin || ORIGIN) + "|" + (a.permalink || PERMALINK);
        if (!groups[key]) {
          groups[key] = [];
          order.push(key);
        }
        groups[key].push(a);
      });
      return order.map(function (key) {
        var items = groups[key];
        var first = items[0];
        var path = first.permalink || PERMALINK;
        var pageUrl = (first.origin || ORIGIN) + path;
        var annotations = items.map(function (a) {
          return {
            quote: a.quote || "",
            prefix: a.prefix || "",
            suffix: a.suffix || "",
            intent: a.intent || DEFAULT_INTENT,
            note: a.comment || "",
          };
        });
        var body = {
          id: "explainer-" + fnv1a(key + JSON.stringify(annotations)),
          permalink: pageUrl,
          page_url: pageUrl,
          title: first.title || "",
          annotations: annotations,
        };
        if (first.source_repo) body.source_repo = first.source_repo;
        if (first.source_repo && first.source) body.source_path = first.source;
        if (first.branch) body.branch = first.branch;
        return { items: items, path: path, body: body };
      });
    }

    function sendToLarry() {
      if (sending) return Promise.resolve();
      var list = loadBuffer();
      var sendBtn = document.getElementById("blog-annot-send");
      if (!list.length) {
        sendBtn.textContent = "Nothing to send";
        setTimeout(function () {
          sendBtn.textContent = "Send to Larry";
        }, 1500);
        return Promise.resolve();
      }
      // Off the tailnet with no saved address, ask once. Cancel means "use
      // the gist"; a bad address sends nothing.
      // A reader with no Larry and no token: nothing to send to, so the
      // review card with Copy for Igor.
      if (!LARRY && !OWNER && !lsGet(TOKEN_KEY)) {
        openReview();
        document.getElementById("blog-annot-note").textContent =
          "Larry isn't connected in this browser. Copy your notes and send them to Igor.";
        return Promise.resolve();
      }
      if (!LARRY && !SAME_HOST && OWNER) {
        var typed = window.prompt(
          "Cockpit address for Send to Larry (https://…), saved in this " +
            "browser. Cancel to send to a secret gist instead.",
          DEFAULT_COCKPIT
        );
        if (typed && typed.trim()) {
          var origin = cockpitOrigin(typed);
          if (!origin) {
            openReview();
            document.getElementById("blog-annot-note").textContent =
              "Not a Cockpit address, so nothing was sent. Your notes are kept.";
            return Promise.resolve();
          }
          saveCockpit(origin);
          LARRY = origin;
          talkRender();
        }
      }
      var token = null;
      var asked = false;
      var cockpitDown = !LARRY;
      var why = "";
      function gist(batch, why) {
        if (!asked) {
          asked = true;
          token = OWNER ? getToken() : lsGet(TOKEN_KEY);
        }
        if (!token)
          return Promise.reject(
            new Error(
              (why ? why + ", and no" : "No") +
                " GitHub token, so nothing was sent"
            )
          );
        return postGist(token, batch.path, reviewBatchJson(batch));
      }
      var deliver = SAME_HOST
        ? deliverToCockpit
        : function (batch) {
            if (cockpitDown) return gist(batch, why);
            return deliverToCockpit(batch).catch(function (err) {
              cockpitDown = true;
              why = err.message || String(err);
              return gist(batch, why);
            });
          };
      sending = true;
      sendBtn.disabled = true;
      sendBtn.textContent = "Sending…";
      var sent = {};
      var failed = [];
      var errors = [];
      return reviewBatches(list)
        .reduce(function (chain, batch) {
          return chain.then(function () {
            return deliver(batch)
              .then(function () {
                batch.items.forEach(function (a) {
                  sent[noteKey(a)] = true;
                });
              })
              .catch(function (err) {
                failed = failed.concat(batch.items);
                errors.push(err.message || String(err));
              });
          });
        }, Promise.resolve())
        .then(function () {
          // Only what was delivered leaves the buffer.
          saveBuffer(
            loadBuffer().filter(function (a) {
              return !sent[noteKey(a)];
            })
          );
          sending = false;
          refreshPill();
          sendBtn.textContent = "Send to Larry";
          refreshLarry();
          if (!failed.length) {
            sendBtn.textContent = "Sent ✓";
            setTimeout(function () {
              sendBtn.textContent = "Send to Larry";
            }, 2000);
            return;
          }
          openReview();
          document.getElementById("blog-annot-note").textContent =
            "Send to Larry failed (" +
            errors.join("; ") +
            "). Your notes are kept: upload a gist or copy them instead.";
        });
    }

    function noteKey(a) {
      return a.ts + "|" + a.quote;
    }

    // NOTES GO STRAIGHT TO CHAT (ported from the blog's annotate.html, Igor
    // 2026-11-22): with a Cockpit the note box has "Send straight to chat",
    // checked unless this browser unticked it (TO_CHAT_KEY). A ticked note is
    // saved with toChat and posted at once to the page's thread, the one the
    // chat panel shows; an unticked one waits on the Review list for Send to
    // Larry, as before. A toChat note that could not go stays listed and goes
    // when the Cockpit answers again (status or chat poll). Quiet: no gist,
    // no card, no prompt.
    function flushToCockpit() {
      if (!LARRY || sending || !live) return Promise.resolve(false);
      var list = loadBuffer().filter(function (a) {
        return a.toChat;
      });
      if (!list.length) return Promise.resolve(true);
      var sendBtn = document.getElementById("blog-annot-send");
      sending = true;
      refreshPill();
      sendBtn.textContent = "Sending…";
      var sent = {};
      var ok = true;
      return reviewBatches(list)
        .reduce(function (chain, batch) {
          return chain.then(function () {
            return deliverToCockpit(batch).then(
              function () {
                batch.items.forEach(function (a) {
                  sent[noteKey(a)] = true;
                });
              },
              function () {
                ok = false;
              }
            );
          });
        }, Promise.resolve())
        .then(function () {
          saveBuffer(
            loadBuffer().filter(function (a) {
              return !sent[noteKey(a)];
            })
          );
          sending = false;
          refreshPill();
          sendBtn.textContent = ok ? "Sent to chat ✓" : "Send to Larry";
          if (!ok) return false;
          setTimeout(function () {
            if (!sending) sendBtn.textContent = "Send to Larry";
          }, 2000);
          if (!chatPanel.hidden) chatPoll();
          return true;
        });
    }
    window.blogAnnotate.flushToCockpit = flushToCockpit;

    function deliverToCockpit(batch) {
      var init = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(batch.body),
      };
      if (!SAME_HOST && window.AbortSignal && AbortSignal.timeout)
        init.signal = AbortSignal.timeout(COCKPIT_TIMEOUT_MS);
      return fetch(LARRY + "/blog-review", init).then(function (res) {
        if (!res.ok) throw new Error("Cockpit returned " + res.status);
      });
    }

    // One page's batch as the review.json a Send writes to its own gist.
    function reviewBatchJson(batch) {
      var first = batch.items[0];
      return JSON.stringify(
        {
          schema: "blog-review-batch/1",
          batch_id: batch.body.id,
          via: "send",
          permalink: batch.path,
          origin: first.origin || ORIGIN,
          title: first.title || "",
          url: batch.body.page_url,
          page_url: batch.body.page_url,
          source_repo: first.source_repo || "",
          source_path: first.source || "",
          branch: first.branch || "",
          created: new Date().toISOString(),
          version: first.version || null,
          annotations: batch.items,
        },
        null,
        2
      );
    }

    document.getElementById("blog-annot-send").onclick = sendToLarry;
    window.blogAnnotate.sendToLarry = sendToLarry;
    if (LARRY) {
      refreshLarry();
      setInterval(refreshLarry, 60000);
      window.blogAnnotate.refreshLarry = refreshLarry;
    }

    // ------------------------------------------------------------- connect
    // Pairing (Cockpit story 196): the page asks the Cockpit for a challenge
    // (bound to this origin), Igor types it into the Cockpit's "Pair a page"
    // and types the 6-digit number it shows back here. The number goes only
    // in a POST body; on success the address is saved as the fragment saves it.
    function pairPost(base, path, body) {
      // Off the tailnet the Cockpit never answers: give up after
      // COCKPIT_TIMEOUT_MS rather than hang the card.
      var ctl = typeof AbortController === "function" ? new AbortController() : null;
      var timer = ctl
        ? setTimeout(function () {
            ctl.abort();
          }, COCKPIT_TIMEOUT_MS)
        : null;
      return fetch(base + path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        cache: "no-store",
        signal: ctl ? ctl.signal : undefined,
      })
        .then(function (res) {
          return res.json().then(
            function (j) {
              return { status: res.status, body: j || {} };
            },
            function () {
              return { status: res.status, body: {} };
            }
          );
        })
        .finally(function () {
          clearTimeout(timer);
        });
    }

    function connectNote(text) {
      var n = document.getElementById("blog-annot-note");
      if (n) n.textContent = text;
    }

    function connectOpen() {
      showModal(
        "<b>Connect to Larry</b>" +
          '<div id="blog-annot-pair-addr"><p>Cockpit address:</p>' +
          '<input id="blog-annot-pair-origin" type="url" autocomplete="off" ' +
          'spellcheck="false" placeholder="https://…" style="width:100%;' +
          'box-sizing:border-box;padding:8px;font:inherit"></div>' +
          '<div id="blog-annot-pair-step" hidden><p>In the Cockpit, Pair a page, type:</p>' +
          '<p id="blog-annot-pair-ch" style="font:700 28px ui-monospace,monospace;' +
          'letter-spacing:.2em;margin:4px 0 10px"></p>' +
          '<input id="blog-annot-pair-code" inputmode="numeric" autocomplete="one-time-code" ' +
          'maxlength="6" placeholder="Number" style="width:100%;box-sizing:border-box;' +
          'padding:8px;font:600 20px ui-monospace,monospace;letter-spacing:.2em"></div>' +
          '<div class="blog-annot-row">' +
          '<button type="button" class="blog-annot-ghost" id="blog-annot-pair-cancel">Cancel</button>' +
          '<button type="button" class="blog-annot-primary" id="blog-annot-pair-go">Next</button>' +
          "</div>" +
          '<div id="blog-annot-note" aria-live="polite"></div>'
      );
      var base = "";
      var challenge = "";
      var busy = false;
      var go = document.getElementById("blog-annot-pair-go");
      var addr = document.getElementById("blog-annot-pair-origin");
      var codeIn = document.getElementById("blog-annot-pair-code");
      document.getElementById("blog-annot-pair-cancel").onclick = hideModal;

      function start(origin) {
        busy = true;
        connectNote("…");
        return pairPost(origin, "/pair/start", {})
          .then(function (r) {
            if (r.status !== 200 || !r.body.challenge) throw new Error();
            base = origin;
            challenge = String(r.body.challenge);
            document.getElementById("blog-annot-pair-addr").hidden = true;
            document.getElementById("blog-annot-pair-step").hidden = false;
            document.getElementById("blog-annot-pair-ch").textContent = challenge;
            go.textContent = "Pair";
            connectNote("");
            codeIn.focus();
          })
          .catch(function () {
            connectNote("Can't reach the Cockpit. Are you on Tailscale?");
          })
          .then(function () {
            busy = false;
          });
      }

      function redeem() {
        var code = String(codeIn.value || "").replace(/\D/g, "");
        if (code.length !== 6) {
          connectNote("Type the 6-digit number.");
          return;
        }
        busy = true;
        connectNote("…");
        pairPost(base, "/pair/redeem", { challenge: challenge, code: code })
          .then(function (r) {
            if (r.status === 200 && r.body.ok) {
              saveCockpit(base);
              lsSet(OWNER_KEY, "1");
              // Reload so the status dot, Send and an open chat all pick it up.
              window.location.reload();
              return;
            }
            connectNote(
              r.status === 429
                ? "Too many tries. Wait a minute."
                : "Wrong or expired number. Connect again for a new challenge."
            );
          })
          .catch(function () {
            connectNote("Can't reach the Cockpit. Are you on Tailscale?");
          })
          .then(function () {
            busy = false;
          });
      }

      go.onclick = function () {
        if (busy) return;
        if (challenge) return redeem();
        var origin = cockpitOrigin(addr.value);
        if (!origin) {
          connectNote("Not a Cockpit address (https on a tailnet name).");
          return;
        }
        start(origin);
      };
      [addr, codeIn].forEach(function (el) {
        el.addEventListener("keydown", function (e) {
          if (e.key === "Enter" && !e.isComposing) {
            e.preventDefault();
            go.onclick();
          }
        });
      });
      var preset = LARRY || cockpitOrigin(DEFAULT_COCKPIT);
      addr.value = preset;
      if (preset) start(preset);
      else addr.focus();
    }

    var connectBtn = document.getElementById("blog-annot-connect");
    if (connectBtn) connectBtn.onclick = connectOpen;
    window.blogAnnotate.connect = connectOpen;

    // The page as the chat names it: this url, and the repo and file.
    var CHAT_PAGE = {
      page_url: ORIGIN + window.location.pathname,
      permalink: "",
      title: TITLE,
      source_repo: SRC.repo,
      source_path: SRC.path,
    };

    // ------------------------------------------------------------ chat panel
    // A small panel for talking to Larry about THIS page (Cockpit story 171):
    // each message goes to POST /page-chat, lands on the page's own Cockpit
    // thread and wakes him like any chat; his replies on that thread show here
    // by polling GET /page-chat. Polls only while the panel is open and the
    // tab is visible; stop() closes it, so it is as inert as the rest. The
    // inline comments above are untouched by it.
    var CHAT_POLL_MS = 4000;
    var chatTimer = null;
    var chatLastId = null; // the newest message id the panel has from a poll
    var chatSeen = {}; // message id -> its bubble
    var chatDayLast = ""; // the last "N days ago" line drawn, so one per day
    var chatBusy = false;

    // The receipt on each of Igor's messages, the Cockpit's own ladder
    // (cockpit-0gp, story 195): 👀 the Cockpit has it, 🫡 Larry has seen it,
    // 🏆 done; nothing while only sent. GET /page-chat carries `receipts`
    // on every poll (the `after` read never returns a drawn message again);
    // a Cockpit without them sends none, and no mark is drawn.
    var CHAT_RECEIPT = {
      received: ["👀", "Received"],
      seen: ["🫡", "Seen by Larry"],
      done: ["🏆", "Done"],
    };
    var CHAT_RECEIPT_RANK = { received: 1, seen: 2, done: 3 };

    var chatPanel = document.createElement("div");
    chatPanel.id = "blog-annot-chat";
    chatPanel.setAttribute("role", "dialog");
    chatPanel.setAttribute("aria-label", "Chat with Larry about this page");
    chatPanel.hidden = true;
    chatPanel.innerHTML =
      '<div class="bac-head"><b>Larry · this page</b>' +
      '<button type="button" id="blog-annot-chat-close" aria-label="Close chat">×</button></div>' +
      '<div id="blog-annot-chat-log" aria-live="polite"></div>' +
      '<div id="blog-annot-chat-status"></div>' +
      '<div class="bac-row"><textarea id="blog-annot-chat-text" rows="2" ' +
      'placeholder="Talk to Larry about this page…"></textarea>' +
      '<button type="button" id="blog-annot-chat-copy">Copy</button>' +
      '<button type="button" id="blog-annot-chat-send">Send</button></div>';
    document.body.appendChild(chatPanel);
    var chatLog = document.getElementById("blog-annot-chat-log");
    var chatTa = document.getElementById("blog-annot-chat-text");
    var chatSendBtn = document.getElementById("blog-annot-chat-send");

    function chatStatus(text) {
      document.getElementById("blog-annot-chat-status").textContent = text || "";
    }

    function chatFetch(path, init) {
      init = init || {};
      if (!SAME_HOST && window.AbortSignal && AbortSignal.timeout)
        init.signal = AbortSignal.timeout(COCKPIT_TIMEOUT_MS);
      return fetch(LARRY + path, init).then(function (res) {
        if (res.status === 404)
          throw new Error("this Cockpit has no page chat yet");
        if (!res.ok) throw new Error("Cockpit returned " + res.status);
        return res.json();
      }, function () {
        // An older Cockpit answers 404 with no CORS header, which the browser
        // reports as a failed fetch, the same as being off the tailnet.
        throw new Error("can't reach the Cockpit, or it has no page chat yet");
      });
    }

    // A message's text with its http(s) URLs as links, built as nodes:
    // message text never goes through innerHTML.
    var URL_RE = /https?:\/\/[^\s<>"']+/g;
    function chatSetText(el, text) {
      el.textContent = "";
      var at = 0;
      text.replace(URL_RE, function (raw, i) {
        var url = raw.replace(/[.,;:!?)\]]+$/, "");
        var ok = false;
        try {
          ok = /^https?:$/.test(new URL(url).protocol);
        } catch (e) {
          ok = false;
        }
        if (!ok) return raw;
        el.appendChild(document.createTextNode(text.slice(at, i)));
        var a = document.createElement("a");
        a.href = url;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.textContent = url;
        el.appendChild(a);
        at = i + url.length;
        return raw;
      });
      el.appendChild(document.createTextNode(text.slice(at)));
    }

    // One bubble per message id, text only (never HTML).
    // How old a message is in whole local calendar days: "" for today, the
    // future or no stamp, else "1 day ago" / "N days ago". The Cockpit's own
    // chat draws the same thin line (its chatDaysAgo, story 281): one over
    // each older day's run of messages, none over today's.
    function chatDaysAgo(ts) {
      var t = Date.parse(ts);
      if (!(t > 0)) return "";
      var a = new Date(t),
        b = new Date();
      var days = Math.round(
        (new Date(b.getFullYear(), b.getMonth(), b.getDate()) -
          new Date(a.getFullYear(), a.getMonth(), a.getDate())) /
          86400000,
      );
      if (!(days >= 1)) return "";
      return days === 1 ? "1 day ago" : days + " days ago";
    }

    function chatAdd(m, state) {
      var el = m.id ? chatSeen[m.id] : null;
      if (!el) {
        var day = chatDaysAgo(m.ts);
        if (day && day !== chatDayLast) {
          var line = document.createElement("div");
          line.className = "bac-day";
          line.setAttribute("role", "separator");
          line.textContent = day;
          chatLog.appendChild(line);
        }
        if (day) chatDayLast = day;
        el = document.createElement("div");
        el.className = "bac-msg";
        chatLog.appendChild(el);
        if (m.id) chatSeen[m.id] = el;
      }
      el.setAttribute("data-who", m.who === "larry" ? "larry" : "igor");
      chatSetText(el, String(m.text || ""));
      if (state) el.setAttribute("data-state", state);
      else el.removeAttribute("data-state");
      chatMark(el, m.receipt);
      chatLog.scrollTop = chatLog.scrollHeight;
      return el;
    }

    // An attribute, drawn by CSS: chatSetText empties the bubble's children.
    // Only forward, as in the Cockpit; never on Larry's or a sending bubble.
    function chatMark(el, receipt) {
      var mark = CHAT_RECEIPT[receipt];
      if (!mark || el.getAttribute("data-who") !== "igor") return;
      if (el.getAttribute("data-state")) return;
      var had = CHAT_RECEIPT_RANK[el.getAttribute("data-receipt")] || 0;
      if (CHAT_RECEIPT_RANK[receipt] <= had) return;
      el.setAttribute("data-receipt", receipt);
      el.setAttribute("data-mark", mark[0]);
      el.title = mark[1];
    }

    // fromId re-reads the whole thread and, when it holds that message,
    // redraws it in the Cockpit's order: after the first send makes a thread,
    // the Cockpit's opener goes above Igor's message, not below it.
    function chatPoll(fromId) {
      if (!LARRY || chatPanel.hidden || !live) return Promise.resolve();
      var q =
        "/page-chat?page=" +
        encodeURIComponent(CHAT_PAGE.permalink || CHAT_PAGE.page_url) +
        (chatLastId && !fromId ? "&after=" + encodeURIComponent(chatLastId) : "");
      return chatFetch(q, { cache: "no-store" })
        .then(function (out) {
          var msgs = out.messages || [];
          if (fromId) {
            var has = msgs.some(function (x) {
              return x.id === fromId;
            });
            if (!has) return;
            chatLog.textContent = "";
            chatSeen = {};
            chatDayLast = "";
            chatLastId = null;
          }
          msgs.forEach(function (m) {
            chatAdd(m);
            if (m.id) chatLastId = m.id;
          });
          var receipts = out.receipts || {};
          Object.keys(receipts).forEach(function (id) {
            if (chatSeen[id]) chatMark(chatSeen[id], receipts[id]);
          });
          if (!chatBusy) chatStatus("");
          flushToCockpit();
        })
        .catch(function (err) {
          chatStatus("Can't reach Larry: " + (err.message || err));
        });
    }

    function chatSchedule() {
      clearTimeout(chatTimer);
      chatTimer = null;
      if (chatPanel.hidden || !live) return;
      chatTimer = setTimeout(function () {
        (document.hidden ? Promise.resolve() : chatPoll()).then(chatSchedule);
      }, CHAT_POLL_MS);
    }

    function chatOpen() {
      if (!LARRY && !SAME_HOST && OWNER) {
        var origin = cockpitOrigin(
          window.prompt(
            "Cockpit address for the chat (https://…), saved in this browser.",
            DEFAULT_COCKPIT
          )
        );
        if (origin) {
          saveCockpit(origin);
          LARRY = origin;
          talkRender();
        }
      }
      chatPanel.hidden = false;
      chatSendBtn.disabled = !LARRY;
      if (!LARRY) {
        chatStatus(
          OWNER
            ? "No Cockpit address, so the chat is off. Open it again to set one."
            : "Larry isn't connected in this browser. Write here, then Copy and send it to Igor."
        );
        chatTa.focus();
        return Promise.resolve();
      }
      chatTa.focus();
      return chatPoll().then(chatSchedule);
    }

    function chatClose() {
      chatPanel.hidden = true;
      clearTimeout(chatTimer);
      chatTimer = null;
    }

    var chatPrev = "";
    var chatEnterAt = null;
    var chatFailed = null; // {text, id} of the last send that failed

    function chatSend() {
      var text = chatTa.value.trim();
      if (!text || chatBusy || !LARRY) return Promise.resolve();
      chatBusy = true;
      chatSendBtn.disabled = true;
      // a retry of the same text keeps its id: if the first try landed after
      // all (a timeout), the Cockpit sees a duplicate and wakes nobody twice
      var id =
        chatFailed && chatFailed.text === text
          ? chatFailed.id
          : "pc-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
      chatFailed = null;
      var fresh = chatLastId === null; // no message seen yet: a new thread
      var el = chatAdd({ id: id, who: "igor", text: text }, "sending");
      chatTa.value = "";
      chatPrev = "";
      var body = { id: id, text: text, page_url: CHAT_PAGE.page_url };
      if (CHAT_PAGE.permalink) body.permalink = CHAT_PAGE.permalink;
      if (CHAT_PAGE.title) body.title = CHAT_PAGE.title;
      if (CHAT_PAGE.source_repo) body.source_repo = CHAT_PAGE.source_repo;
      if (CHAT_PAGE.source_repo && CHAT_PAGE.source_path)
        body.source_path = CHAT_PAGE.source_path;
      return chatFetch("/page-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
        .then(function (out) {
          // chatLastId stays put: a reply that landed before this message
          // still comes in on the next poll, and this one is not shown twice.
          var sent = (out && out.messages && out.messages[0]) || {};
          chatAdd({ id: id, who: "igor", text: text, receipt: sent.receipt });
          chatStatus("");
          if (fresh) return chatPoll(id);
        })
        .catch(function (err) {
          if (el.parentNode) el.parentNode.removeChild(el);
          delete chatSeen[id];
          chatFailed = { text: text, id: id };
          if (!chatTa.value) chatTa.value = chatPrev = text;
          chatStatus("Not sent (" + (err.message || err) + "). Your text is kept: retry, or Copy it for Igor.");
        })
        .then(function () {
          chatBusy = false;
          chatSendBtn.disabled = !LARRY;
        });
    }

    document.getElementById("blog-annot-chat-toggle").onclick = function () {
      if (chatPanel.hidden) chatOpen();
      else chatClose();
    };
    document.getElementById("blog-annot-chat-close").onclick = chatClose;
    chatSendBtn.onclick = chatSend;
    // Copy works with or without Larry: the message with the page link, to
    // paste to Igor anywhere.
    document.getElementById("blog-annot-chat-copy").onclick = function () {
      var text = chatTa.value.trim();
      if (!text) return;
      copyText("About " + CHAT_PAGE.page_url + "\n\n" + text).then(
        function () {
          chatStatus("Copied with the page link. Paste it to Igor.");
        },
        function () {
          chatStatus("Copy failed. Select the text by hand.");
        }
      );
    };
    chatTa.addEventListener("keydown", function (e) {
      if (e.key === "Escape" || e.key === "Esc") {
        chatClose();
        return;
      }
      if ((e.key === "Enter" || e.keyCode === 13) && !e.shiftKey && !e.isComposing) {
        e.preventDefault();
        chatSend();
      }
    });
    // Keyboards and dictation that send no usable Enter key insert newlines
    // instead: two at the end send, as the note composer saves.
    chatTa.addEventListener("input", function () {
      var next = chatTa.value;
      var atEnd =
        chatTa.selectionStart === next.length && chatTa.selectionEnd === next.length;
      var step = noteEnterStep(chatPrev, next, atEnd, chatEnterAt, Date.now());
      chatPrev = next;
      chatEnterAt = step.lastAt;
      if (step.save) chatSend();
    });

    var stopCapture = stop;
    stop = function () {
      stopCapture();
      chatClose();
    };
    window.blogAnnotate.chat = {
      open: chatOpen,
      close: chatClose,
      send: chatSend,
      poll: chatPoll,
    };

    // ---------------------------------------------------------------- talk
    // See TALK WHILE POINTING above. Nothing here runs until Talk is
    // pressed: no mic, no listener. One recording at a time; a send that
    // failed keeps its body (and id) for Retry until the page is reloaded.
    var talkBtn = document.getElementById("blog-annot-talk");
    var talk = null; // the recording in progress
    var talkPending = null; // a body whose send failed, for Retry
    var talkTick = null;
    var TALK_OK = !!(
      window.MediaRecorder &&
      navigator.mediaDevices &&
      navigator.mediaDevices.getUserMedia
    );

    function talkRender(state, label) {
      if (!talkBtn) return;
      talkBtn.hidden = !TALK_OK || !LARRY;
      state =
        state || (talk ? "rec" : talkPending ? "retry" : "idle");
      talkBtn.setAttribute("data-state", state);
      talkBtn.setAttribute("aria-pressed", state === "rec" ? "true" : "false");
      talkBtn.disabled = state === "sending";
      talkBtn.textContent =
        label ||
        {
          idle: "🎙 Talk",
          rec: "■ Stop",
          retry: "↻ Retry talk",
          sending: "Sending…",
        }[state];
    }

    function talkMime() {
      var kinds = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"];
      for (var i = 0; i < kinds.length; i++) {
        if (
          !MediaRecorder.isTypeSupported ||
          MediaRecorder.isTypeSupported(kinds[i])
        )
          return kinds[i];
      }
      return "";
    }

    function talkPoint(e, kind) {
      if (!talk || !talk.trace) return;
      // the event clock; made relative to the recorder's start in talkFinish
      var t = e.timeStamp || performance.now();
      if (e.clientX !== undefined) {
        talk.x = e.clientX;
        talk.y = e.clientY;
      }
      var el = e.target;
      if (kind === "scroll") {
        // the page moved under a still pointer: what is under it now
        if (talk.x === null || !document.elementFromPoint) return;
        el = document.elementFromPoint(talk.x, talk.y);
      }
      var p = e.pointerType || talk.p || "";
      talk.p = p;
      if (kind === "move" && p === "pen" && !e.buttons) kind = "hover";
      var s = talk.trace.add(
        kind,
        p,
        talk.x,
        talk.y,
        t,
        el,
        talkWordAt(talk.x, talk.y, el)
      );
      if (s) talkOutline(talk.trace.elementOf(s.i));
    }

    // The block under the pointer gets a faint red outline while recording,
    // so Igor sees what Larry will be told he was pointing at.
    var talkLit = null;
    function talkOutline(el) {
      if (el === talkLit) return;
      if (talkLit) talkLit.classList.remove("blog-annot-pointing");
      talkLit = el || null;
      if (talkLit) talkLit.classList.add("blog-annot-pointing");
    }

    var TALK_EVENTS = {
      pointermove: "move",
      pointerdown: "down",
      pointerup: "up",
    };
    var talkHandlers = {};
    Object.keys(TALK_EVENTS).forEach(function (type) {
      talkHandlers[type] = function (e) {
        talkPoint(e, TALK_EVENTS[type]);
      };
    });
    talkHandlers.scroll = function (e) {
      talkPoint(e, "scroll");
    };
    function talkListen(on) {
      Object.keys(talkHandlers).forEach(function (type) {
        var target = type === "scroll" ? window : document;
        if (on)
          target.addEventListener(type, talkHandlers[type], {
            capture: true,
            passive: true,
          });
        else target.removeEventListener(type, talkHandlers[type], true);
      });
    }

    function talkStart() {
      if (talk || !LARRY || !TALK_OK) return Promise.resolve();
      talk = { starting: true };
      talkRender("sending", "Mic…");
      return navigator.mediaDevices.getUserMedia({ audio: true }).then(
        function (stream) {
          if (!live || !talk || !talk.starting) {
            // Comments went off while the mic prompt was up
            stream.getTracks().forEach(function (tr) {
              tr.stop();
            });
            talk = null;
            talkRender();
            return;
          }
          var mime = talkMime();
          var rec = mime
            ? new MediaRecorder(stream, { mimeType: mime })
            : new MediaRecorder(stream);
          talk = {
            rec: rec,
            stream: stream,
            mime: rec.mimeType || mime || "audio/webm",
            chunks: [],
            trace: pointTrace(),
            t0: performance.now(), // until the recorder says when it started
            x: null,
            y: null,
            p: "",
            cancelled: false,
          };
          var mine = talk;
          rec.ondataavailable = function (e) {
            if (e.data && e.data.size) mine.chunks.push(e.data);
          };
          rec.onstart = function (e) {
            // one clock: pointer events and this share event.timeStamp
            mine.t0 = (e && e.timeStamp) || performance.now();
            mine.started = Date.now();
          };
          rec.onstop = function () {
            talkFinish(mine);
          };
          // listening from now, not from onstart: a point made while the
          // recorder spins up counts as at its start (t 0)
          talkListen(true);
          rec.start(1000);
          mine.timer = setTimeout(talkStop, TALK_MAX_MS);
          talkRender("rec");
          talkTick = setInterval(function () {
            if (!mine.started) return;
            var s = Math.floor((Date.now() - mine.started) / 1000);
            talkRender(
              "rec",
              "■ Stop " + Math.floor(s / 60) + ":" + ("0" + (s % 60)).slice(-2)
            );
          }, 1000);
        },
        function (err) {
          talk = null;
          talkRender("idle", "🎙 No mic");
          talkBtn.title = "Mic not available: " + ((err && err.message) || err);
          setTimeout(function () {
            talkRender();
          }, 3000);
        }
      );
    }

    function talkStop() {
      if (!talk) return;
      if (talk.starting) {
        talk.starting = false; // the mic answer will find it cancelled
        return;
      }
      if (talk.rec.state !== "inactive") talk.rec.stop();
    }

    // Comments off mid-recording: the mic goes off and nothing is sent.
    function talkCancel() {
      if (!talk) return;
      talk.cancelled = true;
      talkStop();
    }

    function talkFinish(mine) {
      talkListen(false);
      talkOutline(null);
      clearTimeout(mine.timer);
      clearInterval(talkTick);
      mine.stream.getTracks().forEach(function (tr) {
        tr.stop();
      });
      talk = null;
      if (mine.cancelled || !mine.chunks.length) {
        talkRender();
        return Promise.resolve();
      }
      mine.trace.samples.forEach(function (s) {
        s.t = Math.max(0, Math.round(s.t - mine.t0));
      });
      var body = {
        id:
          "pt-" +
          Date.now().toString(36) +
          Math.random().toString(36).slice(2, 10),
        page_url: CHAT_PAGE.page_url,
        mime: mine.mime,
        duration_ms: Math.round(
          mine.started ? Date.now() - mine.started : 0
        ),
        targets: mine.trace.targets,
        trace: mine.trace.samples,
      };
      if (CHAT_PAGE.permalink) body.permalink = CHAT_PAGE.permalink;
      if (CHAT_PAGE.title) body.title = CHAT_PAGE.title;
      if (CHAT_PAGE.source_repo) body.source_repo = CHAT_PAGE.source_repo;
      if (CHAT_PAGE.source_repo && CHAT_PAGE.source_path)
        body.source_path = CHAT_PAGE.source_path;
      talkRender("sending");
      return blobBase64(new Blob(mine.chunks, { type: mine.mime })).then(
        function (b64) {
          body.audio = b64;
          return talkSend(body);
        }
      );
    }

    function blobBase64(blob) {
      return new Promise(function (resolve, reject) {
        var r = new FileReader();
        r.onload = function () {
          resolve(String(r.result).replace(/^data:[^,]*,/, ""));
        };
        r.onerror = function () {
          reject(r.error);
        };
        r.readAsDataURL(blob);
      });
    }

    function talkSend(body) {
      talkRender("sending");
      var init = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      };
      if (window.AbortSignal && AbortSignal.timeout)
        init.signal = AbortSignal.timeout(TALK_TIMEOUT_MS);
      return fetch(LARRY + "/point-review", init)
        .then(function (res) {
          return res.json().then(
            function (j) {
              if (!res.ok) throw new Error((j && j.error) || res.status);
              return j;
            },
            function () {
              throw new Error("Cockpit returned " + res.status);
            }
          );
        })
        .then(function () {
          talkPending = null;
          talkBtn.title = "";
          talkRender("idle", "✓ Sent");
          setTimeout(function () {
            talkRender();
          }, 2000);
          if (!chatPanel.hidden) chatPoll();
        })
        .catch(function (err) {
          talkPending = body; // a retry keeps the id: a duplicate wakes nobody
          talkBtn.title =
            "Not sent (" + ((err && err.message) || err) + "). Click to retry.";
          talkRender("retry");
        });
    }

    if (talkBtn) {
      talkBtn.onclick = function () {
        if (talk) return talkStop();
        if (talkPending) return talkSend(talkPending);
        return talkStart();
      };
      talkRender();
    }

    var stopChat = stop;
    stop = function () {
      stopChat();
      talkCancel();
    };
    window.blogAnnotate.talk = {
      start: talkStart,
      stop: talkStop,
      render: talkRender,
      state: function () {
        return talk;
      },
    };

    function payloadJson(list) {
      return JSON.stringify(
        {
          permalink: PERMALINK,
          origin: ORIGIN,
          title: TITLE,
          url: ORIGIN + window.location.pathname,
          source_repo: SRC.repo,
          source_path: SRC.path,
          created: new Date().toISOString(),
          version: pageVersion(),
          annotations: list,
        },
        null,
        2
      );
    }

    function getToken() {
      var t;
      try {
        t = localStorage.getItem(TOKEN_KEY);
      } catch (e) {
        t = null;
      }
      if (t) return t;
      t = window.prompt(
        "GitHub personal access token with ONLY the `gist` scope.\n" +
          "Stored in this browser's localStorage — never committed."
      );
      if (!t) return null;
      t = t.trim();
      try {
        localStorage.setItem(TOKEN_KEY, t);
      } catch (e) {
        /* still usable for this one upload */
      }
      return t;
    }

    // One SECRET gist holding `content` as review.json. A rejected token is
    // cleared so the next try re-prompts.
    function postGist(token, permalink, content) {
      return fetch("https://api.github.com/gists", {
        method: "POST",
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          public: false,
          // Larry greps for exactly this prefix. Do not reformat.
          description: "blog-review: " + permalink,
          files: { "review.json": { content: content } },
        }),
      }).then(function (res) {
        if (res.status === 401 || res.status === 403) {
          try {
            localStorage.removeItem(TOKEN_KEY);
          } catch (e) {
            /* ignore */
          }
          throw new Error(
            "GitHub rejected the token (" +
              res.status +
              "). It has been cleared — retry to re-enter one with `gist` scope."
          );
        }
        if (!res.ok) throw new Error("GitHub returned " + res.status);
        return res.json();
      });
    }

    function uploadGist(list, note) {
      var token = getToken();
      if (!token) {
        note.textContent = "No token — cancelled.";
        return;
      }
      note.textContent = "Uploading…";
      postGist(token, PERMALINK, payloadJson(list))
        .then(function (gist) {
          saveBuffer([]);
          refreshPill();
          note.innerHTML =
            "Uploaded ✅ <a href='" +
            escapeHtml(gist.html_url) +
            "' target='_blank' rel='noopener'>" +
            escapeHtml(gist.html_url) +
            "</a><br>Local buffer cleared.";
        })
        .catch(function (err) {
          // Never clear the buffer on failure — the notes are the valuable part.
          note.textContent = "Upload failed: " + err.message;
        });
    }
  }
})();
