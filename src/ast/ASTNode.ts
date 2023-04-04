export default class ASTNode {
    constructor(public readonly context: Context) {
    }
}

export class Context {
    constructor(public readonly row: number, public readonly col: number) {
    }

    add(row: number, col: number): Context {
        return new Context(this.row + row, this.col + col);
    }
}