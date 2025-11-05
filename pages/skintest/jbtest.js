/* -- neutralize reset/wishlist bindings (auto-inserted) -- */
(function(){
  try {
    var IDs = new Set(["resetBtn","wishlistBtn","wishlistAll"]);
    var origGet = document.getElementById.bind(document);
    document.getElementById = function(id){
      var el = origGet(id);
      if (el && IDs.has(id)) {
        try { el.onclick = null; } catch(e){}
        try { el.addEventListener = function(){}; } catch(e){}
      }
      return el;
    };
  } catch(e){}
})();
// -- end neutralizer --

(function (w) {
  "use strict";
  const JB = (w.JB = w.JB || {});

  // State
  JB.state = {
    currentIndex: 0,          // 0..4
    answers: Array(5).fill(null),
    navigating: false,
    profile: null,
  };

  // DOM helpers
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  // Scroll lock
  JB.lockScroll = function (on) {
    const d = document.documentElement, b = document.body;
    d.style.overflow = on ? "hidden" : "";
    b.style.overflow = on ? "hidden" : "";
  };

  // Section show/hide
  JB.showSection = function (id) {
    const ids = ["home", "quiz", "loading", "result"];
    ids.forEach(sec => {
      const el = document.getElementById(sec);
      if (!el) return;
      el.hidden = sec !== id;
      el.classList.toggle("is-hidden", sec !== id);
    });
    // focus first control
    const focus = document.querySelector(`#${id} button, #${id} [tabindex], #${id} a, #${id} input`);
    if (focus) setTimeout(() => focus.focus(), 0);
    // lock only on loading
    JB.lockScroll(id === "loading");
    // set hash
    if (typeof history !== "undefined" && history.replaceState) {
      history.replaceState(null, "", `#${id}`);
    } else {
      location.hash = `#${id}`;
    }
  };

  // Questions (5)
  const questions = [
    {
      text: "Under the soft moonlight, a banquet is underway in the royal palace. Where are you?",
      choices: ["Dressed in a splendid dangui (court robe), you bow before the king", "Sitting in the study, writing poetry", "Playing the geomungo and mingling with connoisseurs of the arts", "Alone by the riverbank, contemplating the fate of the nation", "Dancing boldly, your crimson skirt swirling", "Quietly reciting poems beneath a plum tree in bloom"]
    },
    {
      text: "If you were to spend a day inside the palace, which place draws you most?",
      choices: ["The dazzling banquet hall", "The tranquil garden", "A lively, tavern-like gathering", "A rock by the Nam River", "The grand, ornate main hall (daecheong)", "A pavilion adorned with plum blossoms"]
    },
    {
      text: "Which description do people use for you most often?",
      choices: ["“You have charisma—you command the room.”", "“Calm and graceful.”", "“Fun and captivating.”", "“Principled and righteous.”", "“Bold and unconventional.”", "“Cultured and poetic.”"]
    },
    {
      text: "With a free day to yourself, what are you doing?",
      choices: ["Tending to court attire and doing your makeup", "Drawing with children and composing poems", "Raising a cup of wine and singing", "Renewing your vow of integrity by the riverside", "Performing a brilliant, flamboyant dance", "Spending the night with poetry and song"]
    },
    {
      text: "In Joseon, how would your allure be summed up in one phrase?",
      choices: ["Power and splendor", "Graceful wisdom", "Refinement and the arts", "Integrity and courage", "Daring and allure", "Cultivation and letters (literary grace)"]
    }
  ]

  // Quiz backgrounds per question (optional)
  // Configure via: JB.setQuizBackgrounds([ "center/cover no-repeat url(/path/bg1.jpg)", ... ])
  JB.quizBackgrounds = JB.quizBackgrounds || null;
  JB.setQuizBackgrounds = function (arr) { JB.quizBackgrounds = Array.isArray(arr) ? arr : null; };
  function applyQuizBackground(idx) {
    var el = document.getElementById("quiz");
    if (!el) return;
    var bg = (JB.quizBackgrounds && JB.quizBackgrounds[idx]) || (questions[idx] && questions[idx].bg) || null;
    if (bg) {
      // Accept full CSS background value or just image URL
      if (/^url\(/.test(bg) || /no-repeat|cover|contain|#|rgb|gradient/i.test(bg)) {
        el.style.background = bg;
      } else {
        el.style.backgroundImage = 'url(' + bg + ')';
        el.style.backgroundSize = 'cover';
        el.style.backgroundRepeat = 'no-repeat';
        el.style.backgroundPosition = 'center';
      }
    } else {
      el.style.background = "";
      el.style.backgroundImage = "";
    }
  }


  // Result presets
  // (removed: personas & pickPersona)
  // Render quiz question
  function renderQuestion() {
    const idx = JB.state.currentIndex;
    const q = questions[idx];
    const qText = $("#question");
    const options = $("#options");
    const prevBtn = $("#prevBtn");
    const nextBtn = $("#nextBtn");
    const progress = $("#progress");
    if (!q || !qText || !options || !prevBtn || !nextBtn || !progress) return;

    qText.textContent = `Q${idx + 1}. ${q.text}`;
    options.innerHTML = "";
    progress.textContent = `${idx + 1} of ${questions.length}`;
    applyQuizBackground(idx);

    const group = `q${idx}`;
    q.choices.forEach((label, i) => {
      const wrap = document.createElement("label");
      wrap.className = "choice";
      wrap.tabIndex = 0;

      const input = document.createElement("input");
      input.type = "radio";
      input.name = group;
      input.value = String(i);
      input.setAttribute("aria-label", label);

      const dot = document.createElement("span");
      dot.className = "radio";

      const text = document.createElement("span");
      text.className = "label-text";
      const prefix = String.fromCharCode(65 + i);
      text.textContent = `${prefix}. ${label}`;

      if (JB.state.answers[idx] === i) {
        input.checked = true;
        wrap.classList.add("checked");
      }

      input.addEventListener("change", () => {
        JB.state.answers[idx] = i;
        nextBtn.disabled = false;
        // sync class
        $$("#options .choice").forEach(el => {
          const on = el.querySelector('input[type="radio"]')?.checked;
          el.classList.toggle("checked", !!on);
        });
      });

      wrap.appendChild(input);
      wrap.appendChild(dot);
      wrap.appendChild(text);
      options.appendChild(wrap);
    });

    prevBtn.disabled = idx === 0;
    nextBtn.textContent = idx === questions.length - 1 ? "Result" : "Next";
    nextBtn.disabled = JB.state.answers[idx] == null;
  }

  // Navigation
  function goPrev() {
    if (JB.state.currentIndex === 0) return;
    JB.state.currentIndex -= 1;
    renderQuestion();
  }
  function goNext() {
    const idx = JB.state.currentIndex;
    if (JB.state.answers[idx] == null) return;
    if (idx < questions.length - 1) {
      JB.state.currentIndex += 1;
      renderQuestion();
      return;
    }
    // Last → loading
    JB.showSection("loading");
    const delay = Number($("#loading")?.dataset?.delay || 1200);
    setTimeout(showResult, Math.max(0, delay));
  }

  // Result render
  function showResult() {
    JB.showSection("result");
    // Optional: animate buttons safely
    if (typeof w.animateResultButtonsSafe === "function") {
      w.animateResultButtonsSafe();
    }
  }

  // Wishlist single button toggle in product cards
  function bindWishlistButtons() {
    document.addEventListener("click", (e) => {
      const btn = e.target.closest?.(".product_card .add_btn");
      if (!btn) return;
      e.preventDefault();
      const on = btn.classList.toggle("on");
      btn.setAttribute("aria-pressed", on ? "true" : "false");
      const img = btn.querySelector("img.heart");
      if (img) img.src = on ? "/asset/img/skintest/icon_heart_fill.svg" : "/asset/img/skintest/icon_heart_stroke.svg";
      // keep label same as provided
      syncWishlistAll();
    });
  }

  // ALL TO WISHLIST button
  function syncWishlistAll() {
    const allBtn = $("#wishlistBtn");
    if (!allBtn) return;
    const btns = $$(".product_card .add_btn");
    const allOn = btns.length > 0 && btns.every(b => b.classList.contains("on"));
    allBtn.setAttribute("aria-pressed", allOn ? "true" : "false");
    const onLabel = allBtn.dataset.labelOn || "REMOVE ALL";
    const offLabel = allBtn.dataset.labelOff || "ALL TO WISHLIST";
    allBtn.textContent = allOn ? onLabel : offLabel;
  }
  function bindWishlistAll() {
    const allBtn = $("#wishlistBtn");
    if (!allBtn) return;
    if (!allBtn.dataset.labelOn) allBtn.dataset.labelOn = "REMOVE ALL";
    if (!allBtn.dataset.labelOff) allBtn.dataset.labelOff = "ALL TO WISHLIST";
    syncWishlistAll();
    allBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const btns = $$(".product_card .add_btn");
      const allOn = allBtn.getAttribute("aria-pressed") === "true";
      btns.forEach(b => {
        b.classList.toggle("on", !allOn);
        b.setAttribute("aria-pressed", !allOn ? "true" : "false");
        const img = b.querySelector("img.heart");
        if (img) img.src = !allOn ? "/asset/img/skintest/icon_heart_fill.svg" : "/asset/img/skintest/icon_heart_stroke.svg";
      });
      // sync label
      setTimeout(syncWishlistAll, 0);
    });
  }


  // Result main card: show back face on click
  function bindMainCardFlip() {
    var card = document.getElementById("mainCard");
    if (!card) return;
    var front = card.querySelector(".card-face.front");
    var back = card.querySelector(".card-face.back");
    // initial: show back, hide front (JS overrides CSS minimally)
    if (front) front.hidden = true;
    if (back) back.hidden = false;
    function showFront() {
      if (front) front.hidden = false;
      if (back) back.hidden = true;
      card.setAttribute("aria-pressed", "false");
    }
    card.addEventListener("click", function (e) {
      e.preventDefault();
      showFront();
    });
    card.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        showFront();
      }
    });
  }

  // Bindings
  function bindNav() {
    $("#startBtn")?.addEventListener("click", () => JB.showSection("quiz"));
    $("#prevBtn")?.addEventListener("click", goPrev);
    $("#nextBtn")?.addEventListener("click", goNext);
    $("#homeBtn")?.addEventListener("click", () => JB.showSection("home"));
    $("#resetBtn")?.addEventListener("click", () => {
      JB.state.currentIndex = 0;
      JB.state.answers = Array(5).fill(null);
      JB.state.profile = null;
      JB.showSection("quiz");
      renderQuestion();
    });
  }

  // Initial route
  function initRoute() {
    const initial = (location.hash || "#home").replace("#", "");
    JB.showSection(initial);
  }

  // Init
  document.addEventListener("DOMContentLoaded", () => {
    JB.lockScroll(false);
    bindNav();
    /* disabled: bindWishlistButtons(); */
/* disabled: bindWishlistAll(); */
bindMainCardFlip();
    renderQuestion();
    initRoute();
  });
})(window);



// === GSAP safe animations (aligned with skintest.js) ===
(function (w) {
  "use strict";
  var JB = w.JB || (w.JB = {});

  // GSAP bootstrap (minimal, GSAP-only)
  (function bootstrap() {
    if (typeof w.gsap === "undefined") return;
    try { if (typeof w.ScrollTrigger !== "undefined" && w.gsap && w.gsap.registerPlugin) { w.gsap.registerPlugin(w.ScrollTrigger); } } catch (_) { }
    try { w.gsap.defaults({ immediateRender: false, overwrite: "auto" }); } catch (_) { }
  })();

  function hasGSAP() { return typeof w.gsap !== "undefined"; }
  var homeTL = null, resultTL = null;

  function killHomeAnim() {
    if (homeTL) { homeTL.kill(); homeTL = null; }
    var sel = "#home .home-title, #home .home-sub, #home .badges .badge, #home #startBtn";
    document.querySelectorAll(sel).forEach(function (el) {
      el.style.opacity = "";
      el.style.transform = "";
    });
  }
  function killResultAnim() {
    if (resultTL) { resultTL.kill(); resultTL = null; }
    var sel = "#result .product_card, #result #wishlistBtn, #result .row-ghosts button, #result #mainCard";
    document.querySelectorAll(sel).forEach(function (el) {
      el.style.opacity = "";
      el.style.transform = "";
    });
  }

  function dispatch(name) {
    try {
      var ev = new CustomEvent(name);
      w.dispatchEvent(ev);
    } catch (_) {
      var ev2 = document.createEvent("Event");
      ev2.initEvent(name, true, true);
      w.dispatchEvent(ev2);
    }
  }

  // Home entrance
  function animateHomeSection() {
    if (!hasGSAP()) return;
    var home = document.getElementById("home");
    if (!home || home.hidden) return;

    var prefersReduced = w.matchMedia && w.matchMedia("(prefers-reduced-motion: reduce)").matches;
    killHomeAnim();

    var title = home.querySelector(".home-title");
    var sub = home.querySelector(".home-sub");
    var badges = home.querySelectorAll(".badges .badge");
    var start = home.querySelector("#startBtn");

    homeTL = gsap.timeline({ defaults: { ease: "power3.out" } });

    if (prefersReduced) {
      if (title) homeTL.from(title, { opacity: 0, duration: 0.20 }, 0);
      if (sub) homeTL.from(sub, { opacity: 0, duration: 0.20 }, 0.05);
      if (badges && badges.length) homeTL.from(badges, { opacity: 0, duration: 0.18, stagger: 0.04 }, 0.10);
      if (start) homeTL.from(start, { opacity: 0, duration: 0.22 }, 0.18);
      return;
    }
    if (title) homeTL.from(title, { y: 18, opacity: 0, duration: 0.42 }, 0);
    if (sub) homeTL.from(sub, { y: 14, opacity: 0, duration: 0.34 }, 0.08);
    if (badges && badges.length) homeTL.from(badges, { y: 10, opacity: 0, duration: 0.26, stagger: 0.06 }, 0.14);
    if (start) homeTL.from(start, { y: 8, opacity: 0, duration: 0.28 }, 0.22);
  }
  w.addEventListener("JB_SHOW_HOME", animateHomeSection);

  // Loading
  w.animateLoadingSafe = function () {
    if (!hasGSAP()) return;
    if (typeof w.ScrollTrigger !== "undefined" && gsap.registerPlugin) {
      gsap.registerPlugin(ScrollTrigger);
    }
    gsap.to("#loading .spinner", { rotation: 360, duration: 1, repeat: -1, ease: "none" });
    gsap.from("#loading .loading-text, #loading .loading-sub", {
      duration: 0.6, y: 16, opacity: 0, stagger: 0.15, ease: "power2.out"
    });
  };

  // Result entrance
  function animateResultSection() {
    if (!hasGSAP()) return;
    var res = document.getElementById("result");
    if (!res || res.hidden) return;

    killResultAnim();

    var mainCard = res.querySelector("#mainCard");
    var cards = res.querySelectorAll(".product_card");
    var ctaAll = res.querySelector("#wishlistBtn");
    var ctas = res.querySelectorAll(".row-ghosts button");

    resultTL = gsap.timeline({ defaults: { ease: "power3.out" } }); if (mainCard) resultTL.from(mainCard, { y: 10, opacity: 0, duration: 0.34 }, 0.08);
    if (ctaAll) resultTL.from(ctaAll, { y: 12, opacity: 0, duration: 0.28 }, "+=0.05");
    if (ctas && ctas.length) resultTL.from(ctas, { y: 10, opacity: 0, stagger: 0.06, duration: 0.26 }, "-=0.10");


    // Scroll-triggered reveal for products
    (function setupScrollReveal() {
      var cards = res.querySelectorAll(".product_card");
      if (!cards || !cards.length) return;

      function animateCard(el) {
        gsap.fromTo(el, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.80, ease: "power2.out", overwrite: "auto", clearProps: "transform,opacity" });
      }

      if (typeof ScrollTrigger !== "undefined" && gsap.registerPlugin) {
        gsap.registerPlugin(ScrollTrigger);
        var startPos = (w.matchMedia && w.matchMedia("(min-width: 1024px)").matches) ? "top 85%" : "top 90%";
        cards.forEach(function (card) {
          gsap.fromTo(card,
            { y: 22, opacity: 0 },
            {
              y: 0, opacity: 1, duration: 0.38, ease: "power2.out", immediateRender: false, clearProps: "transform,opacity",
              scrollTrigger: {
                trigger: card,
                start: startPos,
                end: "bottom 5%",
                once: true,
                invalidateOnRefresh: true,
                toggleActions: "play none none none"
              }
            }
          );
        });
        // Refresh after layout settles
        requestAnimationFrame(function () { setTimeout(function () { try { ScrollTrigger.refresh(); } catch (e) { } }, 60); });
        w.addEventListener("load", function () { try { ScrollTrigger.refresh(); } catch (e) { } });
      } else if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (entries, obs) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              animateCard(entry.target);
              obs.unobserve(entry.target);
            }
          });
        }, { root: null, rootMargin: "0px 0px -12% 0px", threshold: 0.1 });
        cards.forEach(function (card) { io.observe(card); });
      } else {
        // Last resort: animate immediately
        cards.forEach(animateCard);
      }
    })();

  }
  w.addEventListener("JB_SHOW_RESULT", animateResultSection);

  // Provide a small helper used in jbtest.js showResult()
  w.animateResultButtonsSafe = function () {
    if (!hasGSAP()) return;
    var res = document.getElementById("result");
    if (!res || res.hidden) return;
    gsap.from("#result .actions .btn-white, #result .row-ghosts button", {
      duration: 0.28, y: 10, opacity: 0, stagger: 0.06, ease: "power2.out"
    });
  };

  // Hook JB.showSection to emit events
  if (JB && typeof JB.showSection === "function") {
    var orig = JB.showSection.bind(JB);
    JB.showSection = function (id) {
      var ret = orig(id);
      try {
        if (id === "home") {
          dispatch("JB_SHOW_HOME");
        } else if (id === "result") {
          dispatch("JB_SHOW_RESULT");
        }
      } catch (e) { }
      return ret;
    };
  }

  // Clean up when navigating away
  w.addEventListener("hashchange", function () {
    var h = (location.hash || "#home");
    if (h !== "#home") killHomeAnim();
    if (h !== "#result") killResultAnim();
  });

  // Initial auto-run on direct hash loads
  document.addEventListener("DOMContentLoaded", function () {
    if (!hasGSAP()) return;
    var h = location.hash || "#home";
    if (h === "#home") requestAnimationFrame(animateHomeSection);
    if (h === "#result") requestAnimationFrame(animateResultSection);

    // Bonus: light hover scale on .btn elements
    document.querySelectorAll(".btn, .btn-white").forEach(function (btn) {
      btn.addEventListener("mouseenter", function () { if (!hasGSAP()) return; gsap.to(btn, { duration: 0.18, scale: 1.04, ease: "power2.out" }); });
      btn.addEventListener("mouseleave", function () { if (!hasGSAP()) return; gsap.to(btn, { duration: 0.18, scale: 1.00, ease: "power2.out" }); });
    });

    // Quiz next/start triggers
    document.getElementById("startBtn")?.addEventListener("click", w.animateQuizCardSafe);
    document.getElementById("nextBtn")?.addEventListener("click", w.animateQuizCardSafe);
  });
})(window);

document.addEventListener('DOMContentLoaded', function () {
  JB.setQuizBackgrounds([
    '/asset/img/skintest/jbtest-quiz-bg.jpg',
    '/asset/img/skintest/jbtest-quiz-bg.jpg',
    '/asset/img/skintest/jbtest-quiz-bg.jpg',
    '/asset/img/skintest/jbtest-quiz-bg.jpg',
    '/asset/img/skintest/jbtest-quiz-bg.jpg',
  ]);
});