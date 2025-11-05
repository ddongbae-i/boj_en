AOS.init({
  duration: 800,
  once: false,
  offset: 100,
  mirror: true,
});

document.addEventListener('DOMContentLoaded', () => {
  const community = document.querySelector('.community');

  // 초기에는 data-aos 속성 제거해서 애니메이션 비활성화
  community.querySelectorAll('[data-aos]').forEach(el => {
    // 애니 속성 백업
    el.dataset.aosBackup = el.getAttribute('data-aos');
    el.removeAttribute('data-aos');
  });

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // 커뮤니티 영역 보이면 data-aos 복구해 애니메이션 재활성화
        community.querySelectorAll('[data-aos-backup]').forEach(el => {
          el.setAttribute('data-aos', el.dataset.aosBackup);
          el.removeAttribute('data-aos-backup');
        });
        if (window.AOS) {
          AOS.refresh(); // AOS 리프레시로 활성화
        }
      }
    });
  }, { threshold: 0.1 });

  if (community) {
    observer.observe(community);
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const subMain = document.querySelector('.sub_main');
  const subMain2 = document.querySelector('.sub_main2');
  const subMainImg = document.querySelector('.sub_main_img');

  if (subMain2) {
    subMain2.classList.remove('active');
    subMain2.style.display = 'none';
    subMain2.style.opacity = 0;
    subMain2.style.transition = 'opacity 0.5s ease';
  }

  window.scrollTo(0, 0);
  locked = false;

  if (subMainImg) {
    subMainImg.addEventListener('click', () => {
      if (subMain) {
        subMain.style.transition = 'opacity 0.5s ease';
        subMain.style.opacity = 0;

        setTimeout(() => {
          subMain.style.display = 'none';

          if (subMain2) {
            subMain2.style.display = 'flex';
            subMain2.classList.add('active');
            setTimeout(() => {
              subMain2.style.opacity = 1;

              // AOS 재초기화 타이밍
              if (window.AOS) window.AOS.refresh();
            }, 20);
          }
        }, 500);
      }
      locked = false;
    });
  }
});

/* document.addEventListener('DOMContentLoaded', () => {
  const subMain = document.querySelector('.sub_main');
  const subMain2 = document.querySelector('.sub_main2');
  const subMainImg = document.querySelector('.sub_main_img');

  if (subMain2) {
    subMain2.classList.remove('active');
    subMain2.style.display = 'none';
    
  }

  window.scrollTo(0, 0);
  locked = false;

  if (subMainImg) {
    subMainImg.addEventListener('click', () => {
      if (subMain) subMain.style.display = 'none';
      if (subMain2) {
        subMain2.classList.add('active');
        subMain2.style.display = 'flex';
      }
      locked = false;
      if (window.AOS) AOS.refresh();
    });
  }
}); */
/* document.addEventListener('DOMContentLoaded', () => {
  const subMain = document.querySelector('.sub_main');
  const subMain2 = document.querySelector('.sub_main2');
  const subMainImg = document.querySelector('.sub_main_img');
  const introVideo = document.querySelector('.intro_video');

  if (subMain2) {
    subMain2.classList.remove('active');
    subMain2.style.display = 'none';
  }

  window.scrollTo(0, 0);
  locked = false;

  if (subMainImg) {
    subMainImg.addEventListener('click', () => {
      if (introVideo) {
        introVideo.style.display = 'block';
        introVideo.currentTime = 0;
        introVideo.play();

        introVideo.onended = () => {
          introVideo.style.display = 'none';
          // sub_main 숨기고 sub_main2 보이기
          if(subMain) subMain.style.display = 'none';
          if(subMain2) {
            subMain2.classList.add('active');
            subMain2.style.display = 'flex';
          }

          locked = false;
          window.scrollTo({ top: 0, behavior: 'smooth' });
          if(window.AOS) AOS.refresh();
        };
      } else {
        // 영상 없으면 바로 전환
        if(subMain) subMain.style.display = 'none';
        if(subMain2) {
          subMain2.classList.add('active');
          subMain2.style.display = 'flex';
        }
        locked = false;
        window.scrollTo({ top: 0, behavior: 'smooth' });
        if(window.AOS) AOS.refresh();
      }
    });
  }
}); */


/* let locked = false; // 락 여부 플래그
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
  if (scrollY > mainHeight * 0.15 && scrollY < mainHeight) {
    smoothScrollTo(mainHeight, 1000); // 1초 동안 천천히 이동
    locked = true;
  }
});

//클릭 시 sub_main2 전환 
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
 */
/*  수정 전  sub_main  위 내용.*/
/* 영상  
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



// 필터 클릭 
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

// 하트 클릭 이벤트
document.addEventListener("DOMContentLoaded", () => {
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
  /*   const addBtns = document.querySelectorAll(".product_card .add_btn");
    addBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault(); // a 태그 기본 링크 막기
        const productName = btn.closest(".product_card").querySelector("h3").innerText;
        alert(`${productName}이(가) 장바구니에 추가되었습니다.`);
        // 실제 장바구니 로직 구현 시 여기에 코드를 추가
      });
    }); */

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

/*_____________________________________________ tags color */
const wordColors = {
  'Moisturizing': { color: '#5c0000ff', background: '#ffe5e571', border: '#D18B8B' },
  'Firming': { color: '#204500', background: '#e0fffa77', border: '#204500' },
  'Hydrating': { color: '#C1843A', background: '#fff7cc6b', border: '#E8BA88' },
  'Soothing': { color: '#818181ff', background: '#e5dccf42', border: '#E5DCCF' },
  'Brightening': { color: '#4c935aff', background: '#e0f7e7ff', border: '#4c9358ff' }

};

document.querySelectorAll('.tags span').forEach(span => {
  const word = span.textContent.trim();
  const style = wordColors[word];

  if (!style) return;

  const originalColor = span.style.color || window.getComputedStyle(span).color;
  const originalBg = span.style.backgroundColor || window.getComputedStyle(span).backgroundColor;
  const originalBorder = span.style.borderColor || window.getComputedStyle(span).borderColor;

  span.addEventListener('mouseenter', () => {
    span.style.color = style.color;
    span.style.backgroundColor = style.background;
    span.style.borderColor = style.border;
  });

  span.addEventListener('mouseleave', () => {
    span.style.color = originalColor;
    span.style.backgroundColor = originalBg;
    span.style.borderColor = originalBorder;
  });
});

/*  애드백 컬러까지 변경
document.querySelectorAll('.product_card').forEach(card => {
  card.querySelectorAll('.tags span').forEach(tag => {
    tag.style.cursor = 'pointer'; // 클릭 가능 커서

    tag.addEventListener('click', () => {
      const word = tag.textContent.trim();
      const colorStyle = wordColors[word];
      const addBtn = card.querySelector('.add_btn');
      if (colorStyle && addBtn) {
        addBtn.style.color = colorStyle.color;
        addBtn.style.backgroundColor = colorStyle.background;
        addBtn.style.borderColor = colorStyle.border;
      }
    });
  });
}); */


/*sub_main2 호버 시 디테일 내용 */
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

// Bag Count 기능 추가 __헤더 +1
document.addEventListener("DOMContentLoaded", () => {
  const addBtns = document.querySelectorAll(".product_card .add_btn");
  const bagBtn = document.querySelector(".bag");

  // 숫자 배지 생성
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
      bagCount.style.display = "flex"; // 표시 활성화
    });
  });
});

//heart
document.querySelectorAll('.heart_btn').forEach(btn => {
  const img = btn.querySelector('img');
  btn.addEventListener('click', function () {
    if (btn.classList.toggle('is-on')) {
      btn.style.background = 'none';
      img.style.display = 'block';
      img.src = '../../asset/img/common/icon_heart_shop.svg';
    } else {
      btn.style.background = "transparent url('../../asset/img/shop/icon_heart_x.svg') no-repeat center/24px 24px";
      img.style.display = 'none';
    }
  });
});

/* popup1 */

document.addEventListener("DOMContentLoaded", () => {
  const addButtons = document.querySelectorAll(".add_btn");
  const popup = document.querySelector(".add_popup");
  const dim = document.querySelector(".add_dim");
  const popupHeading = popup.querySelector("h2");
  const popupParagraph = popup.querySelector("p");
  const continueBtn = popup.querySelector(".add_btn_re");      // 쇼핑 계속하기 버튼
  const closeCartBtn = popup.querySelector(".add_btn_close");   // 장바구니 가기 버튼
  const closeXBtn = popup.querySelector(".add_popup_close");    // 우측 상단 X버튼

  addButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();

      const productCard = btn.closest(".product_card");
      if (!productCard) return;

      const productTitle = productCard.querySelector(".info h3").textContent;
      popupParagraph.innerHTML = `"${productTitle}"<br>Your item has been added to your shopping cart.`;

      popup.style.display = "block";
      dim.style.display = "block";
    });
  });

  // 쇼핑 계속하기(하단 버튼) 클릭 시
  continueBtn.addEventListener("click", () => {
    popup.style.display = "none";
    dim.style.display = "none";
  });

  // 장바구니 가기(하단 버튼) 클릭 시 닫기(여기서는 단순 팝업 닫기지만, cart 별도 로직 추가 가능)
  closeCartBtn.addEventListener("click", () => {
    popup.style.display = "none";
    dim.style.display = "none";
    // 장바구니 열기 기능 추가 가능
  });

  // dim 영역 클릭 시 팝업 닫기
  dim.addEventListener("click", () => {
    popup.style.display = "none";
    dim.style.display = "none";
  });

  // 우측 상단 X(닫기) 버튼 클릭 시 팝업 닫기
  closeXBtn.addEventListener("click", () => {
    popup.style.display = "none";
    dim.style.display = "none";
  });
});

/*제품 상세페이지 연동  */
document.querySelectorAll('.product_card img').forEach(img => {
  img.style.cursor = 'pointer';
  img.onclick = () => location.href = '../detail/detail.html';
});

/* popup2 */
const popupFilters = [
  'GreenPlum',
  'Propolis',
  'RedBean',
  'Mugwort',
  'GreenTea',
  'CentellaAsiatica'
];

const notice = document.querySelector('.notice');
const popup = document.querySelector('.popup');
const dim = document.querySelector('.dim');

notice.style.display = 'none';
popup.style.display = 'none';
dim.style.display = 'none';


function closePopup() {
  notice.style.display = 'none';
  popup.style.display = 'none';
  dim.style.display = 'none';
}

document.querySelectorAll('.popup_close, .btn_close').forEach(btn => {
  btn.addEventListener('click', closePopup);
});
dim.addEventListener('click', closePopup);

document.querySelectorAll('.product_filter li').forEach(li => {
  if (popupFilters.includes(li.textContent.trim())) {
    li.style.cursor = 'pointer';
    li.addEventListener('click', () => {
      closePopup();
      setTimeout(() => {
        notice.style.display = 'block';
        popup.style.display = 'block';
        dim.style.display = 'block';
      }, 10);
    });
  }
});
