let currentSlide = 0;
const slides = document.querySelectorAll("#ul li");

const intervalTime = 2000; // 設定自動輪播的時間間隔，以毫秒為單位
function showSlide(index) {
  const transformValue = -index * 100 + "%";
  document.getElementById("ul").style.transform =
    "translateX(" + transformValue + ")";
}

function nextSlide() {
  currentSlide = (currentSlide + 1) % slides.length;
  showSlide(currentSlide);
}

function prevSlide() {
  currentSlide = (currentSlide - 1 + slides.length) % slides.length;
  showSlide(currentSlide);
}

function left() {
  prevSlide();
}

function right() {
  nextSlide();
}

function startAutoSlide() {
  slideInterval = setInterval(nextSlide, intervalTime);
}

function stopAutoSlide() {
  clearInterval(slideInterval);
}

// 初始顯示第一張輪播
showSlide(currentSlide);

// 啟動自動輪播
startAutoSlide();
