import { BLOCKSIZE, COLORS, GREY, MARGIN, View } from "./view";
import { CellType, World } from "./world";


class BirdeyeView implements View {
    private world: World | null = null;

    private readonly container: HTMLDivElement;
    private readonly background: HTMLCanvasElement;
    private readonly foreground: HTMLCanvasElement;

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

    private updateSize(entries: ResizeObserverEntry[]) {
        let box = entries[0].contentBoxSize[0];

        this.background.width = box.inlineSize;
        this.background.height = box.blockSize;
        this.foreground.width = box.inlineSize;
        this.foreground.height = box.blockSize;

        this.updateScreen();
    }

    private updateScreen() {
        this.drawBackground();
        this.drawForeground();
    }

    private initCanvas(ctx: CanvasRenderingContext2D) {
        ctx.translate(MARGIN.x+0.5, MARGIN.y+0.5);
        // TODO: Scale
    }

    private drawBackground() {
        if (this.world === null) return; // TODO: Maybe send error message (+ foreground)

        let ctx = this.background.getContext("2d");
        if (ctx === null) return; // TODO: Maybe try regenerating the canvas here? (+ foreground)
        ctx.save();

        ctx.clearRect(0, 0, this.background.width, this.background.height);
        this.initCanvas(ctx);

        ctx.strokeStyle = "#0000ff";
        for (let i = 0; i <= this.world.worldSize.x; i++) {
            ctx.beginPath();
            ctx.moveTo(i * BLOCKSIZE, 0);
            ctx.lineTo(i * BLOCKSIZE, BLOCKSIZE * this.world.worldSize.y);
            ctx.stroke();
            ctx.closePath();
        }
        for (let i = 0; i <= this.world.worldSize.y; i++) {
            ctx.beginPath();
            ctx.moveTo(0, i * BLOCKSIZE);
            ctx.lineTo(BLOCKSIZE * this.world.worldSize.x, i * BLOCKSIZE);
            ctx.stroke();
            ctx.closePath();
        }

        ctx.restore();
    }

    private drawForeground() {
        if (this.world === null) return;

        let ctx = this.foreground.getContext("2d");
        if (ctx === null) return;
        ctx.save();

        ctx.clearRect(0, 0, this.foreground.width, this.foreground.height);
        this.initCanvas(ctx);

        let m = 3;

        for (let i = 0; i < this.world.worldSize.x; i++) {
            for (let k = 0; k < this.world.worldSize.y; k++) {
                let cell = this.world.cells[i][k];
                if (cell === null) continue;

                let [x, y] = [i*BLOCKSIZE, k*BLOCKSIZE];

                let [a, b, c, d] = [x+m, y+m, BLOCKSIZE-m*2, BLOCKSIZE-m*2];
                if (cell.kind === CellType.Bricks) {
                    // TODO: Make color changable

                    ctx.lineWidth = m;
                    if (cell.mark !== null) {
                        ctx.fillStyle = COLORS.get(cell.mark)!.stroke;
                        ctx.strokeStyle = "#000000";

                        ctx.fillRect(a, b, c, d);
                        ctx.strokeRect(a, b, c, d);
                    } else if (cell.bricks.length > 0) {
                        let pair = COLORS.get(cell.bricks[cell.bricks.length - 1])!;
                        ctx.fillStyle = pair.background;
                        ctx.strokeStyle = pair.stroke;

                        ctx.fillRect(a, b, c, d);
                        ctx.strokeRect(a, b, c, d);

                        ctx.fillStyle = "#fff";
                        ctx.font = "30px sans-serif";
                        ctx.textAlign = "center";
                        ctx.textBaseline = "middle";
                        ctx.fillText(cell.bricks.length.toString(), x + BLOCKSIZE/2, y + BLOCKSIZE/2);
                    }
                } else if (cell.kind === CellType.Cuboid) {
                    ctx.fillStyle = GREY.background;
                    ctx.strokeStyle = GREY.stroke;

                    ctx.fillRect(a, b, c, d);
                    ctx.strokeRect(a, b, c, d);
                }
            }
        }

        let {x, y, direction} = this.world.playerPosition;
        y *= BLOCKSIZE;
        x *= BLOCKSIZE;

        ctx.fillStyle = "#000000";
        ctx.translate(x+BLOCKSIZE/2, y+BLOCKSIZE/2);
        ctx.rotate(direction*(Math.PI/2));

        ctx.beginPath();
        ctx.moveTo(0,               -BLOCKSIZE/2+m);
        ctx.lineTo(-BLOCKSIZE/2+m/2, BLOCKSIZE/2-m);
        ctx.lineTo( BLOCKSIZE/2-m/2, BLOCKSIZE/2-m);
        ctx.lineTo(0,               -BLOCKSIZE/2+m);
        ctx.fill();
        ctx.closePath();

        ctx.restore();
    }
}

export { BirdeyeView }