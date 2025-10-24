// app.js
// Simple router between #home, #quiz, #result with fixed header/footer.
// Quiz minimal logic + pentagon radar.

// Router
const PAGES = ['home','quiz','result'];
function show(id) {
  PAGES.forEach(pid => {
    const el = document.getElementById(pid);
    if (!el) return;
    const active = (pid === id);
    el.toggleAttribute('hidden', !active);
    el.classList.toggle('is-active', active);
  });
  
  // focus management
  if (id === 'quiz') { var q=document.getElementById('question'); if(q) q.focus(); }
}
function go(id){
  location.hash = '#' + id;
  show(id);
}

// Header/Buttons
window.addEventListener('DOMContentLoaded', () => {
  (function(el){ if(el) el.addEventListener('click', function(){ go('quiz'); show('quiz'); }); })(document.getElementById('startBtn'));
  (function(el){ if(el) el.addEventListener('click', function(){ go('home'); }); })(document.getElementById('homeBtn'));
  (function(el){ if(el) el.addEventListener('click', function(e){ e.preventDefault(); try{ localStorage.removeItem('skin_quiz_final'); }catch(_){} location.hash = '#quiz'; location.reload(); }); })(document.getElementById('resetBtn'));

  // Hash routing
  const target = (location.hash ? location.hash.replace('#','') : '') || 'home';
  show(PAGES.includes(target) ? target : 'home');


  // Footer height -> CSS variable to avoid overlap
  const footer = document.querySelector('footer');
  function updateFooterPadding(){
    if (!footer) return;
    const h = footer.getBoundingClientRect().height;
    document.documentElement.style.setProperty('--footer-h', h + 'px');
  }
  updateFooterPadding();
  window.addEventListener('resize', updateFooterPadding);

  initQuiz(
    function finish(){
    // Map to values A/B/C/D
    const values = selectedIdx.map((idx, qi)=>QUESTIONS[qi].choices[idx].value);
    // Dummy result numbers (0-100) derived from answers for demo
    const map={'A':30,'B':70,'C':50,'D':40};
    const dataValues=[
      map[values[0]], // Oil
      map[values[1]], // Water retention
      map[values[2]], // Sensitivity
      map[values[3]], // Moisturizing
      map[values[4]], // Elasticity
    ];
    // compute type using global deriveType and persist
    const theType = deriveType(dataValues);
    try {
      localStorage.setItem('skin_quiz_final', JSON.stringify({ type: theType, values:dataValues, avg:[50,55,50,60,52] }));
    } catch(e) {}
    go('result');
    renderResult();
    }
  );
});

// Quiz: 10 questions (English)
const QUESTIONS = [
  { title:'Q1. How does your skin feel after cleansing?', choices:[
    {label:'A. Very tight/dry', value:'A'},
    {label:'B. Oily overall', value:'B'},
    {label:'C. Only T-zone oily', value:'C'},
    {label:'D. Stings/irritated', value:'D'}
  ]},
  { title:'Q2. Pores?', choices:[
    {label:'A. Barely visible', value:'A'},
    {label:'B. Large overall', value:'B'},
    {label:'C. Large on T-zone only', value:'C'},
    {label:'D. Flare with irritation', value:'D'}
  ]},
  { title:'Q3. Oil through the day?', choices:[
    {label:'A. Dry even in afternoon', value:'A'},
    {label:'B. Greasy all day', value:'B'},
    {label:'C. Only T-zone greasy', value:'C'},
    {label:'D. Highly reactive to env.', value:'D'}
  ]},
  { title:'Q4. Texture / flakes?', choices:[
    {label:'A. Frequent flaking', value:'A'},
    {label:'B. Hardly any flakes', value:'B'},
    {label:'C. Area-dependent', value:'C'},
    {label:'D. Breaks out with product swap', value:'D'}
  ]},
  { title:'Q5. Blemish tendency?', choices:[
    {label:'A. Dryness-related', value:'A'},
    {label:'B. Oil-related', value:'B'},
    {label:'C. Varies by area', value:'C'},
    {label:'D. Irritation-related', value:'D'}]
  },
  { title:'Q6. Serum/cream feel?', choices:[
    {label:'A. Absorbs fast, needs more', value:'A'},
    {label:'B. Sits heavy', value:'B'},
    {label:'C. Depends on area', value:'C'},
    {label:'D. Sometimes stings/burns', value:'D'}
  ]},
  { title:'Q7. Shine right after wash?', choices:[
    {label:'A. Almost none', value:'A'},
    {label:'B. Overall shine', value:'B'},
    {label:'C. Subtle on T-zone', value:'C'},
    {label:'D. Red/irritation glow', value:'D'}
  ]},
  { title:'Q8. Heat/humidity response?', choices:[
    {label:'A. Gets drier', value:'A'},
    {label:'B. More sebum', value:'B'},
    {label:'C. Varies by area', value:'C'},
    {label:'D. Overly sensitive', value:'D'}
  ]},
  { title:'Q9. After cleansing?', choices:[
    {label:'A. Very tight', value:'A'},
    {label:'B. Still oily', value:'B'},
    {label:'C. Cheeks tight, T‑zone ok', value:'C'},
    {label:'D. Irritation/redness', value:'D'}
  ]},
  { title:'Q10. AM cleansing style?', choices:[
    {label:'A. Water only yet tight', value:'A'},
    {label:'B. Cleanser is a must', value:'B'},
    {label:'C. Cleanser for T‑zone only', value:'C'},
    {label:'D. Hard to change cleanser', value:'D'}
  ]}
];

function initQuiz(onFinish){
  const section = document.getElementById('quiz');
  if (!section) return;
  const el = {
    progress:  document.getElementById('progress'),
    question:  document.getElementById('question'),
    options:   document.getElementById('options'),
    prevBtn:   document.getElementById('prevBtn'),
    nextBtn:   document.getElementById('nextBtn'),
  };
  const missing = Object.entries(el).filter(([_,v])=>!v).map(([k])=>k);
  if (missing.length){ console.error('Missing quiz elements:', missing); return; }

  const N = QUESTIONS.length;
  let i = 0;
  const selectedIdx = new Array(N).fill(null);

  function updateProgress(){ el.progress.textContent = `${i+1} of ${N}`; }
  function isAnswered(){ return selectedIdx[i] !== null; }
  function updateNext(){ el.nextBtn.disabled = !isAnswered(); }

  function renderOptions(){
    const choices = QUESTIONS[i].choices;
    el.options.innerHTML = '';
    el.options.setAttribute('role', 'radiogroup');
    el.options.setAttribute('aria-labelledby', 'question');
    const sel = selectedIdx[i];

    choices.forEach((opt, idx) => {
      const li = document.createElement('li');
      li.className = 'option-item';

      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.id = `q${i}_opt${idx}`;
      radio.name = `question${i}`;
      radio.className = 'radio-input';
      radio.checked = sel === idx;

      const label = document.createElement('label');
      label.htmlFor = radio.id;
      label.className = 'option';
      label.textContent = opt.label;

      radio.addEventListener('change', () => {
        selectedIdx[i] = idx;
        const radios = el.options.querySelectorAll('.radio-input');
        radios.forEach((r, rIdx) => {
          const lab = el.options.querySelector(`label[for="${r.id}"]`);
          if (lab) {
            lab.setAttribute('aria-checked', rIdx === idx ? 'true' : 'false');
            lab.tabIndex = rIdx === idx ? 0 : -1;
          }
        });
        updateNext();
      });

      li.appendChild(radio);
      li.appendChild(label);
      el.options.appendChild(li);
    });
  }

  function focusCurrent(){
    const idx = ((selectedIdx[i]!==undefined && selectedIdx[i]!==null) ? selectedIdx[i] : 0);
    const radios = el.options.querySelectorAll('.radio-input');
    if (radios[idx]) radios[idx].focus();
  }

  function render(){
    el.question.textContent = QUESTIONS[i].title;
    updateProgress();
    renderOptions();
    el.prevBtn.disabled = i===0;
    el.nextBtn.textContent = (i===N-1)?'Result':'Next';
    updateNext();
    el.question.setAttribute('tabindex','-1');
    try { animateQuizCard(); } catch(e) {}
  }

  function finish(){
    // Map answers A/B/C/D -> numeric indicators (example mapping)
    const answers = selectedIdx.map((idx, qi)=> QUESTIONS[qi].choices[idx]?.value || 'C');
    const map = {'A':30,'B':70,'C':50,'D':40};
    const dataValues = [
      map[answers[0]] || 50,
      map[answers[1]] || 50,
      map[answers[2]] || 50,
      map[answers[3]] || 50,
      map[answers[4]] || 50
    ];

    if (typeof onFinish === 'function'){
      try {
        onFinish(selectedIdx.slice(), dataValues);
      } catch(e){
        console.error('onFinish callback error', e);
      }
    } else {
      // backward-compatible fallback: compute type and persist
      try {
        const theType = deriveType(dataValues);
        localStorage.setItem('skin_quiz_final', JSON.stringify({ type: theType, values: dataValues, avg:[50,55,50,60,52] }));
      } catch(e){ console.error(e); }
      go('result');
      renderResult();
      try { fillProducts(); } catch(e) {}
    }
  }

  el.nextBtn.addEventListener('click', ()=>{
    if (!isAnswered()) return;
    if (i < N-1){ i++; render(); } else { finish(); }
  });
  el.prevBtn.addEventListener('click', ()=>{ if (i>0){ i--; render(); focusCurrent(); } });

  render();
}

// Pentagon radar renderer
(function(){
  function clamp01(v){ return Math.max(0, Math.min(100, Number(v)||0)); }
  function fit5(arr, fill=50){
    const a = Array.isArray(arr) ? arr.slice(0,5) : [];
    while(a.length<5) a.push(fill);
    return a.map(clamp01);
  }
  function toXY(cx, cy, R, i, n, val){
    const angle = -Math.PI/2 + i*(2*Math.PI/n);
    const r = (clamp01(val)/100)*R;
    return [cx + r*Math.cos(angle), cy + r*Math.sin(angle)];
  }
  window.renderPentagon = function(svg, axes, avg, mine){
    if (!svg) return;
    const AX = Array.isArray(axes)&&axes.length===5 ? axes : ['Oil','Water retention','Sensitivity','Moisturizing','Elasticity'];
    const AVG = fit5(avg, 50);
    const MINE= fit5(mine, 50);
    const size=520, pad=36, cx=size/2, cy=size/2, R=size/2-pad;
    const ns='http://www.w3.org/2000/svg';
    while(svg.firstChild) svg.removeChild(svg.firstChild);
    svg.setAttribute('viewBox',`0 0 ${size} ${size}`);

    // grid (pentagon rings at 20/40/60/80/100)
    [20,40,60,80,100].forEach((l, idx) => {
      const pts = AX.map((_,i)=>toXY(cx,cy,R,i,AX.length,l)).map(p=>p.join(',')).join(' ');
      const poly=document.createElementNS(ns,'polygon');
      poly.setAttribute('points',pts);
      poly.setAttribute('fill','none');
      poly.setAttribute('stroke','#e5e7eb');
      poly.setAttribute('stroke-width','1');
      svg.appendChild(poly);

      // steps 라벨: 각 링의 기준값(좌상 기준) — step을 20단위로 표시
      // 라벨은 축 0 방향 기준으로 살짝 바깥쪽에 위치시킴
      const [lx,ly] = toXY(cx,cy,R,0,AX.length,l);
      const label = document.createElementNS(ns,'text');
      label.setAttribute('x', String(lx - 18));
      label.setAttribute('y', String(ly - 8));
      label.setAttribute('fill', '#888');
      label.setAttribute('font-size', '14');
      label.setAttribute('text-anchor', 'start');
      label.textContent = String(l);
      svg.appendChild(label);
    });
    
    // axes
    AX.forEach((_,i)=>{
      const [x,y]=toXY(cx,cy,R,i,AX.length,100);
      const ln=document.createElementNS(ns,'line');
      ln.setAttribute('x1',cx);ln.setAttribute('y1',cy);
      ln.setAttribute('x2',x); ln.setAttribute('y2',y);
      ln.setAttribute('stroke','#e5e7eb'); ln.setAttribute('stroke-width','1');
      svg.appendChild(ln);
    });
    // draw polygon with markers
    function draw(vals, stroke, fill){
      const V = fit5(vals,50);
      const pts = AX.map((_,i)=>toXY(cx,cy,R,i,AX.length,V[i])).map(p=>p.join(',')).join(' ');
      const poly=document.createElementNS(ns,'polygon');
      poly.setAttribute('points',pts);
      poly.setAttribute('fill',fill);
      poly.setAttribute('stroke',stroke);
      poly.setAttribute('stroke-width','2.5');
      poly.setAttribute('stroke-linejoin','round');
      svg.appendChild(poly);
      AX.forEach((_,i)=>{
        const [mx,my]=toXY(cx,cy,R,i,AX.length,V[i]);
        const c=document.createElementNS(ns,'circle');
        c.setAttribute('cx',mx); c.setAttribute('cy',my); c.setAttribute('r','3.5'); c.setAttribute('fill',stroke);
        svg.appendChild(c);
      });
    }
    draw(AVG,'#18A999','rgba(24,169,153,0.16)');
    draw(MINE,'#FF6B6B','rgba(255,107,107,0.16)');

    // return anchor points for chips
    return AX.map((_,i)=>toXY(cx,cy,R*1.04,i,AX.length,100));
  };
})();

function renderResult(){
  // 1) 유도함수: 값 -> 타입 (예: DSPW, ORNT ...)
  function deriveType(vals){
    const [oil, water, sensitivity, moisturizing, elasticity] = vals;
    // 1글자: D/O (건성/지성) - oil 낮으면 D, 높으면 O
    const t1 = oil < 50 ? 'D' : 'O';
    // 2글자: S/R (민감/저자극) - sensitivity 높으면 S, 낮으면 R
    const t2 = sensitivity > 50 ? 'S' : 'R';
    // 3글자: P/N (색소침착 경향/비색소) - 보유 지표 부재 → 수분 보유 낮음 또는 보습 필요 높음이면 P로 간주
    const t3 = (water < 45 || moisturizing > 60) ? 'P' : 'N';
    // 4글자: W/T (주름 경향/탄력 좋음) - elasticity 낮으면 W, 높으면 T
    const t4 = elasticity < 50 ? 'W' : 'T';
    return t1 + t2 + t3 + t4;
  }

  // 2) 타입 요약 생성
  function getTypeSummary(type){
    const m = {
      D: 'Dry', O: 'Oily',
      S: 'Sensitive', R: 'Resistant',
      P: 'Pigmented-prone', N: 'Non‑pigmented',
      W: 'Wrinkle‑prone', T: 'Tight/firm'
    };
    const s0 = `${type}: ${m[type[0]]}, ${m[type[1]]}, ${m[type[2]]}, ${m[type[3]]}.`;

    const tips = [];
    if (type[0] === 'D') tips.push('focus on barrier repair and hydration');
    if (type[0] === 'O') tips.push('use lightweight, non‑comedogenic formulas');
    if (type[1] === 'S') tips.push('avoid fragrance and harsh actives');
    if (type[3] === 'W') tips.push('add daily SPF and firming care');

    // Tips 앞에 줄바꿈을 위한 <br> 추가 (summary는 innerHTML로 설정됨)
    return tips.length ? `${s0}<br>Tips: ${tips.join('; ')}.` : s0;
  }

  // 기존 로딩 로직 유지
  const raw = localStorage.getItem('skin_quiz_final');
  const fallback = { values:[65,60,45,70,58], avg:[50,55,50,60,52] };
  const parsed = raw ? JSON.parse(raw) : {};
  const data = {
    // 기본값에 덮어쓰기
    type: parsed.type,               // 있으면 사용, 없으면 아래에서 산출
    values: parsed.values || fallback.values,
    avg: parsed.avg || fallback.avg
  };

  // 타입 자동 산출(테스트 응답 기반)
  data.type = data.type || deriveType(data.values);

  const AXES = ['Oil','Water retention','Sensitivity','Moisturizing','Elasticity'];
  const anchors = window.renderPentagon(document.getElementById('radar'), AXES, data.avg, data.values);

  // chips (기존 유지)
  const cls = v => v>=65?'good':(v<=35?'bad':'mid');
  anchors.forEach(([x,y],i)=>{
    const el = document.getElementById('chip'+i);
    if (!el) return;
    el.style.left = (x/520*100)+'%';
    el.style.top  = (y/520*100)+'%';
    el.className = 'axis-chip ' + cls(data.values[i]);
    el.textContent = `${AXES[i]} ${data.values[i]}`;
  });

  // mbti + summary (요청 반영)
  const mbti = document.getElementById('mbti');
  if (mbti) mbti.textContent = data.type;

  const summaryEl = document.getElementById('summary');
  if (summaryEl) summaryEl.innerHTML = getTypeSummary(data.type);
  // innerHTML 사용 (줄바꿈 포함)
}

// 해시 라우팅 부분은 그대로 사용
window.addEventListener('hashchange', ()=>{
  const target = (location.hash ? location.hash.replace('#','') : '') || 'home';
  show(PAGES.includes(target) ? target : 'home');
  if (target==='quiz') { try { /* ensure first render */ } catch(e){} }
  if (target==='result') { renderResult(); try{ fillProducts();}catch(e){} }
});






// ------------------------------
// 0) Config
// ------------------------------


  'product1.png','product2.png','product3.png','product4.png','product5.png','product6.png';

// Skin MBTI -> ingredient preferences map
// You can adjust this mapping to fit your own skin test results.
const SKIN_MBTI_MAP = {
  "DRPT": {
    "good": [
      "Ceramide",
      "Panthenol",
      "Glycerin",
      "Hyaluronic Acid",
      "Squalane",
      "Beta-Glucan",
      "Occlusive Creams",
      "Vitamin C",
      "Exfoliating Acids (low %)",
      "Niacinamide",
      "Arbutin",
      "Tranexamic Acid"
    ],
    "bad": [
      "Harsh Foaming Surfactants"
    ]
  },
  "DRPW": {
    "good": [
      "Ceramide",
      "Panthenol",
      "Glycerin",
      "Hyaluronic Acid",
      "Squalane",
      "Beta-Glucan",
      "Occlusive Creams",
      "Vitamin C",
      "Exfoliating Acids (low %)",
      "Niacinamide",
      "Arbutin",
      "Tranexamic Acid"
    ],
    "bad": [
      "Harsh Foaming Surfactants"
    ]
  },
  "DRNT": {
    "good": [
      "Ceramide",
      "Panthenol",
      "Glycerin",
      "Hyaluronic Acid",
      "Squalane",
      "Beta-Glucan",
      "Occlusive Creams",
      "Vitamin C",
      "Exfoliating Acids (low %)",
      "Barrier Support",
      "Antioxidants"
    ],
    "bad": [
      "Harsh Foaming Surfactants"
    ]
  },
  "DRNW": {
    "good": [
      "Ceramide",
      "Panthenol",
      "Glycerin",
      "Hyaluronic Acid",
      "Squalane",
      "Beta-Glucan",
      "Occlusive Creams",
      "Vitamin C",
      "Exfoliating Acids (low %)",
      "Barrier Support",
      "Retinol",
      "Retinal"
    ],
    "bad": [
      "Harsh Foaming Surfactants"
    ]
  },
  "DSPT": {
    "good": [
      "Ceramide",
      "Panthenol",
      "Glycerin",
      "Hyaluronic Acid",
      "Squalane",
      "Beta-Glucan",
      "Occlusive Creams",
      "Centella",
      "Madecassoside",
      "Allantoin",
      "Mugwort",
      "Green Tea"
    ],
    "bad": [
      "Harsh Foaming Surfactants",
      "Alcohol Denat",
      "Fragrance",
      "Essential Oil",
      "Limonene",
      "Linalool",
      "High % AHA",
      "High % BHA"
    ]
  },
  "DSPW": {
    "good": [
      "Ceramide",
      "Panthenol",
      "Glycerin",
      "Hyaluronic Acid",
      "Squalane",
      "Beta-Glucan",
      "Occlusive Creams",
      "Centella",
      "Madecassoside",
      "Allantoin",
      "Mugwort",
      "Green Tea"
    ],
    "bad": [
      "Harsh Foaming Surfactants",
      "Alcohol Denat",
      "Fragrance",
      "Essential Oil",
      "Limonene",
      "Linalool",
      "High % AHA",
      "High % BHA"
    ]
  },
  "DSNT": {
    "good": [
      "Ceramide",
      "Panthenol",
      "Glycerin",
      "Hyaluronic Acid",
      "Squalane",
      "Beta-Glucan",
      "Occlusive Creams",
      "Centella",
      "Madecassoside",
      "Allantoin",
      "Mugwort",
      "Green Tea"
    ],
    "bad": [
      "Harsh Foaming Surfactants",
      "Alcohol Denat",
      "Fragrance",
      "Essential Oil",
      "Limonene",
      "Linalool",
      "High % AHA",
      "High % BHA"
    ]
  },
  "DSNW": {
    "good": [
      "Ceramide",
      "Panthenol",
      "Glycerin",
      "Hyaluronic Acid",
      "Squalane",
      "Beta-Glucan",
      "Occlusive Creams",
      "Centella",
      "Madecassoside",
      "Allantoin",
      "Mugwort",
      "Green Tea"
    ],
    "bad": [
      "Harsh Foaming Surfactants",
      "Alcohol Denat",
      "Fragrance",
      "Essential Oil",
      "Limonene",
      "Linalool",
      "High % AHA",
      "High % BHA"
    ]
  },
  "ORPT": {
    "good": [
      "Niacinamide",
      "Lightweight Humectants",
      "Green Tea",
      "Zinc PCA",
      "Tea Tree",
      "Salicylic Acid",
      "Vitamin C",
      "Exfoliating Acids (low %)",
      "Arbutin",
      "Tranexamic Acid",
      "Rice Extract",
      "Licorice"
    ],
    "bad": [
      "Coconut Oil",
      "Isopropyl Myristate",
      "Lanolin",
      "Heavy Oils",
      "Heavy Creams"
    ]
  },
  "ORPW": {
    "good": [
      "Niacinamide",
      "Lightweight Humectants",
      "Green Tea",
      "Zinc PCA",
      "Tea Tree",
      "Salicylic Acid",
      "Vitamin C",
      "Exfoliating Acids (low %)",
      "Arbutin",
      "Tranexamic Acid",
      "Rice Extract",
      "Licorice"
    ],
    "bad": [
      "Coconut Oil",
      "Isopropyl Myristate",
      "Lanolin",
      "Heavy Oils",
      "Heavy Creams"
    ]
  },
  "ORNT": {
    "good": [
      "Niacinamide",
      "Lightweight Humectants",
      "Green Tea",
      "Zinc PCA",
      "Tea Tree",
      "Salicylic Acid",
      "Vitamin C",
      "Exfoliating Acids (low %)",
      "Barrier Support",
      "Antioxidants"
    ],
    "bad": [
      "Coconut Oil",
      "Isopropyl Myristate",
      "Lanolin",
      "Heavy Oils",
      "Heavy Creams"
    ]
  },
  "ORNW": {
    "good": [
      "Niacinamide",
      "Lightweight Humectants",
      "Green Tea",
      "Zinc PCA",
      "Tea Tree",
      "Salicylic Acid",
      "Vitamin C",
      "Exfoliating Acids (low %)",
      "Barrier Support",
      "Retinol",
      "Retinal",
      "Peptide"
    ],
    "bad": [
      "Coconut Oil",
      "Isopropyl Myristate",
      "Lanolin",
      "Heavy Oils",
      "Heavy Creams"
    ]
  },
  "OSPT": {
    "good": [
      "Niacinamide",
      "Lightweight Humectants",
      "Green Tea",
      "Zinc PCA",
      "Tea Tree",
      "Salicylic Acid",
      "Centella",
      "Madecassoside",
      "Allantoin",
      "Mugwort",
      "Bisabolol",
      "Low-pH Cleanser"
    ],
    "bad": [
      "Coconut Oil",
      "Isopropyl Myristate",
      "Lanolin",
      "Heavy Oils",
      "Heavy Creams",
      "Alcohol Denat",
      "Fragrance",
      "Essential Oil",
      "Limonene",
      "Linalool"
    ]
  },
  "OSPW": {
    "good": [
      "Niacinamide",
      "Lightweight Humectants",
      "Green Tea",
      "Zinc PCA",
      "Tea Tree",
      "Salicylic Acid",
      "Centella",
      "Madecassoside",
      "Allantoin",
      "Mugwort",
      "Bisabolol",
      "Low-pH Cleanser"
    ],
    "bad": [
      "Coconut Oil",
      "Isopropyl Myristate",
      "Lanolin",
      "Heavy Oils",
      "Heavy Creams",
      "Alcohol Denat",
      "Fragrance",
      "Essential Oil",
      "Limonene",
      "Linalool"
    ]
  },
  "OSNT": {
    "good": [
      "Niacinamide",
      "Lightweight Humectants",
      "Green Tea",
      "Zinc PCA",
      "Tea Tree",
      "Salicylic Acid",
      "Centella",
      "Madecassoside",
      "Allantoin",
      "Mugwort",
      "Bisabolol",
      "Low-pH Cleanser"
    ],
    "bad": [
      "Coconut Oil",
      "Isopropyl Myristate",
      "Lanolin",
      "Heavy Oils",
      "Heavy Creams",
      "Alcohol Denat",
      "Fragrance",
      "Essential Oil",
      "Limonene",
      "Linalool"
    ]
  },
  "OSNW": {
    "good": [
      "Niacinamide",
      "Lightweight Humectants",
      "Green Tea",
      "Zinc PCA",
      "Tea Tree",
      "Salicylic Acid",
      "Centella",
      "Madecassoside",
      "Allantoin",
      "Mugwort",
      "Bisabolol",
      "Low-pH Cleanser"
    ],
    "bad": [
      "Coconut Oil",
      "Isopropyl Myristate",
      "Lanolin",
      "Heavy Oils",
      "Heavy Creams",
      "Alcohol Denat",
      "Fragrance",
      "Essential Oil",
      "Limonene",
      "Linalool"
    ]
  }
};

// If test result not present, use this default
// 권장: '' 로 두면 반드시 퀴즈 결과를 우선 사용합니다.
// 원하면 'DSPW' 같은 기본값을 넣어둘 수 있음.
const DEFAULT_SKIN_MBTI = '';

// deriveType : 퀴즈값 배열 -> 4글자 타입 (재사용 가능하도록 전역으로 이동)
function deriveType(vals){
  const [oil, water, sensitivity, moisturizing, elasticity] = Array.isArray(vals) ? vals : [];
  const t1 = (Number(oil)||0) < 50 ? 'D' : 'O';
  const t2 = (Number(sensitivity)||0) > 50 ? 'S' : 'R';
  const t3 = ((Number(water)||0) < 45 || (Number(moisturizing)||0) > 60) ? 'P' : 'N';
  const t4 = (Number(elasticity)||0) < 50 ? 'W' : 'T';
  return t1 + t2 + t3 + t4;
}

// ------------------------------
// 1) Utilities
// ------------------------------

function stripHTML(html) {
  const tmp = document.createElement('div');
  tmp.innerHTML = html || '';
  return tmp.textContent || tmp.innerText || '';
}

function firstSentence(text, fallback='') {
  if (!text) return fallback;
  const t = text.replace(/\s+/g,' ').trim();
  const match = t.match(/(.+?[.!?])(\s|$)/);
  return (match ? match[1] : t).slice(0, 120);
}
// [ADDED] --- Keyword-based subtext generator (single-line) ---
const SUBTEXT_MAX = 80;

const KNOWN_KEYWORDS = [
  "Ceramide",
  "Panthenol",
  "Glycerin",
  "Hyaluronic Acid",
  "Squalane",
  "Beta-Glucan",
  "Centella",
  "Madecassoside",
  "Allantoin",
  "Mugwort",
  "Green Tea",
  "Bisabolol",
  "Niacinamide",
  "Arbutin",
  "Tranexamic Acid",
  "Vitamin C",
  "Rice Extract",
  "Licorice",
  "Zinc PCA",
  "Tea Tree",
  "Salicylic Acid",
  "Retinol",
  "Retinal",
  "Peptide",
  "Adenosine",
  "Sunscreen",
  "SPF",
  "Antioxidants",
  "Low-pH Cleanser",
  "Occlusive Creams",
  "Lightweight Humectants",
  "Barrier Support",
  "Exfoliating Acids"
];

function cleanOneLine(s='') {
  return s.replace(/\s+/g,' ').replace(/[\u200B-\u200D\uFEFF]/g,'').trim();
}

function dedupeKeepOrder(arr) {
  const seen = new Set(); const out = [];
  for (const x of arr) { const k = String(x).trim(); if (!k || seen.has(k.toLowerCase())) continue; seen.add(k.toLowerCase()); out.push(k); }
  return out;
}

function extractKeywordsFromText(text='') {
  const t = stripHTML(text).toLowerCase();
  const hits = [];
  for (const kw of KNOWN_KEYWORDS) {
    const re = new RegExp('\\b' + kw.replace(/\s+/g, '\\s+') + '\\b', 'i');
    if (re.test(t)) hits.push(kw);
  }
  return dedupeKeepOrder(hits).slice(0,4);
}

function extractKeywordsFromTags(tags) {
  if (!tags) return [];
  const raw = Array.isArray(tags) ? tags : String(tags).split(',');
  const cleaned = raw.map(s=>s.replace(/[_-]/g,' ').trim())
                     .filter(Boolean)
                     .filter(s => !/beauty of joseon|boj|skincare|skin care|k-beauty/i.test(s));
  return dedupeKeepOrder(cleaned).slice(0,4);
}

function makeSubtext(product) {
  // priority: tags -> body keywords -> product_type -> fallback first sentence
  const fromTags = extractKeywordsFromTags(product?.tags);
  const fromBody = extractKeywordsFromText(product?.body_html || '');
  let phrase = '';
  if (fromTags.length) {
    phrase = fromTags.join(', ');
  } else if (fromBody.length) {
    phrase = fromBody.join(', ');
  } else if (product?.product_type) {
    phrase = product.product_type;
  } else {
    phrase = firstSentence(stripHTML(product?.body_html||''), '').replace(/^Beauty of Joseon\s*[-–]*\s*/i,'');
  }
  phrase = cleanOneLine(phrase);
  if (phrase.length > SUBTEXT_MAX) phrase = phrase.slice(0, SUBTEXT_MAX-1) + '…';
  return phrase;
}
// [ADDED] --- end ---

function pickRepresentative(arr=[], max=2) {
  // pick up to max unique items preserving order
  const out = [];
  for (const x of arr) {
    if (!x || out.includes(x)) continue;
    out.push(x);
    if (out.length >= max) break;
  }
  return out;
}

function computeMatchScore(productInciSet, goodList, badList) {
  // naive scoring: +15 for each good match, -20 for each bad match. Clamp 0..100.
  let score = 70;
  const goodHits = goodList.filter(g => productInciSet.has(g.toLowerCase())).length;
  const badHits  = badList.filter(b => productInciSet.has(b.toLowerCase())).length;
  score += goodHits * 15;
  score -= badHits * 20;
  return Math.max(0, Math.min(100, score));
}

function extractIngredientsFromBody(bodyHTML) {
  // Try common patterns in Shopify descriptions
  const text = stripHTML(bodyHTML).replace(/\r?\n/g,' ').trim();
  // look for "Ingredients:" or similar
  const m = text.match(/ingredients?\s*[:\-]\s*(.+)$/i);
  if (!m) return [];
  // split by commas
  return m[1].split(/,|\uFF0C/).map(s => s.trim()).filter(Boolean);
}

function toSetLower(arr) {
  return new Set(arr.map(s => s.toLowerCase()));
}

function preload(src) {
  if (!src) return;
  const img = new Image();
  img.src = src;
}

// ------------------------------
// 2) Core: Fetch products from BOJ
// ------------------------------

/* ========================= [ADDED] Product tags + MBTI score + wishlist toggle (1+ items show) ========================= */

(function(){
  // 제품별 표시할 태그(좋은 2개, 나쁜 2개)
  const PRODUCT_TAGS = {
    "Dynasty Cream": { good: ["Rice Bran Water", "Ginseng Root Extract"], bad:  ["Fragrance", "Essential Oil"] },
    "Glow Replenishing Rice Milk": { good: ["Rice Extract", "Niacinamide"], bad:  ["Fragrance", "Essential Oil"] },
    "Ginseng Essence Water": { good: ["Ginseng Extract", "Panthenol"], bad:  ["Alcohol Denat", "Fragrance"] },
    "Revive Serum: Ginseng + Snail Mucin": { good: ["Ginseng Extract", "Snail Mucin"], bad:  ["Fragrance", "Essential Oil"] },
    "Ginseng Cleansing Oil": { good: ["Soybean Oil", "Ginseng Seed Oil"], bad:  ["Isopropyl Myristate", "Fragrance"] },
    "Day Dew Sunscreen": { good: ["Hyaluronic Acid", "Niacinamide"], bad:  ["Octocrylene", "Homosalate"] }
  };

  // --- 수정: MBTI 매칭용 유틸 (PRODUCT_TAGS 바로 아래에 추가/대체) ---
  function getMatchedProducts(mbti) {
    // 우선순위: 함수 인자 mbti -> localStorage.skin_quiz_final.type -> DEFAULT_SKIN_MBTI
    let key = '';
    try {
      const raw = localStorage.getItem('skin_quiz_final');
      const parsed = raw ? JSON.parse(raw) : null;
      key = (mbti || (parsed && parsed.type) || DEFAULT_SKIN_MBTI || '').toString().trim().toUpperCase();
    } catch(e){
      key = (mbti || DEFAULT_SKIN_MBTI || '').toString().trim().toUpperCase();
    }
    const map = SKIN_MBTI_MAP[key] || null;
    const out = [];
    Object.keys(PRODUCT_TAGS).forEach(name => {
      const tags = PRODUCT_TAGS[name] || { good:[], bad:[] };
      if (!map) {
        out.push({ name, goodMatch: [], badMatch: [], score: 70 });
        return;
      }
      const goodMatch = (tags.good||[]).filter(t => map.good.map(g=>g.toLowerCase()).includes(t.toLowerCase()));
      const badMatch  = (tags.bad || []).filter(t => map.bad.map(b=>b.toLowerCase()).includes(t.toLowerCase()));
      const score = Math.max(0, Math.min(100, 70 + goodMatch.length * 15 - badMatch.length * 20));
      out.push({ name, goodMatch, badMatch, score });
    });
    // 정렬: 점수 내림차순
    out.sort((a,b)=>b.score - a.score);
    return { mbtiKey: key, list: out };
  };

  // fillProducts: renderResult 이후 호출될 때 결과 mbti 기준으로 카드 보이기/숨기기, top 3 이상만 표시
  function fillProducts(){
    const cards = Array.from(document.querySelectorAll(".product_card"));
    if (!cards.length) return;

    // mbti는 화면 텍스트보다 localStorage 우선(이미 저장된 타입을 사용)
    let mbtiStored = '';
    try { const raw=localStorage.getItem('skin_quiz_final'); mbtiStored = raw? (JSON.parse(raw).type || '') : ''; } catch(e){ mbtiStored=''; }
    const matchedBundle = getMatchedProducts(mbtiStored);
    const matched = matchedBundle.list;

    // 우선 필터: score >= 65를 후보로. 후보가 3개 이상이면 그들만 쓰고, 아니면 상위 3개를 보여준다.
    let candidates = matched.filter(m=>m.score >= 65);
    if (candidates.length < 3) {
      candidates = matched.slice(0, Math.min(3, matched.length));
    } else {
      candidates = candidates.slice(0, Math.min(3, candidates.length));
    }
    const showNames = new Set(candidates.map(c=>c.name));

    cards.forEach(card => {
      const nameEl = card.querySelector(".info h3");
      const spans = card.querySelectorAll(".tags span");
      const scoreEl = card.querySelector(".info .score");
      const name = nameEl ? nameEl.textContent.trim() : '';

      if (!showNames.has(name)){
        // 숨김 처리
        card.style.display = 'none';
        return;
      } else {
        card.style.display = '';
      }

      // tags 채우기 (제품 정의에 있는 값 사용)
      const map = PRODUCT_TAGS[name];
      if (map && spans.length){
        if (spans[0]) setSpanTextOrHide(spans[0], [map.good?.[0]].filter(Boolean));
        if (spans[1]) setSpanTextOrHide(spans[1], [map.good?.[1]].filter(Boolean));
        if (spans[2]) setSpanTextOrHide(spans[2], [map.bad?.[0]].filter(Boolean));
        if (spans[3]) setSpanTextOrHide(spans[3], [map.bad?.[1]].filter(Boolean));
      }

      // score: matched array에서 가져오기(더 정교함)
      const prod = matched.find(m => m.name === name);
      const sc = prod ? prod.score : computeMbtiScoreForCard(matchedBundle.mbtiKey || mbtiStored);
      if (scoreEl){
        scoreEl.textContent = `Score : ${String(sc).padStart(2,"0")} / 100`;
      }
    });
  }

  // 1개 이상이면 표시, 0개면 숨김
  function setSpanTextOrHide(span, items, joiner=", "){
    const arr = Array.isArray(items)
      ? items.filter(v => typeof v === "string" && v.trim().length > 0)
      : [];

    if (arr.length >= 1){
      span.textContent = arr.join(joiner);
      span.style.display = "";
    } else {
      span.textContent = "";
      span.style.display = "none";
    }
  }

  // 각 span에 “하나의 항목”만 배치
  function setSingleOrHide(span, value){
    if (value && String(value).trim().length){
      setSpanTextOrHide(span, [String(value).trim()]);
    } else {
      setSpanTextOrHide(span, []); // 숨김
    }
  }

  function computeMbtiScoreForCard(mbtiStr){
    const s = String(mbtiStr||"").trim().toUpperCase();
    let score = 78;
    if (!s || s.length<4) return 78;

    score += (s[0] === "D") ? 10 : -8; // D(건성) 가산, O(지성) 감산
    score += (s[1] === "S") ? 5 : 2;   // S(민감) 가산, R(저자극) 소가산
    score += (s[3] === "W") ? 3 : 0;   // W(주름 경향) 소가산

    if (score < 50) score = 50;
    if (score > 98) score = 98;
    return Math.round(score);
  }

  function fillProducts(){
    const cards = document.querySelectorAll(".product_card");
    if (!cards.length) return;

    const mbtiEl = document.getElementById("mbti");
    const mbtiText = mbtiEl ? mbtiEl.textContent : "";

    cards.forEach(card => {
      const nameEl = card.querySelector(".info h3");
      const spans = card.querySelectorAll(".tags span");
      const scoreEl = card.querySelector(".info .score");
      const name = nameEl ? nameEl.textContent.trim() : "";

      // 1) tags: 각 span에 하나씩(중복 없음)
      const map = PRODUCT_TAGS[name];
      if (map && spans.length){
        // 기대 순서: 0=good[0], 1=good[1], 2=bad[0], 3=bad[1]
        if (spans[0]) setSpanTextOrHide(spans[0], [map.good?.[0]].filter(Boolean));
        if (spans[1]) setSpanTextOrHide(spans[1], [map.good?.[1]].filter(Boolean));
        if (spans[2]) setSpanTextOrHide(spans[2], [map.bad?.[0]].filter(Boolean));
        if (spans[3]) setSpanTextOrHide(spans[3], [map.bad?.[1]].filter(Boolean));
      }

      // 2) score
      const sc = computeMbtiScoreForCard(mbtiText);
      if (scoreEl){
        scoreEl.textContent = `Score : ${String(sc).padStart(2,"0")} / 100`;
      }
    });
  }

  function initWishlistToggle(){
    document.querySelectorAll(".product_card .add_btn").forEach(btn => {
      btn.addEventListener("click", () => {
        btn.classList.toggle("is-liked");
        const pressed = btn.classList.contains("is-liked");
        btn.setAttribute("aria-pressed", pressed ? "true" : "false");

        const heart = btn.querySelector("img.heart");
        if (heart && heart.src){
          if (/icon_heart_stroke\.svg$/i.test(heart.src)){
            heart.src = heart.src.replace(/icon_heart_stroke\.svg$/i, "icon_heart_fill.svg");
          } else {
            heart.src = heart.src.replace(/icon_heart_fill\.svg$/i, "icon_heart_stroke.svg");
          }
        }
      });
    });
  }

  // DOM 준비/탭 전환 시 갱신
    window.addEventListener("DOMContentLoaded", () => {
        fillProducts();
        initWishlistToggle();
  });
})();

/* ========================= [ADDED END] ========================= */

/* ========================= [ALL WISHLIST HELPERS] ========================= */
(function(){
  function setWishlistState(btn, on){
    if (!btn) return;
    btn.classList.toggle('is-liked', !!on);
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    var heart = btn.querySelector('img.heart');
    if (heart && heart.src){
      if (on){
        if (/icon_heart_stroke\.svg$/i.test(heart.src)) heart.src = heart.src.replace(/icon_heart_stroke\.svg$/i, 'icon_heart_fill.svg');
        else if (!/icon_heart_fill\.svg$/i.test(heart.src)) heart.src = 'img/icon_heart_fill.svg';
      } else {
        if (/icon_heart_fill\.svg$/i.test(heart.src)) heart.src = heart.src.replace(/icon_heart_fill\.svg$/i, 'icon_heart_stroke.svg');
        else if (!/icon_heart_stroke\.svg$/i.test(heart.src)) heart.src = 'img/icon_heart_stroke.svg';
      }
    }
  }

  function updateAllBtnLabel(){
    var cards = Array.prototype.slice.call(document.querySelectorAll('.product_card .add_btn'));
    var allOn = cards.length>0 && cards.every(function(b){ return b.classList.contains('is-liked'); });
    var allBtn = document.getElementById('wishlistBtn');
    if (allBtn){
      allBtn.textContent = allOn ? 'REMOVE ALL FROM WISHLIST' : 'ADD ALL TO WISHLIST';
      allBtn.setAttribute('aria-pressed', allOn ? 'true' : 'false');
    }
  }

  function toggleAllWishlist(){
    var cards = Array.prototype.slice.call(document.querySelectorAll('.product_card .add_btn'));
    if (!cards.length) return;
    var anyOff = cards.some(function(b){ return !b.classList.contains('is-liked'); });
    cards.forEach(function(btn){ setWishlistState(btn, anyOff); });
    updateAllBtnLabel();
  }

  // Bind once DOM is ready
  window.addEventListener('DOMContentLoaded', function(){
    var allBtn = document.getElementById('wishlistBtn');
    if (allBtn){
      allBtn.addEventListener('click', toggleAllWishlist);
      updateAllBtnLabel();
    }
    // Hook individual toggles to keep label in sync
    document.querySelectorAll('.product_card .add_btn').forEach(function(b){
      b.addEventListener('click', function(){ try{ updateAllBtnLabel(); }catch(e){} });
    });
  });
})();
/* ========================= [ALL WISHLIST HELPERS END] ========================= */



// 페이지 로드 시 애니메이션 (GSAP 존재 시에만)
(function(){
  var G = window.gsap;
  if (!G) { console.warn('[skin-test] GSAP not found. Skipping home animations.'); return; }
  G.from('.home-title', { opacity: 0, y: 30, duration: 1, delay: 0.3 });
  G.from('.home-sub',   { opacity: 0, y: 20, duration: 1, delay: 0.6 });
  G.from('.badges .badge', { opacity: 0, x: -20, duration: 0.8, stagger: 0.2, delay: 0.9 });
})();


// 퀴즈 카드 애니메이션
function animateQuizCard() {
  var G = window.gsap; if (!G) return;
  G.from('.card', { opacity: 0, scale: 0.9, duration: 0.5 });
}

// 결과 페이지 애니메이션
function animateResults() {
  var G = window.gsap; if (!G) return;
  G.from('.radar-wrap', { opacity: 0, y: 30, duration: 1 });
  G.from('.product_card', { opacity: 0, y: 30, duration: 0.8, stagger: 0.2 });
}