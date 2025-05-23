document.addEventListener('DOMContentLoaded', function () {
    const menuToggle = document.getElementById('menu-toggle');
    const nav = document.querySelector('#header nav');

    menuToggle.addEventListener('click', function () {
        nav.classList.toggle('show');
    });
});

