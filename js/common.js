/* ========== 캐시 ========== */
const header = document.querySelector('header');
const nav = document.querySelector('nav');
const gnb = document.querySelector('nav ul.gnb');
const mainMenus = document.querySelectorAll('nav ul.gnb > li > a');
const headerImgs = header?.querySelectorAll('.nav_right img') || [];
const hammenuBtn = document.querySelector('.ham_menu');

const searchBtn = document.querySelector('.nav_right .search');
const searchTab = document.querySelector('.search_tab');
const searchCloseBtn = document.querySelector('.search_tab .close');

const bagBtn = document.querySelector('.nav_right .bag');
const cartWrap = document.querySelector('.cart_wrap');
const cartCloseBtn = document.querySelector('.cart_close');

/* ========== 상태 ========== */
let lastScrollY = window.scrollY;
let mode = 'desktop'; // 'mobile' | 'tablet' | 'desktop'

/* ========== 유틸: 모드 계산 ========== */
function updateMode() {
  const w = window.innerWidth;
  if (w <= 768) mode = 'mobile';
  else if (w <= 1280) mode = 'tablet';
  else mode = 'desktop';
}

/* ========== 헤더 스크롤 표시 ========== */
function onScrollHeader() {
  const y = window.scrollY;
  if (y > lastScrollY) {
    // 아래로
    header?.classList.remove('scrolled-up');
    if (header) {
      header.style.top = '-124px';
      header.style.color = '#1c1c1c';
      header.style.boxShadow = '0 2px 6px rgba(0,0,0,0.08)';
    }
    headerImgs.forEach(img => {
      img.style.filter = 'brightness(0) saturate(100%)';
    });
  } else {
    // 위로
    header?.classList.add('scrolled-up');
    if (header) header.style.top = '0';
  }
  lastScrollY = y;
}
window.addEventListener('scroll', onScrollHeader);

/* ========== 데스크톱: 호버로 전체 nav on/off ========== */
function attachDesktopHover() {
  if (!nav) return;
  nav.addEventListener('mouseenter', () => {
    if (mode === 'desktop') nav.classList.add('on');
  });
  nav.addEventListener('mouseleave', () => {
    if (mode === 'desktop') nav.classList.remove('on');
  });
}

/* ========== 모바일/태블릿: 클릭으로 li.on 토글(위임) ========== */
function attachClickToggle() {
  if (!gnb) return;
  gnb.addEventListener('click', (e) => {
    // 데스크톱은 클릭으로 열지 않음
    if (mode === 'desktop') return;

    const a = e.target.closest('nav ul.gnb > li > a');
    if (!a) return;

    // 링크 이동 막고 토글
    e.preventDefault();

    const li = a.parentElement;
    const willOpen = !li.classList.contains('on');

    // 형제 닫기
    gnb.querySelectorAll(':scope > li.on').forEach(sib => {
      if (sib !== li) sib.classList.remove('on');
    });

    li.classList.toggle('on', willOpen);
    a.setAttribute('aria-expanded', String(willOpen));
  });
}

/* ========== 서브 클릭 중복 방지(데스크톱)는 CSS에서 처리 ==========
   데스크톱에서는 hover로만 열리므로 클릭 이동 허용(접근성/SEO 유지) */

/* ========== 헤더 내 1차 메뉴 hover 시 헤더 상태 클래스(시각 효과용) ========== */
document.querySelectorAll('ul.gnb > li').forEach(li => {
  li.addEventListener('mouseenter', () => header?.classList.add('hovered'));
  li.addEventListener('mouseleave', () => header?.classList.remove('hovered'));
});

/* ========== 검색 ========== */
function openSearch() {
  // 햄버거 열려 있으면 무시 (겹침 방지)
  if (header?.classList.contains('on')) return;
  searchTab?.classList.add('open');
}
function closeSearch() {
  searchTab?.classList.remove('open');
}
searchBtn?.addEventListener('click', (e) => {
  // 모든 구간에서 동작, 단 모바일에서 페이크 링크면 이동 막기
  if (mode !== 'desktop') e.preventDefault();
  openSearch();
});
searchCloseBtn?.addEventListener('click', closeSearch);

/* ========== 스크롤 락(메뉴/카트) ========== */
let locked = false;
let scrollYMemo = 0;

function lockScroll() {
  if (locked) return;
  scrollYMemo = window.pageYOffset || document.documentElement.scrollTop || 0;
  document.documentElement.classList.add('menu-open');
  document.body.classList.add('menu-open');
  document.body.style.top = `-${scrollYMemo}px`;
  document.body.style.left = '0';
  document.body.style.width = '100%';
  locked = true;
}
function unlockScroll() {
  if (!locked) return;
  document.documentElement.classList.remove('menu-open');
  document.body.classList.remove('menu-open');
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.left = '';
  document.body.style.width = '';
  window.scrollTo(0, scrollYMemo || 0);
  locked = false;
}

/* ========== 햄버거 ========== */
function applyLockByHeader() {
  const isOpen = header?.classList.contains('on');
  if (mode !== 'desktop') {
    if (isOpen) {
      closeSearch(); // 메뉴 열리면 검색 닫기
      lockScroll();
    } else {
      unlockScroll();
    }
  } else {
    // 데스크톱: 항상 언락 + 검색 닫기
    header?.classList.remove('on');
    unlockScroll();
    closeSearch();
  }
}
hammenuBtn?.addEventListener('click', (e) => {
  e.preventDefault();
  header?.classList.toggle('on');
  applyLockByHeader();
});
if (header) {
  const mo = new MutationObserver(applyLockByHeader);
  mo.observe(header, { attributes: true, attributeFilter: ['class'] });
}

/* ========== 카트 ========== */
function openCart() {
  cartWrap?.classList.add('is-open');
  document.documentElement.classList.add('cart-locked');
  document.body.classList.add('cart-locked');
}
function closeCart() {
  cartWrap?.classList.remove('is-open');
  document.documentElement.classList.remove('cart-locked');
  document.body.classList.remove('cart-locked');
}
bagBtn?.addEventListener('click', (e) => {
  e.preventDefault();
  e.stopPropagation();
  openCart();
});
cartCloseBtn?.addEventListener('click', (e) => {
  e.preventDefault();
  closeCart();
});
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    // 전역 ESC
    header?.classList.remove('on');
    closeSearch();
    closeCart();
    applyLockByHeader();
  }
});

/* ========== 리사이즈: 모드 전환 처리 ========== */
function onResize() {
  const prev = mode;
  updateMode();

  // 모드 바뀌면 상태 정리
  if (mode !== prev) {
    // 메뉴/서브/검색 초기화
    document.querySelectorAll('nav ul.gnb > li.on').forEach(li => li.classList.remove('on'));
    nav?.classList.remove('on');
    closeSearch();

    // 스크롤락 재평가
    applyLockByHeader();
  }
}
updateMode();
attachDesktopHover();
attachClickToggle();
onResize();
window.addEventListener('resize', onResize);
