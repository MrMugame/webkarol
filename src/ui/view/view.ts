import { Color, World } from "./world";
import "./controls.ts";

const MARGIN = { x: 30, y: 30 };
const BLOCKSIZE = 50;

type ColorPair = { background: string, stroke: string };
const COLORS: Map<Color, ColorPair> = new Map([
    [Color.Yellow, { background: "#cdcd00", stroke: "#ffff00" }],
    [Color.Green, { background: "#00cd00", stroke: "#00ff00" }],
    [Color.Red, { background: "#cd0000", stroke: "#ff0000" }],
    [Color.Blue, { background: "#0000cd", stroke: "#0000ff" }]
]);
const GREY: ColorPair = { background: "#404040", stroke: "#808080" };

type Point = { x: number, y: number };

interface View {
    init(): Promise<void>;
    redraw(): void;
    // So I choose dependency injection here, so the world can change the view
    // easily without loosing all data. Caveat is that the view needs a reference
    // to the world and I couldn't come up with a better so solution, so this is it
    // for now.
    // This comes with 2 major draw backs:
    // 1. One could forget to set the world/Its never checked by the compiler if you did
    // 2. The view then always has to check if the property is null, because it's set
    // after the constructor
    setWorld(world: World): void;
}

abstract class CanvasView implements View {
    protected world: World | null = null;

    private readonly container: HTMLDivElement;
    protected readonly background: HTMLCanvasElement;
    protected readonly foreground: HTMLCanvasElement;

    private readonly observer: ResizeObserver;

    constructor(element: HTMLDivElement) {
        this.container = element;

        // Create canvas for background and foreground, so we can layer them.
        // This lets us redraw the foreground (Karol , Bricks) without redrawing
        // the background
        this.background = document.createElement("canvas");
        this.background.style.zIndex = "1";
        this.container.appendChild(this.background);

        this.foreground = document.createElement("canvas");
        this.foreground.style.zIndex = "2";
        this.container.appendChild(this.foreground);

        this.observer = new ResizeObserver(this.updateSize.bind(this));
        this.observer.observe(this.container);
    }

    abstract init(): Promise<void>;

    protected updateScreen() {
        this.drawBackground();
        this.drawForeground();
    }

    private updateSize(entries: ResizeObserverEntry[]) {
        let box = entries[0].contentBoxSize[0];

        this.background.width = box.inlineSize;
        this.background.height = box.blockSize;
        this.foreground.width = box.inlineSize;
        this.foreground.height = box.blockSize;

        this.updateScreen();
    }

    setWorld(world: World): void {
        this.world = world;
    }

    kill() {
        this.observer.disconnect();
    }

    redraw() {
        this.drawForeground();
    }

    protected initCanvas(canvas: HTMLCanvasElement): CanvasRenderingContext2D | null {
        if (this.world === null) return null;

        let ctx = canvas.getContext("2d");
        if (ctx === null) return null;

        ctx.save();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.translate(MARGIN.x+0.5, MARGIN.y+0.5);
        // TODO: Scale

        return ctx;
    }

    protected static drawLine(ctx: CanvasRenderingContext2D, p1: Point, p2: Point) {
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
        ctx.closePath();
    }

    protected abstract drawForeground(): void;
    protected abstract drawBackground(): void;
}


export { MARGIN, BLOCKSIZE, COLORS, GREY, CanvasView }
export type { View, Point }