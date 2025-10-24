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
  const cards = Array.from(document.querySelectorAll('.influencer .card'));
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
    if (influencerEl) {
      influencerEl.addEventListener('pointerenter', () => (isHovered = true));
      influencerEl.addEventListener('pointerleave', () => (isHovered = false));
    }

    const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

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

  /* -------------------------------
      🟣 3. 인플루언서 찜(하트) 기능
  ------------------------------- */
  const KEY = 'wish:list';
  const store = JSON.parse(localStorage.getItem(KEY) || '{}');

  const getId = (btn) => {
    if (btn.dataset.id) return btn.dataset.id;
    const card = btn.closest('.card');
    if (!card) return null;
    const idClass = [...card.classList].find((c) => /^card_\d+$/.test(c));
    return idClass || null;
  };

  const applyState = (btn, on) => {
    btn.classList.toggle('active', on);
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
  };

  document.querySelectorAll('.influencer .wish').forEach((btn) => {
    const id = getId(btn);
    const on = id ? store[id] === true : false;
    applyState(btn, on);

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const nowOn = !btn.classList.contains('active');
      applyState(btn, nowOn);
      const key = getId(btn);
      if (key) {
        store[key] = nowOn;
        localStorage.setItem(KEY, JSON.stringify(store));
      }
    });
  });


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
