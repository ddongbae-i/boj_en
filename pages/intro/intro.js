window.addEventListener('load', () => {
    document.body.style.opacity = '1';
});

// 페이지 전환 효과
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const href = link.getAttribute('href');

        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '0';

        setTimeout(() => {
            window.location.href = href;
        }, 500);
    });
});

// 마우스 커서
const cursor = document.createElement('div');
cursor.style.cssText = `
    position: fixed;
    width: 20px;
    height: 20px;
    border: 2px solid rgba(206, 159, 39, 0.5);
    border-radius: 50%;
    pointer-events: none;
    z-index: 9999;
    transition: transform 0.2s ease;
    display: none;
`;
document.body.appendChild(cursor);

document.addEventListener('mousemove', (e) => {
    cursor.style.display = 'block';
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
});

document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('mouseenter', () => {
        cursor.style.transform = 'scale(2)';
        cursor.style.borderColor = 'rgba(206, 159, 39, 0.8)';
    });

    link.addEventListener('mouseleave', () => {
        cursor.style.transform = 'scale(1)';
        cursor.style.borderColor = 'rgba(206, 159, 39, 0.5)';
    });
});

// 영상 재생
const introVideo = document.getElementById('introVideo');
const mainContent = document.getElementById('mainContent');

// 비디오 리사이즈 함수
function resizeVideo() {
    const windowRatio = window.innerWidth / window.innerHeight;
    const videoRatio = 16 / 9;

    if (windowRatio > videoRatio) {
        introVideo.style.width = '100vw';
        introVideo.style.height = 'auto';
    } else {
        introVideo.style.width = 'auto';
        introVideo.style.height = '100vh';
    }
}

window.addEventListener('resize', resizeVideo);
window.addEventListener('load', () => {
    resizeVideo();
    introVideo.play();
});

// 영상이 끝나면 마지막 프레임에서 멈추고 버튼 등장
introVideo.addEventListener('ended', () => {
    // 영상을 마지막 프레임에 고정 (재생하지 않음)
    mainContent.classList.add('show');
});