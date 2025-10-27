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
  };

  // 키보드 헬퍼
  SK.key = { LEFT: 37, RIGHT: 39, ENTER: 13, ONE: 49, NINE: 57, ZERO: 48 };

  // 부드러운 지연(로딩전환)
  SK.sleep = (ms) => new Promise((r) => setTimeout(r, ms));

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

    // ALL TO WISHLIST → 결과 카드의 .add_btn 전체 토글 (src 스왑)
    if (wishlistBtn) {
      wishlistBtn.addEventListener("click", () => {
        const buttons = SK.$$("#result .add_btn");
        const someInactive = buttons.some(
          (btn) => !btn.classList.contains("active")
        );
        const targetActive = someInactive; // 하나라도 꺼져 있으면 전체 켜기, 아니면 전체 끄기
        buttons.forEach((btn) => {
          btn.classList.toggle("active", targetActive);
          const img = btn.querySelector(".heart");
          if (img) {
            img.src = targetActive
              ? "/asset/img/skintest/icon_heart_fill.svg"
              : "/asset/img/skintest/icon_heart_stroke.svg";
          }
          btn.setAttribute("aria-pressed", targetActive ? "true" : "false");
        });
      });
    }

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
    const code = `${oilType.startsWith("O") ? "O" : "D"}${
      sensType.startsWith("S") ? "S" : "R"
    }${pigType.startsWith("P") ? "P" : "N"}${
      wrinkleType.startsWith("W") ? "W" : "T"
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
    window.dispatchEvent(new Event("SKINTEST_SHOW_RESULT"));
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

    // 고정 버튼 컨테이너(이미 있으면 유지)
    let fa = result.querySelector(".fixed-actions");
    if (!fa) {
      fa = document.createElement("div");
      fa.className = "fixed-actions";
      fa.innerHTML = `
        <button id="homeBtn" class="btn-white" type="button">HOME</button>
        <button id="resetBtn" class="btn-white" type="button">RESET</button>
        <button id="wishlistBtn" class="btn-white" type="button">ALL TO WISHLIST</button>
      `;
      result.appendChild(fa);
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

    // 값(A=평균, B=내 점수)
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
    drawNodes(avg, "#10b981");
    drawNodes(me, "#f43f5e");

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
  }
  // 전역 노출
  window.drawRadar = drawRadar;

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

  // 제품 스코어링
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

    if (grid) {
      // Case A) 정적 그리드 증강
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
    } else if (container) {
      // Case B) 동적 카드 생성
      const scorer = makeScorer(profile.facets);
      const scored = catalog
        .map((p) => ({ ...p, score: scorer(p) }))
        .sort((a, b) => b.score - a.score);

      container.innerHTML = "";
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

  // HOME / RESET / WISHLIST 위치 고정 보장 및 동작
  function bindFixedActions() {
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
  }

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
  }

  window.addEventListener("SKINTEST_SHOW_RESULT", renderResultAll);
  document.addEventListener("DOMContentLoaded", () => {
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
      if (!safe()) return;
      if (gsap.registerPlugin && window.ScrollTrigger) {
        gsap.registerPlugin(ScrollTrigger);
      }

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

      const start = document.getElementById("startBtn");
      const next = document.getElementById("nextBtn");
      if (start) start.addEventListener("click", window.animateQuizCard);
      if (next) next.addEventListener("click", window.animateQuizCard);
    });
  })();
})();
