"use strict"

const acorn = require("acorn")
const tt = acorn.tokTypes
const isIdentifierStart = acorn.isIdentifierStart

module.exports = function(Parser) {
    return class extends Parser {
        parseLiteral(value) {
            const node = super.parseLiteral(value)
            if (node.raw.charCodeAt(node.raw.length - 1) == 110) node.bigint = this.getNumberInput(node.start, node.end - 1)
            return node
        }

        readNumber(startsWithDot) {
            let str;
            let dateArray;
            let val;
            let start = this.pos

            // Not an int
            if (startsWithDot) return super.readNumber(startsWithDot)

            // Legacy octal
            if (this.input.charCodeAt(start) === 48 && this.input.charCodeAt(start + 1) !== 110) {
                return super.readNumber(startsWithDot)
            }

            if (this.readInt(10) === null) this.raise(start, "Invalid number")

            // Not a BigInt, reset and parse again
            if (this.input.charCodeAt(this.pos) != 46) {
                this.pos = start
                return super.readNumber(startsWithDot)
            }
            ++this.pos
            if (this.readInt(10) === null) this.raise(start, "Invalid number")
            if (this.input.charCodeAt(this.pos) != 46) {
                this.pos = start
                return super.readNumber(startsWithDot)
            }
            ++this.pos
            if (this.readInt(10) === null) this.raise(start, "Invalid number")

            //Date without time
            if (this.input.charCodeAt(this.pos) != 84 && this.input.charCodeAt(this.pos) != 116) {
                str = this.getNumberInput(start, this.pos)
                dateArray = str.split('.')
                val = dateArray;
                return this.finishToken(tt.string, val)
            } else {
                ++this.pos;
                if (this.readInt(10) === null) this.raise(start, "Invalid number")
                if (this.input.charCodeAt(this.pos) != 46) {
                    str = this.getNumberInput(start, this.pos)
                    dateArray = str.split(/[.tT]/)
                    val = dateArray;
                    return this.finishToken(tt.num, val)
                } else {
                    ++this.pos;
                    if (this.readInt(10) === null) this.raise(start, "Invalid number")
                    if (this.input.charCodeAt(this.pos) != 46) {
                        str = this.getNumberInput(start, this.pos)
                        dateArray = str.split(/[.tT]/)
                        val = dateArray;
                        return this.finishToken(tt.num, val)
                    } else {
                        ++this.pos;
                        if (this.readInt(10) === null) this.raise(start, "Invalid number")
                        if (this.input.charCodeAt(this.pos) != 46) {
                            str = this.getNumberInput(start, this.pos)
                            dateArray = str.split(/[.tT]/)
                            val = dateArray;
                            return this.finishToken(tt.num, val)
                        } else {
                            ++this.pos;
                            if (this.readInt(10) === null) this.raise(start, "Invalid number")
                            if (this.input.charCodeAt(this.pos) != 46) {
                                str = this.getNumberInput(start, this.pos)
                                dateArray = str.split(/[.tT]/)
                                val = dateArray;
                                return this.finishToken(tt.num, val)
                            }
                        }
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
