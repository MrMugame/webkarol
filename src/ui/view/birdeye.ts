import { BLOCKSIZE, COLORS, CanvasView, GREY } from "./view";
import { CellType } from "./world";

const M = 3;

class BirdeyeView extends CanvasView {
    constructor(element: HTMLDivElement) {
        super(element);
    }

    async init() { return; }

    protected drawBackground() {
        let ctx = this.initCanvas(this.background);
        if (ctx === null) return;
        if (this.world === null) return;

        ctx.strokeStyle = "#0000ff";
        for (let i = 0; i <= this.world.worldSize.x; i++) {
            let p1 = {x: i * BLOCKSIZE, y: 0};
            let p2 = {x: i * BLOCKSIZE, y: BLOCKSIZE * this.world.worldSize.y};

            CanvasView.drawLine(ctx, p1, p2);
        }
        for (let i = 0; i <= this.world.worldSize.y; i++) {
            let p1 = {x: 0, y: i * BLOCKSIZE};
            let p2 = {x: BLOCKSIZE * this.world.worldSize.x, y: i * BLOCKSIZE};

            CanvasView.drawLine(ctx, p1, p2);
        }

        ctx.restore();
    }

    protected drawForeground() {
        let ctx = this.initCanvas(this.background);
        if (ctx === null) return;
        if (this.world === null) return;

        for (let i = 0; i < this.world.worldSize.x; i++) {
            for (let k = 0; k < this.world.worldSize.y; k++) {
                let cell = this.world.cells[i][k];
                if (cell === null) continue;

                let [x, y] = [i*BLOCKSIZE, k*BLOCKSIZE];

                let [a, b, c, d] = [x+M, y+M, BLOCKSIZE-M*2, BLOCKSIZE-M*2];
                if (cell.kind === CellType.Bricks) {
                    // TODO: Make color changable

                    ctx.lineWidth = M;
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
        ctx.moveTo(0,               -BLOCKSIZE/2+M);
        ctx.lineTo(-BLOCKSIZE/2+M/2, BLOCKSIZE/2-M);
        ctx.lineTo( BLOCKSIZE/2-M/2, BLOCKSIZE/2-M);
        ctx.lineTo(0,               -BLOCKSIZE/2+M);
        ctx.fill();
        ctx.closePath();

        ctx.restore();
    }
}

export { BirdeyeView }