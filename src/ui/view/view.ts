import { World } from "./world";

const MARGIN = { x: 30, y: 30 };
const BLOCKSIZE = 50;

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

export { MARGIN, BLOCKSIZE }
export type { View }