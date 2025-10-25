document.addEventListener('DOMContentLoaded', () => {
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
    flipMs: 800,
    stayMs: 500,
    gapMs: 120,
    resetDelay: 1000,
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


(function(){
  const section = document.querySelector('.product_grid.influencer');
  if (!section) return;

  // 그룹 컨테이너
  const leftGroup  = section.querySelector('.influencer_left');
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
  function getActiveCards(){
    if (isNarrow()){
      // 한 그룹만 (CSS로 다른 쪽은 display:none)
      const container = currentSide === 'left' ? leftGroup : rightGroup;
      return Array.from(container.querySelectorAll('.card'));
    }else{
      // 둘 다
      return Array.from(section.querySelectorAll('.card'));
    }
  }

  // 768 이하에서 그룹 표시 토글
  function applyGroupVisibility(){
    if (!isNarrow()){
      section.classList.remove('show-right');
      return;
    }
    if (currentSide === 'right') section.classList.add('show-right');
    else section.classList.remove('show-right');
  }

  // 순차 플립 1회전 (넘겨받은 카드 배열 대상)
  async function flipOnce(cards){
    for (const card of cards) {
      // hover 중엔 잠깐 대기
      while (isHovered) await sleep(150);

      card.classList.add('flipped');
      await sleep(config.flipMs + config.stayMs);
      card.classList.remove('flipped');
      await sleep(config.gapMs);
    }
  }

  async function mainLoop(){
    if (loopRunning) return;
    loopRunning = true;

    while (!stopLoop){
      const cards = getActiveCards();
      if (cards.length === 0){ await sleep(200); continue; }

      await flipOnce(cards);
      await sleep(config.resetDelay);

      // 768 이하 모드라면: 한 바퀴 끝날 때마다 그룹 전환
      if (isNarrow()){
        currentSide = (currentSide === 'left') ? 'right' : 'left';
        applyGroupVisibility();
        // reset 후 살짝 대기
        await sleep(150);
      }
    }

    loopRunning = false;
  }

  // 화면 전환/리사이즈에 대응 (루프 재시작)
  function restartLoop(){
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

  /* -------------------------------
       한방 이미지 ON 상황
  ------------------------------- */


  const txtBoxes = document.querySelectorAll(".hanbang .txt_all ul");
  const hanbangBtns = document.querySelectorAll('.hanbang .txt_all ul li');
  const imgGroups = document.querySelectorAll(".hanbang .img_box > div");
  const total = txtBoxes.length;
  let currentIndex = 0;

  function updateText(index) {
    txtBoxes.forEach(txt => txt.classList.remove("on"));
    if (txtBoxes[index]) {
      txtBoxes[index].classList.add("on");
    }
  }

  function updateImage(index) {
    imgGroups.forEach(img => img.classList.remove('on'));
    document.querySelector('.num span').innerHTML = index + 1;
    if (imgGroups[index]) {
      imgGroups[index].classList.add('on');
    }
  }

  // 최초 실행
  updateText(currentIndex);
  updateImage(currentIndex);

  // 공통 타이머
  let interHanbang = setInterval(() => {
    currentIndex = (currentIndex + 1) % total;
    updateText(currentIndex);
    updateImage(currentIndex);

    // console.log(currentIndex)
  }, 4000); // 4초 간격

  hanbangBtns.forEach((libtn, i) => {
    libtn.addEventListener('click', () => {
      clearInterval(interHanbang);
      updateText(i);
      updateImage(i);
      interHanbang = setInterval(() => {
        currentIndex = (currentIndex + 1) % total;
        updateText(currentIndex);
        updateImage(currentIndex);
      }, 4000); // 4초 간격
    })
  })

});

//한방 1024

document.addEventListener('DOMContentLoaded', () => {
  const leftList = document.querySelector('.hanbang .txt_left .txt_all'); // <ul>들의 부모
  if (!leftList) return;

  // ====== 설정 ======
  const DURATION_MS = 4000;    // 각 항목 재생 시간(프로그레스와 동일)
  const ANIM_MS     = 600;     // 위로 미는 애니메이션 시간
  const VISIBLE_ROWS = 6;      // 동시에 보일 줄 수(예: 6줄)

  // 1024px 이하에서만 동작
  const mq = window.matchMedia('(max-width: 1024px)');

  let tickerTimer = null;
  let rowGapPx = 0;

  function getRowHeight(el){
    const first = el.querySelector('ul');
    if (!first) return 0;
    const ulStyle = getComputedStyle(first);
    const mb = parseFloat(ulStyle.marginBottom) || 0;
    const h = first.getBoundingClientRect().height;
    return h + mb; // 한 줄 + 행간
  }

  function setViewportHeight(){
    // VISIBLE_ROWS 줄 높이를 합산해 부모 높이로 고정
    const h = getRowHeight(leftList);
    const viewportH = h * Math.min(VISIBLE_ROWS, leftList.children.length);
    leftList.parentElement.style.height = viewportH + 'px'; // .txt_left의 실제 높이 고정
  }

  // playbar 애니메이션 재트리거
  function restartPlaybar(ul){
    const bar = ul.querySelector('.playbar');
    if (!bar) return;
    bar.style.animation = 'none';
    // 강제 리플로우
    // eslint-disable-next-line no-unused-expressions
    bar.offsetWidth;
    bar.style.animation = '';
  }

  function markActiveFirst(){
    [...leftList.children].forEach(ul => ul.classList.remove('on'));
    if (leftList.firstElementChild) {
      leftList.firstElementChild.classList.add('on');
      restartPlaybar(leftList.firstElementChild);
    }
  }

  function slideUpOnce(){
    const first = leftList.firstElementChild;
    if (!first) return;

    const delta = getRowHeight(leftList);

    leftList.style.transition = `transform ${ANIM_MS}ms ease`;
    leftList.style.transform  = `translateY(-${delta}px)`;

    setTimeout(() => {
      // 맨 앞을 뒤로 보내고 위치 리셋
      leftList.appendChild(first);
      leftList.style.transition = 'none';
      leftList.style.transform  = 'translateY(0)';

      // 새 맨 앞을 활성화
      markActiveFirst();
    }, ANIM_MS);
  }

  function startTicker(){
    stopTicker();
    setViewportHeight();
    markActiveFirst();
    tickerTimer = setInterval(slideUpOnce, DURATION_MS);
    window.addEventListener('resize', setViewportHeight);
  }

  function stopTicker(){
    if (tickerTimer) clearInterval(tickerTimer);
    tickerTimer = null;
    leftList.style.transition = 'none';
    leftList.style.transform  = 'translateY(0)';
    window.removeEventListener('resize', setViewportHeight);
  }

  function handleMQ(e){
    if (e.matches) startTicker(); else stopTicker(); // 1024px 이하면 시작, 아니면 정지
  }

  // 초기화
  handleMQ(mq);
  mq.addEventListener('change', handleMQ);

  // 기존 클릭/자동 순환 로직과도 함께 사용 가능
  // (사용 중인 interHanbang과 간섭 없도록 left 컬럼만 이 로직이 돌게 설계)
});
