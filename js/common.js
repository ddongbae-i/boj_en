const header = document.querySelector('header');
const menuItems = document.querySelectorAll('ul.gnb > li');
const headerImgs = header.querySelectorAll('.nav_right img');

let lastScrollY = window.scrollY;
let currentBreakpoint = window.innerWidth >= 1280 ? 'desktop' : 'mobile';

menuItems.forEach(li => {
  li.addEventListener('mouseenter', () => {
    header.classList.add('hovered');
  });
  li.addEventListener('mouseleave', () => {
    header.classList.remove('hovered');
  });
});

window.addEventListener('scroll', () => {
  const currentScrollY = window.scrollY; if (currentScrollY > lastScrollY) {
    header.classList.remove('scrolled-up');
    header.style.top = '-100%';
    header.style.color = '#1c1c1c'
    header.style.boxShadow = '0 2px 6px rgba(0,0,0,0.08)';
    headerImgs.forEach
      (img => { img.style.filter = 'brightness(0) saturate(100%)' });
  } else { header.classList.add('scrolled-up'); header.style.top = '0'; }
  lastScrollY = currentScrollY;
});

window.addEventListener('scroll', () => {
  if (window.innerWidth <= 360) {
    // 360px 이하에서는 스크롤 시 헤더 위치 조작 안 함
    header.style.top = '0';
    header.classList.add('scrolled-up');
    return;
  }

  const currentScrollY = window.scrollY;

  if (currentScrollY > lastScrollY) {
    // 아래로 스크롤
    header.classList.remove('scrolled-up');
    header.style.top = '-100%';
    header.style.color = '#1c1c1c';
    header.style.boxShadow = '0 2px 6px rgba(0,0,0,0.08)';
    headerImgs.forEach(img => {
      img.style.filter = 'brightness(0) saturate(100%)'; // 검은 아이콘
    });
  } else {
    // 위로 스크롤 → header 등장
    header.classList.add('scrolled-up');
    header.style.top = '0';
  }

  lastScrollY = currentScrollY;
});

// ✅ 리사이즈 이벤트 (브레이크포인트 넘나들 때만 초기화)
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    const newBreakpoint = window.innerWidth >= 1280 ? 'desktop' : 'mobile';

    // 브레이크포인트가 바뀌었을 때만 초기화
    if (newBreakpoint !== currentBreakpoint) {
      currentBreakpoint = newBreakpoint;
      resetHeaderStyle();
      lastScrollY = window.scrollY; // 스크롤 위치 동기화
    }
  }, 150); // 디바운스 150ms
});

document.addEventListener('click', e => {
  const addBtn = e.target.closest('.add_btn');
  if (!addBtn) return;

  // 헤더 즉시 표시
  header.classList.add('scrolled-up');
  header.style.top = '0';
  header.style.transition = 'top 0.3s ease';

  // 일정 시간 후 transition 원복
  setTimeout(() => {
    header.style.transition = '';
  }, 400);
});


(() => {
  const gnbRoot = document.querySelector('nav ul.gnb');
  if (!gnbRoot) return;

  gnbRoot.addEventListener('click', (e) => {
    const w = window.innerWidth;
    const isMobileOrTablet = w <= 1280;
    if (!isMobileOrTablet) return;

    // 햄버거/검색/카트 클릭은 제외
    if (e.target.closest('.ham_menu, .ham_close, .menu-close, .nav_close, .nav_right .search, .nav_right .bag')) {
      return;
    }

    // 서브 내부 링크는 통과(이동 허용)
    if (e.target.closest('nav ul.gnb > li .sub_wrap a')) return;

    // 탑레벨 a만 토글 트리거
    const topA = e.target.closest('nav ul.gnb > li > a');
    if (!topA) return;

    e.preventDefault();

    const li = topA.parentElement;
    const willOpen = !li.classList.contains('on');

    // 형제 닫기
    const openSiblings = Array.from(gnbRoot.children).filter(el => el.classList && el.classList.contains('on'));
    openSiblings.forEach(sib => { if (sib !== li) sib.classList.remove('on'); });

    li.classList.toggle('on', willOpen);
    topA.setAttribute('aria-expanded', String(willOpen));
  });
})();


const searchBtn = document.querySelector('.nav_right .search');
const searchTab = document.querySelector('.search_tab');
const searchCloseBtn = document.querySelector('.search_tab .close');

// 검색 버튼: 햄버거 열려 있으면 열지 않음
searchBtn?.addEventListener('click', (e) => {
  if (header && header.classList.contains('on')) return;
  searchTab?.classList.add('open');
});
searchCloseBtn?.addEventListener('click', () => {
  searchTab?.classList.remove('open');
});

// footer menu btn
const footerBtn = document.querySelector('.f_nav button');
const footerMenu = document.querySelector('.f_nav ul');

footerBtn?.addEventListener('click', function () {
  footerMenu.classList.toggle('down');
  footerBtn.style.transform = footerMenu.classList.contains('down')
    ? 'rotate(180deg)'
    : 'rotate(0deg)';
  footerBtn.style.transition = 'transform 0.3s ease';
});

//여기가문제
/* ===== 모바일 search sync (기존 로직 유지) ===== */
(function () {
  const headerEl = document.querySelector('header');
  const searchTabEl = document.querySelector('.search_tab');
  const searchBtnEl = document.querySelector('.nav_right .search');

  if (!headerEl || !searchTabEl) return;

  function syncMobileSearch() {
    if (window.innerWidth <= 768) {
      if (headerEl.classList.contains('on')) {
        searchTabEl.classList.add('open');
      } else {
        searchTabEl.classList.remove('open');
      }
    }
  }

  window.addEventListener('resize', syncMobileSearch);

  const mo = new MutationObserver(syncMobileSearch);
  mo.observe(headerEl, { attributes: true, attributeFilter: ['class'] });

  searchBtnEl?.addEventListener('click', (e) => {
    if (window.innerWidth <= 768) e.preventDefault();
  }, true);

  syncMobileSearch();
})();

/* ===== 스크롤 잠금/복원 (위치 보존 방식, 중복 토글 제거) ===== */
// ...existing code...
/* ===== 스크롤 잠금/복원 (위치 보존 방식, search 강제 닫기 포함) ===== */
(function () {
  const headerEl = document.querySelector('header');
  const hamBtnEl = document.querySelector('.ham_menu');
  const searchTabEl = document.querySelector('.search_tab');
  if (!headerEl || !hamBtnEl) return;

  let locked = false;
  let scrollY = 0;

  // ✅ 메뉴/카트/검색탭 등 스크롤 허용 영역
  const SCROLLABLE_SELECTOR = `
    header.on nav,
    .cart_wrap.is-open,
    .search_tab.open
  `;

  function preventTouch(e) {
    if (!locked) return;
    // 768px 이하에서만 전역 차단 + 허용영역 통과
    if (window.innerWidth <= 768 && e.target.closest(SCROLLABLE_SELECTOR)) return;
    if (window.innerWidth <= 768) e.preventDefault();
  }

  function lockMenu() {
    if (locked) return;

    searchTabEl?.classList.remove('open');

    scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
    document.documentElement.classList.add('menu-open');
    document.body.classList.add('menu-open');

    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';

    // ⛔ 전역 터치 차단(768px 이하일 때만 의미 있음)
    window.addEventListener('touchmove', preventTouch, { passive: false });

    locked = true;
  }

  function unlockMenu() {
    if (!locked) return;

    document.documentElement.classList.remove('menu-open');
    document.body.classList.remove('menu-open');

    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.width = '';
    document.body.style.overflow = '';

    window.removeEventListener('touchmove', preventTouch);

    window.scrollTo(0, scrollY || 0);
    locked = false;
  }

  function applyLockByHeader() {
    const isOpen = headerEl.classList.contains('on');
    if (window.innerWidth <= 768) {
      isOpen ? lockMenu() : unlockMenu();
    } else {
      unlockMenu();
      searchTabEl?.classList.remove('open');
    }
  }

  hamBtnEl.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    headerEl.classList.toggle('on');
    applyLockByHeader();
  });

  const mo = new MutationObserver(applyLockByHeader);
  mo.observe(headerEl, { attributes: true, attributeFilter: ['class'] });

  document.querySelectorAll('.ham_close, .menu-close, .nav_close, .search_tab .close, button.close')
    .forEach(btn => {
      btn.addEventListener('click', () => {
        headerEl.classList.remove('on');
        applyLockByHeader();
        searchTabEl?.classList.remove('open');
      });
    });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) headerEl.classList.remove('on');
    applyLockByHeader();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      headerEl.classList.remove('on');
      applyLockByHeader();
      searchTabEl?.classList.remove('open');
    }
  });

  applyLockByHeader();
})();


//cart
//cart
document.addEventListener('DOMContentLoaded', () => {
  const bagBtn = document.querySelector('.nav_right .bag');
  const cartWrap = document.querySelector('.cart_wrap');
  const closeBtn = document.querySelector('.cart_close');

  if (!bagBtn || !cartWrap) return;

  const openCart = () => {
    cartWrap.classList.add('is-open');
    document.documentElement.classList.add('cart-locked');
    document.body.classList.add('cart-locked');
  };

  const closeCart = () => {
    cartWrap.classList.remove('is-open');
    document.documentElement.classList.remove('cart-locked');
    document.body.classList.remove('cart-locked');
  };

  bagBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    openCart();
  });

  closeBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    closeCart();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && cartWrap.classList.contains('is-open')) closeCart();
  });
});


// JavaScript
document.addEventListener("DOMContentLoaded", () => {
  let notice = document.querySelector(".notice");

  if (!notice) {
    const html = `
      <div class="notice" style="display:none;">
        <div class="dim"></div>
        <div class="popup">
          <button class="popup_close" aria-label="Close">&times;</button>
          <h2>Notice</h2>
          <p>We are creating a new look of Joseon's beauty.<br>
             I'll come back with a deeper beauty.<br>Please wait!</p>
          <div class="popup_btns">
            <button class="btn_close">Close</button>
          </div>
        </div>
      </div>`;
    document.body.insertAdjacentHTML("beforeend", html);
    notice = document.querySelector(".notice");
  }

  const dim = notice.querySelector(".dim");
  const popup = notice.querySelector(".popup");
  const closeX = notice.querySelector(".popup_close");
  const closeBtn = notice.querySelector(".btn_close");

  const openNotice = () => {
    notice.style.display = "block";
    document.body.classList.add("no-scroll");
  };
  const closeNotice = () => {
    notice.style.display = "none";
    document.body.classList.remove("no-scroll");
  };


  closeX?.addEventListener("click", closeNotice);
  closeBtn?.addEventListener("click", closeNotice);
  dim?.addEventListener("click", closeNotice);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeNotice();
  });

  document.addEventListener("click", (e) => {
    const trigger = e.target.closest(".popup_btn");
    if (!trigger) return;
    e.preventDefault();
    openNotice();
  });
});

/* login */
document.addEventListener("DOMContentLoaded", () => {
  // 경로 계산
  const depth = location.pathname.split('/').filter(Boolean).length;
  let prefix = './';
  if (depth > 1) prefix = '../'.repeat(depth - 1);

  // 팝업 생성 (없으면 자동 삽입)
  let login = document.querySelector('.login');
  if (!login) {
    const loginHTML = `
      <div class="login" style="display:none">
        <div class="login_dim"></div>
        <form class="login_area">
          <div class="login_pop">
            <button type="button" class="login_close" aria-label="close">&times;</button>
            <h2>Login</h2>

            <!-- 안내 문구 -->
            <p class="dev_notice">
              🚧 This feature is currently under development.<br>
              Please press <b>Close (×)</b> to exit.
            </p>

            <span class="notice">New to beautyofjoseon?
              <a href="#" class="bar">Sign up for free</a>
            </span>

            <label for="login_email" class="email">Email address</label>
            <input type="email" id="login_email" placeholder="Email" disabled />

            <label for="login_password" class="password">Password</label>
            <input type="password" id="login_password" placeholder="Password" disabled />

            <a href="#" class="pw_reset disabled">Forget password?</a>

            <button type="button" class="login_btn disabled">Login</button>

            <div class="sns">
              <a href="#" class="disabled"><img src="${prefix}asset/img/common/google.png" alt="google"></a>
              <a href="#" class="disabled"><img src="${prefix}asset/img/common/apple.png" alt="apple"></a>
              <a href="#" class="disabled"><img src="${prefix}asset/img/common/facebook.png" alt="facebook"></a>
            </div>
          </div>
        </form>
      </div>`;
    document.body.insertAdjacentHTML('beforeend', loginHTML);
    login = document.querySelector('.login');
  }

  const loginDim = login.querySelector('.login_dim');
  const loginClose = login.querySelector('.login_close');

  // 팝업 열기
  const openLoginPopup = () => {
    login.style.display = "block";
    document.body.classList.add('no-scroll');
  };

  // 닫기
  const closeLoginPopup = () => {
    login.style.display = "none";
    document.body.classList.remove('no-scroll');
  };

  // 이벤트 연결
  document.addEventListener('click', (e) => {
    const openTrigger = e.target.closest('.login_open, [data-open-login], .sign_up_btn, .bar');
    if (!openTrigger) return;
    e.preventDefault();
    openLoginPopup();
  });

  loginDim?.addEventListener('click', closeLoginPopup);
  loginClose?.addEventListener('click', closeLoginPopup);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLoginPopup();
  });
});