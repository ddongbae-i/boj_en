const header = document.querySelector('header');
const menuItems = document.querySelectorAll('ul.gnb > li');

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
  if (window.innerWidth <= 768) {
    mainMenus.forEach(menu => menu.removeAttribute('href'));
    ['mouseenter', 'mouseleave'].forEach(event =>
      bottomNav?.removeEventListener(event, handleNavEvent)
    );
    lilis.forEach(lili => {
      // 모바일에서 서브메뉴 토글 (중복 바인딩 방지)
      if (!lili.__hasMobileClick) {
        lili.addEventListener('click', (e) => {
          e.preventDefault();
          lili.classList.toggle('on');
        });
        lili.__hasMobileClick = true;
      }
    });

  } else if (window.innerWidth <= 1280) {
    mainMenus.forEach(menu => menu.removeAttribute('href'));
  } else {
    ['mouseenter', 'mouseleave'].forEach(event =>
      bottomNav?.addEventListener(event, handleNavEvent)
    );
  }
}

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
  let locked = false;
  let scrollY = 0;
  const searchTabEl = document.querySelector('.search_tab');

  function lockMenu() {
    if (locked) return;
    // 메뉴 열릴 때 검색탭 강제 닫기
    searchTabEl?.classList.remove('open');

    scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
    document.documentElement.classList.add('menu-open');
    document.body.classList.add('menu-open');
    /*     document.body.style.position = 'fixed'; */
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = '0';
    document.body.style.width = '100%';
    locked = true;
  }

  function unlockMenu() {
    if (!locked) return;
    document.documentElement.classList.remove('menu-open');
    document.body.classList.remove('menu-open');
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.width = '';
    window.scrollTo(0, scrollY || 0);
    locked = false;
  }

  // header 클래스 기반으로 잠금 제어
  function applyLockByHeader() {
    if (!header) return;
    const isOpen = header.classList.contains('on');
    if (window.innerWidth <= 1280) {
      if (isOpen) lockMenu();
      else unlockMenu();
    } else {
      // 데스크탑에서는 잠금 해제 및 search 강제 닫기
      unlockMenu();
      searchTabEl?.classList.remove('open');
    }
  }

  // 햄버거 버튼 클릭: header.on 토글하고, 그 결과로 잠금/해제 처리
  hammenuBtn?.addEventListener('click', (e) => {
    if (!header) return;
    header.classList.toggle('on');
    applyLockByHeader();
  });

  // header 클래스 변화 감지
  if (header) {
    const mo = new MutationObserver(applyLockByHeader);
    mo.observe(header, { attributes: true, attributeFilter: ['class'] });
  }

  // 닫기 버튼들
  const closeButtons = document.querySelectorAll('.ham_close, .menu-close, .nav_close, .search_tab .close, button.close');
  closeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      header?.classList.remove('on');
      unlockMenu();
      searchTabEl?.classList.remove('open');
    });
  });

  // 뷰포트가 커지면 잠금 해제 및 search 닫기
  window.addEventListener('resize', () => {
    if (window.innerWidth > 1280) {
      unlockMenu();
      searchTabEl?.classList.remove('open');
    }
  });

  // ESC로 닫기
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      header?.classList.remove('on');
      unlockMenu();
      searchTabEl?.classList.remove('open');
    }
  });

})();
// ...existing code...