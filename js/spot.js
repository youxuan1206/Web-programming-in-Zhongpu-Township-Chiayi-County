document.addEventListener("DOMContentLoaded", function () {
    var mapRegions = document.querySelectorAll(".map-path");
    var regionInfo = document.getElementById("region-info");
    var infoText = document.getElementById("info-text");
    var infoImage = document.getElementById("info-image");

    mapRegions.forEach(function (region) {
        region.addEventListener("mouseenter", function (event) {
            // 滑鼠滑入顯示info
            var regionInfoText = region.getAttribute("data-info");
            var regionImageSrc = region.getAttribute("data-image");

            // 文字內容
            infoText.textContent = regionInfoText;

            // 照片位址
            infoImage.src = regionImageSrc;

            // 抓取標點位置與滑鼠位置
            var mouseX = event.clientX;
            var mouseY = event.clientY;

            // 計算info要顯現的位置
            regionInfo.style.display = "block";
            regionInfo.style.position = "fixed";
            regionInfo.style.top = mouseY + 20 + "px";
            regionInfo.style.left = mouseX + 20 + "px";
        });

        region.addEventListener("mouseleave", function () {
            // 滑鼠離開隱藏
            regionInfo.style.display = "none";
            infoText.textContent = "";
            infoImage.src = "";
        });
    });
});

