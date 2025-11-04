document.addEventListener("DOMContentLoaded", function () {
    const thumbnails = document.querySelectorAll(".list img");
    const mainImg = document.querySelector(".main_img img");

    thumbnails.forEach((thumb) => {
        thumb.addEventListener("click", function () {
            const newSrc = this.getAttribute("src");
            mainImg.setAttribute("src", newSrc);

            thumbnails.forEach((t) => t.classList.remove("active"));
            this.classList.add("active");

            mainImg.style.width = "643px";
            mainImg.style.height = "660px";
            mainImg.style.objectFit = "cover";
            mainImg.style.display = "block";
        });
    });
});

document.addEventListener("DOMContentLoaded", function () {
    const tabs = document.querySelectorAll(".tab li");
    const tabimgs = document.querySelectorAll(".tabimg");

    tabs.forEach(tab => {
        tab.addEventListener("click", function () {
            tabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");

            // 이미지 전환
            const target = tab.dataset.tab;
            tabimgs.forEach(img => {
                if (img.classList.contains(target)) {
                    img.classList.add("active");
                } else {
                    img.classList.remove("active");
                }
            });
        });
    });
});


/* filter */
document.querySelectorAll('.filter_label').forEach(label => {
    label.addEventListener('click', function (e) {
        document.querySelectorAll('.filter_group').forEach(g => {
            g.classList.remove('open');
        });
        document.querySelectorAll('.filter_label').forEach(l => {
            l.classList.remove('active');
        });
        this.classList.add('active');
        this.parentNode.classList.add('open');
        e.stopPropagation();
    });
});

// 메뉴 항목 클릭 시 active 
document.querySelectorAll('.filter_menu li').forEach(item => {
    item.addEventListener('click', function (e) {
        document.querySelectorAll('.filter_menu li').forEach(i => i.classList.remove('active'));
        this.classList.add('active');
        this.closest('.filter_group').classList.remove('open');
        this.closest('.filter_group').querySelector('.filter_label').textContent = this.textContent;
        e.stopPropagation();
    });
});

// 바깥 클릭 시 열림 닫기
document.addEventListener('click', function () {
    document.querySelectorAll('.filter_group').forEach(g => g.classList.remove('open'));
    document.querySelectorAll('.filter_label').forEach(l => l.classList.remove('active'));
});


/* - + */
document.addEventListener("DOMContentLoaded", function () {
    const minusBtn = document.querySelector('.qty_minus');
    const plusBtn = document.querySelector('.qty_plus');
    const qtyInput = document.querySelector('.qty_line input');

    minusBtn.addEventListener('click', function () {
        let val = parseInt(qtyInput.value, 10);
        if (val > 1) qtyInput.value = val - 1;
    });

    plusBtn.addEventListener('click', function () {
        let val = parseInt(qtyInput.value, 10);
        qtyInput.value = val + 1;
    });
});