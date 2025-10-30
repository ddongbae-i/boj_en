// utils.js
(function (w) {
  const SK = (w.SKINTEST = w.SKINTEST || {});
  // 전역 상태
  SK.state = {
    currentIndex: 0, // 0..9
    answers: Array(10).fill(null), // 각 문항 선택값 (0,1,2,...)
    profile: null, // 계산된 스킨 MBTI 결과
    navigating: false,
  };

  // 단순 라우팅: 섹션 표시/숨김
  SK.showSection = function (id) {
    if (SK.state.navigating) return;
    const ids = ["home", "quiz", "loading", "result"];
    ids.forEach((sec) => {
      const el = document.getElementById(sec);
      if (!el) return;
      if (sec === id) {
        el.hidden = false;
        el.classList.remove("is-hidden");
      } else {
        el.hidden = true;
        el.classList.add("is-hidden");
      }
    });

    // 포커스 이동 접근성
    const focusTarget = document.querySelector(
      `#${id} [tabindex], #${id} button, #${id} a, #${id} input, #${id} select, #${id} textarea`
    );
    if (focusTarget) setTimeout(() => focusTarget.focus(), 0);
    window.location.hash = `#${id}`;
    // 스크롤 잠금: loading에서만 잠금
    SK.lockScroll(id === "loading");

    // 결과 화면 진입 시 .legend로 스크롤 정렬
    if (id === "result") {
      const legend = document.querySelector("#result .legend");
      if (legend) {
        setTimeout(
          () =>
            legend.scrollIntoView({
              block: "start",
              inline: "nearest",
              behavior: "instant" in window ? "instant" : "auto",
            }),
          0
        );
      }
    }
  };

  // 키보드 헬퍼
  SK.key = { LEFT: 37, RIGHT: 39, ENTER: 13, ONE: 49, NINE: 57, ZERO: 48 };

  // 부드러운 지연(로딩전환)
  SK.sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  // 스크롤 잠금/해제 유틸
  SK.lockScroll = function (on) {
    const d = document.documentElement,
      b = document.body;
    if (on) {
      d.style.overflow = "hidden";
      b.style.overflow = "hidden";
    } else {
      d.style.overflow = "";
      b.style.overflow = "";
    }
  };

  // DOM 유틸
  SK.$ = (sel) => document.querySelector(sel);
  SK.$$ = (sel) => Array.from(document.querySelectorAll(sel));

  // 선택값 안전 확인
  SK.isAnswered = (idx) => SK.state.answers[idx] !== null;

  // 진행표시 “n of 10”
  SK.updateProgress = function () {
    const p = SK.$("#progress");
    if (p) p.textContent = `${SK.state.currentIndex + 1} of 10`;
  };
})(window);

// router.js
(function (w) {
  const SK = w.SKINTEST;

  function initRouting() {
    const startBtn = SK.$("#startBtn");
    const homeBtn = SK.$("#homeBtn");
    const resetBtn = SK.$("#resetBtn");
    const wishlistBtn = SK.$("#wishlistBtn");

    // Start → #quiz
    if (startBtn)
      startBtn.addEventListener("click", () => SK.showSection("quiz"));

    // HOME → #home
    if (homeBtn)
      homeBtn.addEventListener("click", () => SK.showSection("home"));

    // RESET → 상태초기화 + 퀴즈 1/10
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        SK.state.currentIndex = 0;
        SK.state.answers = Array(10).fill(null);
        SK.state.profile = null;
        if (typeof window.SKINTEST_QUIZ_RENDER === "function")
          window.SKINTEST_QUIZ_RENDER();
        SK.showSection("quiz");
      });
    }

    // ALL TO WISHLIST → moved to WishlistAll module

    // 해시 직접 접근 시
    const initial = (location.hash || "#home").replace("#", "");
    SK.showSection(initial);
  }

  // 고정 위치(위치 고정은 CSS 담당, JS는 클래스만 보장)
  function ensureFixedButtons() {
    ["homeBtn", "resetBtn", "wishlistBtn"].forEach((id) => {
      const btn = SK.$(`#${id}`);
      if (btn && !btn.classList.contains("fixed")) btn.classList.add("fixed");
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    SK.lockScroll(false);
    initRouting();
    ensureFixedButtons();
  });
})(window);

// quiz.js
(function (w) {
  const SK = w.SKINTEST;

  // 10 문항
  const questions = [
    {
      text: "How does your skin feel after cleansing?",
      choices: [
        "Very tight/dry",
        "Oily overall",
        "Only T-zone oily",
        "Stings/irritated",
      ],
      map: [
        { Hydration: -2, Oil: -2 }, // A
        { Oil: +2 }, // B
        { Oil: +1, Hydration: -1 }, // C
        { Sensitivity: +2, Hydration: -1 }, // D
      ],
    },
    {
      text: "Pores?",
      choices: [
        "Barely visible",
        "Large overall",
        "Large on T-zone only",
        "Flare with irritation",
      ],
      map: [
        { Oil: -1 }, // A
        { Oil: +2 }, // B
        { Oil: +1 }, // C
        { Sensitivity: +2 }, // D
      ],
    },
    {
      text: "Oil through the day?",
      choices: [
        "Dry even in afternoon",
        "Greasy all day",
        "Only T-zone greasy",
        "Highly reactive to env.",
      ],
      map: [
        { Hydration: -2, Oil: -2 },
        { Oil: +2 },
        { Oil: +1, Hydration: -1 },
        { Sensitivity: +2 },
      ],
    },
    {
      text: "Texture / flakes?",
      choices: [
        "Frequent flaking",
        "Hardly any flakes",
        "Area-dependent",
        "Breaks out with product swap",
      ],
      map: [
        { Hydration: -2 },
        { Sensitivity: -1 },
        { Hydration: -1 },
        { Sensitivity: +2 },
      ],
    },
    {
      text: "Blemish tendency?",
      choices: [
        "Dryness-related",
        "Oil-related",
        "Varies by area",
        "Irritation-related",
      ],
      map: [
        { Hydration: -2 },
        { Oil: +2 },
        { Oil: +1, Hydration: -1 },
        { Sensitivity: +2 },
      ],
    },
    {
      text: "Serum/cream feel?",
      choices: [
        "Absorbs fast, needs more",
        "Sits heavy",
        "Depends on area",
        "Sometimes stings/burns",
      ],
      map: [
        { Hydration: -2 },
        { Oil: +2 },
        { Oil: +1, Hydration: -1 },
        { Sensitivity: +2 },
      ],
    },
    {
      text: "Shine right after wash?",
      choices: [
        "Almost none",
        "Overall shine",
        "Subtle on T-zone",
        "Red/irritation glow",
      ],
      map: [{ Oil: -1 }, { Oil: +2 }, { Oil: +1 }, { Sensitivity: +2 }],
    },
    {
      text: "Heat/humidity response?",
      choices: [
        "Gets drier",
        "More sebum",
        "Varies by area",
        "Overly sensitive",
      ],
      map: [
        { Hydration: -1 },
        { Oil: +2 },
        { Oil: +1, Hydration: -1 },
        { Sensitivity: +2 },
      ],
    },
    {
      text: "After cleansing?",
      choices: [
        "Very tight",
        "Still oily",
        "Cheeks tight, T‑zone ok",
        "Irritation/redness",
      ],
      map: [
        { Hydration: -2, Oil: -2 },
        { Oil: +2 },
        { Oil: +1, Hydration: -2 },
        { Sensitivity: +2, Hydration: -1 },
      ],
    },
    {
      text: "AM cleansing style?",
      choices: [
        "Water only yet tight",
        "Cleanser is a must",
        "Cleanser for T‑zone only",
        "Hard to change cleanser",
      ],
      map: [
        { Hydration: -2 },
        { Oil: +2 },
        { Oil: +1, Hydration: -1 },
        { Sensitivity: +2 },
      ],
    },
  ];

  // 점수 누적 버킷
  const metrics = [
    "Oil",
    "Hydration",
    "Sensitivity",
    "Pigment",
    "Wrinkle",
    "Tight",
  ];
  function freshScore() {
    const obj = {};
    metrics.forEach((k) => (obj[k] = 0));
    return obj;
  }

  function normalize(v, min, max) {
    const clipped = Math.max(min, Math.min(max, v));
    return Math.round(((clipped - min) / (max - min)) * 100); // 0~100
  }

  function calcProfile() {
    const score = freshScore();
    // 응답 적용
    SK.state.answers.forEach((ans, idx) => {
      if (ans === null) return;
      const map = questions[idx].map[ans] || {};
      Object.keys(map).forEach((k) => {
        score[k] += map[k];
      });
    });

    // 유형 판정
    const oilType = score.Oil >= 1 ? "Oily" : "Dry";
    const sensType = score.Sensitivity >= 1 ? "Sensitive" : "Resistant";
    const pigType = score.Pigment >= 1 ? "Pigment" : "Non-Pigment";
    const wrinkleType = score.Wrinkle >= 1 ? "Wrinkle" : "Tight";

    // 코드 4글자
    const code = `${oilType.startsWith("O") ? "O" : "D"}${sensType.startsWith("S") ? "S" : "R"
      }${pigType.startsWith("P") ? "P" : "N"}${wrinkleType.startsWith("W") ? "W" : "T"
      }`;

    return {
      code, // 예: OSPT
      facets: [oilType, sensType, pigType, wrinkleType],
      radar: {
        Oil: normalize(score.Oil, -4, +6),
        Hydration: normalize(score.Hydration, -4, +4),
        Sensitivity: normalize(score.Sensitivity, -4, +6),
        Pigment: normalize(score.Pigment, -4, +6),
        Wrinkle: normalize(score.Wrinkle, -4, +6),
      },
    };
  }

  function renderQuestion() {
    const q = questions[SK.state.currentIndex];
    const qText = document.getElementById("question");
    const optionsEl = document.getElementById("options");
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
    if (!q || !qText || !optionsEl || !prevBtn || !nextBtn) return;

    qText.textContent = `Q${SK.state.currentIndex + 1}. ${q.text}`;
    optionsEl.innerHTML = "";

    // radiogroup name은 문항마다 다르게
    const groupName = `q${SK.state.currentIndex}`;
    const prevAnswer = SK.state.answers[SK.state.currentIndex]; // 0..n or null

    // 폼 submit 방지
    optionsEl.addEventListener("submit", (e) => e.preventDefault(), {
      once: true,
    });

    q.choices.forEach((label, i) => {
      // 라벨 래퍼
      const option = document.createElement("label");
      option.className = "choice";
      option.tabIndex = 0;

      // 네이티브 라디오
      const input = document.createElement("input");
      input.type = "radio";
      input.name = groupName;
      input.value = String(i);
      input.setAttribute("aria-label", label);

      // 커스텀 점, 텍스트
      const dot = document.createElement("span");
      dot.className = "radio";
      const text = document.createElement("span");
      text.className = "label-text";
      const prefix = String.fromCharCode(65 + i); // A,B,C,D...
      text.textContent = `${prefix}. ${label}`;

      // 이전 응답 반영
      if (prevAnswer === i) {
        input.checked = true;
        option.classList.add("checked");
      }

      // 상호작용
      input.addEventListener("change", () => {
        selectChoice(i);
        syncCheckedClasses();
      });

      // 조립
      option.appendChild(input);
      option.appendChild(dot);
      option.appendChild(text);
      optionsEl.appendChild(option);
    });

    prevBtn.disabled = SK.state.currentIndex === 0;
    const atLast = SK.state.currentIndex === 9;
    nextBtn.textContent = atLast ? "Result" : "Next";
    nextBtn.disabled = !SK.isAnswered(SK.state.currentIndex);

    SK.updateProgress();
  }

  // 선택 처리(중복 제거 버전)
  function selectChoice(i) {
    SK.state.answers[SK.state.currentIndex] = i;
    const nextBtn = document.getElementById("nextBtn");
    if (nextBtn) nextBtn.disabled = false;
  }

  // 체크 클래스 동기화
  function syncCheckedClasses() {
    document.querySelectorAll("#options .choice").forEach((opt) => {
      const checked = opt.querySelector('input[type="radio"]')?.checked;
      opt.classList.toggle("checked", !!checked);
    });
  }

  function goNext() {
    if (!SK.isAnswered(SK.state.currentIndex)) return;
    if (SK.state.currentIndex < 9) {
      SK.state.currentIndex += 1;
      renderQuestion();
    } else {
      // 마지막 → 결과 계산 → #loading
      SK.state.profile = calcProfile();
      window.dispatchEvent(
        new CustomEvent("SKINTEST_PROFILE_READY", { detail: SK.state.profile })
      );
      SK.showSection("loading");
      // 로딩 전환 로직은 loading.js가 담당
    }
  }

  function goPrev() {
    if (SK.state.currentIndex === 0) return;
    SK.state.currentIndex -= 1;
    renderQuestion();
  }

  function initQuizControls() {
    const prevBtn = SK.$("#prevBtn");
    const nextBtn = SK.$("#nextBtn");
    if (prevBtn) prevBtn.addEventListener("click", goPrev);
    if (nextBtn) nextBtn.addEventListener("click", goNext);

    // 키보드
    document.addEventListener("keydown", (e) => {
      // 퀴즈 섹션이 보일 때만
      const quiz = document.getElementById("quiz");
      if (!quiz || quiz.hidden) return;

      if (e.keyCode >= SK.key.ONE && e.keyCode <= SK.key.NINE) {
        const pick = e.keyCode - SK.key.ONE; // 0 기반
        const q = questions[SK.state.currentIndex];
        if (q && pick < q.choices.length) {
          selectChoice(pick);
          syncCheckedClasses();
        }
      } else if (e.keyCode === SK.key.ENTER || e.keyCode === SK.key.RIGHT) {
        if (SK.isAnswered(SK.state.currentIndex)) goNext();
      } else if (e.keyCode === SK.key.LEFT) {
        goPrev();
      }
    });
  }

  // 외부에서 다시 렌더 필요 시
  w.SKINTEST_QUIZ_RENDER = renderQuestion;

  document.addEventListener("DOMContentLoaded", () => {
    SK.lockScroll(false);
    initQuizControls();
    renderQuestion(); // 초기 렌더
  });
})(window);

// loading.js
(function (w) {
  const SK = w.SKINTEST;

  async function runLoading() {
    const loading = document.getElementById("loading");
    if (!loading || loading.hidden) return;

    loading.classList.remove("fade-out");
    loading.classList.add("fade-in");

    await SK.sleep(600);
    await SK.sleep(1200);

    loading.classList.remove("fade-in");
    loading.classList.add("fade-out");

    await SK.sleep(300);
    SK.showSection("result");
    const result = document.getElementById("result");
    window.dispatchEvent(new Event("SKINTEST_SHOW_RESULT"));
    // MBTI 박스/요약 보장
    if (!result.querySelector(".mbti#mbti")) {
      const mb = document.createElement("div");
      mb.className = "mbti";
      mb.id = "mbti";
      result.appendChild(mb);
    }
    if (!result.querySelector("#summary")) {
      const p = document.createElement("p");
      p.id = "summary";
      p.className = "center";
      result.appendChild(p);
    }

    // 제품 섹션 보강
    let ps = result.querySelector("section.product");
    if (!ps) {
      ps = document.createElement("section");
      ps.className = "product";
      result.appendChild(ps);
    }
    if (!ps.querySelector(".cards")) {
      const cards = document.createElement("div");
      cards.className = "cards";
      ps.appendChild(cards);
    }
  }

  // 프로필 계산 완료 시 시작
  window.addEventListener("SKINTEST_PROFILE_READY", runLoading);
  // 사용자가 직접 #loading으로 이동했을 때도 처리
  window.addEventListener("hashchange", () => {
    if (location.hash === "#loading") runLoading();
  });
})(window);

// radar + result + products.js
(function () {
  // 안전 셀렉터
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  const hasSK = !!(window.SKINTEST && window.SKINTEST.state);

  // 결과 섹션 DOM 보강
  function ensureResultSkeleton() {
    const result = $("#result");
    if (!result) return;

    // 레이더 래퍼 + chips + svg
    if (!result.querySelector(".radar-wrap")) {
      const wrap = document.createElement("div");
      wrap.className = "radar-wrap";
      wrap.innerHTML = `
        <div id="chip0" class="axis-chip mid">Oil 50</div>
        <div id="chip1" class="axis-chip mid">Water Retention 50</div>
        <div id="chip2" class="axis-chip mid">Sensitivity 50</div>
        <div id="chip3" class="axis-chip mid">Moisturizing 50</div>
        <div id="chip4" class="axis-chip mid">Elasticity 50</div>
        <svg id="radar" viewBox="0 0 460 460" preserveAspectRatio="xMidYMid meet" aria-labelledby="radarTitle" role="img">
          <title id="radarTitle">Skin radar chart</title>
        </svg>
      `;
      result.prepend(wrap);
    }
  }

  // MBTI/레이더용 프로필 취득
  function getProfile() {
    if (hasSK && window.SKINTEST.state.profile) {
      const p = window.SKINTEST.state.profile;
      const radar = p.radar || {
        Oil: 50,
        Hydration: 50,
        Sensitivity: 50,
        Pigment: 50,
        Wrinkle: 50,
      };
      return { code: p.code, facets: p.facets, radar };
    }
    // fallback
    const radar = {
      Oil: 50,
      Hydration: 50,
      Sensitivity: 50,
      Pigment: 50,
      Wrinkle: 50,
    };
    return {
      code: "DSNT",
      facets: ["Dry", "Sensitive", "Non-Pigment", "Tight"],
      radar,
    };
  }

  // 요약/팁
  function buildSummary(facets) {
    const [oil, sens, pig, wink] = facets;
    const summaryParts = [
      oil === "Dry"
        ? "Sebum production is low and the skin tightens easily; moisturizing layers are key."
        : "Sebum production is high, so shine and pore control are crucial.",
      sens === "Sensitive"
        ? "Sensitive to external stressors; focus on low‑irritant, soothing care."
        : "With a resilient barrier, you can introduce a variety of actives gradually.",
      pig === "Pigment"
        ? "Melanin activity is higher; brightening and diligent UV protection are important."
        : "Fewer pigmentation concerns; focus on tone maintenance and antioxidant care.",
      wink === "Wrinkle"
        ? "Needs nourishing and firming care aimed at elasticity and wrinkle improvement."
        : "Good elasticity; focus on water‑oil balance and preventive care.",
    ];

    const tips = [];
    tips.push(
      oil === "Dry"
        ? "Keep cleansing gentle and brief; layer hydration immediately after washing."
        : "Use a hydrating toner plus a lightweight gel/lotion; avoid excessive oils."
    );
    tips.push(
      sens === "Sensitive"
        ? "Patch‑test new ingredients before introducing them."
        : "Start actives at low strengths and build up gradually."
    );
    tips.push(
      pig === "Pigment"
        ? "Reapply sunscreen every 2–3 hours."
        : "Maintain radiance with antioxidants (vitamin C, EGCG, etc.)."
    );
    if (wink === "Wrinkle")
      tips.push("At night, consider combining retinoids and peptides.");
    else
      tips.push(
        "Do light exfoliation 1–2 times a week to keep texture smooth."
      );
    return { summary: summaryParts.join(" "), tips };
  }

  // 레이더 SVG
  function drawRadar({ Oil, Hydration, Sensitivity, Pigment, Wrinkle }) {
    const svg = $("#radar");
    if (!svg) return;

    const W = 460,
      H = 460,
      cx = W / 2,
      cy = H / 2;
    const R = 180,
      N = 5,
      rings = 5,
      start = -Math.PI / 2;

    function el(name, attrs = {}) {
      const e = document.createElementNS("http://www.w3.org/2000/svg", name);
      for (const k in attrs) e.setAttribute(k, attrs[k]);
      return e;
    }
    function pt(i, pct) {
      const ang = start + (i * 2 * Math.PI) / N;
      const r = R * (Math.max(0, Math.min(100, pct)) / 100);
      return { x: cx + r * Math.cos(ang), y: cy + r * Math.sin(ang) };
    }
    function polyFrom(values) {
      return values
        .map((v, i) => {
          const p = pt(i, v);
          return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
        })
        .join(" ");
    }
    function axisTip(i) {
      return pt(i, 100);
    }

    while (svg.firstChild) svg.removeChild(svg.firstChild);

    // 20/40/60/80/100 그리드
    for (let r = 20; r <= 100; r += 20) {
      const points = Array.from({ length: N }, (_, i) => {
        const p = pt(i, r);
        return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
      }).join(" ");
      svg.appendChild(el("polygon", { points, class: "radar-grid" }));
      // 링 라벨(선택): 최상단에만
      if (r < 100) {
        const lab = pt(0, r);
        const t = el("text", {
          x: lab.x + 6,
          y: lab.y + 4,
          fill: "#9ca3af",
          "font-size": 10,
        });
        t.textContent = r;
        svg.appendChild(t);
      }
    }

    // 축
    for (let i = 0; i < N; i++) {
      const tip = axisTip(i);
      svg.appendChild(
        el("line", {
          x1: cx,
          y1: cy,
          x2: tip.x,
          y2: tip.y,
          class: "radar-axis",
        })
      );
    }

    // 값(A=평균, B=내 점수) — 평균은 50으로 표시(필요 시 state.avg로 교체)
    const avg = [50, 50, 50, 50, 50];
    const me = [
      Oil,
      Hydration,
      Sensitivity,
      Math.round((Hydration + Oil) / 2), // Moisturizing proxy
      Math.round(100 - Wrinkle), // Elasticity proxy
    ];

    const polyAvg = el("polygon", {
      class: "radar-area-a",
      points: polyFrom(avg),
      fill: "rgba(16,185,129,.60)",
      stroke: "rgba(16,185,129,1)",
      "stroke-width": 2,
    });
    const polyMe = el("polygon", {
      class: "radar-area-b",
      points: polyFrom(me),
      fill: "rgba(244,63,94,.35)",
      stroke: "rgba(244,63,94,1)",
      "stroke-width": 2,
    });
    svg.appendChild(polyAvg);
    svg.appendChild(polyMe);

    // 노드
    function drawNodes(values, color) {
      const g = el("g", { style: `color:${color}` });
      values.forEach((v, i) => {
        const p = pt(i, v);
        g.appendChild(
          el("circle", { cx: p.x, cy: p.y, r: 3, class: "radar-node" })
        );
      });
      svg.appendChild(g);
    }
    drawNodes(avg, "#10b981"); // teal
    drawNodes(me, "#f43f5e"); // rose

    // 칩 텍스트
    const chips = [
      `Oil ${me[0]}`,
      `Water Retention ${me[1]}`,
      `Sensitivity ${me[2]}`,
      `Moisturizing ${me[3]}`,
      `Elasticity ${me[4]}`,
    ];
    chips.forEach((t, i) => {
      const chip = $(`#chip${i}`);
      if (chip) chip.textContent = t;
    });

    // 칩 배치
    function placeChips() {
      const wrap = svg.closest(".radar-wrap");
      if (!wrap) return;
      const wrapBox = wrap.getBoundingClientRect();
      const ptObj = svg.createSVGPoint();
      const ctm = svg.getScreenCTM();
      function svgToClient(x, y) {
        ptObj.x = x;
        ptObj.y = y;
        const p = ptObj.matrixTransform(ctm);
        return { x: p.x, y: p.y };
      }
      for (let i = 0; i < N; i++) {
        const tip = axisTip(i);
        const client = svgToClient(tip.x, tip.y);
        const chip = $(`#chip${i}`);
        if (chip) {
          chip.className = "axis-chip mid";
          chip.style.left = `${client.x - wrapBox.left}px`;
          chip.style.top = `${client.y - wrapBox.top}px`;
        }
      }
    }
    requestAnimationFrame(placeChips);
    window.addEventListener("resize", () => requestAnimationFrame(placeChips));

    // 전역 노출
    window.drawRadar = drawRadar;
  }

  // 카탈로그(간단 예시)
  const catalog = [
    {
      id: "relief_sun",
      name: "Relief Sun: Rice + Probiotics",
      fit: ["Dry", "Sensitive", "Non-Pigment", "Tight"],
    },
    {
      id: "matte_stick",
      name: "Matte Sun Stick: Mugwort + Camelia",
      fit: ["Oily", "Resistant", "Pigment", "Tight"],
    },
    {
      id: "glow_serum",
      name: "Glow Serum: Propolis + Niacinamide",
      fit: ["Dry", "Sensitive", "Pigment", "Wrinkle"],
    },
    {
      id: "calming_serum",
      name: "Calming Serum: Green Tea + Panthenol",
      fit: ["Oily", "Sensitive", "Non-Pigment", "Tight"],
    },
    {
      id: "revive_serum",
      name: "Revive Serum: Ginseng + Snail Mucin",
      fit: ["Dry", "Resistant", "Wrinkle", "Non-Pigment"],
    },
    {
      id: "ginseng_water",
      name: "Ginseng Essence Water",
      fit: ["Dry", "Resistant", "Wrinkle", "Non-Pigment"],
    },
    {
      id: "dynasty_cream",
      name: "Dynasty Cream",
      fit: ["Dry", "Sensitive", "Non-Pigment", "Wrinkle"],
    },
    {
      id: "red_bean_gel",
      name: "Red Bean Water Gel",
      fit: ["Oily", "Resistant", "Tight", "Non-Pigment"],
    },
    {
      id: "cleanser",
      name: "Green Plum Refreshing Cleanser",
      fit: ["Sensitive", "Oily", "Non-Pigment", "Tight"],
    },
    {
      id: "toner",
      name: "Green Plum Toner: AHA + BHA",
      fit: ["Oily", "Resistant", "Pigment", "Tight"],
    },
    {
      id: "eye_serum",
      name: "Revive Eye Serum: Ginseng + Retinal",
      fit: ["Wrinkle", "Resistant", "Dry"],
    },
    {
      id: "light_on",
      name: "Light On Serum: Centella + Vitamin C",
      fit: ["Pigment", "Sensitive", "Tight"],
    },
    {
      id: "balm",
      name: "Radiance Cleansing Balm",
      fit: ["Dry", "Sensitive", "Non-Pigment"],
    },
  ];

  // 제품 스코어링: MBTI facet 교집합 가중치 + 미세 난수
  function makeScorer(profileFacets) {
    return function (item) {
      let score = 0;
      item.fit.forEach((f) => {
        if (profileFacets.includes(f)) score += 22;
      });
      score += Math.random() * 10;
      return Math.max(60, Math.min(99, Math.round(score)));
    };
  }

  // 제품 렌더링
  window.renderProducts = function renderProducts(profile) {
    const section = $("#result section.product");
    if (!section) return;

    const grid = section.querySelector(".product_grid");
    const container = section.querySelector(".cards");

    // Case A) 정적 그리드가 있을 때 → 증강
    if (grid) {
      const cards = Array.from(grid.querySelectorAll(".product_card"));
      const scorer = makeScorer(profile.facets);
      const used = new Set();

      cards.forEach((card, idx) => {
        const info = card.querySelector(".info");
        const name = (info?.querySelector("h3")?.textContent || "").trim();

        // score
        const base = scorer({ fit: profile.facets });
        let unique = base;
        while (used.has(unique)) unique += 0.1;
        used.add(unique);

        const scoreEl =
          card.querySelector(".score") ||
          (() => {
            const s = document.createElement("span");
            s.className = "score";
            if (info) info.appendChild(s);
            else card.appendChild(s);
            return s;
          })();
        scoreEl.textContent = `Score : ${Math.round(unique)} / 100`;

        // tags (max 4)
        const tags =
          card.querySelector(".tags") ||
          (() => {
            const d = document.createElement("div");
            d.className = "tags";
            card.insertBefore(d, info || card.firstChild);
            return d;
          })();
        tags.innerHTML = "";
        const pos = [
          "Niacinamide",
          "Ginseng",
          "Green Tea",
          "Centella",
          "Panthenol",
          "Ceramide",
          "Hyaluronic Acid",
        ];
        const neg = ["AHA + BHA", "Fragrance", "Alcohol"];
        const list = [
          `+ ${name || "Care"}`,
          `+ ${pos[idx % pos.length]}`,
          `- ${neg[idx % neg.length]}`,
          `+ ${pos[(idx + 3) % pos.length]}`,
        ];
        list.slice(0, 4).forEach((t) => {
          const s = document.createElement("span");
          s.textContent = t;
          tags.appendChild(s);
        });

        // wishlist toggle
        const btn = card.querySelector(".add_btn");
        const img = btn && btn.querySelector(".heart");
        if (btn && img && !btn.__bound) {
          btn.__bound = true;
          btn.addEventListener("click", () => {
            const active = !btn.classList.contains("active");
            btn.classList.toggle("active", active);
            img.src = active
              ? "/asset/img/skintest/icon_heart_fill.svg"
              : "/asset/img/skintest/icon_heart_stroke.svg";
            btn.setAttribute("aria-pressed", active ? "true" : "false");
          });
        }
      });
    } else {
      const scorer = makeScorer(profile.facets);
      const scored = catalog
        .map((p) => ({ ...p, score: scorer(p) }))
        .sort((a, b) => b.score - a.score);

      scored.forEach((item, idx) => {
        const card = document.createElement("article");
        card.className = "product_card";

        const info = document.createElement("div");
        info.className = "info";
        const h3 = document.createElement("h3");
        h3.textContent = item.name;
        const p = document.createElement("p");
        p.textContent = "Beauty of Joseon";
        info.appendChild(h3);
        info.appendChild(p);

        const tags = document.createElement("div");
        tags.className = "tags";
        const pos = [
          "Niacinamide",
          "Ginseng",
          "Green Tea",
          "Centella",
          "Panthenol",
          "Ceramide",
          "Hyaluronic Acid",
        ];
        const neg = ["AHA + BHA", "Fragrance", "Alcohol"];
        function addSpan(text) {
          const s = document.createElement("span");
          s.textContent = text;
          tags.appendChild(s);
        }
        addSpan(`+ ${item.name}`);
        addSpan(`+ ${pos[idx % pos.length]}`);
        addSpan(`- ${neg[idx % neg.length]}`);
        if (idx % 2 === 0) addSpan(`+ ${pos[(idx + 3) % pos.length]}`);

        const score = document.createElement("span");
        score.className = "score";
        score.textContent = `Score : ${item.score} / 100`;

        const wish = document.createElement("button");
        wish.className = "add_btn";
        wish.type = "button";
        wish.setAttribute("aria-pressed", "false");
        const img = document.createElement("img");
        img.src = "/asset/img/skintest/icon_heart_stroke.svg";
        img.alt = "찜하기 아이콘";
        img.className = "heart";
        wish.appendChild(img);
        wish.addEventListener("click", () => {
          const active = !wish.classList.contains("active");
          wish.classList.toggle("active", active);
          img.src = active
            ? "/asset/img/skintest/icon_heart_fill.svg"
            : "/asset/img/skintest/icon_heart_stroke.svg";
          wish.setAttribute("aria-pressed", active ? "true" : "false");
        });

        card.appendChild(info);
        card.appendChild(tags);
        card.appendChild(score);
        card.appendChild(wish);
        container.appendChild(card);
      });
    }
  };

  // MBTI 표시
  const renderMBTI = function (profile) {
    const box = $("#result #mbti");
    const summaryEl = $("#result #summary");
    if (!box || !summaryEl) return;

    box.innerHTML = "";
    const h2 = document.createElement("h2");
    h2.className = "center";
    h2.textContent = `Skin MBTI : ${profile.code} (${profile.facets.join(
      " / "
    )})`;
    box.appendChild(h2);

    const { summary, tips } = buildSummary(profile.facets);
    const shortSummary = summary
      .split(". ")
      .slice(0, 2)
      .join(". ")
      .replace(/\s+$/, "");
    const tipLine = "TIP: " + tips.slice(0, 2).join(" · ");
    summaryEl.innerHTML = `${shortSummary}.<br>${tipLine}`;
  };

  // HOME / RESET / WISHLIST 위치 고정 보장 및 동작(라우터에도 존재하지만 결과만 접근 시 대비)
  var bindFixedActions = function () {
    const homeBtn = $("#homeBtn");
    const resetBtn = $("#resetBtn");
    const wishlistBtn = $("#wishlistBtn");

    [homeBtn, resetBtn, wishlistBtn].forEach((btn) => {
      if (btn && !btn.classList.contains("fixed")) btn.classList.add("fixed");
    });

    if (homeBtn && !homeBtn.__bound) {
      homeBtn.__bound = true;
      homeBtn.addEventListener("click", () => {
        const home = $("#home");
        const quiz = $("#quiz");
        const result = $("#result");
        if (home) home.hidden = false;
        if (quiz) quiz.hidden = true;
        if (result) result.hidden = true;
        window.location.hash = "#home";
      });
    }

    if (resetBtn && !resetBtn.__bound) {
      resetBtn.__bound = true;
      resetBtn.addEventListener("click", () => {
        if (window.SKINTEST && window.SKINTEST.state) {
          window.SKINTEST.state.currentIndex = 0;
          window.SKINTEST.state.answers = Array(10).fill(null);
          window.SKINTEST.state.profile = null;
          if (typeof window.SKINTEST_QUIZ_RENDER === "function")
            window.SKINTEST_QUIZ_RENDER();
        }
        const home = $("#home");
        const quiz = $("#quiz");
        const result = $("#result");
        if (home) home.hidden = true;
        if (quiz) quiz.hidden = false;
        if (result) result.hidden = true;
        const progress = $("#progress");
        if (progress) progress.textContent = "1 of 10";
        window.location.hash = "#quiz";
      });
    }

    if (wishlistBtn && !wishlistBtn.__bound) {
      wishlistBtn.__bound = true;
      wishlistBtn.addEventListener("click", () => {
        $$("#result .add_btn").forEach((btn) => {
          const active = !btn.classList.contains("active");
          btn.classList.toggle("active", active);
          const img = btn.querySelector(".heart");
          if (img)
            img.src = active
              ? "/asset/img/skintest/icon_heart_fill.svg"
              : "/asset/img/skintest/icon_heart_stroke.svg";
          btn.setAttribute("aria-pressed", active ? "true" : "false");
        });
      });
    }
  };

  // 결과 전체 렌더링
  function renderResultAll() {
    ensureResultSkeleton();
    const profile = getProfile();
    drawRadar({
      Oil: profile.radar.Oil,
      Hydration: profile.radar.Hydration,
      Sensitivity: profile.radar.Sensitivity,
      Pigment: profile.radar.Pigment,
      Wrinkle: profile.radar.Wrinkle,
    });
    renderMBTI(profile);
    renderProducts(profile);
    bindFixedActions();
    if (typeof window.animateResultButtonsSafe === 'function') window.animateResultButtonsSafe();
  }

  window.addEventListener("SKINTEST_SHOW_RESULT", renderResultAll);
  document.addEventListener("DOMContentLoaded", () => {
    SK.lockScroll(false);
    if (location.hash === "#result") renderResultAll();
  });

  // GSAP animations (safe)
  (function () {
    function safe() {
      return typeof window.gsap !== "undefined";
    }

    // 전역 노출(ReferenceError 방지)
    window.animateQuizCard = function () {
      if (!safe()) return;
      gsap.from(".card, #options .choice", {
        duration: 0.6,
        y: 14,
        opacity: 0,
        stagger: 0.06,
        ease: "power3.out",
      });
    };

    window.animateLoading = function () {
      if (!safe()) return;
      gsap.to(".spinner", {
        rotation: 360,
        duration: 1,
        repeat: -1,
        ease: "none",
      });
      gsap.from(".loading-text, .loading-sub", {
        duration: 0.8,
        y: 20,
        opacity: 0,
        stagger: 0.2,
      });
    };

    window.animateResults = function () {
      if (!safe()) return;
      gsap.from(".radar-wrap", {
        duration: 1,
        scale: 0.8,
        opacity: 0,
        ease: "power3.out",
      });
      gsap.from(".product_card", {
        duration: 0.8,
        y: 50,
        opacity: 0,
        stagger: 0.12,
        ease: "power3.out",
      });
    };

    document.addEventListener("DOMContentLoaded", () => {
      SK.lockScroll(false);
      if (!safe()) return;
      if (gsap.registerPlugin && window.ScrollTrigger) {
        gsap.registerPlugin(ScrollTrigger);
      }

      // 홈 타이틀
      if (document.querySelector(".home-title")) {
        gsap.from(".home-title", {
          duration: 1,
          y: 50,
          opacity: 0,
          ease: "power3.out",
        });
      }
      if (document.querySelector(".home-sub")) {
        gsap.from(".home-sub", {
          duration: 1,
          y: 30,
          opacity: 0,
          delay: 0.3,
          ease: "power3.out",
        });
      }
      if (document.querySelectorAll(".badges .badge").length) {
        gsap.from(".badges .badge", {
          duration: 0.8,
          scale: 0.5,
          opacity: 0,
          delay: 0.6,
          stagger: 0.2,
          ease: "back.out(1.7)",
        });
      }

      // 버튼 호버
      document.querySelectorAll(".btn-white").forEach((btn) => {
        btn.addEventListener("mouseenter", () => {
          if (!safe()) return;
          gsap.to(btn, { duration: 0.25, scale: 1.05, ease: "power2.out" });
        });
        btn.addEventListener("mouseleave", () => {
          if (!safe()) return;
          gsap.to(btn, { duration: 0.25, scale: 1, ease: "power2.out" });
        });
      });

      // 안전 바인딩: 요소 존재 시만
      const start = document.getElementById("startBtn");
      const next = document.getElementById("nextBtn");
      if (start) start.addEventListener("click", window.animateQuizCard);
      if (next) next.addEventListener("click", window.animateQuizCard);
    });
  })();

  (function () {
    "use strict";

    // 0) Safe DOM helpers
    const $ = (sel, ctx = document) => ctx.querySelector(sel);
    const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
    const on = (el, ev, fn, opts) => el && el.addEventListener(ev, fn, opts);
    const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

    // 1) Simple state (demo-ready; replace with real quiz calc as needed)
    const defaultScores = [65, 60, 55, 70, 40]; // Oil / Elasticity / Water / Moist / Sens
    const avgScores = [55, 55, 55, 55, 55];

    function getTypeSummary() {
      return "피부 유수분 밸런스를 빠르게 맞추고, 자극 최소화에 집중합니다. 꼭 필요한 진정·보습 성분만 권장합니다.";
    }

    // 2) Radar chart
    function renderRadar(svg, my = defaultScores, avg = avgScores) {
      if (!svg) return;
      const size = Math.min(svg.clientWidth || 300, svg.clientHeight || 300);
      const cx = size / 2,
        cy = size / 2,
        r = size * 0.4;
      svg.setAttribute("viewBox", `0 0 ${size} ${size}`);
      svg.innerHTML = "";

      const axes = 5;
      const startDeg = -90;
      const toRad = (d) => (d * Math.PI) / 180;

      // grid (concentric)
      const gridLevels = 4;
      for (let g = 1; g <= gridLevels; g++) {
        const gr = r * (g / gridLevels);
        const circ = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "circle"
        );
        circ.setAttribute("cx", cx);
        circ.setAttribute("cy", cy);
        circ.setAttribute("r", gr);
        circ.setAttribute("fill", "none");
        circ.setAttribute("stroke", "#e9eef3");
        circ.setAttribute("stroke-width", "1");
        svg.appendChild(circ);
      }

      // axis lines
      for (let i = 0; i < axes; i++) {
        const ang = toRad(startDeg + i * (360 / axes));
        const x = cx + r * Math.cos(ang);
        const y = cy + r * Math.sin(ang);
        const line = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "line"
        );
        line.setAttribute("x1", cx);
        line.setAttribute("y1", cy);
        line.setAttribute("x2", x);
        line.setAttribute("y2", y);
        line.setAttribute("stroke", "#d4dde6");
        line.setAttribute("stroke-width", "1");
        svg.appendChild(line);
      }

      // polygon builder
      const polyFor = (vals, color, fillAlpha) => {
        const pts = vals
          .map((v, i) => {
            const ang = toRad(startDeg + i * (360 / axes));
            const rr = (clamp(v, 0, 100) / 100) * r;
            const x = cx + rr * Math.cos(ang);
            const y = cy + rr * Math.sin(ang);
            return `${x},${y}`;
          })
          .join(" ");
        const poly = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "polygon"
        );
        poly.setAttribute("points", pts);
        poly.setAttribute("fill", color);
        poly.setAttribute("fill-opacity", fillAlpha);
        poly.setAttribute("stroke", color);
        poly.setAttribute("stroke-width", "2");
        return poly;
      };

      // avg (green) then my (pink) so my is on top
      svg.appendChild(polyFor(avg, "#3bb273", 0.15));
      svg.appendChild(polyFor(my, "#ff579a", 0.2));
    }

    // 3) Chip auto placement around chart
    function placeChips(container) {
      const chart = $(".chart", container) || container;
      const svg = $("#radar", chart);
      if (!chart || !svg) return;

      const rect = chart.getBoundingClientRect();
      const size = Math.min(rect.width, rect.height);
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const r = size * 0.46; // a bit outside polygon

      const axes = 5;
      const startDeg = -90;
      const toRad = (d) => (d * Math.PI) / 180;

      for (let i = 0; i < axes; i++) {
        const chip = $(`#chip${i}`, chart);
        if (!chip) continue;
        const ang = toRad(startDeg + i * (360 / axes));
        const x = cx + r * Math.cos(ang);
        const y = cy + r * Math.sin(ang);
        // center chip around its size after next paint
        chip.style.position = "absolute";
        chip.style.left = `${x}px`;
        chip.style.top = `${y}px`;
        chip.style.transform = "translate(-50%, -50%)";
        chip.style.pointerEvents = "auto";
      }
    }

    // 4) Wishlist logic
    function isWished(btn) {
      if (!btn) return false;
      if (btn.getAttribute("aria-pressed") === "true") return true;
      if (btn.classList.contains("is-on")) return true;
      if (btn.dataset.wish === "on") return true;
      const t = (btn.textContent || "").trim().toLowerCase();
      return t.includes("remove") || t.includes("wishlisted");
    }
    function setVisualWish(btn, onState) {
      btn.setAttribute("aria-pressed", onState ? "true" : "false");
      btn.classList.toggle("is-on", onState);
      btn.dataset.wish = onState ? "on" : "off";
      if (btn.dataset.labelOn && btn.dataset.labelOff) {
        btn.textContent = onState ? btn.dataset.labelOn : btn.dataset.labelOff;
      }
    }
    function toggleBtn(btn) {
      // Prefer native click if site wires events
      btn.click?.();
      // Also ensure visible state toggles for safety
      setVisualWish(btn, !isWished(btn));
    }
    function syncAllButton(allBtn, buttons) {
      const wished = buttons.filter(isWished);
      const allOn = wished.length === buttons.length && buttons.length > 0;
      allBtn.setAttribute("aria-pressed", allOn ? "true" : "false");
      allBtn.textContent = allOn
        ? allBtn.dataset.labelOn || "REMOVE ALL"
        : allBtn.dataset.labelOff || "ALL TO WISHLIST";
    }
    function initWishlist() {
      const allBtn = $("#wishlistAll");
      const buttons = $$(".add_btn");

      buttons.forEach((btn) => {
        // default text labels if not provided
        if (!btn.dataset.labelOn) btn.dataset.labelOn = "REMOVE";
        if (!btn.dataset.labelOff) btn.dataset.labelOff = "ADD TO WISHLIST";
        on(btn, "click", (e) => {
          // small debounce of visual sync
          setTimeout(() => {
            setVisualWish(btn, isWished(btn));
            if (allBtn) syncAllButton(allBtn, buttons);
          }, 0);
        });
      });

      if (allBtn) {
        if (!allBtn.dataset.labelOn) allBtn.dataset.labelOn = "REMOVE ALL";
        if (!allBtn.dataset.labelOff)
          allBtn.dataset.labelOff = "ALL TO WISHLIST";
        syncAllButton(allBtn, buttons);
        on(allBtn, "click", () => {
          const allOn = allBtn.getAttribute("aria-pressed") === "true";
          if (allOn) {
            // turn all off
            buttons.forEach((btn) => {
              if (isWished(btn)) toggleBtn(btn);
            });
          } else {
            // turn all on
            buttons.forEach((btn) => {
              if (!isWished(btn)) toggleBtn(btn);
            });
          }
          setTimeout(() => syncAllButton(allBtn, buttons), 0);
        });
      }
    }

    // 5) Main render
    function renderResult() {
      const svg = $("#radar");
      renderRadar(svg, defaultScores, avgScores);

      // MBTI + summary
      const mbti = $("#mbti");
      if (mbti) {
        mbti.innerHTML = '<h2 class="mbti-badge">DRNT</h2>';
      }
      const summary = $("#summary");
      if (summary) {
        summary.textContent = getTypeSummary();
      }

      // chips
      const container = $(".chart") || svg?.parentElement;
      if (container) {
        // ensure relative for absolute chips
        const cs = getComputedStyle(container);
        if (cs.position === "static") {
          container.style.position = "relative";
        }
        placeChips(container);
        window.addEventListener("resize", () => placeChips(container));
      }

      // wishlist
      initWishlist();
    }

    // 6) Init
    document.addEventListener("DOMContentLoaded", renderResult);
  })();

  // bootstrap fallback merged
  (function () {
    // Ensure namespace
    var w = window;
    if (!w.SKINTEST || typeof w.SKINTEST !== "object") {
      w.SKINTEST = {};
    }
    var SK = w.SKINTEST;

    // Safe helper: show/hide sections by id
    if (typeof SK.showSection !== "function") {
      SK.showSection = function (id) {
        try {
          var ids = ["home", "quiz", "loading", "result"];
          for (var i = 0; i < ids.length; i++) {
            var el = document.getElementById(ids[i]);
            if (!el) continue;
            el.hidden = ids[i] !== id;
          }
          if (typeof history !== "undefined" && history.replaceState) {
            history.replaceState(null, "", "#" + id);
          }
        } catch (e) {
          console.warn("[bootstrap] showSection error:", e);
        }
      };
    }

    function bindStart() {
      var btn = document.getElementById("startBtn");
      if (!btn || btn.__bound) return;
      btn.__bound = true;
      btn.addEventListener("click", function () {
        try {
          SK.showSection("quiz");
        } catch (e) { }
      });
      console.log("[bootstrap] #startBtn bound");
    }

    // Bind on DOM ready
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", bindStart, { once: true });
    } else {
      bindStart();
    }
  })();
});

// RESULT GSAP
(function () {
  // Namespace safety
  window.SK = window.SK || {};

  // 1) Scroll lock utility (idempotent)
  SK.lockScroll = function (on) {
    var d = document.documentElement,
      b = document.body;
    if (on) {
      d.style.overflow = "hidden";
      b.style.overflow = "hidden";
    } else {
      d.style.overflow = "";
      b.style.overflow = "";
    }
  };

  // 2) Wrap SK.showSection to add policies
  var originalShowSection =
    typeof SK.showSection === "function" ? SK.showSection.bind(SK) : null;

  function afterShow(id) {
    // Policy: lock only on loading
    var lock = id === "loading";
    SK.lockScroll(lock);

    // If result, align to .legend and emit event
    if (id === "result") {
      // Wait for layout/paint
      setTimeout(function () {
        try {
          var target =
            document.querySelector("#result .legend") ||
            document.getElementById("result");
          if (target && typeof target.scrollIntoView === "function") {
            target.scrollIntoView({ behavior: "auto", block: "start" });
          }
        } catch (e) {
          /* noop */
        }
        // Custom event for animations
        var ev;
        try {
          ev = new CustomEvent("SKINTEST_SHOW_RESULT");
        } catch (_) {
          ev = document.createEvent("Event");
          ev.initEvent("SKINTEST_SHOW_RESULT", true, true);
        }
        window.dispatchEvent(ev);
      }, 0);
    }
  }

  // Provide a fallback showSection if not present
  SK.showSection = function (id) {
    if (originalShowSection) {
      originalShowSection(id);
    } else {
      // Basic fallback: toggle [hidden] on .page sections
      var pages = document.querySelectorAll(".page[id]");
      pages.forEach(function (el) {
        el.hidden = el.id !== id;
      });
    }
    afterShow(id);
  };

  // 3) Ensure scroll unlocked on initial load
  document.addEventListener("DOMContentLoaded", function () {
    SK.lockScroll(false);
  });

  // 4) Optional: hash-based navigation support (if app uses #ids)
  window.addEventListener("hashchange", function () {
    var id = (location.hash || "").replace(/^#/, "");
    if (!id) return;
    // If page exists, use our showSection to apply policies
    if (document.getElementById(id)) {
      SK.showSection(id);
    }
  });

  // 5) GSAP entrance animations for #result (safe to include without GSAP)
  (function setupGSAP() {
    function hasGSAP() {
      return typeof window.gsap !== "undefined";
    }
    var resultTL = null;

    function killResultAnim() {
      if (resultTL) {
        resultTL.kill();
        resultTL = null;
      }
      var sel =
        "#result .legend, #result .radar-wrap, #result .axis-chip, #result .product_card, #result .actions .btn-white, #result .row-ghosts button";
      document.querySelectorAll(sel).forEach(function (el) {
        el.style.opacity = "";
        el.style.transform = "";
      });
    }

    function animateResultSection() {
      if (!hasGSAP()) return;
      var gsap = window.gsap;

      killResultAnim();

      var result = document.getElementById("result");
      if (!result || result.hidden) return;

      var legend = result.querySelector(".legend");
      var radar = result.querySelector(".radar-wrap");
      var chips = result.querySelectorAll(".axis-chip");
      var cards = result.querySelectorAll(".product_card");
      var ctaAll = result.querySelector("#wishlistBtn");
      var ctas = result.querySelectorAll(".row-ghosts button");

      resultTL = gsap.timeline({ defaults: { ease: "power3.out" } });

      if (legend) {
        resultTL.from(legend, { y: -12, opacity: 0, duration: 0.35 }, 0);
      }
      if (radar) {
        resultTL.from(radar, { scale: 0.92, opacity: 0, duration: 0.6 }, 0.05);
      }
      if (chips && chips.length) {
        resultTL.from(
          chips,
          { y: 8, opacity: 0, stagger: 0.06, duration: 0.3 },
          0.15
        );
      }
      if (cards && cards.length) {
        resultTL.from(
          cards,
          { y: 28, opacity: 0, stagger: 0.08, duration: 0.42 },
          0.25
        );
      }
      if (ctaAll) {
        resultTL.from(ctaAll, { y: 14, opacity: 0, duration: 0.3 }, "+=0.05");
      }
      if (ctas && ctas.length) {
        resultTL.from(
          ctas,
          { y: 10, opacity: 0, stagger: 0.06, duration: 0.28 },
          "-=0.10"
        );
      }
    }

    // ScrollTrigger 기반 카드 개별 트리거
    if (typeof ScrollTrigger !== "undefined") {
      gsap.registerPlugin(ScrollTrigger);
      document.querySelectorAll("#result .product_card").forEach((card) => {
        gsap.from(card, {
          y: 24,
          opacity: 0,
          duration: 0.35,
          ease: "power2.out",
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        });
      });
    }

    // Fire when result is shown
    window.addEventListener("SKINTEST_SHOW_RESULT", animateResultSection);

    // Clean up animations when leaving result
    window.addEventListener("hashchange", function () {
      if (location.hash.replace(/^#/, "") !== "result") {
        killResultAnim();
      }
    });

    // Direct load to #result
    document.addEventListener("DOMContentLoaded", function () {
      if (location.hash === "#result") {
        requestAnimationFrame(animateResultSection);
      }
    });
  })();
})();

/* HOME 섹션 애니메이션 (제공하신 마크업 전용) */
(function () {
  function hasGSAP() { return typeof window.gsap !== "undefined"; }

  let homeTL = null;
  function killHomeAnim() {
    if (homeTL) { homeTL.kill(); homeTL = null; }
    const reset = document.querySelectorAll("#home .home-title, #home .home-sub, #home .badges .badge, #home #startBtn");
    reset.forEach(el => {
      el.style.opacity = "";
      el.style.transform = "";
      el.style.filter = "";
    });
  }

  function animateHomeSection() {
    if (!hasGSAP()) return;
    const home = document.getElementById("home");
    if (!home || home.hidden) return;

    // 사용자 접근성: 줄인 모션 환경이면 간단 페이드만
    const prefersReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    killHomeAnim();

    const title = home.querySelector(".home-title");
    const sub = home.querySelector(".home-sub");
    const badges = home.querySelectorAll(".badges .badge");
    const start = home.querySelector("#startBtn");

    homeTL = gsap.timeline({ defaults: { ease: "power3.out" } });

    if (prefersReduced) {
      // 간단 페이드
      if (title) homeTL.from(title, { opacity: 0, duration: 0.20 }, 0);
      if (sub) homeTL.from(sub, { opacity: 0, duration: 0.20 }, 0.05);
      if (badges && badges.length) homeTL.from(badges, { opacity: 0, duration: 0.18, stagger: 0.04 }, 0.10);
      if (start) homeTL.from(start, { opacity: 0, duration: 0.22 }, 0.18);
      return;
    }

    // 리치 애니메이션
    if (title) {
      homeTL.from(title, {
        y: 18, opacity: 0, duration: 0.42
      }, 0);
    }
    if (sub) {
      homeTL.from(sub, {
        y: 14, opacity: 0, duration: 0.34
      }, 0.08);
    }
    if (badges && badges.length) {
      homeTL.from(badges, {
        y: 10, opacity: 0, duration: 0.26, stagger: 0.06
      }, 0.14);
    }
  }

  // 커스텀 이벤트로도 트리거 가능
  window.addEventListener("SKINTEST_SHOW_HOME", animateHomeSection);

  // 해시 기반 라우팅 대응(#home 진입 시 실행)
  function onRouteChange() {
    if ((location.hash || "#home") === "#home") {
      requestAnimationFrame(animateHomeSection);
    } else {
      killHomeAnim();
    }
  }
  window.addEventListener("hashchange", onRouteChange);

  // 초기 진입 처리
  document.addEventListener("DOMContentLoaded", () => {
    killHomeAnim();
    onRouteChange();
  });

  // 앱 내부 라우터가 SK.showSection(id)를 쓰는 경우 훅킹(기존 기능 보존)
  if (window.SK && typeof SK.showSection === "function") {
    const orig = SK.showSection.bind(SK);
    SK.showSection = function (id) {
      const ret = orig(id);
      try {
        if (id === "home") {
          window.dispatchEvent(new Event("SKINTEST_SHOW_HOME"));
        } else {
          killHomeAnim();
        }
      } catch (_) { }
      return ret;
    };
  }
})();

// Buttons (wishlist/home/reset) — safe animation with clearProps.
window.animateResultButtonsSafe = function () {
  function safe() { return typeof window.gsap !== "undefined"; }
  const sel = ["#wishlistBtn", "#homeBtn", "#resetBtn"];
  const btns = sel.map((s) => document.querySelector(s)).filter(Boolean);

  // 1) 항상 가시성 보장: 이전 애니메이션 잔여 인라인 스타일 제거
  btns.forEach((el) => {
    if (!el || !el.style) return;
    if (el.style.opacity === "0") el.style.opacity = "";
    if (el.style.transform && el.style.transform !== "none") el.style.transform = "";
  });

  // 2) GSAP 미로딩 시 애니메이션은 생략(버튼은 이미 정상 노출)
  if (!safe() || !btns.length) return;

  // 3) 안전 애니메이션: 완료 시 transform/opacity를 지워 후속 레이아웃/스타일에 영향 없게
  btns.forEach((el, i) => {
    gsap.fromTo(
      el,
      { y: 14, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.30, ease: "power3.out", delay: 0.05 + i * 0.05, clearProps: "transform,opacity" }
    );
  });
};

/* 개별 상품카드의 ADD TO WISHLIST 버튼 토글 */
(function () {
  // 아이콘 경로(프로젝트 경로에 맞게 필요 시 수정)
  const ICON_STROKE = "/asset/img/skintest/icon_heart_stroke.svg";
  const ICON_FILL = "/asset/img/skintest/icon_heart_fill.svg";

  // 버튼 UI를 상태(on/off)에 맞게 갱신
  function updateAddBtnUI(btn, on) {
    if (!btn) return;
    btn.classList.toggle("on", on);                 // 스타일용
    btn.setAttribute("aria-pressed", on ? "true" : "false");

    // 텍스트/아이콘 갱신
    const img = btn.querySelector("img.heart");
    if (img) img.src = on ? ICON_FILL : ICON_STROKE;

    // 버튼 라벨(문구는 원하시는 대로)
    const labelOn = "ADD TO WISHLIST";
    const labelOff = "ADD TO WISHLIST";
    // 버튼 내부 노드에서 아이콘을 제외하고 텍스트만 바꾸기
    const textNode = [...btn.childNodes].find(n => n.nodeType === Node.TEXT_NODE);
    if (textNode) {
      textNode.nodeValue = (on ? " " + labelOn : " " + labelOff); // 아이콘 뒤에 공백 포함
    } else {
      // 텍스트 노드가 없다면 추가
      btn.append(document.createTextNode(on ? " " + labelOn : " " + labelOff));
    }
  }

  // 토글 동작(상태 반전)
  function toggleAddBtn(btn) {
    const isOn = btn.classList.contains("on");
    const next = !isOn;
    updateAddBtnUI(btn, next);

    // 선택: 전역 상태(SKU/상품ID)를 같이 관리하고 싶다면 여기서 처리
    // const card = btn.closest(".product_card");
    // const pid = card?.dataset.pid; // <div class="product_card" data-pid="...">
    // if (pid) { SK?.wishlist?.set(pid, next); }

    // 기본 클릭 동작(폼 제출 등) 방지
    return next;
  }

  // 이벤트 위임: .product_card 내부의 .add_btn 클릭을 처리
  function onDocClick(e) {
    const btn = e.target.closest(".product_card .add_btn");
    if (!btn) return;
    e.preventDefault();
    toggleAddBtn(btn);
    // 개별 토글 후, ALL 버튼 라벨/상태 동기화
    if (window.WishlistAll && typeof window.WishlistAll.sync === "function") {
      window.WishlistAll.sync();
    }
  }

  // 중복 바인딩 방지
  if (!window.__ADD_BTN_TOGGLE_BOUND__) {
    document.addEventListener("click", onDocClick, false);
    window.__ADD_BTN_TOGGLE_BOUND__ = true;
  }

  // 초기 상태 정리(필요 시): 렌더 시 이미 on/off가 지정돼 있으면 UI 동기화
  document.querySelectorAll(".product_card .add_btn").forEach((btn) => {
    const on = btn.classList.contains("on") || btn.getAttribute("aria-pressed") === "true";
    updateAddBtnUI(btn, on);
  });

  // 선택: 외부에서 프로그램적으로 토글/설정하고 싶을 때 사용할 수 있게 공개
  window.WishlistBtn = Object.assign(window.WishlistBtn || {}, {
    set(btnOrSelector, on) {
      const btn = typeof btnOrSelector === "string" ? document.querySelector(btnOrSelector) : btnOrSelector;
      updateAddBtnUI(btn, !!on);
    },
    toggle(btnOrSelector) {
      const btn = typeof btnOrSelector === "string" ? document.querySelector(btnOrSelector) : btnOrSelector;
      return toggleAddBtn(btn);
    }
  });
})();


// === Injected from jbtest.js: Wishlist ALL toggle + label sync ===
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
    if (!allBtn.dataset.labelOn) allBtn.dataset.labelOn = "REMOVE ALL";
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
