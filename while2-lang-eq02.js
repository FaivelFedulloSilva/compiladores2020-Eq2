/** Implementation of the While language from [_Semantics with Applications_ by
 * Nielsen & Nielsen](https://archive.org/details/Hanne_Riis_Nielson_Flemming_Nielson__Semantics_with_Applications/mode/2up)
 * (section 1.2).
 *
 * by Leonardo Val.
 */


class Exp {
    ////////////////////////////////////////////////////////////
    constructor() {
       }
    eval() {
        throw new Error(`${this.constructor.name}.eval() is not implemented!`);
    }
    unparse() {
        throw new Error(`${this.constructor.name}.unparse() is not implemented!`);
    }
}

class Num extends Exp {
    constructor(n) {
        super();
        
            defineTypedProperty(this, 'n', 'number', n);
    }

    eval() {
        return this.n;
    }

  unparse() {
    return `${this.n}`;
  }
}

class Var extends Exp {
    constructor(x) {
        super();
            defineTypedProperty(this, 'x', 'string', x);
    }

    eval(state) {
        return state.get(this.x);
    }

  unparse() {
    return `VAR ${this.x}`
  }
}

class Add extends Exp {
    constructor(a1, a2) {
      super();
        defineTypedProperty(this, 'a1', Exp, a1);
        defineTypedProperty(this, 'a2', Exp, a2);
    }

    eval(state) {
        const v1 = checkType('a1', 'number', this.a1.eval(state));
        const v2 = checkType('a2', 'number', this.a2.eval(state));
        return v1 + v2;
    }
  unparse() {
    return `${this.a1.unparse()} AND ${this.a2.unparse()}`
  }
}

class Mult extends Exp {
    constructor(a1, a2) {
        super();
            defineTypedProperty(this, 'a1', Exp, a1);
            defineTypedProperty(this, 'a2', Exp, a2);
    }

    eval(state) {
      const v1 = checkType('a1', 'number', this.a1.eval(state));
      const v2 = checkType('a2', 'number', this.a2.eval(state));
      return v1 * v2;
    }

  unparse() {
    return `${this.a1.unparse()} * ${this.a2.unparse()}`;
  }
}

class Sub extends Exp {
    constructor(a1, a2) {
        super();
            defineTypedProperty(this, 'a1', Exp, a1);
            defineTypedProperty(this, 'a2', Exp, a2);
    }

    eval(state) {
      const v1 = checkType('a1', 'number', this.a1.eval(state));
      const v2 = checkType('a2', 'number', this.a2.eval(state));
      return v1 - v2;
    }
}

class Bool extends Exp {
    constructor(b) {
        super();
            defineTypedProperty(this, 'b', 'boolean', b);
    }

    eval() {
        return this.b;
    }
    
    unparse() {
        return `${this.b}`
    }
}

class CompEq extends Exp {
    constructor(a1, a2) {
        super();
            defineTypedProperty(this, 'a1', Exp, a1);
            defineTypedProperty(this, 'a2', Exp, a2);
    }

    eval(state) {
        return this.a1.eval(state) === this.a2.eval(state);
    }

    unparse() {
        return `${this.a1.unparse()} === ${this.a2.unparse()}`
    }
}

class CompLte extends Exp {
    constructor(a1, a2) {
        super();
            defineTypedProperty(this, 'a1', Exp, a1);
            defineTypedProperty(this, 'a2', Exp, a2);
    }

    eval(state) {
      const v1 = checkType('a1', 'number', this.a1.eval(state));
      const v2 = checkType('a2', 'number', this.a2.eval(state));
      return v1 <= v2;
    }

    unparse() {
        return `${this.a1.unparse()} <= ${this.a2.unparse()}`
    }
}

class Neg extends Exp {
    constructor(b) {
        super();
            defineTypedProperty(this, 'b', Exp, b);
    }

    eval(state) {
      const v1 = checkType('b', 'boolean', this.b.eval(state));
        return v1;
    }

    unparse() {
        return `NOT ${this.b.unparse()}`
    }
}

class And extends Exp {
    constructor(b1, b2) {
        super();
       
            defineTypedProperty(this, 'b1', Exp, b1);
            defineTypedProperty(this, 'b2', Exp, b2);
    }

    eval(state) {
      const v1 = checkType('b1', 'boolean', this.b1.eval(state));
      const v2 = checkType('b2', 'boolean', this.b2.eval(state));
      return v1 && v2;
    }

    unparse() {
        return `${this.b1.unparse()} AND ${this.b2.unparse()}`
    }
}

class Stmt {
    ////////////////////////////////////////////////////////////
    constructor() {
      }
    eval() {
        throw new Error(`${this.constructor.name}.eval() is not implemented!`);
    }

    unparse() {
        throw new Error(`${this.constructor.name}.unparse() is not implemented!`);
    }
}

class Assign extends Stmt {
    constructor(x, a) {
        super();
        
            defineTypedProperty(this, 'x', 'string', x);
        
            defineTypedProperty(this, 'a', Exp, a);
        
    }

    eval(state) {
        state = state || new Map();
        state.set(this.x, this.a.eval(state));
        return state;
    }
    
  unparse() {
    return `\nASSIGN ${this.x} = ${this.a.unparse()}`
  }
}

class Seq extends Stmt {
    constructor(stmts) {
        super();
        defineTypedProperty(this, 'stmts', [Stmt], stmts);
        
    }

    eval(state) {
        state = state || new Map();
        return this.stmt.reduce((s, stmt) => stmt.eval(s), state);
    }

  unparse() {
    return `{ ${this.stmts.map(stmt => stmt.unparse()).join(';')} }`
  }
}

class IfThenElse extends Stmt {
    constructor(b, s1, s2) {
        super();
        defineTypedProperty(this, 'b', Exp, b);
        defineTypedProperty(this, 's1', Stmt, s1);
        defineTypedProperty(this, 's2', Stmt, s2);
    }

    eval(state) {
        state = state || new Map();
        const v1 = checkType('b', 'boolean', this.b.eval(state));
        if (v1) {
            return this.s1.eval(state);
        } else {
            return this.s2.eval(state);
        }
    }
    
  unparse() {
      return `IF ${this.b.unparse()} THEN ${this.s1.unparse()} ELSE ${this.s2.unparse()}`
  }
}

class WhileDo extends Stmt {
    constructor(b, s) {
        super();
        defineTypedProperty(this, 'b', Exp, b);
        defineTypedProperty(this, 's', Stmt, s);
    }

    eval(state) {
        state = state || new Map();
        const v1 = checkType('b', 'boolean', this.b.eval(state));
        while (v1) {
            state = this.s1.eval(state);
        }
        return state;
    }

    unparse() {
        return `WHILE ${this.b.unparse()} DO ${this.s.unparse()}`
    }
}

// Examples ////////////////////////////////////////////////////////////////////

const TESTS = [
    new Assign('x', new Add(new Num(3), new Num(5))),
    new IfThenElse(new Bool(true), new Seq([new Assign('x', new Num(1.2))
]), new Seq([new Assign('j', new Num(13))
])),
    new Assign('x', new Num(1.2)),
    new Seq([new Assign('x', new Num(77)), new Assign('y', new Mult(new Num(2), new Var('x')))]),
    new Assign('b', new Bool(true)),
    new Assign('f', new Bool(false)),
    // unparse("new Assign('x', new Num(1.2))")
];

console.log(TESTS[1].unparse())

// Utilities ///////////////////////////////////////////////////////////////////

function checkType(name, type, value) {
    if (typeof type === 'string') {
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

    return value
  }

function defineTypedProperty(obj, prop, type, value) {
    checkType(prop, type, value);
    Object.defineProperty(obj, prop, { value });
}


module.exports = {
    Exp, Num, Var, Add, Mult, Sub,
    Bool, CompEq, CompLte, Neg, And,
    Stmt, Assign, Seq, IfThenElse, WhileDo,
    TESTS,
  }
