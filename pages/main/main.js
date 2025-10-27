
const bestTopSwiper = new Swiper(".bestSeller .product .slide_wrap1", {
  loop: true,
  slidesPerView: "auto",
  freeMode: true,
  allowTouchMove: false,
  speed: 0,
});

const bestBottomSwiper = new Swiper(".bestSeller .product .slide_wrap2", {
  loop: true,
  slidesPerView: 'auto',
  freeMode: true,
  allowTouchMove: false,
  speed: 0,
});

//메인 스크롤 이벤트
// === GSAP: 메인 <-> 베스트셀러 스냅 (양방향, 이후 자연 스크롤) ===
gsap.registerPlugin(ScrollToPlugin, Observer);

const main = document.querySelector(".main");
const best = document.querySelector(".bestSeller");

let snapping = false;
const getBestTopY = () => best.getBoundingClientRect().top + window.pageYOffset;

// 스냅 중에만 스크롤 잠그기 (휠/터치 모두)
const preventTouch = (e) => e.preventDefault();
function lockScroll(on) {
  document.documentElement.style.overscrollBehavior = on ? "none" : "";
  document.body.style.overflow = on ? "hidden" : "";
  // iOS/안드 터치 이동 차단
  if (on) {
    window.addEventListener("touchmove", preventTouch, { passive: false });
  } else {
    window.removeEventListener("touchmove", preventTouch);
  }
}

Observer.create({
  target: window,
  type: "wheel,touch",   // 자연 스크롤은 그대로 두고, 스냅 시에만 잠금
  // preventDefault: true  <- ❌ 사용하지 않음! (자연 스크롤 막지 않기)

  // ↓ 아래로: 메인 → 베스트셀러 스냅
  onDown() {
    if (snapping) return;
    const y = window.pageYOffset;
    if (y < getBestTopY() - 8) {
      snapping = true;
      lockScroll(true);
      gsap.to(window, {
        duration: 0.9,
        ease: "power2.out",
        scrollTo: { y: best, autoKill: false },
        onComplete: () => {
          lockScroll(false);
          snapping = false;
        }
      });
    }
  },

  // ↑ 위로: 베스트셀러 꼭대기 근처 → 메인으로 스냅
  onUp() {
    if (window.innerWidth <= 1024) return;
    if (snapping) return;
    const y = window.pageYOffset;
    const top = getBestTopY();
    const threshold = top + 24;           // 꼭대기에서 살짝 아래까지 허용
    if (y <= threshold && y >= top - 200) {
      snapping = true;
      lockScroll(true);
      gsap.to(window, {
        duration: 0.9,
        ease: "power2.out",
        scrollTo: { y: main, autoKill: false },
        onComplete: () => {
          lockScroll(false);
          snapping = false;
        }
      });
    }
  }
});


/* -------------------------------
    ✅ GSAP 무한 흐름
------------------------------- */
const scrollSpeed = 40;
let tlTop = gsap.timeline({ repeat: -1 });
let tlBottom = gsap.timeline({ repeat: -1 });

function animateSwiper(swiper, timeline, direction = "left") {
  const wrapper = swiper.wrapperEl;
  const distance = wrapper.scrollWidth; // ✅ 복제 포함 전체 길이 기준

  gsap.set(wrapper, { x: 0 });

  timeline.to(wrapper, {
    x: direction === "left" ? -distance / 2 : distance / 2,
    duration: scrollSpeed,
    ease: "none",
    repeat: -1,
    modifiers: {
      x: gsap.utils.unitize((x) => {
        const num = parseFloat(x);
        if (direction === "left") return num <= -distance / 2 ? 0 : num;
        else return num >= distance / 2 ? 0 : num;
      }),
    },
  });
}

animateSwiper(bestTopSwiper, tlTop, "left");
animateSwiper(bestBottomSwiper, tlBottom, "right");


/* -------------------------------
     🟣 hover 시 흐름 멈춤 / 재개
 ------------------------------- */
const productEl = document.querySelector(".bestSeller .product");

productEl.addEventListener("mouseenter", () => {
  gsap.to([tlTop, tlBottom], {
    timeScale: 0,
    duration: 0.4,
    ease: "power2.out",
  });
});

productEl.addEventListener("mouseleave", () => {
  gsap.to([tlTop, tlBottom], {
    timeScale: 1,
    duration: 0.4,
    ease: "power2.in",
  });
});

//베스트셀러768

let swiper = new Swiper(".mySwiper", {
  slidesPerView: 3.5,
  freeMode: true,
  watchSlidesProgress: true,
});
let swiper2 = new Swiper(".mySwiper2", {

  thumbs: {
    swiper: swiper,
  },
});

/* -------------------------------
             🟣 2. 인플루언서 카드 순차 회전
         ------------------------------- */
const cards = document.querySelectorAll('.influencer .card');

if (cards.length) {
  const config = {
    flipMs: 160,
    stayMs: 200,
    gapMs: 120,
    resetDelay: 500,
  };

  let loopRunning = false;
  let stopLoop = false;
  let isHovered = false;

  const influencerEl = document.querySelector('.influencer');
  influencerEl?.addEventListener('pointerenter', () => (isHovered = true));
  influencerEl?.addEventListener('pointerleave', () => (isHovered = false));

  const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

  // ✅ 하트 클릭(front/back 연동)
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.influencer .wish');
    if (!btn) return;
    e.stopPropagation();

    const card = btn.closest('.card');
    const active = !btn.classList.contains('active');
    card.querySelectorAll('.wish').forEach((w) => {
      w.classList.toggle('active', active);
      w.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  });

  // ✅ 순차 플립 루프
  async function sequentialFlipLoop() {
    if (loopRunning) return;
    loopRunning = true;

    while (!stopLoop) {
      for (const card of cards) {
        if (stopLoop) break;
        while (isHovered && !stopLoop) await sleep(150);
        if (stopLoop) break;

        card.classList.add('flipped');
        await sleep(config.flipMs + config.stayMs + config.gapMs);
      }
      if (stopLoop) break;

      await sleep(config.resetDelay);
      cards.forEach((c) => c.classList.remove('flipped'));
      await sleep(config.flipMs + 300);
    }

    loopRunning = false;
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopLoop = true;
    else if (stopLoop) {
      stopLoop = false;
      sequentialFlipLoop();
    }
  });

  sequentialFlipLoop();
}


(function () {
  const section = document.querySelector('.product_grid.influencer');
  if (!section) return;

  // 그룹 컨테이너
  const leftGroup = section.querySelector('.influencer_left');
  const rightGroup = section.querySelector('.influencer_right');

  // 공통 설정 (기존과 유사)
  const config = {
    flipMs: 800,
    stayMs: 500,
    gapMs: 120,
    resetDelay: 1000,
  };

  let loopRunning = false;
  let stopLoop = false;
  let isHovered = false;
  let currentSide = 'left'; // 768 이하 모드에서 사용

  // 섹션 hover 시 전체 일시정지(요청에 맞게 유지)
  section.addEventListener('pointerenter', () => (isHovered = true));
  section.addEventListener('pointerleave', () => (isHovered = false));

  const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

  // 현재 뷰포트 모드
  const isNarrow = () => window.matchMedia('(max-width: 768px)').matches;

  // 현재 활성 카드 목록
  function getActiveCards() {
    if (isNarrow()) {
      // 한 그룹만 (CSS로 다른 쪽은 display:none)
      const container = currentSide === 'left' ? leftGroup : rightGroup;
      return Array.from(container.querySelectorAll('.card'));
    } else {
      // 둘 다
      return Array.from(section.querySelectorAll('.card'));
    }
  }

  // 768 이하에서 그룹 표시 토글
  function applyGroupVisibility() {
    if (!isNarrow()) {
      section.classList.remove('show-right');
      return;
    }
    if (currentSide === 'right') section.classList.add('show-right');
    else section.classList.remove('show-right');
  }

  // 순차 플립 1회전 (넘겨받은 카드 배열 대상)
  async function flipOnce(cards) {
    for (const card of cards) {
      // hover 중엔 잠깐 대기
      while (isHovered) await sleep(150);

      card.classList.add('flipped');
      await sleep(config.flipMs + config.stayMs);
      card.classList.remove('flipped');
      await sleep(config.gapMs);
    }
  }

  async function mainLoop() {
    if (loopRunning) return;
    loopRunning = true;

    while (!stopLoop) {
      const cards = getActiveCards();
      if (cards.length === 0) { await sleep(200); continue; }

      await flipOnce(cards);
      await sleep(config.resetDelay);

      // 768 이하 모드라면: 한 바퀴 끝날 때마다 그룹 전환
      if (isNarrow()) {
        currentSide = (currentSide === 'left') ? 'right' : 'left';
        applyGroupVisibility();
        // reset 후 살짝 대기
        await sleep(150);
      }
    }

    loopRunning = false;
  }

  // 화면 전환/리사이즈에 대응 (루프 재시작)
  function restartLoop() {
    stopLoop = true;
    // 플립 클래스 제거
    section.querySelectorAll('.card.flipped').forEach(c => c.classList.remove('flipped'));
    // 좁은 화면이면 왼쪽부터 시작
    currentSide = 'left';
    applyGroupVisibility();

    // 다음 틱에 루프 재개
    requestAnimationFrame(() => {
      stopLoop = false;
      mainLoop();
    });
  }

  window.addEventListener('resize', () => {
    // 모드가 바뀐 경우만 재시작(너무 잦은 재시작 방지)
    clearTimeout(window.__influencerResizeTimer);
    window.__influencerResizeTimer = setTimeout(restartLoop, 120);
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopLoop = true;
    else if (stopLoop) restartLoop();
  });

  // 초기 진입
  applyGroupVisibility();
  mainLoop();
})();

//membership

document.addEventListener('DOMContentLoaded', () => {
  // 등장 순서: green → red → blue → yellow
  const videos = [
    document.querySelector('.mem768 .green'),
    document.querySelector('.mem768 .red'),
    document.querySelector('.mem768 .blue'),
    document.querySelector('.mem768 .yellow')
  ].filter(Boolean);

  // IntersectionObserver로 스크롤 등장 애니메이션 제어
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const idx = videos.indexOf(entry.target);

      // 순차적으로 지연 등장
      setTimeout(() => {
        entry.target.classList.add('active');
        const v = entry.target.querySelector('video');
        if (v) {
          v.setAttribute('playsinline', '');
          v.setAttribute('loop', '');
          v.setAttribute('muted', '');
          const p = v.play?.();
          if (p && typeof p.catch === 'function') p.catch(() => { });
        }
      }, idx * 400);

      io.unobserve(entry.target);
    });
  }, { threshold: 0.4 });

  videos.forEach(v => io.observe(v));
});

/* -------------------------------
     한방 이미지 ON 상황
------------------------------- */
// === HANBANG SECTION ONLY ===
// === 한방 섹션 전용 ===
// 기존 IIFE 전부 교체
(function () {
  const root = document.querySelector('.hanbang');
  if (!root) return;

  const txtLists = Array.from(root.querySelectorAll('.txt_all > ul'));   // txt1~txt8
  const imgGroups = Array.from(root.querySelectorAll('.img_box > div'));  // img1~img8
  const numSpan = root.querySelector('.num span');
  const txtCol = root.querySelector('.txt_col');    // 텍스트 컬럼 래퍼(1024에서 sticky/scroll)
  const stream = root.querySelector('.txt_stream'); // 텍스트 UL들이 들어있는 스트림

  // 뷰포트 구간
  const mq768 = matchMedia('(max-width:768px)');
  const mq1024 = matchMedia('(min-width:769px) and (max-width:1024px)');

  const TOTAL = Math.min(txtLists.length, imgGroups.length);
  const AUTO_MS = 4000; // 진행바 주기와 동일
  const SLIDE_MS = 600;  // 태블릿에서 한 칸 이동 시간
  const RESUME_MS = 800;  // 클릭/사용자 액션 후 루프 재무장 딜레이

  if (!TOTAL) return;

  // --- 상태 ---
  let index = 0;       // 현재 활성 인덱스
  let autoTimer = null;    // 모바일/데스크톱 자동 회전
  let tabletTimer = null;    // 태블릿 타이머
  let animFrame = null;    // 태블릿 scrollTop RAF
  let isAnimating = false;   // 태블릿 슬라이드 중 여부
  let tabletMode = false;   // 현재 태블릿 모드인지

  // 간단 디바운스
  function debounce(fn, wait) {
    let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), wait); };
  }

  // --- 표시 갱신 (텍스트 on / 이미지 on / 카운터 / 768 높이 보정) ---
  function setActive(i) {
    // 텍스트
    txtLists.forEach(el => el.classList.remove('on'));
    if (txtLists[i]) txtLists[i].classList.add('on');

    // 이미지
    imgGroups.forEach(el => el.classList.remove('on'));
    if (imgGroups[i]) imgGroups[i].classList.add('on');

    // 번호
    if (numSpan) numSpan.textContent = i + 1;

    // 768: 슬롯 높이를 현재 on 아이템 높이에 맞춤(내부 스크롤 방지)
    if (mq768.matches && txtCol) {
      const on = root.querySelector('.txt_all > ul.on');
      if (on) {
        const cs = getComputedStyle(on);
        const h = on.offsetHeight
          + parseFloat(cs.marginTop || '0')
          + parseFloat(cs.marginBottom || '0');
        txtCol.style.height = Math.ceil(h) + 'px';
      }
    }
  }

  const next = () => { index = (index + 1) % TOTAL; setActive(index); };

  // --- 모바일/데스크톱 자동 회전 ---
  function startAuto() { stopAuto(); autoTimer = setInterval(next, AUTO_MS); }
  function stopAuto() { if (autoTimer) { clearInterval(autoTimer); autoTimer = null; } }

  // --- 태블릿 루프(여러 개 보이는 상태에서 한 칸만 위로) ---
  function tabletStep() {
    if (!tabletMode || isAnimating || !stream || !txtCol) return;

    const items = Array.from(stream.querySelectorAll('.txt_all > ul'));
    if (items.length < 2) return;

    // 다음 인덱스 = 두 번째 카드의 스탬프
    const nextIdx = parseInt(items[1].dataset.hbIdx, 10) || 0;
    setActive(nextIdx);

    // 한 칸 높이(마진 포함) 계산
    const first = items[0];
    const cs = getComputedStyle(first);
    const step = first.offsetHeight + parseFloat(cs.marginBottom || '0');

    // 부드러운 scrollTop 애니메이션
    const start = txtCol.scrollTop;
    const end = start + step;
    const t0 = performance.now();
    const ease = (t) => (t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

    cancelAnimationFrame(animFrame);
    isAnimating = true;
    root.classList.add('is-sliding'); // 진행바/버블 애니메이션 일시정지용(선택)

    const tick = (now) => {
      const p = Math.min(1, (now - t0) / SLIDE_MS);
      txtCol.scrollTop = start + (end - start) * ease(p);
      if (p < 1) {
        animFrame = requestAnimationFrame(tick);
      } else {
        // 순환: 첫 요소를 맨 뒤로, 스크롤 리셋
        stream.appendChild(first);
        txtCol.scrollTop = start;
        isAnimating = false;
        root.classList.remove('is-sliding');
        scheduleTablet(); // 다음 사이클 예약
      }
    };
    animFrame = requestAnimationFrame(tick);
  }

  // setInterval 대신 setTimeout 스케줄링(충돌 줄임)
  function scheduleTablet() {
    clearTimeout(tabletTimer);
    if (!tabletMode) return;
    tabletTimer = setTimeout(tabletStep, AUTO_MS);
  }

  function stopTablet() {
    tabletMode = false;
    clearTimeout(tabletTimer); tabletTimer = null;
    cancelAnimationFrame(animFrame); animFrame = null;
    isAnimating = false;
    root.classList.remove('is-sliding');
    // 1024 모드에서 강제로 건드린 인라인 스타일 복구
    if (txtCol) {
      // 768 모드로 전환되는 경우 setActive가 height를 다시 세팅하므로 여기선 비움
      if (!mq768.matches) txtCol.style.height = '';
    }
  }

  function startTablet() {
    stopTablet();
    tabletMode = true;

    // 인덱스 스탬프(불변 ID)
    txtLists.forEach((ul, i) => ul.dataset.hbIdx = String(i));

    // 현재 맨 위 카드 기준 동기화
    const top = stream ? stream.querySelector('.txt_all > ul') : null;
    const topIdx = top ? parseInt(top.dataset.hbIdx, 10) || 0 : 0;
    index = topIdx;
    setActive(index);

    scheduleTablet();
  }

  // --- 클릭 동작 ---
  txtLists.forEach((ul, i) => {
    ul.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      // 태블릿: 해당 카드가 맨 위로 오도록 즉시 점프
      if (mq1024.matches && !mq768.matches) {
        stopAuto();
        clearTimeout(tabletTimer);
        cancelAnimationFrame(animFrame);
        isAnimating = false;

        if (stream) {
          const target = Array.from(stream.children)
            .find(el => parseInt(el.dataset.hbIdx, 10) === i);
          if (target) {
            while (stream.firstElementChild !== target) {
              stream.appendChild(stream.firstElementChild);
            }
          }
        }

        if (txtCol) txtCol.scrollTop = 0;
        index = i;
        setActive(index);

        // 짧은 대기 후 루프 재무장(멈춤 방지)
        setTimeout(() => { if (tabletMode) scheduleTablet(); }, RESUME_MS);
        return;
      }

      // 모바일/데스크톱: 즉시 전환 + 자동 회전 재개
      stopAuto();
      index = i;
      setActive(index);
      startAuto();
    }, { passive: false });
  });

  // --- 모드 전환 ---
  function applyMode() {
    if (mq1024.matches && !mq768.matches) {
      // 태블릿
      stopAuto();     // 다른 루프 종료
      startTablet();  // 태블릿 루프 시작
    } else {
      // 모바일(<=768) 또는 데스크톱(>1024)
      stopTablet();
      setActive(index); // 현재 상태 유지
      startAuto();      // 자동 회전
      // 768 해제 시 인라인 제거
      if (!mq768.matches && txtCol) {
        txtCol.style.height = '';
      }
    }
  }

  // 초기화
  index = 0;
  setActive(index);
  applyMode();

  // 반응형 이벤트
  mq768.addEventListener('change', applyMode);
  mq1024.addEventListener('change', applyMode);
  // 768에서 on 아이템 높이가 레이아웃에 반영되도록 가벼운 보정
  window.addEventListener('resize', debounce(() => {
    if (mq768.matches) setActive(index);
  }, 120));
})();


//banner_2 

document.addEventListener('DOMContentLoaded', () => {
  const bannerImg = document.querySelector('.banner_2 img');
  if (!bannerImg) return;

  const changeBannerImage = () => {
    const isMobile = window.innerWidth <= 440;

    if (isMobile) {
      bannerImg.src = "./asset/img/main/banner02_440.png";
    } else {
      // 👇 기본 데스크톱 이미지 경로
      bannerImg.src = ".//asset/img/main/banner02.png";
    }
  };

  // 최초 1회 실행
  changeBannerImage();

  // 화면 크기 바뀔 때도 자동 갱신
  window.addEventListener('resize', changeBannerImage);
});
