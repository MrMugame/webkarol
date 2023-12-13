import "./editor";

document.querySelector("#left-panel-handle")!.addEventListener("mousedown", () => {
    const resize = (event: MouseEvent) => {        
        document.querySelector("#left-panel")!.setAttribute("style", `width: ${event.pageX}px;`)
    };

    window.addEventListener("mousemove", resize);

    window.addEventListener("mouseup", () => {
        window.removeEventListener("mousemove", resize);
    });
});