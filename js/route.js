document.addEventListener("DOMContentLoaded", function () {
    // 隱藏所有 SVG 元素
    document.querySelectorAll('[id^="route-"]').forEach((element) => {
      element.style.display = 'none';
    });
  });
  
  function showRouteContent(contentNumber) {
    // 隱藏所有內容
    document.getElementById("content1Text").classList.remove("active");
    document.getElementById("content2Text").classList.remove("active");
    document.getElementById("content3Text").classList.remove("active");
  
    // 隱藏所有 SVG 元素
    document.querySelectorAll('[id^="route-"]').forEach((element) => {
      element.style.display = "none";
    });
  
    // 顯示選定的內容
    document
      .getElementById(`content${contentNumber}Text`)
      .classList.add("active");
  
    // 顯示選定的 SVG 元素
    const selectedRoute = document.getElementById(`route-${contentNumber}`);
    if (selectedRoute) {
      selectedRoute.style.display = "block";
    }
  }
  