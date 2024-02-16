import { controller } from "../controller";


const inputWidth = document.querySelector("#input-width")! as HTMLInputElement;
const inputLength = document.querySelector("#input-length")! as HTMLInputElement;
const inputHeight = document.querySelector("#input-height")! as HTMLInputElement;

const modal = document.getElementById("modal-new-world")! as HTMLDialogElement;
const callback = () => {
    let x = parseInt(inputWidth.value);
    let y = parseInt(inputLength.value);
    let z = parseInt(inputHeight.value);
    controller.setWorld(x, y, z);
}

document.getElementById("btn-bar-new-world")!.addEventListener("click", () => {
    modal.showModal();
    inputWidth.setAttribute("value", "5");
    inputLength.setAttribute("value", "10");
    inputHeight.setAttribute("value", "6");
});

document.querySelector("#modal-new-world .confirm")!.addEventListener("click", () => {
    modal.close();
    callback();
});

document.querySelector("#modal-new-world .deny")!.addEventListener("click", () => {
    modal.close();
});

document.getElementById("btn-bar-reset-world")!.addEventListener("click", () => {
    let {x, y, z} = controller.getWorld().worldSize;
    controller.setWorld(x, y, z);
});