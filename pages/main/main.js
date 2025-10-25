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

(function () {
  const MQ = matchMedia('(max-width:1024px)');

  /* 타이밍 */
  const PROGRESS_MS = 4000;                 // CSS fill-bar와 동일
  const SLIDE_MS = 600;                  // 카드가 위로 올라가는 시간
  const EASE = 'cubic-bezier(.2,.8,.2,1)';
  const RESUME_IDLE = 600;                  // 사용자가 스크롤/스와이프 후 재무장 딜레이

  let cleanup = null;
  let inFlight = false;

  /* 안전한 이미지 전환 */
  const updateImageSafe =
    (typeof window.updateImage === 'function')
      ? window.updateImage
      : (i) => {
        const groups = document.querySelectorAll('.hanbang .img_box > div');
        groups.forEach((g, idx) => g.classList.toggle('on', idx === i));
        const n = document.querySelector('.hanbang .num span');
        if (n) n.textContent = i + 1;
      };

  /* 셀렉터 유틸 */
  const sel = {
    root: () => document.querySelector('.hanbang'),
    container: () => document.querySelector('.hanbang .txt_col'),
    stream: () => document.querySelector('.hanbang .txt_stream'),
    items: (s) => Array.from(s.querySelectorAll('.txt_all ul')),
    all: () => Array.from(document.querySelectorAll('.hanbang .txt_all ul')),
  };

  function stampIndices() { sel.all().forEach((ul, i) => ul.dataset.hbIdx = String(i)); }

  /* 맨 위만 on + playbar 강제 0% 재시작 */
  function setOnlyFirstOn(stream) {
    const arr = sel.items(stream);

    arr.forEach(ul => {
      const pb = ul.querySelector('.progress .playbar');
      if (pb) { pb.style.animation = ''; pb.style.width = ''; }
    });

    arr.forEach((el, i) => el.classList.toggle('on', i === 0));
    const top = arr[0] || null;

    if (top) {
      const topBar = top.querySelector('.progress .playbar');
      if (topBar) {
        topBar.style.animation = 'none';
        void topBar.offsetWidth;  // reflow
        topBar.style.animation = '';   // CSS 규칙으로 재시작
        topBar.style.width = '';
      }
    }
    return top;
  }

  /* 스크롤 위치 기준으로 현재 보이는 카드가 맨 위가 되도록 DOM 재정렬 */
  function normalizeTopByScroll(container, stream) {
    const arr = sel.items(stream); if (!arr.length) return null;
    const base = container.scrollTop;
    let closest = arr[0], min = Math.abs(arr[0].offsetTop - base);
    for (let i = 1; i < arr.length; i++) {
      const d = Math.abs(arr[i].offsetTop - base);
      if (d < min) { min = d; closest = arr[i]; }
    }
    while (sel.items(stream)[0] !== closest) {
      stream.appendChild(sel.items(stream)[0]);
    }
    container.scrollTo({ top: 0, behavior: 'instant' });
    return closest;
  }

  /* 진행바 0%부터 다시 시작 */
  function restartBar(bar, durMs) {
    bar.style.animation = 'none';
    bar.style.width = '';
    void bar.offsetWidth;
    bar.style.animation = `fill-bar ${durMs}ms linear forwards`;
  }

  /* 진행바 리드 타이머로 ‘한 번만’ 슬라이드 트리거 */
  function armByProgress(topUl, advance) {
    const bar = topUl?.querySelector('.progress .playbar');
    if (!bar) return;

    // 기존 onanimationend 제거
    document.querySelectorAll('.hanbang .txt_all .playbar').forEach(pb => pb.onanimationend = null);

    const LEAD = Math.max(0, PROGRESS_MS - SLIDE_MS - 50); // 조금 앞당김
    restartBar(bar, PROGRESS_MS);

    let fired = false;

    const leadTimer = setTimeout(() => {
      if (fired) return;
      fired = true;
      bar.onanimationend = null;
      advance();
    }, LEAD);

    // 백업: 리드가 혹시 실패해도 1회 보장
    bar.onanimationend = () => {
      if (fired) return;
      fired = true;
      clearTimeout(leadTimer);
      advance();
    };
  }

  /* 한 스텝: 슬라이드 동안 pause → 이미지 페이드 + 카드 상승 → 순환 → 다음 무장 */
  function makeAdvance(container, stream) {
    return function advance() {
      if (inFlight) return;
      inFlight = true;

      const root = sel.root();
      const list = sel.items(stream);
      if (!list.length) { inFlight = false; return; }

      const first = list[0];
      const second = list[1] || list[0];
      const nextIdx = parseInt(second.dataset.hbIdx, 10) || 0;

      // 슬라이드 시작 프레임: 이미지 동기 + 전체 pause
      root.classList.add('is-sliding');
      updateImageSafe(nextIdx);

      // 컨테이너 기준 정확한 한 칸 거리
      const contRect = container.getBoundingClientRect();
      const firstRect = first.getBoundingClientRect();
      const secondRect = second.getBoundingClientRect();
      let step = Math.round((secondRect.top - contRect.top) - (firstRect.top - contRect.top));
      if (step <= 0) {
        const mb = parseFloat(getComputedStyle(first).marginBottom || '0');
        step = Math.round(firstRect.height + mb);
      }

      const canScroll = container.scrollHeight > container.clientHeight + 1;

      const finish = () => {
        // 1) 첫 항목 뒤로
        const fresh = sel.items(stream);
        if (fresh.length) {
          const firstNow = fresh[0];
          const tail = fresh[fresh.length - 1];
          tail.parentNode.appendChild(firstNow);
        }
        // 2) 위치 리셋
        if (canScroll) container.scrollTop = 0;
        else {
          stream.style.transition = 'none';
          stream.style.transform = 'translateY(0)';
        }
        // 3) 새 맨 위 on + playbar 0% 재시작
        const newTop = setOnlyFirstOn(stream);
        // 4) pause 해제
        root.classList.remove('is-sliding');
        // 5) 다음 사이클 무장
        armByProgress(newTop, advance);
        inFlight = false;
      };

      if (canScroll) {
        // scrollTop 애니메이션
        const start = container.scrollTop;
        const end = start + step;
        const ease = (t) => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; // easeInOutQuad
        let rafId = null, t0 = performance.now();
        const tick = (now) => {
          const p = Math.min(1, (now - t0) / SLIDE_MS);
          const k = ease(p);
          container.scrollTop = start + (end - start) * k;
          if (p < 1) rafId = requestAnimationFrame(tick);
          else finish();
        };
        rafId = requestAnimationFrame(tick);
      } else {
        // translateY 애니메이션
        stream.style.transition = `transform ${SLIDE_MS}ms ${EASE}`;
        stream.style.transform = `translateY(-${step}px)`;
        const onEnd = () => { stream.removeEventListener('transitionend', onEnd); finish(); };
        stream.addEventListener('transitionend', onEnd, { once: true });
      }
    };
  }

  /* 1024 모드 시작/종료 */
  function startTablet() {
    const root = sel.root();
    const container = sel.container();
    const stream = sel.stream();
    if (!root || !container || !stream) return;

    // 혹시 남아 있던 pause 해제
    root.classList.remove('is-sliding');

    // 데스크톱 인터벌 중지(있다면)
    if (window.interHanbang) { try { clearInterval(window.interHanbang); } catch (e) { } window.interHanbang = null; }

    stampIndices();

    // 초기 정렬/활성/이미지 동기
    const top0 = normalizeTopByScroll(container, stream) || setOnlyFirstOn(stream);
    const idx0 = top0 ? parseInt(top0.dataset.hbIdx, 10) || 0 : 0;
    updateImageSafe(idx0);

    const advance = makeAdvance(container, stream);

    // ✅ 첫 사이클 무장: 진행바 리드 타이머 기반
    armByProgress(setOnlyFirstOn(stream), advance);

    // 사용자 스크롤/스와이프: 잠시 pause → 손 떼면 정렬 후 재무장
    let idle = null;
    const pause = () => {
      root.classList.add('is-sliding');
      if (idle) clearTimeout(idle);
      idle = setTimeout(() => {
        const nowTop = normalizeTopByScroll(container, stream) || setOnlyFirstOn(stream);
        const idx = nowTop ? parseInt(nowTop.dataset.hbIdx, 10) || 0 : 0;
        updateImageSafe(idx);
        root.classList.remove('is-sliding');
        armByProgress(nowTop, advance);
      }, RESUME_IDLE);
    };
    container.addEventListener('touchstart', pause, { passive: true });
    container.addEventListener('touchend', pause, { passive: true });
    container.addEventListener('wheel', pause, { passive: true });

    cleanup = () => {
      container.removeEventListener('touchstart', pause);
      container.removeEventListener('touchend', pause);
      container.removeEventListener('wheel', pause);
      root.classList.remove('is-sliding');
      sel.all().forEach(ul => {
        const b = ul.querySelector('.progress .playbar');
        if (b) b.onanimationend = null;
      });
      stream.style.transition = '';
      stream.style.transform = '';
      inFlight = false;
    };
  }

  function stopTablet() { if (cleanup) { cleanup(); cleanup = null; } }

  function choose() { MQ.matches ? startTablet() : stopTablet(); }
  addEventListener('load', choose);
  MQ.addEventListener('change', choose);
})();
