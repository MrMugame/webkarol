import "./toolbar/toolbar.ts";
import "./leftpanel/leftpanel.ts";
import "./bottompanel/bottompanel.ts";

import { Editor } from "./leftpanel/editor.ts";
import { Parser } from "../lang/parser.ts";
import { Terminal } from "./bottompanel/terminal.ts";
import { Interpreter } from "../lang/interpreter.ts";
import { World } from "./view/world.ts";
import { BirdeyeView } from "./view/birdeye.ts";
import { KarolError, Result } from "../lang/util.ts";


type Runner = Generator<void, Result<null, KarolError>, undefined>;

class Controller {
    private editor: Editor;
    private world: World;
    private runner: Runner | null;
    private terminal: Terminal;
    private running: boolean;

    constructor() {
        this.editor = new Editor(document.getElementById("editor")!);
        this.terminal = new Terminal(document.getElementById("bottom-panel-console")!);
        this.world = new World({x: 5, y: 10, z: 5}, new BirdeyeView(document.getElementById("view") as HTMLDivElement));
        this.running = false;
        this.runner = null;

        this.terminal.clear();

        // TODO: Move all the event handler out of the constructor into a seperate file
        document.querySelector("#btn-start")!.addEventListener("click", () => {
            if (this.running) return;

            if (this.runner === null) {
                // No runner exists. This means there is currently no program running
                // nor is there a compiled one waiting
                this.compile();
                if (this.runner === null) return;
            } else if (this.runner.next().done === true) {
                this.compile();
            }

            this.terminal.printInfo("Karol wurde gestartet");

            this.running = true;
            this.world.setSlow();

            this.loop();
        });

        document.querySelector("#btn-pause")!.addEventListener("click", () => {
            if (!this.running) return;
            this.running = false;

            this.terminal.printInfo("Karol wurde pausiert");
        });

        document.querySelector("#btn-fastforward")!.addEventListener("click", () => {
            if (this.running) return;

            if (this.runner === null) {
                // No runner exists. This means there is currently no program running
                // nor is there a compiled one waiting
                this.compile();
                if (this.runner === null) return;
            } else if (this.runner.next().done === true) {
                this.compile();
            }

            this.terminal.printInfo("Karol wurde gestartet");

            this.running = true;
            this.world.setFast();

            this.loop();
        });

        document.querySelector("#btn-stop")!.addEventListener("click", () => {
            this.running = false;

            this.runner = null;

            this.terminal.printInfo("Karol wurde gestopt");
        });

        document.querySelector("#btn-singlestep")!.addEventListener("click", () => {
            if (this.running) return;

            if (this.runner === null) {
                // No runner exists. This means there is currently no program running
                // nor is there a compiled one waiting
                this.compile();
                if (this.runner === null) return;
                this.terminal.printInfo("Karol wurde gestartet");
            }

            if (this.runner !== null) {
                let res = this.runner.next();

                if (res.done) {
                    if(!res.value) return;
                    if (!res.value.isOk()) this.terminal.printError(res.value.unwrapErr());
                    else this.terminal.printInfo("Karol ist fertig");
                }
            }
        });
    }

    private compile() {
        let parser = new Parser(this.editor.getText());

        let ast = parser.parse();

        if (!ast.isOk()) {
            this.terminal.printError(ast.unwrapErr());
            return;
        }

        let interpreter = new Interpreter(ast.unwrap(), this.world, (lineNumber) => {
            this.editor.highlightLine(lineNumber);
        });
        this.runner = interpreter.interpret();
    }

    private loop() {
        setTimeout(() => {
            if (!this.running || this.runner === null) {
                this.running = false;
                return;
            }

            let res = this.runner.next();

            if (res.done) {
                if (!res.value) return;
                if (!res.value.isOk()) this.terminal.printError(res.value.unwrapErr());
                else this.terminal.printInfo("Karol ist fertig");
                this.running = false;
            } else this.loop();
        }, this.world.getSpeed());
    }

    getEditor = () => this.editor;

    isRunning = () => this.running;

    getWorld = () => this.world;
}

export let controller: Controller;

window.onload = () => {
    controller = new Controller();
}