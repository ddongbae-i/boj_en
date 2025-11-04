gsap.registerPlugin(ScrollTrigger, Flip);

function shuffleChildren(container) {
  const nodes = Array.from(container.children);
  for (let i = nodes.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [nodes[i], nodes[j]] = [nodes[j], nodes[i]];
  }
  nodes.forEach(n => container.appendChild(n));
}

function scatterTiles(tiles) {
  tiles.forEach(t => {
    gsap.set(t, {
      rotation: gsap.utils.random(-15, 15),
      scale: gsap.utils.random(0.88, 1.12),
      x: gsap.utils.random(-60, 60),
      y: gsap.utils.random(-60, 60),
      zIndex: Math.floor(gsap.utils.random(1, 20)),
      boxShadow: "0 10px 20px rgba(0,0,0,0.1)"
    });
  });
}

window.addEventListener('load', () => {
  const section = document.getElementById('puzzleSection');
  const grid = document.getElementById('grid');
  const video = document.getElementById('finalVideo');
  const hintBtn = document.getElementById('scrollHint');
  const tiles = [...grid.children];

  // 🧷 1️⃣ 섞인 상태로 시작
  shuffleChildren(grid);
  scatterTiles(tiles);
  let assembled = false;
  let merged = false;
  let played = false;

  // 🧷 2️⃣ 스크롤 힌트 버튼
  hintBtn?.addEventListener('click', () => {
    window.scrollBy({ top: window.innerHeight * 0.8, left: 0, behavior: 'smooth' });
  });

  // 🧷 3️⃣ ScrollTrigger 생성
  const puzzleScrollTrigger = ScrollTrigger.create({
    trigger: section,
    start: "top top",
    end: "+=300%",
    pin: true,
    scrub: true,
    anticipatePin: 1,
    // markers: true,
    onEnter: () => hintBtn && hintBtn.classList.add('hide'),
    onLeave: () => {
      // 퍼즐 섹션 완전히 벗어나면 필터 표시
      const filters = document.querySelector('.filters');
      if (filters) filters.classList.add('show');
    },
    onEnterBack: () => {
      // 다시 퍼즐 섹션으로 돌아오면 필터 숨김
      const filters = document.querySelector('.filters');
      if (filters) filters.classList.remove('show');
    },
    onUpdate: (self) => {
      const p = self.progress;

      // ✅ (A) 섞인 상태 → 퍼즐 완성
      if (p > 0.05 && p <= 0.33 && !assembled) {
        const state = Flip.getState('.tile');
        const sorted = [...grid.children].sort((a, b) => (+a.dataset.key) - (+b.dataset.key));
        sorted.forEach(el => grid.appendChild(el));
        gsap.set('.tile', { rotation: 0, x: 0, y: 0, scale: 1, zIndex: 1, boxShadow: "0 0 0 rgba(0,0,0,0)" });
        Flip.from(state, { absolute: true, duration: 1.0, ease: "power3.out", stagger: 0.02 });
        assembled = true;
      }

      // ✅ (B) gap/padding 줄이며 합쳐짐
      if (p > 0.33 && p <= 0.66 && !merged) {
        gsap.to(grid, { gap: 0, padding: 0, duration: 1.2, ease: "power2.inOut" });
        gsap.to('.tile', { borderRadius: 0, duration: 1.0, ease: "power2.inOut" });
        merged = true;
      }

      // ✅ (C) 비디오 재생 + 스크롤 고정
      if (p > 0.66 && p <= 1 && !played) {
        gsap.to(grid, { opacity: 0, duration: 0.6, ease: "power2.inOut" });
        gsap.to(video, { opacity: 1, duration: 0.8, ease: "power2.inOut" });

        // 스크롤 잠시 고정
        document.documentElement.style.overflow = 'hidden';
        setTimeout(() => { document.documentElement.style.overflow = ''; }, 1200);

        const play = () => {
          video.currentTime = 0;
          video.play().catch(() => { });
        };
        (video.readyState >= 2) ? play() : video.addEventListener('canplay', play, { once: true });

        played = true;
      }

      // ✅ (D) 역스크롤 시 단계 초기화
      if (p < 0.05 && assembled) {
        assembled = false;
        merged = false;
        played = false;
        video.pause();
        video.style.opacity = 0;
        gsap.set(grid, { opacity: 1, gap: "6px", padding: "6px" });
        scatterTiles(tiles);
      }
    }
  });
});



//shop

const swiper = new Swiper('.sale_zone .swiper', {
  slidesPerView: 'auto',
  freeMode: { enabled: true, momentum: true },
  grabCursor: true,
  navigation: {
    nextEl: '.sale_zone .swiper-button-next',
    prevEl: '.sale_zone .swiper-button-prev',
  },
  resistanceRatio: 0.85,
});

//option

const optionMenu = document.querySelectorAll('.p_right .option');
const optionBtn = document.querySelectorAll('.p_right .option button');

optionBtn.forEach(function (btn, index) {
  btn.addEventListener('click', function () {
    const isActive = optionMenu[index].classList.contains('active');
    optionMenu.forEach(function (p_right) {
      p_right.classList.remove('active');
    });
    if (!isActive) {
      optionMenu[index].classList.add('active');
    }
  })
})


//best seller

const swiperBest = new Swiper('.bestSwiper', {
  loop: true,
  effect: 'fade',
  speed: 300,
  fadeEffect: { crossFade: true },
  navigation: {
    nextEl: '.right_arrow',
    prevEl: '.left_arrow',
  },
});



//더보기

document.addEventListener('DOMContentLoaded', () => {
  const list = document.getElementById('productList');
  const btn = document.getElementById('moreBtn');
  const cards = Array.from(list.querySelectorAll('.pro_card'));

  // 기본값 (데스크톱)
  let INITIAL = 9;
  let BATCH = 6;

  // 화면 크기에 따라 수치 조정
  function updateValues() {
    if (window.innerWidth <= 1024) {
      INITIAL = 8; // 모바일에서 처음 보이는 개수
      BATCH = 4;   // 모바일에서 더보기 단위
    } else {
      INITIAL = 9;
      BATCH = 6;
    }
  }

  // 최초 1회 실행
  updateValues();

  // 리사이즈 시 자동 반영 (선택)
  window.addEventListener('resize', updateValues);

  // 초기 상태 설정
  cards.forEach((card, index) => {
    if (index >= INITIAL) card.classList.add('is-hidden');
  });

  // 더보기 버튼 클릭 시
  btn.addEventListener('click', () => {
    const hidden = cards.filter(card => card.classList.contains('is-hidden'));
    hidden.slice(0, BATCH).forEach(card => card.classList.remove('is-hidden'));

    if (hidden.length <= BATCH) btn.style.display = 'none';
  });
});


//heart

document.querySelectorAll('.pro_card').forEach(card => {
  if (!card.querySelector('.heart_btn')) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'heart_btn';
    btn.setAttribute('aria-label', 'Add to wishlist');
    btn.setAttribute('aria-pressed', 'false');
    card.appendChild(btn);
  }
});

['.product_wrap', '.product_list'].forEach(selector => {
  const container = document.querySelector(selector);
  if (!container) return;

  container.addEventListener('click', (e) => {
    const btn = e.target.closest('.heart_btn');
    if (!btn) return;

    e.stopPropagation();
    e.preventDefault();

    btn.classList.toggle('is-on');
    const on = btn.classList.contains('is-on');
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const addBtns = document.querySelectorAll(".pro_card .add_btn");
  const bagBtn = document.querySelector(".bag");

  const bagCount = document.createElement("span");
  bagCount.classList.add("bag_count");
  bagCount.textContent = "0";
  bagBtn.appendChild(bagCount);

  let count = 0;

  addBtns.forEach(btn => {
    btn.addEventListener("click", e => {
      e.preventDefault();
      count++;
      bagCount.textContent = count;
      bagCount.style.display = "flex";
    });
  });
});

document.querySelectorAll('.all_product .add_btn').forEach(btn => {
  btn.addEventListener('mouseenter', () => {
    btn.style.backgroundColor = 'black';
    btn.style.color = 'white';

    const img = btn.querySelector('img');
    if (img) {
      img.style.filter = 'brightness(0) invert(1)';
    }
  });

  btn.addEventListener('mouseleave', () => {
    btn.style.backgroundColor = '';
    btn.style.color = '';

    const img = btn.querySelector('img');
    if (img) {
      img.style.filter = '';
    }
  });
});

//filter

(() => {
  const filters = document.querySelector('.filters');
  const panel = document.getElementById('filters-panel');
  const openBtn = filters?.querySelector('.open');
  if (!filters || !panel || !openBtn) return;

  // 상태 적용 헬퍼
  const setPanel = (open) => {
    panel.hidden = !open;                        // aria-hidden 대응
    filters.classList.toggle('active', open);    // 필요 시 스타일용
    openBtn.classList.toggle('is-open', open);   // 아이콘 전환용
    openBtn.setAttribute('aria-expanded', String(open));
  };

  // 아코디언 헤더(섹션 타이틀) 이벤트 – 한 번만 바인딩
  document.querySelectorAll('.filters_group .filter_tit').forEach((tit) => {
    if (tit.dataset.bound === '1') return;
    tit.dataset.bound = '1';
    tit.setAttribute('role', 'button');
    tit.setAttribute('tabindex', '0');

    const toggle = () => {
      if (window.innerWidth > 1024) return; // 데스크탑 모드에서는 무시
      tit.closest('.filters_group').classList.toggle('is-open');
    };

    tit.addEventListener('click', toggle);
    tit.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
    });
  });

  if (!openBtn.dataset.bound) {
    openBtn.dataset.bound = '1';
    openBtn.addEventListener('click', () => {
      const willOpen = panel.hasAttribute('hidden');
      setPanel(willOpen);
    });
  }

  const applyMode = () => {
    const isMobile = window.innerWidth <= 1024;

    if (isMobile) {
      setPanel(false);
      document.querySelectorAll('.filters_group').forEach(g => g.classList.remove('is-open'));
      setPanel(true);
      document.querySelectorAll('.filters_group').forEach(g => g.classList.add('is-open'));
    }
  };

  applyMode();
  let rid;
  window.addEventListener('resize', () => {
    cancelAnimationFrame(rid);
    rid = requestAnimationFrame(applyMode);
  });
})();