//import { Result } from "../../lang/util";

import { assert } from "../../lang/util"

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
    count: number
    mark: MarkColor | null
}

const enum CellType {
    Bricks,
    Cuboid
}

const enum MarkColor {
    Yellow,
    Green,
    Blue,
    Red
}

class World {
    private readonly size: WorldSize;
    private world: Cell[][]; // x, y
    private player: PlayerPosition;
    //private speed: "schnell" | "langsam";

    private view: View;

    constructor(size: WorldSize, view: View) {
        this.size = size;
        this.view = view;
        this.world = new Array(this.size.x).fill(null).map(() => new Array(this.size.y).fill(null));
        this.player = { x: 0, y: 0, direction: Rotation.South };
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

        return cell?.kind === CellType.Bricks && cell.count >= this.size.z;
    }

    private cellIsEmpty(x: number, y: number): boolean {
        let cell = this.world[x][y];

        return cell?.kind === CellType.Bricks && cell.count <= 0
    }

    step() {
        let [x, y] = this.cellInFront();

        if (this.cellExists(x, y)) {
            return; // TODO: Karol cant walk into wall
        } else if (this.cellIsCuboid(x, y)) {
            return; // TODO: Karol cant walk into wall
        } // TODO: Handle case of cell being above certain level, where karol cant jump

        this.player.x = x;
        this.player.y = y;

        this.view.invalidatePlayer();
    }

    rotateLeft() {
        // https://stackoverflow.com/questions/4467539/javascript-modulo-gives-a-negative-result-for-negative-numbers
        this.player.direction = ((this.player.direction - 1 % 4) + 4) % 4;

        this.view.invalidatePlayer();
    }

    rotateRight() {
        this.player.direction = this.player.direction + 1 % 4;

        this.view.invalidatePlayer();
    }

    placeBrick() {
        let [x, y] = this.cellInFront();

        if (this.cellExists(x, y)) {
            return; // TODO: Karol cant place because of a wall
        } else if (this.cellIsCuboid(x, y)) {
            return; // TODO: Karol cell infront is a cuboid
        } else if (this.cellIsFull(x, y)) {
            return; // TODO: Karol cell is full
        }

        let cell = this.world[x][y];
        if (cell === null) {
            cell = { kind: CellType.Bricks, count: 1, mark: null };
        } else if (cell.kind === CellType.Bricks) {
            cell.count += 1;
        }

        this.view.invalidateCell(x, y);
    }

    pickupBrick() {
        let [x, y] = this.cellInFront();

        if (this.cellExists(x, y)) {
            return; // TODO: Karol cant place because of a wall
        } else if (this.cellIsCuboid(x, y)) {
            return; // TODO: Karol cell infront is a cuboid
        } else if (this.cellIsEmpty(x, y)) {
            return; // TODO: Karol cell pickup because cell is empty
        }

        let cell = this.world[x][y];
        if (cell?.kind === CellType.Bricks) cell.count -= 1;

        this.view.invalidateCell(x, y);
    }

    // Set mark doesn't error for some reason
    setMark(color: MarkColor) {
        let cell = this.world[this.player.x][this.player.y];

        assert(cell?.kind != CellType.Cuboid, "Karol is standing on a cuboid?!");

        if (cell === null) {
            cell = { kind: CellType.Bricks, count: 0, mark: color };
        } else if (cell.kind == CellType.Bricks) {
            cell.mark = color;
        }

        this.view.invalidateCell(this.player.x, this.player.y);
    }

    // Remove mark doesnt error either
    removeMark() {
        let cell = this.world[this.player.x][this.player.y];

        assert(cell?.kind != CellType.Cuboid, "Karol is standing on a cuboid?!");

        if (cell === null) {
            return;
        } else if (cell.kind == CellType.Bricks) {
            cell.mark = null;
        }

        this.view.invalidateCell(this.player.x, this.player.y);
    }

    // TODO: Sound


}

export { World }