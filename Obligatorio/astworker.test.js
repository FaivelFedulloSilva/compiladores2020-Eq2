const { ASTworker } = require("./astworker");
const acorn = require("acorn");
const t = require("./date");
const cg = require('escodegen');


const p = acorn.Parser.extend(t);

// TODO - Agregar mas test
// TODO - Ver como funciona el coverage. El principio es pasandole el argumento --coverage, pero no logro qeu funcione

test('Fail at let', () => {
    let parsed = p.parse("let x = 1;");
    expect(() => {
        ASTworker(parsed);
    }).toThrow(/Let.*/);
});

test('Fail at let', () => {
    let parsed = p.parse(`
    var x = [1,2,3,4]
    x[1,2,3] = 1;
    `, { locations: true, ecmaVersion: 2020 });
    expect(cg.generate(ASTworker(parsed)).replace(/\s/g, '')).toMatch(`let x = [1, 2, 3, 4];
        x[3] = x[2] =x[1] =1;
    `.replace(/\s/g, ''));
});