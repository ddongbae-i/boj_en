AOS.init({
  duration: 1200, // 애니메이션 시간(ms)
  once: false, // 스크롤 시 한 번만 실행
});

let locked = false; // 락 여부 플래그
const main = document.querySelector(".main");
const subMain2 = document.querySelector(".sub_main2");

// 천천히 스크롤 이동 (duration: 이동 시간 ms)
function smoothScrollTo(targetY, duration = 1000) { // 1000ms = 1초
  const startY = window.scrollY;
  const distance = targetY - startY;
  let startTime = null;

  function animation(currentTime) {
    if (!startTime) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    const progress = Math.min(timeElapsed / duration, 1);

    // easeInOutQuad 적용 (자연스러운 가속/감속)
    const ease = progress < 0.5
      ? 2 * progress * progress
      : -1 + (4 - 2 * progress) * progress;

    window.scrollTo(0, startY + distance * ease);

    if (timeElapsed < duration) {
      requestAnimationFrame(animation);
    }
  }

  requestAnimationFrame(animation);
}

document.addEventListener("scroll", () => {
  const scrollY = window.scrollY;
  const mainHeight = main.offsetHeight;
  const subMain2Top = subMain2.offsetTop;

  // sub_main2에 도달하면 락 해제
  if (scrollY >= subMain2Top) {
    locked = false;
    return;
  }

  // 이미 락이 걸렸으면 sub_main 위치에 고정
  if (locked) {
    window.scrollTo({
      top: mainHeight,
      behavior: "auto"
    });
    return;
  }

  // 스크롤이 main 높이의 30% 이상 내려가면 sub_main으로 자동 이동
  if (scrollY > mainHeight * 0.3 && scrollY < mainHeight) {
    smoothScrollTo(mainHeight, 1000); // 1초 동안 천천히 이동
    locked = true;
  }
});



/* 영상  */

/* 
document.addEventListener('DOMContentLoaded', () => {
  const subMain = document.querySelector('.sub_main');
  const subMain2 = document.querySelector('.sub_main2');
  const introVideo = document.querySelector('.intro_video');
  if (!subMain || !subMain2 || !introVideo) return;
  
  const goToSubMain2 = () => {
    gsap.to(subMain, {
      opacity: 0,
      duration: 0.5,
      ease: 'power2.inOut',
      onComplete: () => {
        subMain.style.display = 'none';
        subMain2.classList.add('active');
        subMain2.style.display = 'flex';
        gsap.fromTo(subMain2, { opacity: 0, y: 30 }, {
          opacity: 1, y: 0, duration: 0.8, ease: 'power2.out',
          onStart: () => { if (window.AOS) AOS.refresh(); }
        });
      }
    });
  };

  subMain.addEventListener('click', () => {
    introVideo.style.display = 'block';
    introVideo.currentTime = 0;
    introVideo.play();

    introVideo.onended = () => {
      introVideo.style.display = 'none';
      goToSubMain2();
    };

    // (원하면 영상 도중에도 sub_main 클릭 막기)
    subMain.style.pointerEvents = 'none';
  });
});

 */



// 1. DOM 요소 선택
const filterItems = document.querySelectorAll(".product_filter li");
const bannerTitle = document.querySelector(".banner1_left h2");
const bannerList = document.querySelector(".banner1_left ul");
const bannerDesc = document.querySelector(".banner1_right p");

// 2. 각 성분별 데이터 정의
const bannerData = {
  Ginseng: {
    title: "Ginseng Line",
    list: [
      { sub_tit: "Name", sub_txt: "Ginseng" },
      { sub_tit: "Origins", sub_txt: "Korea" },
      { sub_tit: "Key Benefits", sub_txt: "Boosts elasticity and Brightens" }
    ],
    desc: "A prized Hanbang ingredient, Ginseng is packed with antioxidants and saponins, helping to firm, energize, and brighten tired skin. Known for its anti-aging properties, it enhances circulation and restores a youthful glow."
  },
  Rice: {
    title: "Rice Line",
    list: [
      { sub_tit: "Name", sub_txt: "Rice" },
      { sub_tit: "Origins", sub_txt: "Korea" },
      { sub_tit: "Key Benefits", sub_txt: "Moisturizing and Brightening" }
    ],
    desc: "Rice extracts deeply hydrate and nourish the skin while promoting a clear, radiant complexion. Its natural brightening properties help maintain a healthy glow."
  },
  GreenPlum: {
    title: "Green Plum Line",
    list: [
      { sub_tit: "Name", sub_txt: "Green Plum" },
      { sub_tit: "Origins", sub_txt: "Korea" },
      { sub_tit: "Key Benefits", sub_txt: "Hydrating and Revitalizing" }
    ],
    desc: "Green Plum provides antioxidant protection and refreshes tired skin, enhancing vitality and a youthful feel."
  },
  Propolis: {
    title: "Propolis Line",
    list: [
      { sub_tit: "Name", sub_txt: "Propolis" },
      { sub_tit: "Origins", sub_txt: "Korea" },
      { sub_tit: "Key Benefits", sub_txt: "Soothing and Protective" }
    ],
    desc: "Propolis helps calm irritated skin, strengthen the skin barrier, and maintain moisture for soft, healthy skin."
  },
  RedBean: {
    title: "Red Bean Line",
    list: [
      { sub_tit: "Name", sub_txt: "Red Bean" },
      { sub_tit: "Origins", sub_txt: "Korea" },
      { sub_tit: "Key Benefits", sub_txt: "Brightening and Detoxifying" }
    ],
    desc: "Red Bean extract purifies and brightens the complexion while providing gentle nourishment to maintain a clear skin tone."
  },
  Mugwort: {
    title: "Mugwort Line",
    list: [
      { sub_tit: "Name", sub_txt: "Mugwort" },
      { sub_tit: "Origins", sub_txt: "Korea" },
      { sub_tit: "Key Benefits", sub_txt: "Calming and Anti-inflammatory" }
    ],
    desc: "Mugwort soothes sensitive skin, reduces redness, and helps restore skin balance."
  },
  GreenTea: {
    title: "Green Tea Line",
    list: [
      { sub_tit: "Name", sub_txt: "Green Tea" },
      { sub_tit: "Origins", sub_txt: "Korea" },
      { sub_tit: "Key Benefits", sub_txt: "Antioxidant and Refreshing" }
    ],
    desc: "Green Tea extract protects skin from free radicals, revitalizes, and keeps the skin refreshed and youthful."
  },
  CentellaAsiatica: {
    title: "Centella Asiatica Line",
    list: [
      { sub_tit: "Name", sub_txt: "Centella Asiatica" },
      { sub_tit: "Origins", sub_txt: "Korea" },
      { sub_tit: "Key Benefits", sub_txt: "Healing and Moisturizing" }
    ],
    desc: "Centella Asiatica accelerates skin recovery, enhances barrier function, and deeply hydrates for resilient, healthy skin."
  }
};

// 3. 클릭 이벤트 설정
filterItems.forEach(item => {
  item.addEventListener("click", () => {
    // 3-1. active 클래스 갱신
    filterItems.forEach(i => i.classList.remove("active"));
    item.classList.add("active");

    const key = item.textContent.trim();
    if (bannerData[key]) {
      // 3-2. 배너 제목 변경
      bannerTitle.textContent = bannerData[key].title;

      // 3-3. 리스트 내용 변경
      bannerList.innerHTML = ""; // 기존 삭제
      bannerData[key].list.forEach(obj => {
        const li = document.createElement("li");
        li.innerHTML = `<span class="sub_tit">${obj.sub_tit}</span><span class="sub_txt">${obj.sub_txt}</span>`;
        bannerList.appendChild(li);
      });

      // 3-4. 설명 텍스트 변경
      bannerDesc.textContent = bannerData[key].desc;
    }

    // 3-5. product_card 표시 (선택한 카테고리만)
    const allCards = document.querySelectorAll(".product_card");
    allCards.forEach(card => card.style.display = "none");

    const activeCards = document.querySelectorAll(`.product_card.${key.toLowerCase()}`);
    activeCards.forEach(card => card.style.display = "block");
  });
});





/*  let locked = false; // 락 여부 플래그

const main = document.querySelector(".main");
const subMain = document.querySelector(".sub_main");
const subMain2 = document.querySelector(".sub_main2");

document.addEventListener("scroll", () => {
    const scrollY = window.scrollY;
    const mainHeight = main.offsetHeight;
    const subMain2Top = subMain2.offsetTop;

    // sub_main2에 도달하면 락 해제
    if (scrollY >= subMain2Top) {
        locked = false;
        return;
    }

    // 이미 락이 걸렸으면 sub_main 위치에 고정
    if (locked) {
        window.scrollTo({
            top: mainHeight,
            behavior: "auto" // 순간적으로 위치 고정
        });
        return;
    }

    // 스크롤이 main 높이의 30% 이상 내려가면 sub_main으로 자동 이동
    if (scrollY > mainHeight * 0.3 && scrollY < mainHeight) {
        
        window.scrollTo({
            top: mainHeight,
            behavior: "smooth",
        });
        locked = true; // 락 걸림
    }
});  */



document.addEventListener("DOMContentLoaded", () => {
  // 1. 하트 클릭 이벤트
  const hearts = document.querySelectorAll(".product_card .heart img");
  hearts.forEach((heart) => {
    heart.addEventListener("click", (e) => {
      e.stopPropagation(); // 카드 클릭 이벤트와 겹치지 않도록 방지
      heart.classList.toggle("liked"); // liked 클래스 토글

      if (heart.classList.contains("liked")) {
        heart.src = "./img/mini_icon_heart_hover.svg"; // 찜 완료 아이콘
      } else {
        heart.src = "./img/heart1.svg"; // 원래 아이콘
      }
    });

  });

  // 2. ADD TO BAG 클릭 이벤트
  const addBtns = document.querySelectorAll(".product_card .add_btn");
  addBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault(); // a 태그 기본 링크 막기
      const productName = btn.closest(".product_card").querySelector("h3").innerText;
      alert(`${productName}이(가) 장바구니에 추가되었습니다.`);
      // 실제 장바구니 로직 구현 시 여기에 코드를 추가
    });
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const filterItems = document.querySelectorAll(".product_filter li");

  // 페이지 로드 시 Ginseng 활성화
  filterItems.forEach(item => {
    if (item.textContent.trim() === "Ginseng") {
      item.classList.add("active");
    }
  });

  // 클릭 이벤트
  filterItems.forEach(item => {
    item.addEventListener("click", () => {
      // 모든 탭 active 제거
      filterItems.forEach(i => i.classList.remove("active"));
      // 클릭한 탭 active 추가
      item.classList.add("active");

      // 선택된 탭 텍스트 확인 (필터용)
      const filterText = item.textContent.trim().toLowerCase();

      // 모든 제품 카드 선택
      const productCards = document.querySelectorAll(".product_card");

      // 필터 적용
      productCards.forEach(card => {
        // 예: 카드에 ginseng, rice 등 클래스가 있어야 함
        if (card.classList.contains(filterText)) {
          card.style.display = "block";
        } else {
          card.style.display = "none";
        }
      });
    });
  });
});


/*________________________sub_main2 */
/*  document.addEventListener('DOMContentLoaded', () => {
    const subMain = document.querySelector('.sub_main');
    const subMain2 = document.querySelector('.sub_main2');
    if (!subMain || !subMain2) return;

    // 클릭 가능 표시 및 키보드 접근성
    subMain.style.cursor = 'pointer';
    if (!subMain.hasAttribute('tabindex')) subMain.setAttribute('tabindex', '0');

    const goToSubMain2 = () => {
        subMain2.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    subMain.addEventListener('click', goToSubMain2);
    subMain.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            goToSubMain2();
        }
    });
});  */


document.addEventListener('DOMContentLoaded', () => {
  const octs = document.querySelectorAll('.octagon');
  const side = document.getElementById('sideInfo');
  const details = document.getElementById('details');
  if (!octs.length || !side) return;

  const defaultSide = side.dataset.default || side.textContent;
  const defaultDetails = details ? (details.dataset.default || details.innerHTML) : '';

  octs.forEach(o => {
    const name = o.dataset.name || '';
    const desc = o.dataset.desc || '';

    const show = () => {
      side.textContent = name || defaultSide;
      if (details) { details.innerHTML = desc || defaultDetails; }
      o.classList.add('hover');
      details.classList.add('hover');
    };
    const hide = () => {
      side.textContent = defaultSide;
      if (details) { details.innerHTML = defaultDetails; }
      o.classList.remove('hover');
      details.classList.remove('hover');
    };

    o.addEventListener('mouseenter', show);
    o.addEventListener('focus', show);
    o.addEventListener('mouseleave', hide);
    o.addEventListener('blur', hide);

    // 모바일용: 한 번 터치하면 표시, 다시 터치하면 해제
    let tapped = false;
    o.addEventListener('touchstart', (e) => {
      tapped = !tapped;
      if (tapped) show();
      else hide();
    }, { passive: true });
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const subMainImg = document.querySelector('.sub_main_img');
  const subMain = document.querySelector('.sub_main');
  const subMain2 = document.querySelector('.sub_main2');

  if (!subMainImg || !subMain || !subMain2) return;

  subMainImg.addEventListener('click', () => {
    gsap.to(subMain, {
      opacity: 0,
      duration: 0.5,
      ease: 'power2.inOut',
      onComplete: () => {
        subMain.style.display = 'none';

        // sub_main2 보이기
        subMain2.classList.add('active');
        subMain2.style.display = 'flex'; // 필요시
        gsap.fromTo(subMain2, { opacity: 0, y: 30 }, {
          opacity: 1, y: 0, duration: 0.8, ease: 'power2.out',
          onStart: () => {
            // AOS에 새로 보이는 요소들을 재계산하라고 알림
            if (window.AOS) AOS.refresh(); // 또는 AOS.refreshHard();
          }
        });

        // 스크롤 이동 등...
      }
    });
  });
});