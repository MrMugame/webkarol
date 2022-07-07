import { Position } from "./types"

class BasicError {
    constructor(
        public posStart: Position,
        public posEnd: Position,
        public text: string
    ){}
}


export class LanguageError extends BasicError {}
export class RuntimeError extends BasicError {}