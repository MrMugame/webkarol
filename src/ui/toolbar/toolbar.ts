import "./file";

window.addEventListener("click", (event: MouseEvent) => {
    if (event.target instanceof Element && event.target.matches('.dropdown-button')) return;

    let dropdowns = document.getElementsByClassName("dropdown");
    // Just yeet, we don't need to check
    for (let dropdown of dropdowns) dropdown.classList.remove('active');
});