const acorn = require("acorn");
const t = require("./date");
const util = require("util");
const cg = require('escodegen');
const estools = require('estools');
const estraverse = require('estraverse');
const fs = require('fs');
const { measureMemory } = require("vm");


const p = acorn.Parser.extend(t);

const constFunctionTamplate = function() {
    let parsed = acorn.parse("const x = function x(){};")
    return parsed.body;
}

const assignTemplate = function() {
    let parsed = acorn.parse("x[1] = 'chau'")
    return parsed.body[0];
}

const memberTamplate = function() {
    let parsed = acorn.parse("x[1]")
    return parsed.body[0];
}

const dateUTCTemplate = function() {
    let parsed = acorn.parse("new Date(Date.UTC(10,10))")
    return parsed.body[0].expression;
}

function changeToConstFunction(FunctionNode) {
    let template = constFunctionTamplate()[0];
    let y = [...template.declarations]
    y[0].id = FunctionNode.id
    y[0].init = {...y[0].init, id: FunctionNode.id, params: FunctionNode.params, body: FunctionNode.body }
    let x = {
        ...template,
        declarations: y
    }
    return x;
}

function recursiveMultiAsignGeneration(parts, object, index) {
    if (index > 0) {
        let newExp = {
            ...assignTemplate().expression,
            left: {
                ...memberTamplate().expression,
                object: object,
                property: {...parts[index] }
            },
            right: recursiveMultiAsignGeneration(parts, object, --index)
        }
        return newExp
    } else {
        return {...parts[index] };
    }
}

function changeToMultiAsign(AExpNode) {
    let parts = [AExpNode.right, ...AExpNode.left.property.expressions]
    let result = recursiveMultiAsignGeneration(parts, AExpNode.left.object, parts.length - 1);
    // console.log(result)
    return result;
}











const ASTworker = (ast) => {
    result = estraverse.replace(ast, {
        enter: function(node, parent) {

            if (node.type === 'AssignmentExpression') {
                if (node.left.type === "MemberExpression" && node.left.property.type === "SequenceExpression") {
                    return changeToMultiAsign(node);
                }
            }

            if (node.type === 'Literal' && node.value instanceof Array) {
                // console.log(util.inspect(dateUTCTemplate(), false, null, true));
                let date = dateUTCTemplate();
                date.arguments[0].arguments = [];
                node.value.forEach(element => {
                    date.arguments[0].arguments.push({
                        type: 'Literal',
                        value: parseInt(element),
                        raw: `${element}`
                    })
                });
                return date;
            }

        },
        leave: function(node, parent) {
            if (node.type === 'FunctionDeclaration') {
                // console.log(node);
                let n = changeToConstFunction(node);
                // console.log(n);
                return n;
            }

            if (node.type === 'SequenceExpression') {
                throw new SyntaxError(`Comma operation\n${util.inspect(node.loc, false, null, true)}`)
            }

            if (node.type === 'VariableDeclaration') {
                if (node.kind === 'let') {
                    throw new SyntaxError(`Let is not a recognized keyword. \n${util.inspect(node.loc, false, null, true)}`)
                }
                if (node.declarations.length > 1) {
                    throw new SyntaxError(`Cannot declare multiple variables or constants in a single expression\n${util.inspect(node.loc, false, null, true)}`)
                }
                if (node.kind === 'var') {
                    return {...node, kind: 'let' }
                }
            }
        }
    });

    return result;
}


code = `
    var y = 2020.10.24;;
    var x = 1050.40.60t30.40;;
    var z = 2020.10.40t10 + 2000.10.40t10;;
    var x = 1;
    x[1,2,3] = 3;
    function f(){
        return 1;
    }`
let parsed = p.parse(code, {
    locations: true,
    ecmaVersion: 2020,
    onInsertedSemicolon: (pos, loc) => { throw new SyntaxError(`Lack of semicolon (${loc.line}, ${loc.column})`) }
});
// console.log(util.inspect(parsed, false, null, true));
console.log(cg.generate(ASTworker(parsed)))


module.exports = {
    ASTworker: ASTworker,
};