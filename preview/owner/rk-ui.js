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
    ".badgekey"
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

  /* Sparklines draw themselves in rather than appearing whole. Uses the path
     length so timing is the same whatever the shape. */
  function drawSparks() {
    var lines = document.querySelectorAll(
      "svg.spark polyline:not([data-rk-drawn]), svg.fp-spark polyline:not([data-rk-drawn])"
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
        area.style.transition = "opacity 1.1s ease";
      }

      void p.getBoundingClientRect(); // force a start value to move from
      p.style.transition = "stroke-dashoffset 1.1s cubic-bezier(.25,.8,.35,1)";
      p.style.strokeDashoffset = "0";
      if (area) area.style.opacity = "1";
    }
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
      if (reduced) return;
      scan();
      drawSparks();
    }, 90);
  }

  function start() {
    markActiveNav();
    wireTables();

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
