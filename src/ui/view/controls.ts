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

const toggleMark = () => {
    if (controller.getWorld().isMark()) controller.getWorld().removeMark();
    else controller.getWorld().setMark(Color.Yellow);
}

const placeCuboid = () => {
    controller.getWorld().placeCuboid();
}

const removeCuboid = () => {
    controller.getWorld().removeCuboid();
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
        case "m": toggleMark(); break;
        case "Q":
        case "q": placeCuboid(); break;
        case "E":
        case "e": removeCuboid(); break;
    }
})

export { left, right, placeBrick, placeCuboid, forward, backward, pickup, toggleMark, removeCuboid };