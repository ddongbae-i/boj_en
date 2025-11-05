const right = document.querySelector('.right');
const triggerPoint = 160;

window.addEventListener('scroll', () => {
  if (window.scrollY >= triggerPoint) {
    right.style.paddingTop = '40px'; // 160px 패딩 제거
  } else {
    right.style.paddingTop = '160px'; // 다시 원상복구
  }
});