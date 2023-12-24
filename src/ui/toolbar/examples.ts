import { controller } from "../controller";


const pathPrefix = "examples/";
const pathSuffix = ".kdp";

const examples = [
    "Pyramide",
    "Kreis"
];

let div = document.getElementById("dropdown-examples")!;
for (const example of examples) {
    let button = document.createElement("button");
    button.innerText = example;

    button.addEventListener("click", async () => {
        // TODO: Ask for comfomation (like with `new`)
        let res = await fetch(pathPrefix + example + pathSuffix);

        // TODO: Show error modal
        if (!res.ok) return;

        let text = await res.text();
        controller.getEditor().setText(text);
    });

    div.appendChild(button);
}