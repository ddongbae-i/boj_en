

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
  (function(el){ if(el) el.addEventListener('click', function(){ location.reload(); }); })(document.getElementById('resetBtn'));

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

  initQuiz();
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

function initQuiz(){
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

  function renderOptions(){const choices = QUESTIONS[i].choices;
    el.options.innerHTML = '';
    el.options.setAttribute('role', 'radiogroup');
    el.options.setAttribute('aria-labelledby', 'question');
    const sel = selectedIdx[i];

    choices.forEach((opt, idx) => {
        const li = document.createElement('li');
        li.className = 'option-item';

        // 라디오 버튼 생성
        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.id = `q${i}_opt${idx}`;
        radio.name = `question${i}`;
        radio.className = 'radio-input';
        radio.checked = sel === idx;

        // 라벨 생성
        const label = document.createElement('label');
        label.htmlFor = `q${i}_opt${idx}`;
        label.className = 'option';
        label.textContent = opt.label;

        // 라디오 버튼 이벤트
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

        // 요소 추가
        li.appendChild(radio);
        li.appendChild(label);
        el.options.appendChild(li);
    });
}
  function focusCurrent(){
    const idx = ((selectedIdx[i]!==undefined && selectedIdx[i]!==null) ? selectedIdx[i] : 0);
    const buttons = el.options.querySelectorAll('button[role="radio"]');
    if (buttons[idx]) buttons[idx].focus();
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
    try { localStorage.setItem('skin_quiz_final', JSON.stringify({ type:'', values:dataValues, avg:[50,55,50,60,52] })); } catch(e) {}
    go('result');
    renderResult();
  }

  el.nextBtn.addEventListener('click', ()=>{
    if (!isAnswered()) return;
    if (i<N-1){ i++; render(); } else { finish(); }
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
    [20,40,60,80,100].forEach(l=>{
      const pts = AX.map((_,i)=>toXY(cx,cy,R,i,AX.length,l)).map(p=>p.join(',')).join(' ');
      const poly=document.createElementNS(ns,'polygon');
      poly.setAttribute('points',pts);
      poly.setAttribute('fill','none');
      poly.setAttribute('stroke','#e5e7eb');
      poly.setAttribute('stroke-width','1');
      svg.appendChild(poly);
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

    // 간단 권장 포커스(옵션)
    const tips = [];
    if (type[0] === 'D') tips.push('focus on barrier repair and hydration');
    if (type[0] === 'O') tips.push('use lightweight, non‑comedogenic formulas');
    if (type[1] === 'S') tips.push('avoid fragrance and harsh actives');
    if (type[3] === 'W') tips.push('add daily SPF and firming care');

    return tips.length ? `${s0} Tips: ${tips.join('; ')}.` : s0;
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

  const summary = document.getElementById('summary');
  if (summary) summary.textContent = getTypeSummary(data.type);
}

// 해시 라우팅 부분은 그대로 사용
window.addEventListener('hashchange', ()=>{
  const target = (location.hash ? location.hash.replace('#','') : '') || 'home';
  show(PAGES.includes(target) ? target : 'home');
  if (target==='quiz') { try { /* ensure first render */ } catch(e){} }
  if (target==='result') { renderResult(); try{ fillProducts(); }catch(e){} }
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
const DEFAULT_SKIN_MBTI = 'ISFP';

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
    "Dynasty Cream": {
      good: ["Rice Bran Water", "Ginseng Root Extract"],
      bad:  ["Fragrance", "Essential Oil"]
    },
    "Glow Replenishing Rice Milk": {
      good: ["Rice Extract", "Niacinamide"],
      bad:  ["Fragrance", "Essential Oil"]
    },
    "Ginseng Essence Water": {
      good: ["Ginseng Extract", "Panthenol"],
      bad:  ["Alcohol Denat", "Fragrance"]
    },
    "Revive Serum: Ginseng + Snail Mucin": {
      good: ["Ginseng Extract", "Snail Mucin"],
      bad:  ["Fragrance", "Essential Oil"]
    },
    "Ginseng Cleansing Oil": {
      good: ["Soybean Oil", "Ginseng Seed Oil"],
      bad:  ["Isopropyl Myristate", "Fragrance"]
    },
    "Day Dew Sunscreen": {
      good: ["Hyaluronic Acid", "Niacinamide"],
      bad:  ["Octocrylene", "Homosalate"]
    }
  };

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


// 페이지 로드 시 애니메이션
gsap.from('.home-title', {
    opacity: 0,
    y: 30,
    duration: 1,
    delay: 0.3
});

gsap.from('.home-sub', {
    opacity: 0,
    y: 20,
    duration: 1,
    delay: 0.6
});

gsap.from('.badges .badge', {
    opacity: 0,
    x: -20,
    duration: 0.8,
    stagger: 0.2,
    delay: 0.9
});


// 퀴즈 카드 애니메이션
function animateQuizCard() {
    gsap.from('.card', {
        opacity: 0,
        scale: 0.9,
        duration: 0.5
    });
}

// 결과 페이지 애니메이션
function animateResults() {
    gsap.from('.radar-wrap', {
        opacity: 0,
        y: 30,
        duration: 1
    });
    
    gsap.from('.product_card', {
        opacity: 0,
        y: 30,
        duration: 0.8,
        stagger: 0.2
    });
}