// jbtest.js — 5-question flow up to #loading, tailored to jb-test.html
(function (w) {
  const JB = (w.JBTEST = w.JBTEST || {});

  JB.state = {
    currentIndex: 0,      // 0..4
    answers: Array(5).fill(null),
    navigating: false,
  };

  // Utilities
  JB.$ = (sel) => document.querySelector(sel);
  JB.$$ = (sel) => Array.from(document.querySelectorAll(sel));
  JB.sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  JB.lockScroll = function (on) {
    const d = document.documentElement, b = document.body;
    if (on) { d.style.overflow = "hidden"; b.style.overflow = "hidden"; }
    else { d.style.overflow = ""; b.style.overflow = ""; }
  };

  JB.showSection = function (id) {
    const ids = ["home", "quiz", "loading"];
    ids.forEach((sec) => {
      const el = JB.$("#" + sec);
      if (!el) return;
      el.hidden = sec !== id;
      el.classList.toggle("is-hidden", sec !== id);
    });
    // focus and hash
    const focusTarget = document.querySelector(
      `#${id} [tabindex], #${id} button, #${id} a, #${id} input, #${id} select, #${id} textarea`
    );
    if (focusTarget) setTimeout(() => focusTarget.focus(), 0);
    if (w.location.hash !== "#" + id) w.location.hash = "#" + id;
    JB.lockScroll(id === "loading");
  };

  JB.isAnswered = (idx) => JB.state.answers[idx] !== null;

  JB.updateProgress = function () {
    const p = JB.$("#progress");
    if (p) p.textContent = `${JB.state.currentIndex + 1} of 5`;
  };

  // Questions(5). Replace/translate as needed.
  const QUESTIONS = [
    {
      q: "Q1. Under the soft moonlight, a banquet is underway in the royal palace. Where are you?",
      a: ["A. Dressed in a splendid dangui (court robe), you bow before the king", "B. Sitting in the study, writing poetry", "C. Playing the geomungo and mingling with connoisseurs of the arts", "D. Alone by the riverbank, contemplating the fate of the nation", "E. Dancing boldly, your crimson skirt swirling", "F. Quietly reciting poems beneath a plum tree in bloom"],
    },
    {
      q: "Q2. If you were to spend a day inside the palace, which place draws you most?",
      a: ["A. The dazzling banquet hall", "B. The tranquil garden", "C. A lively, tavern-like gathering", "D. A rock by the Nam River", "E. The grand, ornate main hall (daecheong)", "F. A pavilion adorned with plum blossoms"],
    },
    {
      q: "Q3. Which description do people use for you most often?",
      a: ["A. “You have charisma—you command the room.”", "B. “Calm and graceful.”", "C. “Fun and captivating.”", "D. “Principled and righteous.”", "E. “Bold and unconventional.”", "F. “Cultured and poetic.”"],
    },
    {
      q: "Q4. With a free day to yourself, what are you doing?",
      a: ["A. Tending to court attire and doing your makeup", "B. Drawing with children and composing poems", "C. Raising a cup of wine and singing", "D. Renewing your vow of integrity by the riverside", "E. Performing a brilliant, flamboyant dance", "F. Spending the night with poetry and song"],
    },
    {
      q: "Q5. In Joseon, how would your allure be summed up in one phrase?",
      a: ["A. Power and splendor", "B. Graceful wisdom", "C. Refinement and the arts", "D. Integrity and courage", "E. Daring and allure", "F. Cultivation and letters (literary grace)"],
    },
  ];

  // Render question + options
  function renderQuestion() {
    const { currentIndex, answers } = JB.state;
    const data = QUESTIONS[currentIndex];
    const qEl = JB.$("#question");
    const form = JB.$("#options");
    const nextBtn = JB.$("#nextBtn");
    const prevBtn = JB.$("#prevBtn");

    if (!data || !qEl || !form || !nextBtn || !prevBtn) return;

    qEl.textContent = data.q;
    form.innerHTML = "";

    data.a.forEach((label, i) => {
      const id = `opt_${currentIndex}_${i}`;
      const wrap = document.createElement("label");
      wrap.className = "choice";
      wrap.setAttribute("role", "radio");
      wrap.setAttribute("aria-checked", "false");
      wrap.setAttribute("tabindex", "0");

      wrap.innerHTML = `
        <input type="radio" name="q${currentIndex}" id="${id}" value="${i}" aria-label="${label}">
        <span class="radio" aria-hidden="true"></span>
        <span class="label-text">${label}</span>
      `;

      wrap.addEventListener("click", (e) => {
        e.preventDefault(); // make label itself control selection
        selectOption(i);
      });
      wrap.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          selectOption(i);
        }
      });

      form.appendChild(wrap);
    });

    // restore selection if exists
    if (answers[currentIndex] !== null) {
      selectOption(answers[currentIndex], { silent: true });
      nextBtn.disabled = false;
    } else {
      nextBtn.disabled = true;
    }

    JB.updateProgress();
    prevBtn.disabled = currentIndex === 0;
    // focus first option for screen reader
    const first = form.querySelector(".choice");
    if (first) first.focus();
  }

  function selectOption(i, opts = {}) {
    const { currentIndex } = JB.state;
    JB.state.answers[currentIndex] = i;

    JB.$$("#options .choice").forEach((el, idx) => {
      const checked = idx === i;
      el.classList.toggle("checked", checked);
      el.setAttribute("aria-checked", checked ? "true" : "false");
    });
    const nextBtn = JB.$("#nextBtn");
    if (nextBtn) nextBtn.disabled = false;
    if (!opts.silent) {
      // Optional: move to next automatically on selection on mobile UX
    }
  }

  // Navigation
  async function goNext() {
    const { currentIndex } = JB.state;
    if (!JB.isAnswered(currentIndex)) return;
    if (currentIndex < QUESTIONS.length - 1) {
      JB.state.currentIndex += 1;
      renderQuestion();
    } else {
      // finish → show loading
      await finish();
    }
  }
  function goPrev() {
    if (JB.state.currentIndex > 0) {
      JB.state.currentIndex -= 1;
      renderQuestion();
    }
  }

  async function finish() {
    JB.showSection("loading");
    const loading = JB.$("#loading");
    const delay = loading?.dataset?.delay ? parseInt(loading.dataset.delay, 10) : 1200;
    // Dispatch an event for downstream handlers (e.g., card spread animation script)
    const detail = { answers: JB.state.answers.slice(), finishedAt: Date.now() };
    const evt = new CustomEvent("JB_TEST_READY", { detail });
    document.dispatchEvent(evt);
    await JB.sleep(Number.isFinite(delay) ? delay : 1200);
    // We intentionally stop at #loading as requested. Downstream code can listen to JB_TEST_READY to proceed.
  }

  function bindControls() {
    const startBtn = JB.$("#startBtn");
    const nextBtn = JB.$("#nextBtn");
    const prevBtn = JB.$("#prevBtn");

    if (startBtn) startBtn.addEventListener("click", () => {
      JB.state.currentIndex = 0;
      JB.state.answers = Array(5).fill(null);
      JB.showSection("quiz");
      renderQuestion();
    });
    if (nextBtn) nextBtn.addEventListener("click", goNext);
    if (prevBtn) prevBtn.addEventListener("click", goPrev);

    // keyboard shortcuts: left/right/enter numbers 1..9
    document.addEventListener("keydown", (e) => {
      const inQuiz = !JB.$("#quiz")?.hidden;
      if (!inQuiz) return;
      if (e.key === "ArrowRight") { e.preventDefault(); goNext(); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); goPrev(); }
      else if (e.key === "Enter") { e.preventDefault(); goNext(); }
      else if (/^[1-9]$/.test(e.key)) {
        const idx = parseInt(e.key, 10) - 1;
        const choices = JB.$$("#options .choice");
        if (idx >= 0 && idx < choices.length) {
          e.preventDefault();
          selectOption(idx);
        }
      }
    });

    // hash routing: allow direct links
    w.addEventListener("hashchange", () => {
      const id = (w.location.hash || "#home").slice(1);
      if (["home", "quiz", "loading"].includes(id)) {
        JB.showSection(id);
        if (id === "quiz") renderQuestion();
      }
    });
  }

  function init() {
    bindControls();
    // initial route
    const id = (w.location.hash || "#home").slice(1);
    if (["home", "quiz", "loading"].includes(id)) {
      JB.showSection(id);
      if (id === "quiz") renderQuestion();
    } else {
      JB.showSection("home");
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(window);

/* ========== Wishlist: Individual add_btn (delegated) ========== */
(function (w) {
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  const ICON_STROKE = "/asset/img/skintest/icon_heart_stroke.svg";
  const ICON_FILL   = "/asset/img/skintest/icon_heart_fill.svg";

  function updateAddBtnUI(btn, on) {
    if (!btn) return;
    btn.classList.toggle("on", on);
    btn.setAttribute("aria-pressed", on ? "true" : "false");
    const img = btn.querySelector("img.heart");
    if (img) img.src = on ? ICON_FILL : ICON_STROKE;

    const labelOn  = btn.dataset.labelOn  || "ADD TO WISHLIST";
    const labelOff = btn.dataset.labelOff || "ADD TO WISHLIST";
    const textNode = [...btn.childNodes].find(n => n.nodeType === Node.TEXT_NODE);
    const txt = (on ? " " + labelOn : " " + labelOff);
    if (textNode) textNode.nodeValue = txt;
    else btn.append(document.createTextNode(txt));
  }

  function toggleAddBtn(btn) {
    const next = !btn.classList.contains("on");
    updateAddBtnUI(btn, next);
    return next;
  }

  function onDocClick(e) {
    const btn = e.target.closest(".product_card .add_btn");
    if (!btn) return;
    e.preventDefault();
    toggleAddBtn(btn);
    // after individual toggle, also resync ALL button if present
    if (window.WishlistAll && typeof window.WishlistAll.sync === "function") {
      window.WishlistAll.sync();
    }
  }

  function primeInitial() {
    $$(".product_card .add_btn").forEach((btn) => {
      const on = btn.classList.contains("on") || btn.getAttribute("aria-pressed") === "true";
      updateAddBtnUI(btn, !!on);
    });
  }

  if (!w.__ADD_BTN_TOGGLE_BOUND__) {
    document.addEventListener("click", onDocClick, false);
    w.__ADD_BTN_TOGGLE_BOUND__ = true;
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", primeInitial);
  } else {
    primeInitial();
  }

  // small API
  w.WishlistBtn = Object.assign(w.WishlistBtn || {}, {
    set: (btnOrSelector, on) => {
      const btn = typeof btnOrSelector === "string" ? $(btnOrSelector) : btnOrSelector;
      updateAddBtnUI(btn, !!on);
    },
    toggle: (btnOrSelector) => {
      const btn = typeof btnOrSelector === "string" ? $(btnOrSelector) : btnOrSelector;
      return toggleAddBtn(btn);
    }
  });
})(window);

/* ========== Wishlist: ALL TO WISHLIST toggle + sync ========== */
(function (w) {
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  function isOn(btn) {
    return btn?.getAttribute("aria-pressed") === "true" || btn?.classList.contains("on");
  }

  function buttons() {
    return $$(".product_card .add_btn");
  }

  function setAll(on) {
    buttons().forEach((b) => window.WishlistBtn?.set(b, on));
  }

  function syncAllButton() {
    const allBtn = $("#wishlistBtn") || $("#wishlistAll");
    if (!allBtn) return;
    const btns = buttons();
    const allOn = btns.length > 0 && btns.every(isOn);
    allBtn.setAttribute("aria-pressed", allOn ? "true" : "false");
    allBtn.textContent = allOn ? (allBtn.dataset.labelOn || "REMOVE ALL") : (allBtn.dataset.labelOff || "ALL TO WISHLIST");
  }

  function bind() {
    const allBtn = $("#wishlistBtn") || $("#wishlistAll");
    if (!allBtn) return;
    if (!allBtn.dataset.labelOn)  allBtn.dataset.labelOn  = "REMOVE ALL";
    if (!allBtn.dataset.labelOff) allBtn.dataset.labelOff = "ALL TO WISHLIST";

    allBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const allOn = allBtn.getAttribute("aria-pressed") === "true";
      setAll(!allOn);
      // microtask 이후 동기화
      setTimeout(syncAllButton, 0);
    });
    syncAllButton();
  }

  // expose
  w.WishlistAll = { sync: syncAllButton };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bind);
  } else {
    bind();
  }
})(window);

/* ========== Result-like animations (GSAP safe) ========== */
(function (w) {
  function hasGSAP(){ return typeof w.gsap !== "undefined"; }

  function clearStyles(els) {
    els.forEach(el => {
      if (!el || !el.style) return;
      el.style.opacity = "";
      el.style.transform = "";
      el.style.filter = "";
    });
  }

  let tl = null;
  function kill() {
    if (tl) { tl.kill(); tl = null; }
    clearStyles([
      document.querySelector(".cl-card"),
      document.querySelector(".type"),
      document.querySelector("#summary"),
      ...document.querySelectorAll(".product_card"),
      document.querySelector("#wishlistBtn"),
      document.querySelector("#resetBtn")
    ]);
  }

  function animate() {
    if (!hasGSAP()) return;
    const card = document.querySelector(".cl-card");
    const type = document.querySelector(".type");
    const summary = document.querySelector("#summary");
    const cards = document.querySelectorAll(".product_card");
    const allBtn = document.querySelector("#wishlistBtn");
    const resetBtn = document.querySelector("#resetBtn");

    kill();
    tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    if (card)   tl.from(card,   { y: -16, opacity: 0, duration: 0.40 }, 0);
    if (type)   tl.from(type,   { y:  10, opacity: 0, duration: 0.30 }, 0.06);
    if (summary)tl.from(summary,{ y:  10, opacity: 0, duration: 0.30 }, 0.10);
    if (cards && cards.length) tl.from(cards, { y: 26, opacity: 0, duration: 0.42, stagger: 0.06 }, 0.18);
    if (allBtn) tl.from(allBtn, { y: 12, opacity: 0, duration: 0.28 }, "+=0.02");
    if (resetBtn) tl.from(resetBtn, { y: 10, opacity: 0, duration: 0.24 }, "-=0.10");
  }

  // Scroll-trigger per product card (if plugin present)
  function bindScrollTriggers() {
    if (typeof w.ScrollTrigger === "undefined" || !hasGSAP()) return;
    gsap.registerPlugin(ScrollTrigger);
    document.querySelectorAll(".product_card").forEach((card) => {
      gsap.from(card, {
        y: 24, opacity: 0, duration: 0.35, ease: "power2.out",
        scrollTrigger: { trigger: card, start: "top 85%", toggleActions: "play none none reverse" }
      });
    });
  }

  // Run when test completes (from jbtest.js finish → JB_TEST_READY)
  document.addEventListener("JB_TEST_READY", () => {
    // if sections exist, you may scroll or show them, here we just animate
    requestAnimationFrame(() => { animate(); bindScrollTriggers(); });
  });

  // Also run on first load if already visible
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => { animate(); bindScrollTriggers(); });
  } else {
    animate(); bindScrollTriggers();
  }

  // Public helper for buttons only
  w.animateResultButtonsSafe = function () {
    const sel = ["#wishlistBtn", "#resetBtn"];
    const btns = sel.map(s => document.querySelector(s)).filter(Boolean);
    // ensure visible
    btns.forEach(el => {
      if (!el || !el.style) return;
      if (el.style.opacity === "0") el.style.opacity = "";
      if (el.style.transform && el.style.transform !== "none") el.style.transform = "";
    });
    if (!hasGSAP() || !btns.length) return;
    btns.forEach((el, i) => {
      gsap.fromTo(el, { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.28, ease: "power3.out", delay: 0.04 + i*0.04, clearProps: "transform,opacity" });
    });
  };
})(window);
