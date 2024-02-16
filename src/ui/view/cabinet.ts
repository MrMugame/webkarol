import { BLOCKSIZE, CanvasView } from "./view";
import { CellType, Color } from "./world";

type ColoredImages = {
    red: HTMLImageElement,
    blue: HTMLImageElement,
    green: HTMLImageElement,
    yellow: HTMLImageElement,
};

const colorToImage = (imgs: ColoredImages, color: Color): HTMLImageElement => {
    switch (color) {
        case Color.Yellow: return imgs.yellow;
        case Color.Green: return imgs.green;
        case Color.Blue: return imgs.blue;
        case Color.Red: return imgs.red;
    }
}

class CabinetView extends CanvasView {
    private initQueue: Promise<void>[]

    private ORIGIN: {x: number, y: number} = { x: 0, y: 0}

    private PLAYER_IMG: {
        north: HTMLImageElement,
        east: HTMLImageElement,
        south: HTMLImageElement,
        west: HTMLImageElement
    };

    private BRICK_IMG: ColoredImages;

    private MARK_IMG: ColoredImages;

    private CUBOID_IMG: HTMLImageElement

    constructor(element: HTMLDivElement) {
        super(element);
        this.initQueue = []

        const loadImage = (url: string) => {
            let img = new Image();
            img.src = url;

            this.initQueue.push(new Promise<void>((resolve, _) => {
                img.onload = () => resolve();
            }));

            return img;
        }

        this.PLAYER_IMG = {
            north: loadImage("assets/robot_north.png"),
            east: loadImage("assets/robot_east.png"),
            south: loadImage("assets/robot_south.png"),
            west: loadImage("assets/robot_west.png")
        }

        this.BRICK_IMG = {
            red: loadImage("assets/brick_red.png"),
            blue: loadImage("assets/brick_blue.png"),
            yellow: loadImage("assets/brick_yellow.png"),
            green: loadImage("assets/brick_green.png"),
        }

        this.MARK_IMG = {
            red: loadImage("assets/mark_red.png"),
            blue: loadImage("assets/mark_blue.png"),
            yellow: loadImage("assets/mark_yellow.png"),
            green: loadImage("assets/mark_green.png"),
        }

        this.CUBOID_IMG = loadImage("assets/cuboid.png");
    }

    async init() {
        await Promise.all(this.initQueue);
    }

    private convert(x: number, y: number, z: number): {x: number, y: number} {
        // TODO: Maybe move this somethere else idk
        this.ORIGIN = {
            x: this.world!.worldSize.x*BLOCKSIZE,
            y: this.world!.worldSize.z*BLOCKSIZE,
        }

        return {
            x: this.ORIGIN.x + 1*x - 0.5*y,
            y: this.ORIGIN.y + 0.5*y - 0.5*z
        }
    }

    protected drawBackground() {
        let ctx = this.initCanvas(this.background);
        if (ctx === null) return;
        if (this.world === null) return;

        // XY-PLANE
        ctx.strokeStyle = "#0000ff";
        for (let i = 0; i <= this.world.worldSize.x; i++) {
            let p1 = this.convert(i * BLOCKSIZE, 0, 0);
            let p2 = this.convert(i * BLOCKSIZE, BLOCKSIZE * this.world.worldSize.y, 0);

            CanvasView.drawLine(ctx, p1, p2);
        }
        for (let i = 0; i <= this.world.worldSize.y; i++) {
            let p1 = this.convert(0, i * BLOCKSIZE, 0);
            let p2 = this.convert(BLOCKSIZE * this.world.worldSize.x, i * BLOCKSIZE, 0);

            CanvasView.drawLine(ctx, p1, p2);
        }

        // XZ-PLANE
        ctx.strokeStyle = "#0000ff";
        ctx.setLineDash([10, 5, 5, 5]);
        for (let i = 0; i <= this.world.worldSize.x; i++) {
            let p1 = this.convert(i * BLOCKSIZE, 0, 0);
            let p2 = this.convert(i * BLOCKSIZE, 0, BLOCKSIZE * this.world.worldSize.z);

            CanvasView.drawLine(ctx, p1, p2);
        }
        {
            let p1 = this.convert(0, 0, this.world.worldSize.z * BLOCKSIZE);
            let p2 = this.convert(BLOCKSIZE * this.world.worldSize.x, 0, this.world.worldSize.z * BLOCKSIZE);

            CanvasView.drawLine(ctx, p1, p2);
        }

        // YZ-PLANE
        ctx.strokeStyle = "#0000ff";
        ctx.setLineDash([10, 5, 5, 5]);
        for (let i = 0; i <= this.world.worldSize.y; i++) {
            let p1 = this.convert(0, i * BLOCKSIZE, 0);
            let p2 = this.convert(0, i * BLOCKSIZE, BLOCKSIZE * this.world.worldSize.z);

            CanvasView.drawLine(ctx, p1, p2);
        }
        {
            let p1 = this.convert(0, 0, this.world.worldSize.z * BLOCKSIZE);
            let p2 = this.convert(0, BLOCKSIZE * this.world.worldSize.y, this.world.worldSize.z * BLOCKSIZE);

            CanvasView.drawLine(ctx, p1, p2);
        }

        ctx.restore();
    }


    protected drawForeground() {
        let ctx = this.initCanvas(this.foreground);
        if (ctx === null) return;
        if (this.world === null) return;

        for (let y = 0; y < this.world.worldSize.y; y++) {
            for (let z = 0; z < this.world.worldSize.z; z++) {
                for (let x = 0; x < this.world.worldSize.x; x++) {
                    let cell = this.world.cells[x][y];

                    if (cell?.kind === CellType.Bricks && cell.bricks.length > z) {
                        let p1 = this.convert(x*BLOCKSIZE, y*BLOCKSIZE+(BLOCKSIZE), z*BLOCKSIZE);

                        ctx.drawImage(colorToImage(this.BRICK_IMG, cell.bricks[z]), p1.x, p1.y-(BLOCKSIZE), BLOCKSIZE*1.5, BLOCKSIZE);

                    } else if (cell?.kind === CellType.Cuboid && z == 2) {
                        // Draw on z == 2 here to not get under the second z layer of bricks (e.g. if to the left of the cuboid is a brick)
                        let p1 = this.convert(x*BLOCKSIZE, y*BLOCKSIZE+(BLOCKSIZE), 0);

                        ctx.drawImage(this.CUBOID_IMG, p1.x, p1.y-(1.5*BLOCKSIZE), BLOCKSIZE*1.5, BLOCKSIZE*1.5);
                    }

                    // Handle mark
                    if (cell?.kind === CellType.Bricks && Math.max(cell.bricks.length-1, 0) === z && cell.mark !== null) {
                        let p1 = this.convert(x*BLOCKSIZE, y*BLOCKSIZE+(BLOCKSIZE), (cell.bricks.length)*BLOCKSIZE);

                        ctx.drawImage(colorToImage(this.MARK_IMG, cell.mark), p1.x, p1.y-(BLOCKSIZE), BLOCKSIZE*1.5, BLOCKSIZE);
                    }

                    let playerX = this.world.playerPosition.x, playerY = this.world.playerPosition.y;
                    if (playerX === x && playerY === y) {
                        let height = 0;
                        let cell = this.world.cells[playerX][playerY];
                        if (cell?.kind === CellType.Bricks) height = cell.bricks.length;

                        if (height === z || height === this.world.worldSize.z) {
                            let p1 = this.convert(this.world.playerPosition.x*BLOCKSIZE, this.world.playerPosition.y*BLOCKSIZE+(BLOCKSIZE/2), height*BLOCKSIZE);
                            let img = Object.values(this.PLAYER_IMG)[this.world.playerPosition.direction];
                            ctx.drawImage(img, p1.x, p1.y-(2*BLOCKSIZE), BLOCKSIZE, BLOCKSIZE*2);
                        }
                    }
                }
            }
        }

        ctx.restore();
    }
}

export { CabinetView }