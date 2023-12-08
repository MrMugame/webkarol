import { Color, World } from "./world";

const MARGIN = { x: 30, y: 30 };
const BLOCKSIZE = 50;

type ColorPair = { background: string, stroke: string };
const COLORS: Map<Color, ColorPair> = new Map([
    [Color.Yellow, { background: "#cdcd00", stroke: "#ffff00" }],
    [Color.Green, { background: "#00cd00", stroke: "#00ff00" }],
    [Color.Red, { background: "#cd0000", stroke: "#ff0000" }],
    [Color.Blue, { background: "#0000cd", stroke: "#0000ff" }]
]);

interface View {
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

export { MARGIN, BLOCKSIZE, COLORS }
export type { View }