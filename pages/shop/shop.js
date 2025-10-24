gsap.registerPlugin(ScrollTrigger, Flip);

function shuffleChildren(container){
  const nodes = Array.from(container.children);
  for(let i=nodes.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [nodes[i], nodes[j]] = [nodes[j], nodes[i]];
  }
  nodes.forEach(n => container.appendChild(n));
}

function scatterTiles(tiles){
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
  const grid    = document.getElementById('grid');
  const video   = document.getElementById('finalVideo');
  const hintBtn = document.getElementById('scrollHint');
  const tiles   = [...grid.children];

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
  ScrollTrigger.create({
    trigger: section,
    start: "top top",
    end: "+=300%",
    pin: true,
    scrub: true,
    anticipatePin: 1,
    // markers: true,
    onEnter: () => hintBtn && hintBtn.classList.add('hide'),
    onUpdate: (self) => {
      const p = self.progress;

      // ✅ (A) 섞인 상태 → 퍼즐 완성
      if (p > 0.05 && p <= 0.33 && !assembled) {
        const state = Flip.getState('.tile');
        const sorted = [...grid.children].sort((a,b)=> (+a.dataset.key) - (+b.dataset.key));
        sorted.forEach(el => grid.appendChild(el));
        gsap.set('.tile', { rotation:0, x:0, y:0, scale:1, zIndex:1, boxShadow:"0 0 0 rgba(0,0,0,0)" });
        Flip.from(state, { absolute:true, duration:1.0, ease:"power3.out", stagger:0.02 });
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
          video.play().catch(()=>{}); 
        };
        (video.readyState >= 2) ? play() : video.addEventListener('canplay', play, { once:true });

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
  slidesPerView: 'auto',     // 카드 폭 고정 + 여러 장 보이기
  freeMode: { enabled: true, momentum: true },
  grabCursor: true,
  navigation: {
    nextEl: '.sale_zone .swiper-button-next',
    prevEl: '.sale_zone .swiper-button-prev',
  },
  // 필요시 모바일만 더 부드럽게
  resistanceRatio: 0.85,
});
//option

const optionMenu = document.querySelectorAll('.option ul li');
const optionBtn = document.querySelectorAll('.p_right .option button');

optionBtn.forEach(function (btn, index) {
    btn.addEventListener('click', function () {
        const isActive = selectMenuAll[index].classList.contains('active');
        //contains - 클래스 리스트에 active가 포함되어 있는가
        console.log(isActive)
        //모두닫기
        optionMenu.forEach(function (p_right) {
            p_right.classList.remove('active');
        });
        //클릭한게 원래 열려있지 않았다면 다시 열기
        if (!isActive) {
            optionMenu[index].classList.add('active');
        }
    })
})

