


/* GPT */

document.addEventListener('DOMContentLoaded', () => {
  const links = document.querySelectorAll('.change-page');
  const section5 = document.querySelector('.redeem_for_products');
  const section6 = document.querySelector('.ways_to_earn');

  links.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault(); // 필수
      const target = link.dataset.target;

      if (window.innerWidth <= 684) { // 모바일에서만 동작
        if (target === 'section6') {
          section5.classList.remove('active');
          section6.classList.add('active');
        } else {
          section6.classList.remove('active');
          section5.classList.add('active');
        }
      }
    });
  });

/* GPT */

// 1. 모든 아코디언 제목 요소를 가져옵니다.
    const titles = document.querySelectorAll('.accordion-title');


// 2. 각 제목에 'click' 이벤트 리스너를 추가합니다.
    titles.forEach(title => {
        title.addEventListener('click', () => {
            const content = title.nextElementSibling;
            const icon = title.querySelector('.toggle-icon'); // 아이콘 요소 찾기
            
            // 1. 내용(Content)에 'active' 클래스 토글 (열고 닫기)
            content.classList.toggle('active');
            
            // 2. 제목(Title)에도 'active' 클래스 토글 (아이콘 CSS 변경용)
            title.classList.toggle('active'); 
            
            // 3. 아이콘 텍스트 변경 (+ <-> -)
            if (content.classList.contains('active')) {
                icon.textContent = '-'; // 열렸으면 '-'로 변경
            } else {
                icon.textContent = '+'; // 닫혔으면 '+'로 변경
            }
        });
    });



    /* 클론코딩 이노그리드 */
      const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const motionElement = entry.target;
                
                if (entry.isIntersecting) {
                    motionElement.classList.remove('animate');
                    motionElement.offsetHeight;
                    motionElement.classList.add('animate');
                }
            });
        }, observerOptions);

        document.querySelectorAll('.motion').forEach(motion => {
            observer.observe(motion);
        });


/* GPT */
const video = document.getElementById('bgVideo');
video.playbackRate = 0.5;














 AOS.init();
}); //DOMContentLoaded
