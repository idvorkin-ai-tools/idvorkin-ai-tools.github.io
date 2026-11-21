/*
  annotate.js — private Comments mode for the explainer sites.

  One copy, hosted here, loaded by every explainer page with

    <script src="https://idvorkin-ai-tools.github.io/assets/annotate.js" defer></script>

  It is a port of the blog's _includes/annotate.html (idvorkin.github.io)
  with no Jekyll in it: page identity comes from the URL, not from Liquid.
  Left out on purpose: the blog's rendered-diff view and its "open PRs touch
  this page" badge, both specific to the blog repo.

  KEEP IN SYNC (Igor 2026-11-21): this file and the blog's
  _includes/annotate.html are double-written. A fix or feature in one is
  ported to the other in the same change, or filed against the other the
  same day. The blog copy is the spec.

  INERT BY DEFAULT. Readers get no UI and no network calls; the only cost is
  this file's fetch and parse, plus one keydown listener. Everything else is
  guarded by a localStorage flag that only the owner ever sets. The one
  exception is a `#larry-cockpit=` fragment (see SEND TO LARRY): it saves an
  address to localStorage and strips itself, with no network call.

  Enable  : open any explainer page with ?annotate=1  (persists via localStorage)
  Disable : open any explainer page with ?annotate=0
  Toggle  : Cmd/Ctrl+Shift+A on desktop

  localStorage is per origin, so one ?annotate=1 turns it on for every
  explainer on this host (they all share it), and none of this touches the
  blog's own setting.

  Once enabled: select text -> a small "Comment" bubble appears near the
  selection -> tap it -> type a note -> pick an intent -> Save (or
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
      replacing a different saved address). Only an https origin on a
      tailnet name or localhost is accepted. That Cockpit must allow CORS
      from this origin (its `cors_origins`).
    * If the POST fails, errors or hangs past COCKPIT_TIMEOUT_MS: one SECRET
      gist per batch (token asked for only then), description
      `blog-review: <path>`, file review.json. The review card also offers
      Copy to clipboard and Upload to gist by hand.
  The POST body is the blog's {id, permalink, page_url, title, annotations}
  plus `source_repo`, `source_path` and, when known, `branch`, so the chat
  says which repo and file to edit.

  CHAT PANEL: "Chat" in the pill opens a small panel (bottom right) for
  talking to Larry about this page, typed or dictated (Enter sends,
  Shift+Enter is a line break, two trailing newlines also send). Each
  message goes to `<Cockpit>/page-chat`, the page's own Cockpit thread (made
  on its first message), so the same conversation is in the Cockpit; his
  replies there show in the panel, polled every CHAT_POLL_MS while it is
  open and the tab is visible. Same Cockpit address as SEND TO LARRY; a
  Cockpit that predates the route says so in the panel.

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

  var q = readQueryFlag();
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
    var origin = cockpitOrigin(raw);
    if (!origin) {
      // Fixed text, never the link's: a reader without the flag sees nothing.
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

  // The keyboard toggle is the only listener a normal reader ever pays for.
  document.addEventListener("keydown", function (e) {
    var key = e.key || "";
    if ((e.metaKey || e.ctrlKey) && e.shiftKey && key.toLowerCase() === "a") {
      e.preventDefault();
      setEnabled(!enabled());
      window.location.reload();
    }
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
    cockpitOrigin: cockpitOrigin,
    pageSource: pageSource,
    set: function (on) {
      live = !!on;
      setEnabled(live);
      document.documentElement.classList.toggle("blog-annot-off", !live);
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
      "@media (prefers-color-scheme:dark){#blog-annot-chat{background:#1e1f22;",
      "color:#e9ecef;border-color:#3a3d42}",
      "#blog-annot-chat .bac-head,#blog-annot-chat .bac-row{border-color:#3a3d42}",
      "#blog-annot-chat .bac-msg[data-who='larry']{background:#2c2f33;color:#e9ecef}",
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
      '<button type="button" id="blog-annot-chat-toggle">Chat</button>';
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
          "#blog-annot-pill,#blog-annot-modal,#blog-annot-btn,#blog-annot-chat"
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
        list.push({
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
        });
        saveBuffer(list);
        refreshPill();
        hideModal();
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
          '<button type="button" class="blog-annot-ghost" id="blog-annot-copy">Copy to clipboard</button>' +
          '<button type="button" class="blog-annot-primary" id="blog-annot-gist">Upload to gist</button>' +
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
        var json = payloadJson(list);
        function fallback() {
          var ta = document.createElement("textarea");
          ta.value = json;
          ta.style.position = "fixed";
          ta.style.opacity = "0";
          document.body.appendChild(ta);
          ta.select();
          try {
            document.execCommand("copy");
            note.textContent = "Copied " + list.length + " annotations.";
          } catch (e) {
            note.textContent = "Copy failed — select the JSON manually.";
          }
          document.body.removeChild(ta);
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(json).then(function () {
            note.textContent = "Copied " + list.length + " annotations.";
          }, fallback);
        } else {
          fallback();
        }
      };

      document.getElementById("blog-annot-gist").onclick = function () {
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
      if (!LARRY && !SAME_HOST) {
        var typed = window.prompt(
          "Cockpit address for Send to Larry (https://…), saved in this " +
            "browser. Cancel to send to a secret gist instead."
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
        }
      }
      var token = null;
      var asked = false;
      var cockpitDown = !LARRY;
      var why = "";
      function gist(batch, why) {
        if (!asked) {
          asked = true;
          token = getToken();
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
      var noteKey = function (a) {
        return a.ts + "|" + a.quote;
      };
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
    var chatBusy = false;

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
      });
    }

    // One bubble per message id, text only (never HTML).
    function chatAdd(m, state) {
      var el = m.id ? chatSeen[m.id] : null;
      if (!el) {
        el = document.createElement("div");
        el.className = "bac-msg";
        chatLog.appendChild(el);
        if (m.id) chatSeen[m.id] = el;
      }
      el.setAttribute("data-who", m.who === "larry" ? "larry" : "igor");
      el.textContent = m.text || "";
      if (state) el.setAttribute("data-state", state);
      else el.removeAttribute("data-state");
      chatLog.scrollTop = chatLog.scrollHeight;
      return el;
    }

    function chatPoll() {
      if (!LARRY || chatPanel.hidden || !live) return Promise.resolve();
      var q =
        "/page-chat?page=" +
        encodeURIComponent(CHAT_PAGE.permalink || CHAT_PAGE.page_url) +
        (chatLastId ? "&after=" + encodeURIComponent(chatLastId) : "");
      return chatFetch(q, { cache: "no-store" })
        .then(function (out) {
          (out.messages || []).forEach(function (m) {
            chatAdd(m);
            if (m.id) chatLastId = m.id;
          });
          if (!chatBusy) chatStatus("");
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
      if (!LARRY && !SAME_HOST) {
        var origin = cockpitOrigin(
          window.prompt(
            "Cockpit address for the chat (https://…), saved in this browser."
          )
        );
        if (origin) {
          saveCockpit(origin);
          LARRY = origin;
        }
      }
      chatPanel.hidden = false;
      if (!LARRY) {
        chatStatus("No Cockpit address, so the chat is off. Open it again to set one.");
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

    function chatSend() {
      var text = chatTa.value.trim();
      if (!text || chatBusy || !LARRY) return Promise.resolve();
      chatBusy = true;
      chatSendBtn.disabled = true;
      var id =
        "pc-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
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
        .then(function () {
          // chatLastId stays put: a reply that landed before this message
          // still comes in on the next poll, and this one is not shown twice.
          chatAdd({ id: id, who: "igor", text: text });
          chatStatus("");
        })
        .catch(function (err) {
          if (el.parentNode) el.parentNode.removeChild(el);
          delete chatSeen[id];
          if (!chatTa.value) chatTa.value = chatPrev = text;
          chatStatus("Not sent (" + (err.message || err) + "). Your text is kept.");
        })
        .then(function () {
          chatBusy = false;
          chatSendBtn.disabled = false;
        });
    }

    document.getElementById("blog-annot-chat-toggle").onclick = function () {
      if (chatPanel.hidden) chatOpen();
      else chatClose();
    };
    document.getElementById("blog-annot-chat-close").onclick = chatClose;
    chatSendBtn.onclick = chatSend;
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
