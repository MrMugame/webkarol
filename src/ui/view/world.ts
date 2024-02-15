//import { Result } from "../../lang/util";

import { Result, assert } from "../../lang/util"
import { View } from "./view"

//const Err = Result.Err, Ok = Result.Ok;


// N |-------- x
// ^ |
// | |
//   y
type WorldSize = {
    x: number
    y: number
    z: number
}

const enum Rotation {
    North = 0,
    East  = 1,
    South = 2,
    West  = 3
}

type PlayerPosition = {
    x: number
    y: number
    direction: Rotation
}

// Cell represents one column in the World.
// A column is either filled with a stack of bricks and optionally a mark
// or a block
type Cell = Bricks | Cuboid | null;

type Cuboid = {
    kind: CellType.Cuboid
}

type Bricks = {
    kind: CellType.Bricks
    bricks: Color[]
    mark: Color | null
}

const enum CellType {
    Bricks,
    Cuboid
}

// Add black for marks
const enum Color {
    Yellow,
    Green,
    Blue,
    Red
}

const Err = Result.Err, Ok = Result.Ok;

class World {
    private readonly size: WorldSize;
    private world: Cell[][]; // x, y
    private player: PlayerPosition;
    private speed: "fast" | "slow";
    private jumpable: number;

    private view: View;

    constructor(size: WorldSize, view: View) {
        this.speed = "slow";
        this.size = size;
        this.view = view;
        this.view.setWorld(this);
        this.world = new Array(this.size.x).fill(null).map(() => new Array(this.size.y).fill(null));
        this.player = { x: 0, y: 0, direction: Rotation.South };
        this.jumpable = 1;
    }

    get cells(): Cell[][] {
        return this.world;
    }

    get playerPosition(): PlayerPosition {
        return this.player;
    }

    get worldSize(): WorldSize {
        return this.size;
    }

    getSpeed(): number {
        return this.speed === "fast" ? 10 : 50;
    }

    setSlow(): void {
        this.speed = "slow";
    }

    setFast(): void {
        this.speed = "fast";
    }

    private cellInFront(): [number, number] {
        // North = 0   -> y -= 1
        // South = 2   -> y += 1
        // East  = 1   -> x += 1
        // West  = 3   -> x -= 1
        let x = this.player.x + [ 0, 1, 0, -1][this.player.direction]; // East,West
        let y = this.player.y + [-1, 0, 1,  0][this.player.direction]; // North,South

        return [x, y];
    }

    private cellExists(x: number, y: number): boolean {
        return (x < 0 || x >= this.size.x || y < 0 || y >= this.size.y);
    }


    private cellIsCuboid(x: number, y: number): boolean {
        return this.world[x][y]?.kind === CellType.Cuboid;
    }

    private cellIsFull(x: number, y: number): boolean {
        let cell = this.world[x][y];

        return cell?.kind === CellType.Bricks && cell.bricks.length >= this.size.z;
    }

    private cellIsEmpty(x: number, y: number): boolean {
        let cell = this.world[x][y];

        return (cell?.kind === CellType.Bricks && cell.bricks.length === 0) || cell === null;
    }

    private cellIsNotJumpable(x: number, y: number): boolean {
        let cell = this.world[x][y];
        let playerCell = this.world[this.playerPosition.x][this.playerPosition.y];
        let maxHeight = this.jumpable + (playerCell?.kind === CellType.Bricks ? playerCell.bricks.length : 0);

        return cell?.kind === CellType.Bricks && cell.bricks.length > maxHeight;
    }

    // The methods on the world always just take one argument. This has the reason that with a count
    // argument, we couldn't easily mimic the behaviour, that karol shows where he is gonna run into
    // the wall knowing that it wouldn't work on the first move.
    // So a call like schritt(5) just gets expanded to a loop wiederhole 5 mal schritt endewiederhole

    step(): Result<null> {
        let [x, y] = this.cellInFront();

        if (this.cellExists(x, y)) {
            return Err(new Error(";; WIP ;; Karol cant walk into wall"));
        } else if (this.cellIsCuboid(x, y)) {
            return Err(new Error(";; WIP ;; Karol cant walk into cuboid"));
        } else if (this.cellIsNotJumpable(x, y)) {
            return Err(new Error(";; WIP ;; Karol cant jump that high"));
        }

        this.player.x = x;
        this.player.y = y;

        this.view.redraw();
        return Ok(null);
    }

    stepBack(): Result<null> {
        this.rotateLeft();
        this.rotateLeft();
        let res = this.step();
        this.rotateLeft();
        this.rotateLeft();
        if (!res.isOk()) return res;

        this.view.redraw();
        return Ok(null);
    }

    rotateLeft(): void {
        // https://stackoverflow.com/questions/4467539/javascript-modulo-gives-a-negative-result-for-negative-numbers
        this.player.direction = ((this.player.direction - 1 % 4) + 4) % 4;

        this.view.redraw();
    }

    rotateRight(): void {
        this.player.direction = (this.player.direction + 1) % 4;

        this.view.redraw();
    }

    placeBrick(color: Color | null): Result<null> {
        let [x, y] = this.cellInFront();

        if (this.cellExists(x, y)) {
            return Err(new Error(";; WIP ;; Karol cant place because of a wall"));
        } else if (this.cellIsCuboid(x, y)) {
            return Err(new Error(";; WIP ;; Karol cell infront is a cuboid"));
        } else if (this.cellIsFull(x, y)) {
            return Err(new Error(";; WIP ;; Karol cell is full"));
        }

        color = color ?? Color.Red;
        let cell = this.world[x][y];
        if (cell === null) {
            this.world[x][y] = { kind: CellType.Bricks, bricks: [color], mark: null };
        } else if (cell.kind === CellType.Bricks) {
            cell.bricks.push(color);
        }

        this.view.redraw();
        return Ok(null);
    }

    pickupBrick(): Result<null> {
        let [x, y] = this.cellInFront();

        if (this.cellExists(x, y)) {
            return Err(new Error(";; WIP ;; Karol cant place because of a wall"));
        } else if (this.cellIsCuboid(x, y)) {
            return Err(new Error(";; WIP ;; Karol cell infront is a cuboid"));
        } else if (this.cellIsEmpty(x, y)) {
            return Err(new Error(";; WIP ;; Karol cell is empty"));
        }

        let cell = this.world[x][y];
        if (cell?.kind === CellType.Bricks) cell.bricks.pop();

        this.view.redraw();
        return Ok(null);
    }

    // Set mark doesn't error for some reason
    setMark(color: Color | null): void {
        color = color ?? Color.Yellow;
        let cell = this.world[this.player.x][this.player.y];

        assert(cell?.kind != CellType.Cuboid, "Karol is standing on a cuboid?!");

        if (cell === null) {
            this.world[this.player.x][this.player.y] = { kind: CellType.Bricks, bricks: [], mark: color };
        } else if (cell.kind === CellType.Bricks) {
            cell.mark = color;
        }

        this.view.redraw();
    }

    // Remove mark doesnt error either
    removeMark(): void {
        let cell = this.world[this.player.x][this.player.y];

        assert(cell?.kind != CellType.Cuboid, "Karol is standing on a cuboid?!");

        if (cell === null) {
            return;
        } else if (cell.kind === CellType.Bricks) {
            cell.mark = null;
        }

        this.view.redraw();
    }

    placeCuboid(): Result<null> {
        let [x, y] = this.cellInFront();

        if (this.cellExists(x, y)) {
            return Err(new Error(";; WIP ;; Karol cant place because of a wall"));
        } else if (!this.cellIsEmpty(x, y)) {
            return Err(new Error(";; WIP ;; Karol cell is not empty"));
        }

        this.world[x][y] = { kind: CellType.Cuboid };

        this.view.redraw();
        return Ok(null);
    }

    removeCuboid(): Result<null> {
        let [x, y] = this.cellInFront();

        if (this.cellExists(x, y)) {
            return Err(new Error(";; WIP ;; Karol cant place because of a wall"));
        } else if (!this.cellIsCuboid(x, y)) {
            return Err(new Error(";; WIP ;; Karol cant pickup nothing"));
        }

        this.world[x][y] = null;

        this.view.redraw();
        return Ok(null);
    }

    isWall(): boolean {
        let [x, y] = this.cellInFront();
        return this.cellExists(x, y) || this.cellIsCuboid(x, y);
    }

    // Don't use 1 as the default value directly, because I don't wanna see one undefined here ever
    isBrick(count: number | null = null, color: Color | null = null): boolean {
        assert(count === 1 ? color !== null : color === null, "Cannot pass both count and color to isBrick()");
        let [x, y] = this.cellInFront();

        let cell = this.world[x][y];
        if (cell?.kind === CellType.Bricks) {
            if (color !== null) {
                return cell.bricks.some(x => x === color);
            } else return cell.bricks.length >= (count ?? 1);
        } else return false;
    }

    isMark(color: Color | null = null): boolean {
        let cell = this.world[this.player.x][this.player.y];

        if (cell?.kind === CellType.Bricks) {
            if (color === null) {
                return cell.mark !== null;
            } else return cell.mark === color;
        } else return false;
    }

    isRotation(rot: Rotation): boolean {
        return this.player.direction === rot;
    }

    beep(): void {
        const beep = new Audio("/assets/beep.wav");
        beep.play();
    }

    // TODO: Backpack

}

export { World, CellType, Color, Rotation }