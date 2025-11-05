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

// 화면 비율에 따라 비디오 소스 변경
function updateVideoSource() {
  const isPortrait = window.innerHeight > window.innerWidth;
  const currentSrc = introVideo.currentSrc;
  const portraitSrc = './asset/video/intro/intro_916.mp4';
  const landscapeSrc = './asset/video/intro/intro.mp4';
  
  const targetSrc = isPortrait ? portraitSrc : landscapeSrc;
  
  // 현재 재생 중인 소스와 다르면 변경
  if (!currentSrc.includes(targetSrc)) {
    const currentTime = introVideo.currentTime || 0;
    introVideo.src = targetSrc;
    introVideo.currentTime = currentTime;
    introVideo.play().catch(() => {});
  }
}

// 초기 로드 및 화면 회전/리사이즈 시 체크
updateVideoSource();
window.addEventListener('resize', updateVideoSource);
window.addEventListener('orientationchange', updateVideoSource);

function endVideo() {
  const isPortrait = window.innerHeight > window.innerWidth;
  
  // 세로형이면 바로 브랜드 스토리로 이동
  if (isPortrait) {
    window.location.href = './main.html';
    return;
  }
  
  // 가로형일 때만 기존 로직 실행
  try { introVideo.pause(); } catch (_) {}
  if (!isNaN(introVideo.duration)) {
    introVideo.currentTime = Math.max(0, introVideo.duration - 0.01);
  }

  skipButton.classList.add('hidden');
  mainContent.classList.add('show');
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