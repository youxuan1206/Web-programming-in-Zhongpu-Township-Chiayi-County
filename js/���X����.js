    document.addEventListener('DOMContentLoaded', function () {
        var modal = document.getElementById('myModal');
        var video = modal.querySelector('video');
        var modalContent = modal.querySelector('.modal-content');

        function adjustVideoSize() {
            // 計算模態視窗的可用高度
            var modalHeight = modalContent.clientHeight - 40; // 減去 padding

            // 根據模態視窗的高度設定影片的寬度和高度
            video.style.width = '100%';
            video.style.height = modalHeight + 'px';
        }

        function openModal() {
            adjustVideoSize();
            modal.style.display = 'block';
        }

        // 在模態視窗打開時觸發事件
        modal.addEventListener('click', adjustVideoSize);

        // 當影片載入完成時觸發事件，以便在影片載入後也能調整大小
        video.addEventListener('loadedmetadata', adjustVideoSize);

        // 在視窗大小改變時觸發事件
        window.addEventListener('resize', adjustVideoSize);

        // 關閉模態視窗的事件處理程序
        var closeModalButton = document.getElementById('closeModal');
        closeModalButton.addEventListener('click', function () {
            video.pause(); // 停止影片播放
            modal.style.display = 'none';
        });


        // 開啟模態視窗的事件處理程序
        var openModalButton = document.getElementById('openModalButton');
        openModalButton.addEventListener('click', openModal);
    });

    //視窗顯示時的過度效果
    function openModal() {
        adjustVideoSize();
        modal.classList.add('show'); // 添加 'show' 類別以觸發過渡效果
    }
    
    function closeModal() {
        video.pause();
        modal.classList.remove('show'); // 移除 'show' 類別以觸發過渡效果
    }
    