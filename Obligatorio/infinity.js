'use strict';

const acorn = require("acorn");
const tt = acorn.tokTypes;
const isIdentifierStart = acorn.isIdentifierStart;

module.exports = function(Parser) {
    return class extends Parser {
        parseLiteral(value) {
            const node = super.parseLiteral(value);
            if (node.raw.charCodeAt(node.raw.length - 1) == 110)
              node.bigint = this.getNumberInput(node.start, node.end - 1);
            return node;
          }

          getTokenFromCode(code){
            if (code === 8734){
                ++this.pos;
                return this.finishToken(tt.num, Infinity);
            }
            return super.getTokenFromCode(code);
          }

        getNumberInput(start, end) {
            if (super.getNumberInput) return super.getNumberInput(start, end)
            return this.input.slice(start, end)
        }
    }
}