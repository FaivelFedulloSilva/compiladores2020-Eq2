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

test('Fail at comma operation', () => {
    let parsed = p.parse("var x = (1,2);");
    expect(() => {
        ASTworker(parsed);
    }).toThrow(/Comma.*/);
});

test('Fail at multi declaration', () => {
    let parsed = p.parse("var x = 1, y = 2;");
    expect(() => {
        ASTworker(parsed);
    }).toThrow(/Cannot declare multiple variables.*/);
});

// test folder / name--coverage--collectCoverageFrom = 'folder/name/**/*.js'

test('Replace by multiassign', () => {
    let parsed = p.parse(`
    var x = [1,2,3,4]
    x[1,2,3] = 1;
    `, { locations: true, ecmaVersion: 2020 });
    expect(cg.generate(ASTworker(parsed)).replace(/\s/g, '')).toMatch(`let x = [1, 2, 3, 4];
        x[3] = x[2] =x[1] =1;
    `.replace(/\s/g, ''));
});

test('Replace var for let', () => {
    let parsed = p.parse(`
    var x =1;
    var y = [1,2];
    `, { locations: true, ecmaVersion: 2020 });
    expect(cg.generate(ASTworker(parsed)).replace(/\s/g, '')).toMatch(`let x =1;
    let y = [1,2];
    `.replace(/\s/g, ''));
});

test('Replace named function for const function', () => {
    let parsed = p.parse(`
    function f(x){
        return x;
    }
    `, { locations: true, ecmaVersion: 2020 });
    expect(cg.generate(ASTworker(parsed)).replace(/\s/g, '')).toMatch(`const f = functionf(x){return x;}
    `.replace(/\s/g, ''));
});

test('Replace date literal', () => {
    let parsed = p.parse(`
    var x = 2020.20.20t20.20.20.20;
    var y = 2020.20.20T20.20.20.20;
    var z = 2020.20.20;
    var w = 2020.20.20t20;
    var t = 2020.20.20t20.20;
    var d = 2020.20.20t20.20.20;
    `, { locations: true, ecmaVersion: 2020 });
    expect(cg.generate(ASTworker(parsed)).replace(/\s/g, '')).toMatch(`
    let x = new Date(Date.UTC(2020,20,20,20,20,20,20));
    let y = new Date(Date.UTC(2020,20,20,20,20,20,20));
    let z = new Date(Date.UTC(2020,20,20));
    let w = new Date(Date.UTC(2020,20,20,20));
    let t = new Date(Date.UTC(2020,20,20,20,20));
    let d = new Date(Date.UTC(2020,20,20,20,20,20));
    `.replace(/\s/g, ''));
});