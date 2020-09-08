/** Implementation of the While language from [_Semantics with Applications_ by
 * Nielsen & Nielsen](https://archive.org/details/Hanne_Riis_Nielson_Flemming_Nielson__Semantics_with_Applications/mode/2up)
 * (section 1.2).
 *
 * by Leonardo Val.
 */

export class Exp {
    ////////////////////////////////////////////////////////////
    eval() {
        throw new Error(`${this.constructor.name}.eval() is not implemented!`);
    }
}

export class Num extends Exp {
    constructor(n) {
        super();
        if (checkType(n, int, typeof n) || checkType(n, float, typeof n))
        {
            defineTypedProperty(this, 'n', 'number', n);
        }
    }

    eval() {
        return this.n;
    }
}

export class Var extends Exp {
    constructor(x) {
        super();
        if (checkType(x, string, typeof x))
        {
            defineTypedProperty(this, 'x', 'string', x);
        }
    }

    eval(state) {
        return state.get(this.x);
    }
}

export class Add extends Exp {
    constructor(a1, a2) {
        super();
        if ((checkType(a1, int, typeof a1) || checkType(a1, float, typeof a1))
        && (checkType(a2, int, typeof a2) || checkType(a2, float, typeof a2)))
        {
            defineTypedProperty(this, 'a1', Exp, a1);
            defineTypedProperty(this, 'a2', Exp, a2);
        }
    }

    eval(state) {
        return this.a1.eval(state) + this.a2.eval(state);
    }
}

export class Mult extends Exp {
    constructor(a1, a2) {
        super();
        if ((checkType(a1, int, typeof a1) || checkType(a1, float, typeof a1))
        && (checkType(a2, int, typeof a2) || checkType(a2, float, typeof a2)))
        {
            defineTypedProperty(this, 'a1', Exp, a1);
            defineTypedProperty(this, 'a2', Exp, a2);
        }
    }

    eval(state) {
        return this.a1.eval(state) * this.a2.eval(state);
    }
}

export class Sub extends Exp {
    constructor(a1, a2) {
        super();
        if ((checkType(a1, int, typeof a1) || checkType(a1, float, typeof a1))
        && (checkType(a2, int, typeof a2) || checkType(a2, float, typeof a2)))
        {
            defineTypedProperty(this, 'a1', Exp, a1);
            defineTypedProperty(this, 'a2', Exp, a2);
        }
    }

    eval(state) {
        return this.a1.eval(state) - this.a2.eval(state);
    }
}

export class Bool extends Exp {
    constructor(b) {
        super();
        if (checkType(b, boolean, typeof b))
        {
            defineTypedProperty(this, 'b', 'boolean', b);
        }
    }

    eval() {
        return this.b;
    }
}

export class CompEq extends Exp {
    constructor(a1, a2) {
        super();
        if (checkType(a1, boolean, typeof a1) && checkType(a2, boolean, typeof a2))
        {
            defineTypedProperty(this, 'a1', Exp, a1);
            defineTypedProperty(this, 'a2', Exp, a2);
        }
    }

    eval(state) {
        return this.a1.eval(state) === this.a2.eval(state);
    }
}

export class CompLte extends Exp {
    constructor(a1, a2) {
        super();
        if (checkType(a1, boolean, typeof a1) && checkType(a2, boolean, typeof a2))
        {
            defineTypedProperty(this, 'a1', Exp, a1);
            defineTypedProperty(this, 'a2', Exp, a2);
        }
    }

    eval(state) {
        return this.a1.eval(state) <= this.a2.eval(state);
    }
}

export class Neg extends Exp {
    constructor(b) {
        super();
        if (checkType(b, boolean, typeof b))
        {
            defineTypedProperty(this, 'b', Exp, b);
        }
    }

    eval(state) {
        return !this.b.eval(state);
    }
}

export class And extends Exp {
    constructor(b1, b2) {
        super();
        if (checkType(b1, boolean, typeof b1) && checkType(b2, boolean, typeof b2))
        {
            defineTypedProperty(this, 'b1', Exp, b1);
            defineTypedProperty(this, 'b2', Exp, b2);
        }
    }

    eval(state) {
        return this.b1.eval(state) && this.b2.eval(state);
    }
}

export class Stmt {
    ////////////////////////////////////////////////////////////
    eval() {
        throw new Error(`${this.constructor.name}.eval() is not implemented!`);
    }
}

export class Assign extends Stmt {
    constructor(x, a) {
        super();
        if (checkType(x, string, typeof x))
        {
            defineTypedProperty(this, 'x', 'string', x);
        }
        if ((checkType(a, int, typeof a)) || (checkType(a, float, typeof n)) || (checkType(a, boolean, typeof n)))
        {
            defineTypedProperty(this, 'a', Exp, a);
        }
    }

    eval(state) {
        state = state || new Map();
        state.set(this.x, this.a.eval(state));
        return state;
    }
}

export class Seq extends Stmt {
    constructor(stmts) {
        super();
        if (checkType(stmts, Array, typeof stmts))
        {
            defineTypedProperty(this, 'stmts', [Stmt], stmts);
        }
    }

    eval(state) {
        state = state || new Map();
        return this.stmt.reduce((s, stmt) => stmt.eval(s), state);
    }
}

export class IfThenElse extends Stmt {
    constructor(b, s1, s2) {
        super();
        if (checkType(b, boolean, typeof b))
        {
            defineTypedProperty(this, 'b', Exp, b);
        }
        if (checkType(s1, Array, typeof s1))
        {
            defineTypedProperty(this, 's1', Stmt, s1);
        }
        if (checkType(s2, Array, typeof s2))
        {
            defineTypedProperty(this, 's2', Stmt, s2);
        }
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

export class WhileDo extends Stmt {
    constructor(b, s) {
        super();
        if (checkType(b, boolean, typeof b))
        {
            defineTypedProperty(this, 'b', Exp, b);
        }
        if (checkType(s, Array, typeof s))
        {
            defineTypedProperty(this, 's', Stmt, s);
        }
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

export const TESTS = [
    new Assign('x', new Num(1.2)),
    new Seq([new Assign('x', new Num(77)), new Assign('y', new Mult(new Num(2), new Var('x')))]),
];

// Utilities ///////////////////////////////////////////////////////////////////

function checkType(name, type, value) {
    if (typeof type === 'string') {
        return True;
    }
    else if (typeof value !== type) {
            throw new TypeError(`Expected ${type} for ${name}, but got ${typeof value}!`);
        }
    }
    if ((typeof type === 'int') || (typeof type === 'float')) {
        return True;
    }
    else if (typeof value !== type) {
            throw new TypeError(`Expected ${type} for ${name}, but got ${typeof value}!`);
        }
    }
    if (typeof type === 'boolean') {
        return True;
    }
    else if (typeof value !== type) {
            throw new TypeError(`Expected ${type} for ${name}, but got ${typeof value}!`);
        }
    }
    if (typeof type === 'function') {
        return True;
    }
        else if (!(value instanceof type)) {
            throw new TypeError(`Expected ${type.name} for ${name}, but got ${value && value.constructor.name}!`);
        }
    }
    if (Array.isArray(type)) {
        return True;
    }
        else if (!Array.isArray(value)) {
            throw new TypeError(`Expected array for ${name}, but got ${value && value.constructor.name}!`);
        }
        value.forEach((v, i) => checkType(`${name}[${i}]`, type[0], v));
    }
}

function defineTypedProperty(obj, prop, type, value) {
    checkType(prop, type, value);
    Object.defineProperty(obj, prop, { value });
}