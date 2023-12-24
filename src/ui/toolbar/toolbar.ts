import "./file";
import "./examples";


const clearDropdowns = (except?: Element) => {
    let dropdowns = document.getElementsByClassName("dropdown");
    // Just yeet, we don't need to check
    for (let dropdown of dropdowns) {
        if (dropdown !== except) dropdown.classList.remove('active');
    }
}

window.addEventListener("click", (event: MouseEvent) => {
    if (event.target instanceof Element && event.target.matches('.dropdown-button')) return;

    clearDropdowns();
});


for (const element of document.getElementsByClassName("dropdown-button")) {
    element.addEventListener("click", () => {
        clearDropdowns(element.parentElement!);

        element.parentElement!.classList.toggle("active");
    });
}