import "./toolbar/toolbar.ts";
import "./leftpanel/leftpanel.ts";
import "./bottompanel/bottompanel.ts";

import { Editor } from "./leftpanel/editor.ts";
import { Parser } from "../lang/parser.ts";
import { Terminal } from "./bottompanel/terminal.ts";
import { Interpreter } from "../lang/interpreter.ts";
import { World } from "./view/world.ts";
import { KarolError, Result } from "../lang/util.ts";
import { CabinetView } from "./view/cabinet.ts";
import { BirdeyeView } from "./view/birdeye.ts";


type Runner = Generator<void, Result<null, KarolError>, undefined>;

class Controller {
    private view: HTMLDivElement;
    private currentView: "3D" | "2D";

    private editor: Editor;
    private world: World;
    private runner: Runner | null;
    private terminal: Terminal;
    private running: boolean;

    constructor() {
        this.editor = new Editor(document.getElementById("editor")!);
        this.terminal = new Terminal(document.getElementById("bottom-panel-console")!);

        this.view = document.getElementById("view") as HTMLDivElement;
        this.currentView = "3D";

        this.world = new World({x: 5, y: 10, z: 6}, new CabinetView(this.view));

        this.running = false;
        this.runner = null;

        this.terminal.clear();
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

    start() {
        if (this.running) return;
        this.terminal.clear();

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
    }

    pause() {
        if (!this.running) return;
        this.running = false;

        this.terminal.printInfo("Karol wurde pausiert");
    }

    fastforward() {
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
    }

    stop() {
        this.running = false;

        this.runner = null;

        this.terminal.printInfo("Karol wurde gestopt");
    }

    singlestep() {
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
    }

    getEditor = () => this.editor;

    isRunning = () => this.running;

    getWorld = () => this.world;

    setView3D() {
        if (this.currentView === "3D") return;
        this.currentView = "3D";
        this.world.updateView(new CabinetView(this.view));
    }

    setView2D() {
        if (this.currentView === "2D") return;
        this.currentView = "2D";
        this.world.updateView(new BirdeyeView(this.view));
    }

    getView() {
        return this.currentView;
    }

    setWorld(x: number, y: number, z: number) {
        this.world.kill();
        this.world = new World({x, y, z}, this.currentView === "3D" ? new CabinetView(this.view) : new BirdeyeView(this.view));
    }
}

export let controller: Controller;

window.onload = () => {
    controller = new Controller();
}