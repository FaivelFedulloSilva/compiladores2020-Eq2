const { ASTworker } = require("./astworker");
const acorn = require("acorn");
const t = require("./date");
const cg = require('escodegen');
const { createLog, logMessages } = require('./logMessages');


const p = acorn.Parser.extend(t);

describe('ASTworker', () => {
  test('Fail at let', () => {
      expect(() => {
          ASTworker("let x = 1;");
      }).toThrow(/Let.*.*/);
  });

  test('Fail at comma operation', () => {
      expect(() => {
          ASTworker("var x = (1,2);");
      }).toThrow(/Comma.*/);
  });

  test('Fail at multi declaration', () => {
      expect(() => {
          ASTworker("var x = 1, y = 2;");
      }).toThrow(/Cannot declare multiple variables.*/);
  });

  test('Replace by multiassign', () => {
      expect(ASTworker(`
      var x = [1,2,3,4];
      x[1,2,3] = 1;
      `).replace(/\s/g, '')).toMatch(`let x = [1, 2, 3, 4];
          x[3] = x[2] =x[1] =1;
      `.replace(/\s/g, ''));
  });

  test('Replace var for let', () => {
      expect(ASTworker(`
      var x =1;
      var y = [1,2];
      `).replace(/\s/g, '')).toMatch(`
      let x =1;
      let y = [1,2];
      `.replace(/\s/g, ''));
  });

  test('Replace named function for const function', () => {
      expect(ASTworker(`
      function f(x){
          return x;
      }
      `).replace(/\s/g, '')).toMatch(`const f = functionf(x){return x;}
      `.replace(/\s/g, ''));
  });

  test('Replace date literal', () => {
      expect(ASTworker(`
      var x = 2020.20.20t20.20.20.20;
      var y = 2020.20.20T20.20.20.20;
      var z = 2020.20.20;
      var w = 2020.20.20t20;
      var t = 2020.20.20t20.20;
      var d = 2020.20.20t20.20.20;
      var w = 2020.20.20T20;
      var t = 2020.20.20T20.20;
      var d = 2020.20.20T20.20.20;
      `).replace(/\s/g, '')).toMatch(`
      let x = new Date(Date.UTC(2020,20,20,20,20,20,20));
      let y = new Date(Date.UTC(2020,20,20,20,20,20,20));
      let z = new Date(Date.UTC(2020,20,20));
      let w = new Date(Date.UTC(2020,20,20,20));
      let t = new Date(Date.UTC(2020,20,20,20,20));
      let d = new Date(Date.UTC(2020,20,20,20,20,20));
      `.replace(/\s/g, ''));
  });
})
