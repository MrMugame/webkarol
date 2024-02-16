import { controller } from "../controller";
import { pickup, placeBrick, placeCuboid, removeCuboid, toggleMark } from "../view/controls";

document.querySelector("#btn-start")!.addEventListener("click", () => {
    controller.start();
});

document.querySelector("#btn-pause")!.addEventListener("click", () => {
    controller.pause();
});

document.querySelector("#btn-fastforward")!.addEventListener("click", () => {
    controller.fastforward();
});

document.querySelector("#btn-stop")!.addEventListener("click", () => {
    controller.stop();
});

document.querySelector("#btn-singlestep")!.addEventListener("click", () => {
    controller.singlestep();
});

document.querySelector("#btn-left")!.addEventListener("click", () => {
    controller.getWorld().rotateLeft();
});

document.querySelector("#btn-right")!.addEventListener("click", () => {
    controller.getWorld().rotateRight();
});

document.querySelector("#btn-forward")!.addEventListener("click", () => {
    controller.getWorld().step();
});

document.querySelector("#btn-h")!.addEventListener("click", () => {
    placeBrick();
});

document.querySelector("#btn-a")!.addEventListener("click", () => {
    pickup();
});

document.querySelector("#btn-m")!.addEventListener("click", () => {
    toggleMark();
});

document.querySelector("#btn-q")!.addEventListener("click", () => {
    placeCuboid();
});

document.querySelector("#btn-e")!.addEventListener("click", () => {
    removeCuboid();
});


document.querySelector("#btn-view")!.addEventListener("click", () => {
    // TODO: If its possible to change view from somethere else we have to take that into account
    if (controller.getView() === "3D") {
        controller.setView2D();
    } else {
        controller.setView3D();
    }

    document.querySelector("#btn-view")!.innerHTML = controller.getView();
});