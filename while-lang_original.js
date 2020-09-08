/** Implementation of the While language from [_Semantics with Applications_ by
 * Nielsen & Nielsen](https://archive.org/details/Hanne_Riis_Nielson_Flemming_Nielson__Semantics_with_Applications/mode/2up)
 * (section 1.2).
 * 
 * by Leonardo Val.
*/

class AExp { ////////////////////////////////////////////////////////////
  constructor() {
    // throw new TypeError('Class AExp is abstract!');
  }

  eval() {
    throw new Error(`${this.constructor.name}.eval() is not implemented!`);
  }
}

class Num extends AExp {
  constructor(n) {
    super();
    defineTypedProperty(this, 'n', 'number', n);
  }

  eval() {
    return this.n;
  }
}

class Var extends AExp {
  constructor(x) {
    super();
    defineTypedProperty(this, 'x', 'string', x);
  }

  eval(state) {
    return state.get(this.x);
  }
}

class Add extends AExp {
  constructor(a1, a2) {
    super();
    defineTypedProperty(this, 'a1', AExp, a1);
    defineTypedProperty(this, 'a2', AExp, a2);
  }

  eval(state) {
    return this.a1.eval(state) + this.a2.eval(state);
  }
}

class Mult extends AExp {
  constructor(a1, a2) {
    super();
    defineTypedProperty(this, 'a1', AExp, a1);
    defineTypedProperty(this, 'a2', AExp, a2);
  }

  eval(state) {
    return this.a1.eval(state) * this.a2.eval(state);
  }
}

class Sub extends AExp {
  constructor(a1, a2) {
    super();
    defineTypedProperty(this, 'a1', AExp, a1);
    defineTypedProperty(this, 'a2', AExp, a2);
  }

  eval(state) {
    return this.a1.eval(state) - this.a2.eval(state);
  }
}

class BExp { ////////////////////////////////////////////////////////////
  constructor() {
    // throw new TypeError('Class BExp is abstract!');
  }

  eval() {
    throw new Error(`${this.constructor.name}.eval() is not implemented!`);
  }
}

class Bool extends BExp {
  constructor(b) {
    super();
    defineTypedProperty(this, 'b', 'boolean', b);
  }

  eval() {
    return this.b;
  }
}

class CompEq extends BExp {
  constructor(a1, a2) {
    super();
    defineTypedProperty(this, 'a1', AExp, a1);
    defineTypedProperty(this, 'a2', AExp, a2);
  }

  eval(state) {
    return this.a1.eval(state) === this.a2.eval(state);
  }
}

class CompLte extends BExp {
  constructor(a1, a2) {
    super();
    defineTypedProperty(this, 'a1', AExp, a1);
    defineTypedProperty(this, 'a2', AExp, a2);
  }

  eval(state) {
    return this.a1.eval(state) <= this.a2.eval(state);
  }
}

class Neg extends BExp {
  constructor(b) {
    super();
    defineTypedProperty(this, 'b', BExp, b);
  }

  eval(state) {
    return !this.b.eval(state);
  }
}

class And extends BExp {
  constructor(b1, b2) {
    super();
    defineTypedProperty(this, 'b1', BExp, b1);
    defineTypedProperty(this, 'b2', BExp, b2);
  }

  eval(state) {
    return this.b1.eval(state) && this.b2.eval(state);
  }
}

class Stmt { ////////////////////////////////////////////////////////////
  constructor() {
    // throw new TypeError('Class Stmt is abstract!');
  }

  eval() {
    throw new Error(`${this.constructor.name}.eval() is not implemented!`);
  }
}

class Assign extends Stmt {
  constructor(x, a) {
    super();
    defineTypedProperty(this, 'x', 'string', x);
    defineTypedProperty(this, 'a', AExp, a);
  }

  eval(state) {
    state = state || new Map();
    state.set(this.x, this.a.eval(state));
    return state;
  }
}

class Seq extends Stmt {
  constructor(stmts) {
    super();
    defineTypedProperty(this, 'stmts', [Stmt], stmts);
  }

  eval(state) {
    state = state || new Map();
    return this.stmts.reduce((s, stmt) => stmt.eval(s), state);
  }
}

class IfThenElse extends Stmt {
  constructor(b, s1, s2) {
    super();
    defineTypedProperty(this, 'b', BExp, b);
    defineTypedProperty(this, 's1', Stmt, s1);
    defineTypedProperty(this, 's2', Stmt, s2);
  }

  eval(state) {
    state = state || new Map();
    if (this.b.eval(state)) {
      return this.s1.eval(state);
    } else {
      return this.s2.eval(state);
    }
  }
}

class WhileDo extends Stmt {
  constructor(b, s) {
    super();
    defineTypedProperty(this, 'b', BExp, b);
    defineTypedProperty(this, 's', Stmt, s);
  }

  eval(state) {
    state = state || new Map();
    while (this.b.eval(state)) {
      state = this.s1.eval(state);
    }
    return state;
  }
}

// Examples ////////////////////////////////////////////////////////////////////

const TESTS = [
  new Assign('x', new Num(1.2)),
  new Seq([
    new Assign('x', new Num(77)),
    new Assign('y', new Mult(new Num(2), new Var('x'))),
  ]),
  unparse("new Assign('x', new Num(1.2))")

];

// Utilities ///////////////////////////////////////////////////////////////////

function checkType(name, type, value) {
  if (typeof type === 'string' || type === 'number' || type === 'boolean') {
    if (typeof value !== type) {
      throw new TypeError(`Expected ${type} for ${name}, but got ${typeof value}!`);
    }
  }
  if (typeof type === 'function') {
    if (!(value instanceof type)) {
      throw new TypeError(`Expected ${type.name} for ${name}, but got ${value && value.constructor.name}!`);
    }
  }
  if (Array.isArray(type)) {
    if (!Array.isArray(value)) {
      throw new TypeError(`Expected array for ${name}, but got ${value && value.constructor.name}!`);
    }
    value.forEach((v, i) => checkType(`${name}[${i}]`, type[0], v));
  }
}

function defineTypedProperty(obj, prop, type, value) {
  checkType(prop, type, value);
  Object.defineProperty(obj, prop, { value });
}

module.exports = {
  AExp, Num, Var, Add, Mult, Sub,
  BExp, Bool, CompEq, CompLte, Neg, And,
  Stmt, Assign, Seq, IfThenElse, WhileDo,
  TESTS,
}

function unparse(toAST){
  const acorn = require('acorn');
  const body = acorn.parse(toAST).body;
  console.log(body);
}