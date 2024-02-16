import { html } from "../../../docs/help.md";

const modal = document.getElementById("modal-help")! as HTMLDialogElement;

modal.querySelector(".content")!.innerHTML = html;

document.getElementById("btn-bar-help")!.addEventListener("click", () => {
    modal.showModal();
});

document.querySelector("#modal-help .confirm")!.addEventListener("click", () => {
    modal.close();
});