// ---------- 페이지 페이드 인 ----------
window.addEventListener('load', () => {
  document.body.style.opacity = '1';
});

// ---------- 페이지 전환 페이드 아웃 ----------
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const href = link.getAttribute('href');
    document.body.style.opacity = '0';
    setTimeout(() => { window.location.href = href; }, 500);
  });
});

// ---------- 커스텀 커서 ----------
const cursor = document.createElement('div');
cursor.style.cssText = `
  position: fixed;
  width: 20px;
  height: 20px;
  border: 2px solid rgba(206, 159, 39, 0.5);
  border-radius: 50%;
  pointer-events: none;
  z-index: 9999;
  transition: transform .2s ease, border-color .2s ease;
  display: none;
  transform: translate(-50%, -50%); /* 중심 정렬 */
`;
document.body.appendChild(cursor);

document.addEventListener('mousemove', (e) => {
  cursor.style.display = 'block';
  cursor.style.left = e.clientX + 'px';
  cursor.style.top  = e.clientY + 'px';
});

document.querySelectorAll('.nav-link, #skipButton').forEach(el => {
  el.addEventListener('mouseenter', () => {
    cursor.style.transform = 'translate(-50%, -50%) scale(1.8)';
    cursor.style.borderColor = 'rgba(206, 159, 39, 0.8)';
  });
  el.addEventListener('mouseleave', () => {
    cursor.style.transform = 'translate(-50%, -50%) scale(1)';
    cursor.style.borderColor = 'rgba(206, 159, 39, 0.5)';
  });
});

// ---------- 비디오/인트로 제어 ----------
const introVideo  = document.getElementById('introVideo');   // <video> 요소
const mainContent = document.getElementById('mainContent');  // .content-wrapper
const skipButton  = document.getElementById('skipButton');

// (중요) 이전의 resizeVideo 로직 제거: 크기는 CSS(#introVideo)에서만 관리
// → JS가 width/height를 건드리지 않으므로, 의도대로 110vw/110vh로 살짝 확대 유지

function endVideo() {
  // 혹시 남은 재생 중지
  try { introVideo.pause(); } catch (_) {}
  // 마지막 프레임 근처로 이동 (모바일 깜빡임 방지 목적)
  if (!isNaN(introVideo.duration)) {
    introVideo.currentTime = Math.max(0, introVideo.duration - 0.01);
  }

  // 스킵 버튼 히든 처리
  skipButton.classList.add('hidden');

  // 메인 컨텐츠 활성화
  mainContent.classList.add('show');

  // 스크롤 허용 (인트로 끝)
  document.body.style.overflow = 'auto';
}

// 스킵 클릭
skipButton.addEventListener('click', endVideo);

// 비디오 자동 재생 시도
window.addEventListener('load', () => {
  // iOS 등 자동재생 제한 환경에서도 muted + playsinline이면 보통 재생됨
  // 실패해도 UX는 유지
  introVideo.play().catch(() => {});
});

// 자연 종료 시 동일 처리
introVideo.addEventListener('ended', endVideo);
