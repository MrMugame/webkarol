import { KarolError } from "../../lang/util";


export class Terminal {

    constructor(private element: HTMLElement) {}

    private print(text: string, code: string, color: string) {
        this.element.innerHTML += `[<span style="color: ${color};">${code}</span>] ${text}<br>`;
    }

    printError(error: KarolError) {
        this.print(error.toString(), "ERROR", "red");
    }

    printInfo(message: string) {
        this.print(message, "INFO", "green");
    }

    clear(): void {
        this.element.innerHTML = "";

        this.printInfo("Karol ist bereit");
    }
}