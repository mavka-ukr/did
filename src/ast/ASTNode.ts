export default class ASTNode {
    constructor(public readonly context: Context) {
    }
}

export class Context {
    constructor(public readonly row: number, public readonly col: number) {
    }

    /**
     * Add columns to context without changing row
     * @param cols number of columns to add
     * @return {Context} new context
     */
    addColumns(cols: number): Context {
        if (cols < 0) {
            throw new Error("Cannot add negative number of columns");
        }
        return new Context(this.row, this.col + cols);
    }

    /**
     * Add rows to context, reset column to 0 if rows > 0
     * @param rows number of rows to add
     * @return {Context} new context
     */
    addRows(rows: number): Context {
        if (rows < 0) {
            throw new Error("Cannot add negative number of rows");
        }
        return new Context(this.row + rows, rows === 0 ? this.col : 0);
    }
}