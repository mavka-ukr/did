/**
 * Boundaries in the code string for nodes
 * @typedef {{startPosition: Number, startLine: Number, endPosition: Number, endLine: Number}} Position
 */

export class ASTNode {
    /**
     * @param {Position} position 
     */
    constructor(position) {
        this.position = position;
    }
}

export class DictionaryEntryNode extends ASTNode {
    /**
     * @param {Position} position 
     * @param {TextNode|NumberNode|String} key 
     * @param {ASTNode} value 
     */
    constructor(position, key, value) {
        super(position);
        this.key = key;
        this.value = value;
    }
}

export class DictionaryNode extends ASTNode {
    /**
     * @param {Position} position 
     * @param {Array.<DictionaryEntryNode>} dictionaryEntries 
     */
    constructor(position, dictionaryEntries) {
        super(position);
        this.dictionaryEntries = dictionaryEntries;
    }
}

export class EmptyNode extends ASTNode {
    /**
     * @param {Position} position 
     */
    constructor(position) {
        super(position);
    }
}

export class ListNode extends ASTNode {
    /**
     * @param {Position} position 
     * @param {Array.<ASTNode>} nodes 
     */
    constructor(position, nodes) {
        super(position);
        this.nodes = nodes;
    }
}

export class LogicalNode extends ASTNode {
    /**
     * @param {Position} position 
     * @param {Boolean} value 
     */
    constructor(position, value) {
        super(position);
        this.value = value;
    }
}

export class NumberNode extends ASTNode {
    /**
     * @param {Position} position 
     * @param {Number} value 
     */
    constructor(position, value) {
        super(position);
        this.value = value;
    }
}

export class ObjectEntryNode extends ASTNode {
    /**
     * @param {Position} position 
     * @param {String} key 
     * @param {ASTNode} value 
     */
    constructor(position, key, value) {
        super(position);
        this.key = key;
        this.value = value;
    }
}

export class ObjectNode extends ASTNode {
    /**
     * @param {Position} position 
     * @param {String} name 
     * @param {Array.<ObjectEntryNode>} objectEntries 
     */
    constructor(position, name, objectEntries) {
        super(position);
        this.name = name;
        this.objectEntries = objectEntries;
    }
}

export class TextNode extends ASTNode {
    constructor(position, value) {
        super(position);
        this.value = value;
    }
}
