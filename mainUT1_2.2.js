const acorn = require('acorn');
const fs = require('fs');

// pull in the cmd line args
const args = process.argv[2];
const buffer = fs.readFileSync(args).toString();
const body = acorn.parse(buffer).body;

function isOperand(node) {
    let flag = false;
    switch (node.type) {
        case 'Identifier':
            flag = true;
        case 'Literal':
            flag = true;
        default:
            break;
    }
    return flag;
}

function isOperator(node) {
    return !isOperand(node);
}

function getNumbers(node, numbers) {
    if (node == null) {
        return;
    }
    if (isOperand(node)) {
        numbers.totalOperands += 1;
        numbers.distinctOperands.add(node.name);
    } else {
        switch (node.type) {
            case 'FunctionDeclaration':
                numbers.totalOperators += 1;
                numbers.distinctOperators.add(node.type);
                getNumbers(node.id, numbers);
                node.params.forEach((parameter) => {
                    getNumbers(parameter, numbers);
                });
                getNumbers(node.body, numbers);
                break;
            case 'BlockStatement':
                node.body.forEach((element) => {
                    getNumbers(element, numbers);
                });
                break;
            case 'ReturnStatement':
                numbers.totalOperators += 1;
                numbers.distinctOperators.add(node.type);
                getNumbers(node.argument, numbers);
                break;
            case 'BinaryExpression':
                numbers.totalOperators += 1;
                numbers.distinctOperators.add(node.operator);
                getNumbers(node.right, numbers);
                getNumbers(node.left, numbers);
                break;
            case 'IfStatement':
                numbers.totalOperators += 1;
                numbers.distinctOperators.add(node.type);
                getNumbers(node.test, numbers);
                getNumbers(node.consequent, numbers);
                getNumbers(node.alternate, numbers);
                break;
            case 'LogicalExpression':
                numbers.totalOperators += 1;
                numbers.distinctOperators.add(node.operator);
                getNumbers(node.left, numbers);
                getNumbers(node.right, numbers);
                break;
            case 'VariableDeclaration':
                numbers.totalOperators += 1;
                numbers.distinctOperators.add(node.type);
                node.declarations.forEach((element) => {
                    getNumbers(element, numbers);
                });
                break;
            case 'ExpressionStatement':
                getNumbers(node.expression, numbers);
                break;
            case 'LabeledStatement':
                getNumbers(node.body, numbers);
                break;
            case 'BreakStatement':
                numbers.totalOperators += 1;
                numbers.distinctOperators.add(node.type);
                break;
            case 'ContinueStatement':
                numbers.totalOperators += 1;
                numbers.distinctOperators.add(node.type);
                break;
            case 'WithStatement':
                numbers.totalOperators += 1;
                numbers.distinctOperators.add(node.type);
                getNumbers(node.object, numbers);
                getNumbers(node.body, numbers);
                break;
            case 'SwitchStatement':
                numbers.totalOperators += 1;
                numbers.distinctOperators.add(node.type);
                getNumbers(node.discriminant, numbers);
                node.cases.forEach((element) => {
                    getNumbers(element, numbers);
                });
                getNumbers(node.lexical, numbers);
                break;
            case 'ThrowStatement':
                numbers.totalOperators += 1;
                numbers.distinctOperators.add(node.type);
                getNumbers(node.argument, numbers);
                break;
            case 'TryStatement':
                numbers.totalOperators += 1;
                numbers.distinctOperators.add(node.type);
                getNumbers(node.block, numbers);
                getNumbers(node.handler, numbers);
                node.guardedHandlers.forEach((element) => {
                    getNumbers(element, numbers);
                });
                getNumbers(node.finalizer, numbers);
                break;
            case 'WhileStatement':
                numbers.totalOperators += 1;
                numbers.distinctOperators.add(node.type);
                getNumbers(node.test, numbers);
                getNumbers(node.body, numbers);
                break;
            case 'DoWhileStatement':
                numbers.totalOperators += 1;
                numbers.distinctOperators.add(node.type);
                getNumbers(node.test, numbers);
                getNumbers(node.body, numbers);
                break;
            case 'ForStatement':
                numbers.totalOperators += 1;
                numbers.distinctOperators.add(node.type);
                getNumbers(node.init, numbers);
                getNumbers(node.test, numbers);
                getNumbers(node.update, numbers);
                getNumbers(node.body, numbers);
                break;
            case 'ForInStatement':
                numbers.totalOperators += 1;
                numbers.distinctOperators.add(node.type);
                getNumbers(node.left, numbers);
                getNumbers(node.right, numbers);
                getNumbers(node.body, numbers);
                getNumbers(node.each, numbers);
                break;
            case 'ForOfStatement':
                numbers.totalOperators += 1;
                numbers.distinctOperators.add(node.type);
                getNumbers(node.left, numbers);
                getNumbers(node.right, numbers);
                getNumbers(node.body, numbers);
                break;
            case 'LetStatement':
                numbers.totalOperators += 1;
                numbers.distinctOperators.add(node.type);
                node.head.forEach((element) => {
                    getNumbers(element, numbers);
                });
                getNumbers(node.body, numbers);
                break;
            case 'VariableDeclarator':
                numbers.totalOperators += 1;
                numbers.distinctOperators.add(node.type);
                getNumbers(node.init, numbers);
                break;
            case 'ThisExpression':
                numbers.totalOperators += 1;
                numbers.distinctOperators.add(node.type);
                numbers.totalOperators += 1;
                numbers.distinctOperators.add(node.type);
                break;
            case 'ArrayExpression':
                numbers.totalOperators += 1;
                numbers.distinctOperators.add(node.type);
                node.elements.forEach((element) => {
                    getNumbers(element, numbers);
                });
                break;
            case 'ObjectExpression':
                numbers.totalOperators += 1;
                numbers.distinctOperators.add(node.type);
                node.properties.forEach((element) => {
                    getNumbers(element, numbers);
                });
                break;
            case 'Property':
                getNumbers(node.key, numbers);
                getNumbers(node.value, numbers);
                break;
            case 'FunctionExpression':
                numbers.totalOperators += 1;
                numbers.distinctOperators.add(node.type);
                getNumbers(node.id, numbers);
                node.params.forEach((parameter) => {
                    getNumbers(parameter, numbers);
                });
                node.defaults.forEach((parameter) => {
                    getNumbers(parameter, numbers);
                });
                getNumbers(node.rest, numbers);
                getNumbers(node.body, numbers);
                getNumbers(node.generator, numbers);
                getNumbers(node.expression, numbers);
                break;
            case 'ArrowExpression':
                numbers.totalOperators += 1;
                numbers.distinctOperators.add(node.type);
                getNumbers(node.type, numbers);
                node.params.forEach((parameter) => {
                    getNumbers(parameter, numbers);
                });
                node.defaults.forEach((parameter) => {
                    getNumbers(parameter, numbers);
                });
                getNumbers(node.rest, numbers);
                getNumbers(node.body, numbers);
                getNumbers(node.generator, numbers);
                getNumbers(node.expression, numbers);
                break;
            case 'SequenceExpression':
                numbers.totalOperators += 1;
                numbers.distinctOperators.add(node.type);
                node.expressions.forEach((parameter) => {
                    getNumbers(parameter, numbers);
                });
                break;
            case 'UnaryExpression':
                numbers.totalOperators += 1;
                numbers.distinctOperators.add(node.type);
                getNumbers(node.operator, numbers);
                getNumbers(node.prefix, numbers);
                getNumbers(node.argument, numbers);
                break;
            case 'AssignmentExpression':
                numbers.totalOperators += 1;
                numbers.distinctOperators.add(node.type);
                getNumbers(node.operator, numbers);
                getNumbers(node.left, numbers);
                getNumbers(node.right, numbers);
                break;
            case 'UpdateExpression':
                numbers.totalOperators += 1;
                numbers.distinctOperators.add(node.type);
                getNumbers(node.operator, numbers);
                getNumbers(node.argument, numbers);
                getNumbers(node.prefix, numbers);
                break;
            case 'ConditionalExpression':
                numbers.totalOperators += 1;
                numbers.distinctOperators.add(node.type);
                getNumbers(node.test, numbers);
                getNumbers(node.alternate, numbers);
                getNumbers(node.consequent, numbers);
                break;
            case 'NewExpression':
                numbers.totalOperators += 1;
                numbers.distinctOperators.add(node.type);
                getNumbers(node.callee, numbers);
                node.arguments.forEach((parameter) => {
                    getNumbers(parameter, numbers);
                });
                break;
            case 'CallExpression':
                numbers.totalOperators += 1;
                numbers.distinctOperators.add(node.type);
                getNumbers(node.callee, numbers);
                node.arguments.forEach((parameter) => {
                    getNumbers(parameter, numbers);
                });
                break;
            case 'MemberExpression':
                numbers.totalOperators += 1;
                numbers.distinctOperators.add(node.type);
                getNumbers(node.object, numbers);
                getNumbers(node.property, numbers);
                getNumbers(node.computed, numbers);
                break;
            case 'YieldExpression':
                numbers.totalOperators += 1;
                numbers.distinctOperators.add(node.type);
                getNumbers(node.argument, numbers);
                break;
            case 'ComprehensionExpression':
                numbers.totalOperators += 1;
                numbers.distinctOperators.add(node.type);
                getNumbers(node.body, numbers);
                node.blocks.forEach((parameter) => {
                    getNumbers(parameter, numbers);
                });
                getNumbers(node.filter, numbers);
                break;
            case 'GeneratorExpression':
                numbers.totalOperators += 1;
                numbers.distinctOperators.add(node.type);
                getNumbers(node.body, numbers);
                node.blocks.forEach((parameter) => {
                    getNumbers(parameter, numbers);
                });
                getNumbers(node.filter, numbers);
                break;
            case 'GraphExpression':
                numbers.totalOperators += 1;
                numbers.distinctOperators.add(node.type);
                getNumbers(node.expression, numbers);
                break;
            case 'GraphIndexExpression':
                numbers.totalOperators += 1;
                numbers.distinctOperators.add(node.type);
                break;
            case 'LetExpression':
                numbers.totalOperators += 1;
                numbers.distinctOperators.add(node.type);
                node.head.forEach((parameter) => {
                    getNumbers(parameter, numbers);
                });
                getNumbers(node.body, numbers);
                break;
            case 'SwitchCase':
                numbers.totalOperators += 1;
                numbers.distinctOperators.add(node.type);
                node.consequent.forEach((parameter) => {
                    getNumbers(parameter, numbers);
                });
                getNumbers(node.test, numbers);
                break;
            case 'CatchClause':
                numbers.totalOperators += 1;
                numbers.distinctOperators.add(node.type);
                getNumbers(node.param, numbers);
                getNumbers(node.guard, numbers);
                getNumbers(node.body, numbers);
                break;
            case 'ComprehensionBlock':
                numbers.totalOperators += 1;
                numbers.distinctOperators.add(node.type);
                getNumbers(node.left, numbers);
                getNumbers(node.right, numbers);
                getNumbers(node.each, numbers);
                break;
            case 'ComprehensionIf':
                numbers.totalOperators += 1;
                numbers.distinctOperators.add(node.type);
                getNumbers(node.test, numbers);
                break;
            default:
                break;
        }
    }
    return;
}

function getHalsteadMetrics() {
    // numbers = [totalOperands, totalOperators, distinctOperands, distinctOperators]
    n = {
        totalOperands: 0,
        totalOperators: 0,
        distinctOperands: new Set(),
        distinctOperators: new Set(),
    };

    console.log('function,n1,n2,N1,N2,n,N,N^,V,D,E');
    body.forEach((node) => {
        if (node.type === 'FunctionDeclaration') {
            let numbers = {
                totalOperands: 0,
                totalOperators: 0,
                distinctOperands: new Set(),
                distinctOperators: new Set(),
            };
            getNumbers(node, numbers);

            let n1 = numbers.distinctOperators.size;
            let n2 = numbers.distinctOperands.size;
            let N1 = numbers.totalOperators;
            let N2 = numbers.totalOperands;
            let n = n1 + n2;
            let N = N1 + N2;

            let output = '';
            output += node.id.name;
            output += ',';
            output += JSON.stringify(n1);
            output += ',';
            output += JSON.stringify(n2);
            output += ',';
            output += JSON.stringify(N1);
            output += ',';
            output += JSON.stringify(N2);
            output += ',';
            output += JSON.stringify(n);
            output += ',';
            output += JSON.stringify(N);
            output += ',';
            output += JSON.stringify(n1 * Math.log2(N1) + n2 * Math.log2(N2));
            output += ',';
            output += JSON.stringify(N * Math.log2(n));
            output += ',';
            output += JSON.stringify((n1 / 2) * (N2 / n2));
            output += ',';
            output += JSON.stringify((n1 / 2) * (N2 / n2) * (N * Math.log2(n)));
            console.log(output);

            numbers.totalOperands = 0;
            numbers.totalOperators = 0;
            numbers.distinctOperands.clear();
            numbers.distinctOperators.clear();
        }
    });
}

getHalsteadMetrics();