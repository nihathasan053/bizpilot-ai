document.addEventListener("DOMContentLoaded", function () {

    const navItems = document.querySelectorAll(".nav-item");
    const tabPanes = document.querySelectorAll(".tab-pane");
    const pageTitle = document.getElementById("pageTitle");

    navItems.forEach(function (item) {

        item.onclick = function () {

            const target = item.getAttribute("data-tab");

            navItems.forEach(function (nav) {
                nav.classList.remove("active");
            });

            tabPanes.forEach(function (pane) {
                pane.classList.remove("active");
            });

            item.classList.add("active");

            const targetPane = document.getElementById(target + "Tab");

            if (targetPane) {
                targetPane.classList.add("active");
            }

            if (pageTitle) {
                pageTitle.textContent = item.textContent.trim();
            }
        };
    });

});
