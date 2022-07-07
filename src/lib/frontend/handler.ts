import { World } from "../graphics/world";
import { LanguageError, RuntimeError } from "../language/error";
import { Interpreter } from "../language/interpreter";
import { Lexer } from "../language/lexer";
import { Parser } from "../language/parser";
import { State } from "../language/types";
import { Editor } from "./editor";
import { Terminal } from "./terminal";
import { Logtypes, Options } from "./types";


export class Handler {
    world: World;
    interpreter: null | Generator<Boolean | State, Boolean | State | RuntimeError, any>;
    running: boolean;
    terminal: Terminal;
    editor: Editor;

    constructor(private options: Options) {
        this.world = new World(document.querySelector(options.workspace) || new Element());
        this.terminal = new Terminal(document.querySelector(options.output) || new Element());
        this.editor = new Editor(document.querySelector(options.editor) || new HTMLElement());
        this.interpreter = null;
        this.running = false;

        this.terminal.clear();

        const playbutton: HTMLButtonElement | null = document.querySelector(options.playbutton);
        if (playbutton != null) {
            playbutton.onclick = () => {
                if (this.interpreter === null) {
                    this.terminal.clear();
                    this.interpreter = this.compile(this.editor.getCode());
                    if (this.interpreter === null) { return }
                }

                this.terminal.print(Logtypes.Info, "Karol wurde gestartet");

                this.running = true;
                this.world.slow();

                this.loop();
            };
        }

        const pausebutton: HTMLButtonElement | null = document.querySelector(options.pausebutton);
        if (pausebutton != null) {
            pausebutton.onclick = () => {
                this.running = false;
                this.terminal.print(Logtypes.Info, "Karol wurde pausiert");
            };
        }

        const fastbutton: HTMLButtonElement | null = document.querySelector(options.fastbutton);
        if (fastbutton != null) {
            fastbutton.onclick = () => {
                this.running = true;
                this.world.fast();

                if (this.interpreter !== null) {
                    this.loop();
                }
            };
        }

        const stepbutton: HTMLButtonElement | null = document.querySelector(options.stepbutton);
        if (stepbutton != null) {
            stepbutton.onclick = () => {
                if (this.interpreter === null) {
                    this.terminal.clear();
                    this.interpreter = this.compile(this.editor.getCode());
                    if (this.interpreter === null) { return }
                    this.terminal.print(Logtypes.Info, "Karol wurde gestartet");
                }

                this.running = true;
                if(this.interpreter !== null) {
                    let res = this.interpreter.next();
                    this.parseExit(res);
                } 
            };
        }

        const resetbutton: HTMLButtonElement | null = document.querySelector(options.resetbutton);
        if (resetbutton != null) {
            resetbutton.onclick = () => {
                this.running = false;
                this.terminal.clear();
                this.world = new World(document.querySelector(this.options.workspace) || new Element());
                this.interpreter = null;
            };
        }

        this.gameloop();
    }

    compile(code: string) {
        let lexer = new Lexer(code);
        let tokens = lexer.tokenize();

        if (tokens instanceof LanguageError) {
            this.terminal.print(Logtypes.Error, tokens.asString());
            return null;
        }
        
        let parser = new Parser(tokens);
        let ast = parser.parse();
        
        if (ast instanceof LanguageError) {
            this.terminal.print(Logtypes.Error, ast.asString());
            return null;
        }

        const interpreter = new Interpreter(this.world, ast);

        return interpreter.run()
    }

    loop() {
        setTimeout(() => {
            if (!this.running || this.interpreter == null) {
                return;
            }

            let res = this.interpreter.next();

            let repeat = this.parseExit(res);

            if (repeat) {
                this.loop();
            }
            
        }, this.world.speed);
    }

    parseExit(res: IteratorResult<Boolean | State, Boolean | State | RuntimeError>) {
        let truthness = false;
        
        if (typeof res === "number" && res === State.Finished) {
            this.terminal.print(Logtypes.Info, "Karol ist fertig");
            this.interpreter = null;
            this.running = false;
        } else if (typeof res === "number" && res === State.Killed) {
            this.terminal.print(Logtypes.Info, "Karol wurde gestoppt");
            this.interpreter = null;
            this.running = false;
        } else if (res instanceof RuntimeError) {
            this.terminal.print(Logtypes.Error, res.asString());
            this.interpreter = null;
            this.running = false;
        } else if (typeof res === "boolean") {
            this.terminal.print(Logtypes.Error, "Unbekannter Fehler ist aufgetreten");
            this.interpreter = null;
            this.running = false;
        } else {
            truthness = true;
        }

        return truthness
    }

    gameloop() {
        this.world.animate();
        window.requestAnimationFrame(this.gameloop.bind(this));
    }
}