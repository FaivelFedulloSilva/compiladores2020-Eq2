const yargs = require('yargs');
const compiler = require('./compiler');

let source = yargs.argv['s'] || yargs.argv['source'];
let output = yargs.argv['o'] || yargs.argv['output'];
let optimization = yargs.argv['opt'];
let log = yargs.argv['log'];
let compiledCode;

compiler({ source, output, optimization, log }).catch((error) =>
  console.error(error.message),
);
