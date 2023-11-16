document.getElementById("btn-open")?.addEventListener("click", () => {
    let input = document.createElement("input");
    input.type = "file";
    input.accept = ".kdp";
    input.onchange = () => {
        console.log(input.files?.[0].text().then((e) => console.log(e)));
    }
    input.click();
});