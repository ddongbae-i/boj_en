// 쿠폰 토글 기능
document.addEventListener('DOMContentLoaded', function() {
    const label = document.querySelector('.coupon .label');
    const desc = document.querySelector('.coupon .description');
    
    // 아이콘 추가
    label.innerHTML += ' <img src="../../asset/img/payment/toggle_icon_up.svg" class="toggle-icon">';
    desc.style.display = 'none'; // 초기: 닫힘
    
    // 토글
    label.onclick = function() {
        const icon = this.querySelector('.toggle-icon');
        if (desc.style.display === 'none') {
            desc.style.display = 'block';
            icon.src = '../../asset/img/payment/toggle_icon_down.svg';
        } else {
            desc.style.display = 'none';
            icon.src = '../../asset/img/payment/toggle_icon_up.svg';
        }
    };
});