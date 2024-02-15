import { controller } from "../controller"
import { Color } from "./world";

const left = () => {
    controller.getWorld().rotateLeft();
}

const right = () => {
    controller.getWorld().rotateRight();
}

const forward = () => {
    controller.getWorld().step();
}

const backward = () => {
    controller.getWorld().stepBack();
}

const placeBrick = () => {
    controller.getWorld().placeBrick(Color.Red);
}

const pickup = () => {
    controller.getWorld().pickupBrick();
}

const setMark = () => {
    controller.getWorld().setMark(Color.Yellow);
}

const placeCuboid = () => {
    controller.getWorld().placeCuboid();
}


document.getElementById("view")!.addEventListener("keydown", (event) => {
    if (controller.isRunning()) return;

    switch (event.key) {
        case "ArrowLeft": left(); break;
        case "ArrowRight": right(); break;
        case "ArrowUp": forward(); break;
        case "ArrowDown": backward(); break;
        case "H":
        case "h": placeBrick(); break;
        case "A":
        case "a": pickup(); break;
        case "M":
        case "m": setMark(); break;
        case "Q":
        case "q": placeCuboid(); break;
    }
})