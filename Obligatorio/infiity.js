"use strict"

const acorn = require("acorn")
const tt = acorn.tokTypes;

module.exports = function(Parser) {
    return class extends Parser {
        
        readWord = function () {
            var ch = this.fullCharCodeAtPos()
            if ((ch === 85) || (ch === 117)){ //U u
                ++this.pos;
                var ch = this.fullCharCodeAtPos()
                if (ch === 43){ //+
                    ++this.pos;
                    str = this.getNumberInput(this.pos, this.pos+3);
                    ++this.pos;
                    var ch = this.fullCharCodeAtPos()
                    if ((ch === 69) || (ch === 101)){ //E e
                        return this.finishToken(tt.num, Infinity);
                    }
                }
            }
        }

        getNumberInput(start, end) {
            if (super.getNumberInput) return super.getNumberInput(start, end)
            return this.input.slice(start, end)
        }
    }
}