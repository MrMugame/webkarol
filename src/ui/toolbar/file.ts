import { controller } from "../controller";

document.getElementById("btn-bar-open")!.addEventListener("click", () => {
    let input = document.createElement("input");
    input.type = "file";
    input.accept = ".kdp";
    input.onchange = async () => {
        let text = await input.files?.[0].text();

        // TODO: Show error
        if (text === undefined) return;

        controller.getEditor().setText(text);
    }
    input.click();
});

const modal = document.getElementById("modal-new")! as HTMLDialogElement;
const callback = () => {
    // TODO: We should really create the sense of a document and create a new one here
    // So if the document was just saved the modal doesnt show up.
    controller.getEditor().setText("");
}

document.getElementById("btn-bar-new")!.addEventListener("click", () => {
    if (controller.getEditor().getText() !== "") {
        modal.showModal();
    } else callback();
});

document.querySelector("#modal-new .confirm")!.addEventListener("click", () => {
    modal.close();
    callback();
});

document.querySelector("#modal-new .deny")!.addEventListener("click", () => {
    modal.close();
});

document.getElementById("btn-bar-saveas")!.addEventListener("click", () => {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(controller.getEditor().getText()));
    element.setAttribute('download', "programm.kdp");
    element.style.display = 'none';

    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
});