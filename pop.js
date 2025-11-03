// JavaScript
document.addEventListener("DOMContentLoaded", () => {
  const popup = document.querySelector(".popup");
  const dim = document.querySelector(".dim");
  const closeXBtn = document.querySelector(".popup_close");
  const closeBtn = document.querySelector(".btn_close");

  function closePopup() {
    popup.style.display = "none";
    dim.style.display = "none";
  }

  closeXBtn.addEventListener("click", closePopup);
  closeBtn.addEventListener("click", closePopup);
  dim.addEventListener("click", closePopup);
});


/* login */
document.addEventListener("DOMContentLoaded", () => {
  const loginClose = document.querySelector('.login_close');
  const loginDim = document.querySelector('.login_dim');
  const loginForm = document.querySelector('.login_form');
  const login = document.querySelector('.login');

  function closeLoginPopup() {
    login.style.display = "none";
  }

  loginClose.addEventListener('click', closeLoginPopup);
  loginDim.addEventListener('click', closeLoginPopup);

  document.querySelector('.bar').addEventListener('click', () => {
    alert("Coming soon");
  });
});

document.querySelector('.login_box').addEventListener('submit', function (e) {
  e.preventDefault();
  window.location.href = '/main.html'; // 원하는 경로로 이동
});

/* window.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    document.getElementById('login_email').value = 'joseon@gmail.com';
    document.getElementById('login_password').value = '1234567';
  }, 1000); // 초 후 자동 입력
}); */

function typeEffect(element, text, delay) {
  let i = 0;
  const timer = setInterval(() => {
    element.value += text[i];
    i++;
    if (i >= text.length) clearInterval(timer);
  }, delay);
}

window.addEventListener('DOMContentLoaded', () => {
  const emailInput = document.getElementById('login_email');
  const pwInput = document.getElementById('login_password');

  setTimeout(() => typeEffect(emailInput, 'joseon@gmail.com', 100), 500);
  setTimeout(() => typeEffect(pwInput, '1234567', 100), 2000); 
});