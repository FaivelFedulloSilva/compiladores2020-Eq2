/** Implementation of the While language from [_Semantics with Applications_ by
 * Nielsen & Nielsen](https://archive.org/details/Hanne_Riis_Nielson_Flemming_Nielson__Semantics_with_Applications/mode/2up)
 * (section 1.2).
 *
 * by Leonardo Val.
 */

class ASTNode {
  /// /////////////////////////////////////////////////////////////
  constructor(...args) {
    ASTNode.__init__(this, ...args);
  }

  static get props() {
    throw new Error(`${this.constructor.props} is not implemented!`);
  }

  static __init__(node, ...args) {
    const { props } = node.constructor;
    props.forEach(({ name, type, optional }, i) => {
      const arg = args[i];
      if ((arg !== undefined && arg !== null) || !optional) {
        defineTypedProperty(node, name, type, arg);
      }
    });
  }

  toString() {
    const propString = this.constructor.props
      .map(({ name }) => `${this[name]}`)
      .join(', ');
    return `${this.constructor.name}(${propString})`;
  }
}

class Exp extends ASTNode {
  /// /////////////////////////////////////////////////
  constructor(...args) {
    super(...args);
  }

  eval() {
    throw new Error(`${this.constructor.name}.eval() is not implemented!`);
  }

  typedEval(type, ...args) {
    return checkType(this.constructor.name, type, this.eval(...args));
  }

  check() {
    throw new Error(`${this.constructor.name}.check() is not implemented!`);
  }
}

class Num extends Exp {
  static get props() {
    return [{ name: 'n', type: 'number' }];
  }

  constructor(...args) {
    super(...args);
  }

  eval() {
    return this.n;
  }

  check() {
    return 'number';
  }
}

class VarValue extends Exp {
  static get props() {
    return [{ name: 'x', type: 'string' }];
  }

  constructor(...args) {
    super(...args);
  }

  eval(state) {
    const variable = state.get(this.x);
    if (!variable) {
      throw new Error(`Unknown variable ${this.x}`);
    }
    if (variable.value === undefined) {
      throw new Error(`Variable ${this.x} has not been initialized!`);
    }
    return variable.value;
  }

  check(state, errors) {
    const variable = state.get(this.x)
    if (!variable) {
      errors.push(`Unknown variable ${this.x}`);
    }

    return variable.type
  }
}

class Add extends Exp {
  static get props() {
    return [
      { name: 'e1', type: Exp },
      { name: 'e2', type: Exp },
    ];
  }

  constructor(...args) {
    super(...args);
  }

  eval(state) {
    const v1 = this.e1.typedEval('number', state);
    const v2 = this.e2.typedEval('number', state);
    return v1 + v2;
  }

  check(state, errors) {
    const t1 = this.e1.check(state, errors);
    const t2 = this.e2.check(state, errors);
    if (t1 !== 'number' || t2 !== 'number') {
      errors.push(`Type mismatch (${t1} + ${t2})`);
    }
    return 'number';
  }
}

class Mult extends Exp {
  static get props() {
    return [
      { name: 'e1', type: Exp },
      { name: 'e2', type: Exp },
    ];
  }

  constructor(...args) {
    super(...args);
  }

  eval(state) {
    const v1 = this.e1.typedEval('number', state);
    const v2 = this.e2.typedEval('number', state);
    return v1 * v2;
  }

  check(state, errors) {
    const t1 = this.e1.check(state, errors);
    const t2 = this.e2.check(state, errors);
    if (t1 !== 'number' || t2 !== 'number') {
      errors.push(`Type mismatch (${t1} + ${t2})`);
    }
    return 'number';
  }
}

class Sub extends Exp {
  static get props() {
    return [
      { name: 'e1', type: Exp },
      { name: 'e2', type: Exp },
    ];
  }

  constructor(...args) {
    super(...args);
  }

  eval(state) {
    const v1 = this.e1.typedEval('number', state);
    const v2 = this.e2.typedEval('number', state);
    return v1 - v2;
  }

  check(state, errors) {
    const t1 = this.e1.check(state, errors);
    const t2 = this.e2.check(state, errors);
    if (t1 !== 'number' || t2 !== 'number') {
      errors.push(`Type mismatch (${t1} + ${t2})`);
    }
    return {state, errors};
  }
}

class Bool extends Exp {
  static get props() {
    return [{ name: 'b', type: 'boolean' }];
  }

  constructor(...args) {
    super(...args);
  }

  eval() {
    return this.b;
  }

  check() {
    return 'boolean';
  }
}

class CompEq extends Exp {
  static get props() {
    return [
      { name: 'e1', type: Exp },
      { name: 'e2', type: Exp },
    ];
  }

  constructor(...args) {
    super(...args);
  }

  eval(state) {
    const v1 = this.e1.typedEval('number', state);
    const v2 = this.e2.typedEval('number', state);
    return v1 === v2;
  }

  check(state, errors) {
    const t1 = this.e1.check(state, errors);
    const t2 = this.e2.check(state, errors);
    
    if (t1 !== t2) {
      errors.push(`Type mismatch (${t1} + ${t2})`);
    }
    
    return { state, errors };
  }
}

class CompLte extends Exp {
  static get props() {
    return [
      { name: 'e1', type: Exp },
      { name: 'e2', type: Exp },
    ];
  }

  constructor(...args) {
    super(...args);
  }

  eval(state) {
    const v1 = this.e1.typedEval('number', state);
    const v2 = this.e2.typedEval('number', state);
    return v1 <= v2;
  }

  check(state, errors) {
    const t1 = this.e1.check(state, errors);
    const t2 = this.e2.check(state, errors);
    
    if (t1 !== 'number' || t2 !== 'number') {
      errors.push(`Type mismatch (${t1} + ${t2})`);
    }
    
    return { state, errors };
  }
}

class Neg extends Exp {
  static get props() {
    return [{ name: 'e', type: Exp }];
  }

  constructor(...args) {
    super(...args);
  }

  eval(state) {
    const v = this.e.typedEval('boolean', state);
    return !v;
  }

  check(state, errors) {
    const t = this.e.check(state, errors);
    
    if (t !== 'boolean') {
      errors.push(`Type mismatch (${t1})`);
    }
    
    return { state, errors };
  }
}

class And extends Exp {
  static get props() {
    return [
      { name: 'e1', type: Exp },
      { name: 'e2', type: Exp },
    ];
  }

  constructor(...args) {
    super(...args);
  }

  eval(state) {
    const v1 = this.e1.typedEval('boolean', state);
    const v2 = this.e2.typedEval('boolean', state);
    return v1 && v2;
  }

  check(state, errors) {
    const t1 = this.e1.check(state, errors);
    const t2 = this.e2.check(state, errors);
    
    if (t1 !== 'boolean' || t2 !== 'boolean') {
      errors.push(`Type mismatch (${t1} + ${t2})`);
    }
    
    return { state, errors };
  }
}

class Stmt extends ASTNode {
  /// ////////////////////////////////////////////////
  constructor(...args) {
    super(...args);
  }

  eval() {
    throw new Error(`${this.constructor.name}.eval() is not implemented!`);
  }

  check() {
    throw new Error(`${this.constructor.name}.check() is not implemented!`);
  }
}

class VarDecl extends Stmt {
  static get props() {
    return [
      { name: 't', type: 'string' },
      { name: 'x', type: 'string' },
      { name: 'e', type: Exp, optional: true },
    ];
  }

  constructor(...args) {
    super(...args);
  }

  eval(state) {
    state = state || new Map();
    const { t, x, e } = this;
    let variable = state.get(x);
    if (variable) {
      throw new Error(`Variable ${this.x} is already declared!`);
    }
    variable = {
      name: x,
      type: t,
      ...(e && { value: checkType(x, t, e.eval(state)) }),
    };
    state.set(this.x, variable);
    return state;
  }

  check(state, errors) {
    const { t, x, e } = this;
    if (state.get(x)) {
      errors.push(`Variable ${x} is already declared!`);
    }

    if (e) {
      const t1 = e.check(state, errors);
      if (t1 !== t) {
        errors.push(`Type mismatch (${t1} + ${t})`);
      }
    }
    state.set(x, { name: x, type: t, assigned: !!e });
    return { state, errors };
  }
}

class Assign extends Stmt {
  static get props() {
    return [
      { name: 'x', type: 'string' },
      { name: 'e', type: Exp },
    ];
  }

  constructor(...args) {
    super(...args);
  }

  eval(state) {
    state = state || new Map();
    const variable = state.get(this.x);
    if (!variable) {
      throw new Error(`Unknown variable ${this.x}!`);
    }
    const value = checkType(this.x, variable.type, this.e.eval(state));
    variable.value = value;
    return state;
  }

  check(state, errors) {
    const { x, e } = this;
    const isDeclared = state.get(x);
    const t = this.e.check(state, errors);
    
    if (isDeclared) {
      if (t.type != e.type){
        throw new Error(`Variable type ${t} != ${e}!`);
      }
    }
    state.get(x).assigned = true;
    return { state, errors};
  }
}

class Seq extends Stmt {
  static get props() {
    return [{ name: 'stmts', type: [Stmt] }];
  }

  constructor(...args) {
    super(...args);
  }

  eval(state) {
    state = state || new Map();
    return this.stmts.reduce((s, stmt) => stmt.eval(s), state);
  }

  check(state, errors) {
    state = state || new Map();
    errors = errors || [] 
    return this.stmts.reduce((s, stmt) => stmt.check(s.state, s.errors), { state, errors });
  }
}

class IfThenElse extends Stmt {
  static get props() {
    return [
      { name: 'b', type: Exp },
      { name: 's1', type: Stmt },
      { name: 's2', type: Stmt, optional: true },
    ];
  }

  constructor(...args) {
    super(...args);
  }

  eval(state) {
    state = state || new Map();
    if (this.b.typedEval('boolean', state)) {
      return this.s1.eval(state);
    }
    if (this.s2) {
      return this.s2.eval(state);
    }
  }

  
}

class WhileDo extends Stmt {
  static get props() {
    return [
      { name: 'b', type: Exp },
      { name: 's', type: Stmt },
    ];
  }

  constructor(...args) {
    super(...args);
  }

  eval(state) {
    state = state || new Map();
    while (this.b.typedEval('boolean', state)) {
      state = this.s.eval(state);
    }
    return state;
  }

  check(state, errors) {
    state = state || new Map();
    errors = errors || [];

    return this.b.check(state, errors);
  }
}

// Examples ////////////////////////////////////////////////////////////////////

const makeState = (obj) =>
  new Map(
    Object.entries(obj).map(([name, value]) => [
      name,
      { name, value, type: typeof value },
    ]),
  );

const showState = (state) => `{ ${[...state.entries()]
    .map(([, { name, type, value }]) => `${name}:${type}=${value}`)
    .join(', ')} }`;

const makeTypeState = (obj) =>
  new Map(
    Object.entries(obj).map(([name, type]) => [
      name,
      { name, type, assigned: true },
    ]),
  );

const showTypeState = (state) => {
  return `{ ${[...state.entries()]
    .map(([, { name, type, assigned }]) => `${name}:${type}:${assigned}`)
    .join(', ')} }`;
} 

const EXAMPLES = {
  factorial: new Seq([
    new VarDecl('number', 'f', new Num(1)),
    new WhileDo(
      new CompLte(new Num(1), new VarValue('n')),
      new Seq([
        new Assign('f', new Mult(new VarValue('f'), new VarValue('n'))),
        new Assign('n', new Sub(new VarValue('n'), new Num(1))),
      ]),
    ),
  ]),
  substract: new Seq([
    new VarDecl('number','f'),
    new Assign('f', new Sub(new VarValue('n1'), new VarValue('n2'))),
  ]) ,
  add: new Seq([
    new VarDecl('number','f'),
    new Assign('f', new Add(new VarValue('n1'), new VarValue('n2'))),
  ]),
  mult: new Seq([
    new VarDecl('number','f'),
    new Assign('f', new Mult(new VarValue('n1'), new VarValue('n2'))),
  ])
};

const TESTS = [
  {
    code: EXAMPLES.factorial,
    start: makeState({ n: 0 }),
    end: makeState({ n: 0, f: 1 }),
  },
  {
    code: EXAMPLES.factorial,
    start: makeState({ n: 8 }),
    end: makeState({ n: 0, f: 8 * 7 * 6 * 5 * 4 * 3 * 2 * 1 }),
  },
];

const TYPE_TESTS = [
  {
    code: EXAMPLES.factorial,
    start: makeTypeState({ n: 'number' }),
    end: makeTypeState({ n: 'number', f: 'number' }),
  },
  {
    code: EXAMPLES.substract,
    start: makeTypeState({ n1: 'number', n2: 'number' }),
    end: makeTypeState({ n1: 'number', n2: 'number', f: 'number' }),
  },
  {
    code: EXAMPLES.add,
    start: makeTypeState({ n1: 'number', n2: 'number' }),
    end: makeTypeState({ n1: 'number', n2: 'number', f: 'number' }),
  },
  {
    code: EXAMPLES.mult,
    start: makeTypeState({ n1: 'number', n2: 'number' }),
    end: makeTypeState({ n1: 'number', n2: 'number', f: 'number' }),
  }
]

// Utilities ///////////////////////////////////////////////////////////////////

function checkType(name, type, value) {
  if (typeof type === 'string') {
    if (typeof value !== type) {
      throw new TypeError(
        `Expected ${type} for ${name}, but got ${typeof value}!`,
      );
    }
  } else if (typeof type === 'function') {
    if (!(value instanceof type)) {
      throw new TypeError(
        `Expected ${type.name} for ${name}, but got ${
          value && value.constructor.name
        }!`,
      );
    }
  } else if (Array.isArray(type)) {
    if (!Array.isArray(value)) {
      throw new TypeError(
        `Expected array for ${name}, but got ${
          value && value.constructor.name
        }!`,
      );
    }
    value.forEach((v, i) => checkType(`${name}[${i}]`, type[0], v));
  }
  return value;
}

function defineTypedProperty(obj, prop, type, value) {
  checkType(prop, type, value);
  Object.defineProperty(obj, prop, { value });
}

if (require.main === module) {
//   TESTS.forEach(({ code, start, end: expected }, i) => {
//     const actual = code.eval(start);
//     console.log(`\
// Test #${i}. Running code
//   ${code}
// on state
//   ${showState(start)}
// Expected result:
//   ${showState(expected)}
// Actual result:
//   ${showState(actual)}\n`);
//   });

  TYPE_TESTS.forEach(({ code, start, end: expected }, i) => {
    const actual = code.check(start, []);
    console.log(`${actual}`)

    console.log(`\
Test #${i}. Running check code
  ${code}
on state
  ${showTypeState(start)}
Expected result:
  ${showTypeState(expected)}
Actual result:
  ${showTypeState(actual.state)}\n`);
  });
} else {
  module.exports = {
    Exp,
    Num,
    VarValue,
    Add,
    Mult,
    Sub,
    Bool,
    CompEq,
    CompLte,
    Neg,
    And,
    Stmt,
    VarDecl,
    Assign,
    Seq,
    IfThenElse,
    WhileDo,
    TESTS,
  };
}
