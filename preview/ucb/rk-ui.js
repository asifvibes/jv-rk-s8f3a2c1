/* ============================================================================
   ReturnKoto? UI motion layer
   Version 1, 20 Aug 2026

   Companion to rk-ui.css. Progressive enhancement only: it adds entrance
   motion to content that is already on the page. Nothing here fetches data,
   changes a figure, or alters behaviour.

   SAFETY, and why this is written the boring way:
   The hidden starting state is applied by this script, never by the
   stylesheet, so if the script does not run nothing is ever hidden. Reveal is
   plain rect arithmetic on scroll rather than IntersectionObserver, because
   the failure mode of a missed callback here is invisible content on a page
   about people's savings, and rect maths is something I can reason about with
   certainty. A watchdog reveals everything after 1.2 seconds regardless, so
   the worst case is a short delay, never a blank screen.

   House rules: no em dashes, no en dashes. Respects prefers-reduced-motion.
   ========================================================================== */

(function () {
  "use strict";

  var root = document.documentElement;

  // Anything the user has asked to be still, stays still. Note this only gates
  // the motion below, never the disclosure labelling, which is a usability fix
  // every reader needs.
  var reduced = false;
  try {
    reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch (e) {
    reduced = false;
  }

  // Blocks a reader scans, not individual words.
  var SELECTOR = [
    ".panel",
    ".bcard",
    ".chartpanel",
    ".row",
    ".ba-link",
    ".typehead",
    ".browseall",
    ".support",
    ".badgekey",
    ".sx-card"
  ].join(",");

  /* DELIBERATE LIMIT, do not "improve" this into a scroll reveal.

     An earlier version hid everything up front and revealed it on scroll. That
     couples visibility to scroll handlers, observer callbacks and the moment a
     collapsed section is measured, and testing showed content stranded at
     opacity 0 in several of those combinations. On a page about people's
     savings that is not a trade worth making for a fade.

     So: an element gets an entrance only if it is already inside the viewport
     at the moment it is first measured. Anything below the fold is never
     touched at all, which means it is never hidden and there is nothing to
     recover from. Sections that open later, such as the cockpit, are measured
     when they open and their visible part animates then. */
  function scan() {
    var vh = window.innerHeight || root.clientHeight;
    var nodes = document.querySelectorAll(SELECTOR);
    var batch = 0;

    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      if (el.dataset.rkSeen) continue;

      // No layout box yet, usually inside #cockpit[hidden]. Do not mark it
      // seen: it gets picked up once the reader opens that section.
      if (el.offsetParent === null) continue;

      var r = el.getBoundingClientRect();
      if (!r.height) continue;

      el.dataset.rkSeen = "1";

      // Off screen right now: leave it completely alone, permanently visible.
      if (r.top >= vh || r.bottom <= 0) continue;

      el.classList.add("rk-rise");
      el.style.transitionDelay = Math.min(batch * 45, 270) + "ms";
      batch++;

      // Next frame, so the browser registers the hidden state before the
      // transition to the visible one.
      requestAnimationFrame(function (node) {
        return function () { node.classList.add("rk-in"); };
      }(el));
    }
  }

  /* Sparklines draw themselves in rather than appearing whole.

     Two hard won details:

     1. Scope. The fund list re-renders its rows on every control change, and a
        line whose draw was interrupted by a re-render is left frozen with a
        partial stroke-dasharray, which shows up as a chart with chunks
        missing. So only the two sparklines that are stable on the page get the
        animation: the homepage result and the fund page total-return path.
        Fund list rows render complete, every time.

     2. Cleanup. Once the draw finishes the dash properties are removed
        entirely. Leaving a dasharray on the element is what turns any later
        interruption, reflow or re-render into a broken looking line. */
  var DRAW_MS = 1100;

  function clearDash(p) {
    p.style.transition = "";
    p.style.strokeDasharray = "";
    p.style.strokeDashoffset = "";
  }

  function drawSparks() {
    var lines = document.querySelectorAll(
      ".hs-spark svg.spark polyline:not([data-rk-drawn]), svg.fp-spark polyline:not([data-rk-drawn])"
    );
    for (var i = 0; i < lines.length; i++) {
      var p = lines[i];
      var len = 0;
      try { len = p.getTotalLength(); } catch (e) { continue; }
      if (!len) continue;
      p.setAttribute("data-rk-drawn", "1");
      p.style.strokeDasharray = len;
      p.style.strokeDashoffset = len;

      // Fade the shaded area in alongside the line. Without this the fill is
      // fully painted while the line is still drawing across it, which reads
      // as a rendering fault rather than as an animation.
      var area = p.parentNode.querySelector("polygon");
      if (area) {
        area.style.opacity = "0";
        area.style.transition = "opacity " + DRAW_MS + "ms ease";
      }

      void p.getBoundingClientRect(); // force a start value to move from
      p.style.transition = "stroke-dashoffset " + DRAW_MS + "ms cubic-bezier(.25,.8,.35,1)";
      p.style.strokeDashoffset = "0";
      if (area) area.style.opacity = "1";

      // Strip the dash once it has landed, whichever fires first.
      (function (node) {
        var done = false;
        function finish() {
          if (done) return;
          done = true;
          clearDash(node);
        }
        node.addEventListener("transitionend", finish);
        setTimeout(finish, DRAW_MS + 250);
      })(p);
    }
  }

  /* Adds the looping highlight to the result sparkline.

     A clone of the line is overlaid and given a short dash pattern, so a bright
     segment travels along the path on a loop while the real line stays fully
     drawn underneath. The clone is aria-hidden and has no pointer events: it is
     decoration over data, and it must never be mistaken for data. */
  function traceHeroSpark() {
    if (reduced) return;
    var base = document.querySelector(".hs-spark svg.spark polyline:not(.rk-trace)");
    if (!base) return;
    var svg = base.ownerSVGElement;
    if (!svg || svg.querySelector(".rk-trace")) return;

    var len = 0;
    try { len = base.getTotalLength(); } catch (e) { return; }
    if (!len) return;

    var t = base.cloneNode(true);
    t.setAttribute("class", "rk-trace");
    t.setAttribute("aria-hidden", "true");
    t.removeAttribute("data-rk-drawn");
    t.removeAttribute("id");
    t.style.setProperty("--rk-len", len);
    // A segment about a tenth of the path, with the rest of the cycle empty.
    t.style.strokeDasharray = Math.max(24, len * 0.1) + " " + len;
    svg.appendChild(t);
  }

  /* A table that scrolls inside a card keeps its caption and column headings
     pinned. The caption wraps to two lines on narrow screens, so its height is
     measured rather than hardcoded and handed to CSS as --rk-cap-h. */
  function pinTableHeads() {
    var caps = document.querySelectorAll(".cht-nums caption");
    for (var i = 0; i < caps.length; i++) {
      var t = caps[i].closest("table");
      if (!t) continue;
      t.style.setProperty("--rk-cap-h", Math.round(caps[i].offsetHeight) + "px");
    }
  }

  /* A cue that there is more below. The homepage first screen is a hero and two
     cards, which reads as the whole page. This sits under the fold, scrolls to
     the results when clicked, and gets out of the way as soon as the reader
     starts scrolling on their own. */
  function scrollCue() {
    if (!document.body.classList.contains("rk-home")) return;
    if (document.querySelector(".rk-cue")) return;

    var fold = document.getElementById("rkfold");
    if (!fold || !fold.parentNode) return;

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "rk-cue";
    btn.setAttribute("aria-label", "Scroll down to the fund results");
    btn.innerHTML =
      '<span class="rk-cue-t">More below</span><span class="rk-cue-a" aria-hidden="true"></span>';

    btn.addEventListener("click", function () {
      var t = document.getElementById("topperf") ||
              document.getElementById("cockpit") ||
              document.querySelector(".doors");
      if (t && t.scrollIntoView) {
        t.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        window.scrollBy({ top: window.innerHeight * 0.8, behavior: "smooth" });
      }
    });

    fold.parentNode.insertBefore(btn, fold.nextSibling);

    addEventListener("scroll", function () {
      btn.classList.toggle("rk-cue-off", window.scrollY > 120);
    }, { passive: true });
  }

  /* Current page marker, fallback only.

     beta-notice.js marks the active nav link from a hand maintained chain of
     path patterns. That chain was written before Ratings and Stocks joined the
     navigation, so on those two pages nothing is marked and the reader loses
     their place. The markup is fine: every link already carries data-nav and a
     real href.

     This matches on the href instead, longest prefix wins, so it needs no
     maintenance when a link is added. It runs only if nothing has been marked
     already, which keeps beta-notice.js authoritative wherever it works. */
  function markActiveNav() {
    if (document.querySelector(".rk-links a.active, .rk-menu a.active")) return;

    var path = location.pathname.replace(/index\.html$/, "") || "/";
    var links = document.querySelectorAll(".rk-links a[href], .rk-menu a[href]");
    var best = null;
    var bestLen = -1;

    for (var i = 0; i < links.length; i++) {
      var href = links[i].getAttribute("href") || "";
      if (href.charAt(0) !== "/") continue;
      var h = href.replace(/index\.html$/, "") || "/";
      if (h === "/") continue; // the home link must not win on every page
      if ((path === h || path.indexOf(h) === 0) && h.length > bestLen) {
        best = links[i];
        bestLen = h.length;
      }
    }

    if (!best) return;
    best.classList.add("active");
    best.setAttribute("aria-current", "page");
  }

  /* Publish the real header height as --rk-chrome.

     Sticky toolbars offset themselves against this. Some pages never set it, and
     the funds directory hardcoded top:47px, so once the nav grew those bars slid
     underneath it. Measuring the nav means every sticky element stays clear of
     it whatever the nav ends up being. */
  function measureChrome() {
    var nav = document.querySelector(".rk-nav");
    if (!nav) return;
    var h = Math.round(nav.getBoundingClientRect().height);
    if (h > 0) root.style.setProperty("--rk-chrome", h + "px");
  }

  /* Mobile menu, fallback only.

     The burger markup and its stylesheet ship in the page, but the handler that
     opens it lives in beta-notice.js, and the copy being served is an older
     build with no rkMenuBtn code in it at all. On a phone that means tapping
     the burger does nothing.

     This binds a handler that only acts if nothing else did. It reads the
     panel state before the click, then checks again on the next tick: if some
     other listener already toggled it, this does nothing, so there is no double
     toggle once the correct beta-notice.js is deployed. */
  function menuFallback() {
    var btn = document.getElementById("rkMenuBtn");
    var panel = document.getElementById("rkMenu");
    if (!btn || !panel || btn.dataset.rkMenuFallback) return;
    btn.dataset.rkMenuFallback = "1";

    function setOpen(on) {
      panel.hidden = !on;
      btn.setAttribute("aria-expanded", on ? "true" : "false");
      btn.setAttribute("aria-label", on ? "Close menu" : "Open menu");
      document.body.classList.toggle("rk-menu-open", on);
      if (on) {
        var a = panel.querySelector("a");
        if (a && a.focus) a.focus();
      }
    }

    btn.addEventListener("click", function () {
      var before = panel.hidden;
      setTimeout(function () {
        if (panel.hidden === before) setOpen(before);
      }, 0);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !panel.hidden) setOpen(false);
    });

    panel.addEventListener("click", function (e) {
      if (e.target.closest && e.target.closest("a")) setOpen(false);
    });
  }

  /* Touch scroll guard.

     A <summary> fires click on touch release even when the finger travelled,
     so scrolling the page with a thumb resting on "See the numbers behind this
     chart" collapsed the table underneath. Track how far the touch moved and
     swallow the click in the capture phase if it was a drag rather than a tap.
     Preventing default on a summary click is what stops the details toggling. */
  function guardSummaryTaps() {
    if (document.body.dataset.rkTapGuard) return;
    document.body.dataset.rkTapGuard = "1";

    var sx = 0, sy = 0, moved = false;
    var SLOP = 10;

    addEventListener("touchstart", function (e) {
      var t = e.touches[0];
      if (!t) return;
      sx = t.clientX; sy = t.clientY; moved = false;
    }, { passive: true });

    addEventListener("touchmove", function (e) {
      var t = e.touches[0];
      if (!t) return;
      if (Math.abs(t.clientX - sx) > SLOP || Math.abs(t.clientY - sy) > SLOP) {
        moved = true;
      }
    }, { passive: true });

    addEventListener("click", function (e) {
      if (!moved) return;
      var s = e.target && e.target.closest && e.target.closest("summary");
      if (!s) return;
      e.preventDefault();
      e.stopPropagation();
      moved = false;
    }, true);
  }

  /* The chart data table said "See the numbers behind this chart" whether the
     numbers were hidden or already on screen, and gave no hint it could be
     opened at all. The chevron comes from CSS; the wording is swapped here so
     the control describes what the next click will do. */
  var SHUT_LABEL = "See the numbers behind this chart";
  var OPEN_LABEL = "Hide the numbers";

  function wireTables() {
    var list = document.querySelectorAll("details.cht-nums:not([data-rk-toggle])");
    for (var i = 0; i < list.length; i++) {
      var d = list[i];
      var s = d.querySelector("summary");
      if (!s) continue;
      d.setAttribute("data-rk-toggle", "1");

      // Keep whatever wording the page shipped as the closed label.
      var shut = (s.textContent || "").trim() || SHUT_LABEL;

      d.addEventListener("toggle", function (node, sum, closedText) {
        return function () {
          sum.textContent = node.open ? OPEN_LABEL : closedText;
        };
      }(d, s, shut));

      if (d.open) s.textContent = OPEN_LABEL;
    }
  }

  // The fund list re-renders on every control change, and #cockpit and
  // #answerzone lose their hidden flag when opened, which is when most of the
  // page becomes measurable for the first time. Catch both, debounced.
  var pending = null;
  function schedule() {
    if (pending) return;
    pending = setTimeout(function () {
      pending = null;
      wireTables();
      pinTableHeads();
      if (reduced) return;
      scan();
      drawSparks();
      traceHeroSpark();
    }, 90);
  }

  function start() {
    measureChrome();
    addEventListener("resize", measureChrome, { passive: true });
    markActiveNav();
    menuFallback();
    guardSummaryTaps();
    wireTables();
    pinTableHeads();
    scrollCue();
    addEventListener("resize", pinTableHeads, { passive: true });

    if (reduced) {
      // Still watch for re-rendered charts so their toggles stay labelled.
      if ("MutationObserver" in window) {
        new MutationObserver(schedule).observe(document.body, {
          childList: true,
          subtree: true
        });
      }
      return;
    }

    root.classList.add("rk-anim");
    scan();
    drawSparks();
    traceHeroSpark();

    if ("MutationObserver" in window) {
      new MutationObserver(schedule).observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["hidden", "style", "class"]
      });
    }

    // Watchdog. Nothing stays hidden, whatever went wrong above.
    setTimeout(function () {
      var late = document.querySelectorAll(".rk-rise:not(.rk-in)");
      for (var i = 0; i < late.length; i++) late[i].classList.add("rk-in");
    }, 1200);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
