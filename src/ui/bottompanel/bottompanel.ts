import "./toolbar";

document.querySelector("#bottom-panel-handle")!.addEventListener("mousedown", () => {
    const resize = (event: MouseEvent) => {
        document.querySelector("#bottom-panel")!.setAttribute("style", `height: ${window.innerHeight - event.pageY}px;`)
    };

    window.addEventListener("mousemove", resize);

    window.addEventListener("mouseup", () => {
        window.removeEventListener("mousemove", resize);
    });
});