const acorn = require('acorn');
const datePlugin = require('./date');
const cg = require('escodegen');
const estraverse = require('estraverse');
const { logMessages } = require('./logMessages');

// Genera el AST correspondiente a la asignacion de una funcion con
// nombre a una constante del mismo nombre. Luego se utilizara como
// template para generar ASTs similares
const constFunctionTamplate = function () {
  let parsed = acorn.parse('const x = function x(){};');
  return parsed.body;
};

// Genera el AST correspondiente a la asignacion de un literal a un
// elemento de array.Luego se utilizara como template para generar
// ASTs similares
const assignTemplate = function () {
  let parsed = acorn.parse("x[1] = 'chau'");
  return parsed.body[0];
};

// Genera el AST correspondiente al acceso a un elemento de un array.
// Luego se utilizara para generar ASTs similares
const memberTamplate = function () {
  let parsed = acorn.parse('x[1]');
  return parsed.body[0];
};

// Genera el AST correspondiente a la creacion de una fecha en formato
// Date.UTC. Luego se utilizara para generar ASTs similares
const dateUTCTemplate = function () {
  let parsed = acorn.parse('new Date(Date.UTC(10,10))');
  return parsed.body[0].expression;
};

// Esta funcion toma un nodo correspodiente a la definicion de una
// funcion con nombre, y devuelve la msima funcion asignada a una
// constante del mismo nombre
function changeToConstFunction(FunctionNode) {
  let template = constFunctionTamplate()[0];
  let y = [...template.declarations];
  y[0].id = FunctionNode.id;
  y[0].init = {
    ...y[0].init,
    id: FunctionNode.id,
    params: FunctionNode.params,
    body: FunctionNode.body,
  };
  let x = {
    ...template,
    declarations: y,
  };
  return x;
}

// Funcion recursiva auxiliar de changeToMultiAsign.
// Es la que se encarga de armar el AST resultante
function recursiveMultiAsignGeneration(parts, object, index) {
  if (index > 0) {
    let newExp = {
      ...assignTemplate().expression,
      left: {
        ...memberTamplate().expression,
        object: object,
        property: { ...parts[index] },
      },
      right: recursiveMultiAsignGeneration(parts, object, --index),
    };
    return newExp;
  } else {
    return { ...parts[index] };
  }
}

// Esta funcion toma un nodo correspodiente a la asignacion simultarea
// a varias posiciones de array u objeto y devuelve la la asignacion en
// cadena de as posiciones o keys correspondientes
// EJ -         arr[1,2,3] = 100
// Devuelve -   arr[3] = arr[2] = arr[1] = 100 (El AST correspondinete)
function changeToMultiAsign(AExpNode) {
  let parts = [AExpNode.right, ...AExpNode.left.property.expressions];
  let result = recursiveMultiAsignGeneration(
    parts,
    AExpNode.left.object,
    parts.length - 1,
  );
  return result;
}

// Funcion principal a exportar. Dado un AST lo recorre y realiza las
// modificaciones de codigo necesarias. El AST se recorre de manera
// automatica con la libreria estraverse, la cual toma como parametros
// el AST y un objeto con dos funciones, enter y leave.La funcion enter
// se ejecuta sobre cada nodo cuando se llega al mismo, es decir antes
// de moverse recursivamente a sus hijos.La funcion leave se ejecuta al
// abandonar un nodo, es decir, al terminar de procesar sus hijos.
// Particularmente, al usar estraverse.replace, cuando se ejecuta alguna
// de las dos funciones, si no se devuelve nada, el nodo visitado no se
// modifica.Por otro lado si se retorna un nodo, modificado o no, el
// nodo siendo visitado es reemplazado por el nodo retornado
const worker = (ast) => {
  result = estraverse.replace(ast, {
    enter: function (node) {
      // Si el nodo es de tipo AssignmentExpression, su hijo izquierdo es de
      // tipo MemberExpression, y el memeber exrpression tiene como property un
      // SequenceExpression nos econtramos ante un AST que representa codigo de
      // la forma 'arr[1,2,3,4] = y' por lo que podemos realizar al transformacion
      // de codigo correspondiente, llamando a la funcion changeToMultiAsign
      if (node.type === 'AssignmentExpression') {
        if (
          node.left.type === 'MemberExpression' &&
          node.left.property.type === 'SequenceExpression'
        ) {
          let newNode = changeToMultiAsign(node);
          logMessages.changeToMultiAssign(node, newNode);
          return newNode;
        }
      }
      // TODO - Sacar el comportamiento de generar el AST correspondiente al new Date.UTC a una funcion y llamarla desde aca
      // Si el Nodo es de tipo Literal, y el valor es un array, nos encontramos
      // ante un tipo date.El que el value sea de tipo array es una caracteristica
      // agregada en el plugin datePlugin. Estando en un nodo de estas caracteristicas
      // se puede modificar el AST para que se cambie el nodo por uno correspondiente
      // a la creacion de un tipo Date.UTC
      if (node.type === 'Literal' && node.value instanceof Array) {
        let date = dateUTCTemplate();
        date.arguments[0].arguments = [];
        node.value.forEach((element) => {
          date.arguments[0].arguments.push({
            type: 'Literal',
            value: parseInt(element),
            raw: `${element}`,
          });
        });
        logMessages.dateLiteral(node, date);
        return date;
      }
    },
    leave: function (node, parent) {
      // FunctionDeclaration unicamente se da cuando se encuentra
      // la definicion de una funcion no asignada. Por lo que si
      // nos encontramos con un nodo de este tipo se debe alterar
      // el AST para que se mantenga la estructura y nombre de la
      // funcion pero asignado a una constante del mismo nombre.
      // Esto se realiza con la funcion changeToConstFunction
      if (node.type === 'FunctionDeclaration') {
        let constFunction = changeToConstFunction(node);
        logMessages.functionAsignment(node, constFunction);
        return constFunction;
      }

      // SequenceExpression se da cuando se encuentra un operador
      // coma(Existen otros cados, que son eliminados en la funcion
      // Enter) Cuando se encuentra un nodo se tipo SequenceExpression,
      // es decir un operador coma, se elvant aun SyntaxError
      if (node.type === 'SequenceExpression') {
        throw new SyntaxError(
          `Comma operation (${node.loc.start.line}, ${node.loc.start.column})`,
        );
      }

      // Cuando se abandona un nodo de tipo VariableDeclaration existen varias
      // consideraciones.
      if (node.type === 'VariableDeclaration') {
        // Si el tipo de declaracion es let, se levanda una SyntaxError, ya que
        // OneScript no permite el uso de let
        if (node.kind === 'let') {
          throw new SyntaxError(
            `Let is not a recognized keyword. (${node.loc.start.line}, ${node.loc.start.column})`,
          );
        }
        // Si existe mas de una declaracion es que se intenta declarar varias
        // variables con el mismo var.Esto corresponde a otro uso del operador
        // coma, por lo que se levanta un SyntaxError
        if (node.declarations.length > 1) {
          throw new SyntaxError(
            `Cannot declare multiple variables or constants in a single expression. (${node.loc.start.line}, ${node.loc.start.column})`,
          );
        }

        // Si el el tipo es var, se cambia el tipo a let, a modo que en el AST
        // resultante, el correspondiente a JS todas las declaraciones de
        // variables sean con let en lugar de var
        if (node.kind === 'var') {
          let letNode = { ...node, kind: 'let' };
          logMessages.varToLet(node, letNode);
          return letNode;
        }
      }
    },
  });

  return result;
};

const ASTworker = (code) => {
  // datePlugin es lo que se importa de date. Es el plugin que permite a
  // acorn reconocer el literal date
  const p = acorn.Parser.extend(datePlugin);
  logMessages.extendParser();
  logMessages.parseStart();
  let parsed = p.parse(code, {
    locations: true,
    ecmaVersion: 2020,
    onInsertedSemicolon: (pos, loc) => {
      throw new SyntaxError(`Lack of semicolon(${loc.line}, ${loc.column})`);
    },
  });
  logMessages.parseEnd();
  return cg.generate(worker(parsed));
};

// code = `
// var x = [1,2,3,4];
// x[1,2,3] = 1;
// `
//     // console.log(util.inspect(parsed, false, null, true));
// console.log(ASTworker(code, null))

// console.log(ASTworker(`
// `))
// TODO - crear un archivo 1sc.js que funcione como wraper de este modulo.
// Tiene que procesar las opciones, crear el modulo npm y llamar a este modulo

// TODO - Agregar Winston para loguear
module.exports = {
  ASTworker: ASTworker,
};
