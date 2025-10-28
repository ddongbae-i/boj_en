const header = document.querySelector('header');
const menuItems = document.querySelectorAll('ul.gnb > li');
const headerImgs = header.querySelectorAll('.nav_right img');

let lastScrollY = window.scrollY;

menuItems.forEach(li => {
  li.addEventListener('mouseenter', () => {
    header.classList.add('hovered');
  });
  li.addEventListener('mouseleave', () => {
    header.classList.remove('hovered');
  });
});

window.addEventListener('scroll', () => {
  const currentScrollY = window.scrollY;

  if (currentScrollY > lastScrollY) {
    // 아래로 스크롤
    header.classList.remove('scrolled-up');
    header.style.top = '-124px';
    header.style.color = '#1c1c1c'
    header.style.boxShadow = '0 2px 6px rgba(0,0,0,0.08)';
    headerImgs.forEach(img => {
      img.style.filter = 'brightness(0) saturate(100%)'; // 💡 검은색 아이콘 처리
    });
  } else {
    // 위로 스크롤 → header 등장
    header.classList.add('scrolled-up');
    header.style.top = '0';
  }

  lastScrollY = currentScrollY;
});

/* ===== 기존 네비/리사이즈/서브메뉴 관련 로직 (기존 코드 유지) ===== */
const hammenuBtn = document.querySelector('.ham_menu'); // 존재하면 아래에서 사용
// nav hover
const mainMenus = document.querySelectorAll('nav ul.gnb > li > a');
const bottomNav = document.querySelector('.ham_bottom');
const nav = document.querySelector('nav');

function handleNavEvent(e) {
  if (e.type === 'mouseenter') nav.classList.add('on');
  if (e.type === 'mouseleave') nav.classList.remove('on');
}

if (bottomNav) {
  ['mouseenter', 'mouseleave'].forEach(event =>
    bottomNav.addEventListener(event, handleNavEvent)
  );
}

const lilis = document.querySelectorAll('header nav ul.gnb > li');
function handleResize() {
  const w = window.innerWidth;

  // 데스크톱: hover로 열림
  if (w > 1280) {
    ['mouseenter', 'mouseleave'].forEach(event =>
      bottomNav?.addEventListener(event, handleNavEvent)
    );
    // 잔여 상태 초기화
    nav?.classList.remove('on');
    document.querySelectorAll('nav ul.gnb > li.on').forEach(li => li.classList.remove('on'));
    return;
  }

  // 모바일/태블릿: hover 리스너 제거(클릭 전용)
  ['mouseenter', 'mouseleave'].forEach(event =>
    bottomNav?.removeEventListener(event, handleNavEvent)
  );
  // 여기서 a의 href를 건드리지 않음(위임에서 top-level만 막을 것)
}

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
handleResize();
window.addEventListener('resize', handleResize);

// search
// const searchBtn = document.querySelector('.nav_right .search');
// const searchTab = document.querySelector('.search_tab');
// const searchCloseBtn = document.querySelector('.search_tab .close');

// searchBtn?.addEventListener('click', () => {
//   searchTab?.classList.add('open');
// });
// searchCloseBtn?.addEventListener('click', () => {
//   searchTab?.classList.remove('open');
// });

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
  const headerEl    = document.querySelector('header');
  const hamBtnEl    = document.querySelector('.ham_menu');
  const searchTabEl = document.querySelector('.search_tab');
  if (!headerEl || !hamBtnEl) return;

  let locked = false;
  let scrollY = 0;

  function preventTouch(e){ if (locked) e.preventDefault(); }

  function lockMenu() {
    if (locked) return;

    // 메뉴 열릴 때 검색탭 닫기
    searchTabEl?.classList.remove('open');

    // 현재 스크롤 위치 저장
    scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;

    // 클래스 플래그
    document.documentElement.classList.add('menu-open');
    document.body.classList.add('menu-open');

    // ★ 스크롤 락 핵심
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';

    // iOS 터치 스크롤 차단
    document.addEventListener('touchmove', preventTouch, { passive: false });

    locked = true;
  }

  function unlockMenu() {
    if (!locked) return;

    document.documentElement.classList.remove('menu-open');
    document.body.classList.remove('menu-open');

    // 스타일 원복
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.width = '';
    document.body.style.overflow = '';

    // iOS 차단 해제
    document.removeEventListener('touchmove', preventTouch);

    // 원래 위치로 복원
    window.scrollTo(0, scrollY || 0);

    locked = false;
  }

  function applyLockByHeader() {
    const isOpen = headerEl.classList.contains('on');
    if (window.innerWidth <= 1280) {
      isOpen ? lockMenu() : unlockMenu();
    } else {
      // 데스크톱에서는 무조건 해제 + 검색 닫기
      unlockMenu();
      searchTabEl?.classList.remove('open');
    }
  }

  // 햄버거 클릭
  hamBtnEl.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation(); // 다른 위임 핸들러가 가로채지 않게
    headerEl.classList.toggle('on');
    applyLockByHeader();
  });

  // header 클래스 변화 감지
  const mo = new MutationObserver(applyLockByHeader);
  mo.observe(headerEl, { attributes: true, attributeFilter: ['class'] });

  // 닫기 버튼들 처리
  document.querySelectorAll('.ham_close, .menu-close, .nav_close, .search_tab .close, button.close')
    .forEach(btn => {
      btn.addEventListener('click', () => {
        headerEl.classList.remove('on');
        applyLockByHeader();
        searchTabEl?.classList.remove('open');
      });
    });

  // 리사이즈 시 재평가
  window.addEventListener('resize', () => {
    if (window.innerWidth > 1280) {
      headerEl.classList.remove('on'); // 데스크톱 진입 시 항상 닫음
    }
    applyLockByHeader();
  });

  // ESC 닫기
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      headerEl.classList.remove('on');
      applyLockByHeader();
      searchTabEl?.classList.remove('open');
    }
  });

  // 초기 동기화
  applyLockByHeader();
})();

//cart
document.addEventListener('DOMContentLoaded', () => {
  const bagBtn = document.querySelector('.nav_right .bag');
  const cartWrap = document.querySelector('.cart_wrap');
  const closeBtn = document.querySelector('.cart_close');

  if (!bagBtn || !cartWrap) return;

  const openCart = () => {
    cartWrap.classList.add('is-open');              // ← 핵심
    document.documentElement.classList.add('cart-locked');
    document.body.classList.add('cart-locked');
  };

  const closeCart = () => {
    cartWrap.classList.remove('is-open');           // ← 핵심
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

// document.addEventListener('click', (e) => {
//   const target = e.target.closest('a[href="#"]');
//   if (target) {
//     e.preventDefault();
//   }
// });