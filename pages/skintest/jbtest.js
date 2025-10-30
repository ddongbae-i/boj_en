/* jbtest.js integrated build by GPT 5 — 2025-10-30 08:49:20 KST */
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
  ];

  // Result presets
  /* const personas = [
    {
      type: "Jang Hee‑bin — Power & Glam",
      summary:
        "You lead with quiet command and immaculate polish. Feed the skin with ginseng, lift with red ginseng, then veil it in a pearl-lit base that reads elegant rather than loud. Every detail looks deliberate, every moment yours."
    },
  ];

  // Simple scoring → pick persona index 0..3
  function pickPersona(answers) {
    // Reduce to a stable index using sum of choices
    const sum = answers.reduce((a, v) => a + (typeof v === "number" ? v : 0), 0);
    return sum % personas.length;
  }
 */
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
    // compute persona
    const pi = pickPersona(JB.state.answers);
    JB.state.profile = personas[pi];

    // Populate type/summary
    const typeEl = $("#type");
    const sumEl = $("#summary");
    if (typeEl) typeEl.textContent = JB.state.profile.type;
    if (sumEl) sumEl.innerHTML = (JB.state.profile.summary || "").replace(/\n/g, "<br>");

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
    bindWishlistButtons();
    bindWishlistAll();
    renderQuestion();
    initRoute();
  });
})(window);



// === GSAP safe animations (aligned with skintest.js) ===
(function (w) {
  "use strict";
  var JB = w.JB || (w.JB = {});

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
    var sel = "#result #type, #result #summary, #result .product_card, #result #wishlistBtn, #result .row-ghosts button, #result #mainCard";
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

    var type = res.querySelector("#type");
    var summary = res.querySelector("#summary");
    var mainCard = res.querySelector("#mainCard");
    var cards = res.querySelectorAll(".product_card");
    var ctaAll = res.querySelector("#wishlistBtn");
    var ctas = res.querySelectorAll(".row-ghosts button");

    resultTL = gsap.timeline({ defaults: { ease: "power3.out" } });
    if (type) resultTL.from(type, { y: -8, opacity: 0, duration: 0.28 }, 0);
    if (summary) resultTL.from(summary, { y: 8, opacity: 0, duration: 0.32 }, 0.04);
    if (mainCard) resultTL.from(mainCard, { y: 10, opacity: 0, duration: 0.34 }, 0.08);
    if (cards && cards.length) resultTL.from(cards, { y: 26, opacity: 0, stagger: 0.08, duration: 0.40 }, 0.16);
    if (ctaAll) resultTL.from(ctaAll, { y: 12, opacity: 0, duration: 0.28 }, "+=0.05");
    if (ctas && ctas.length) resultTL.from(ctas, { y: 10, opacity: 0, stagger: 0.06, duration: 0.26 }, "-=0.10");

    // ScrollTrigger for products
    if (typeof ScrollTrigger !== "undefined") {
      gsap.registerPlugin(ScrollTrigger);
      res.querySelectorAll(".product_card").forEach(function (card) {
        gsap.from(card, {
          y: 22,
          opacity: 0,
          duration: 0.35,
          ease: "power2.out",
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
            toggleActions: "play none none reverse"
          },
        });
      });
    }
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
      } catch (e) {}
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