import { Logtypes } from "./types";


export class Terminal {
    constructor(private terminal: Element) {}

    print(type: Logtypes, str: string) {
        let prefix = "[UNDEFINED]";

        if (type === Logtypes.Error) {
            prefix = "[" + '<font color="#D25252">' + "ERROR" + '</font>' + "]";
        } else if (type === Logtypes.Info) {
            prefix = "[" + '<font color="#4EC9B0">' + "INFO" + '</font>' + "]";
        }

        prefix += " ";

        this.terminal.innerHTML += prefix + str + "<br>";
        this.terminal.scrollTop = this.terminal.scrollHeight;
    }

    clear() {
        this.terminal.textContent = "";
        this.print(Logtypes.Info, "Karol ist bereit")
    }
}