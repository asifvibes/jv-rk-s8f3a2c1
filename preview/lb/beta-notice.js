/* ReturnKoto? - site-wide beta / data-verification banner.
   Loaded on every page (including generated fund pages). Injects a slim amber strip.
   Adaptive (17 Jul 2026): the first visit shows the full explanation; once seen (or
   acknowledged with "Got it") later visits show one compact line with a "Why beta?"
   expander, returning roughly 10% of the first mobile screen while staying honest.
   To retire later: replace the body of the IIFE below with a no-op. */
(function () {
  try {
    if (document.getElementById("rk-beta-banner")) return;
    var seen = null;
    try { seen = localStorage.getItem("rk_beta_seen"); } catch (e) {}
    try { localStorage.setItem("rk_beta_seen", "1"); } catch (e) {}
    var css =
      '#rk-beta-banner{background:var(--amber-soft,#FEF3C7);border-bottom:1px solid rgba(180,83,9,.28)}' +
      '#rk-beta-banner .in{max-width:760px;margin:0 auto;padding:6px 18px;display:flex;align-items:center;flex-wrap:wrap;gap:6px 9px;font-size:12.5px;line-height:1.42}' +
      '#rk-beta-banner .pill{flex:none;font-size:9.5px;font-weight:800;letter-spacing:.09em;color:#fff;background:#B45309;padding:2px 7px;border-radius:5px}' +
      '#rk-beta-banner .tx{color:#7A4A08;flex:1;min-width:140px}' +
      '#rk-beta-banner .tx b{color:#5C3806;font-weight:700}' +
      '#rk-beta-banner .more{display:none}' +
      '#rk-beta-banner.open .more{display:inline}' +
      '#rk-beta-banner .bbtn{flex:none;position:relative;font-family:inherit;font-size:11.5px;font-weight:700;color:#7A4A08;background:none;border:1px solid rgba(180,83,9,.4);border-radius:999px;padding:4px 11px;cursor:pointer;min-height:28px;margin-left:auto}' +
      '#rk-beta-banner .bbtn::after{content:"";position:absolute;inset:-9px}' +
      '[data-theme="dark"] #rk-beta-banner{background:#2A2010;border-bottom-color:#5A4420}' +
      '[data-theme="dark"] #rk-beta-banner .tx{color:#E8C98A}' +
      '[data-theme="dark"] #rk-beta-banner .tx b{color:#F5DEAC}' +
      '[data-theme="dark"] #rk-beta-banner .pill{background:#8A5411}' +
      '[data-theme="dark"] #rk-beta-banner .bbtn{color:#E8C98A;border-color:rgba(232,201,138,.45)}';
    var st = document.createElement("style");
    st.textContent = css;
    document.head.appendChild(st);

    var b = document.createElement("div");
    b.id = "rk-beta-banner";
    b.setAttribute("role", "note");
    b.innerHTML =
      '<div class="in"><span class="pill">BETA</span>' +
      '<span class="tx"><b>Data is still being verified.</b><span class="more"> ReturnKoto? is an experimental reference for learning and research. Figures are still being reviewed and corrected.</span></span>' +
      '<button class="bbtn" type="button" aria-expanded="false"></button></div>';

    var body = document.body;
    if (body) body.insertBefore(b, body.firstChild);

    var btn = b.querySelector(".bbtn");
    function setOpen(open) {
      b.classList.toggle("open", open);
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      btn.textContent = open ? "Got it" : "Why beta?";
    }
    setOpen(!seen); // first visit: full explanation; later visits: compact line
    btn.addEventListener("click", function () {
      var open = b.classList.contains("open");
      if (open) { try { localStorage.setItem("rk_beta_seen", "1"); } catch (e) {} }
      setOpen(!open);
    });
  } catch (e) {}
})();
