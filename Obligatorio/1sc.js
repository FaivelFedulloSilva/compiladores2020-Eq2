const yargs = require('yargs');
const { ASTworker } = require('./astworker');
const fs = require('fs');
const readline = require('readline');


// console.log(yargs.argv)
let source = yargs.argv['s'] || yargs.argv['source'];
let output = yargs.argv['o'] || yargs.argv['output'];
let optimization = yargs.argv['opt']
let log = yargs.argv['log']



console.log(source, output, optimization, log);

if (source) {
    let path = source;
    let pathExtension = path.split('.')
    if (pathExtension[pathExtension.length - 1] !== '1s') {
        throw new Error('The provided extension is not suported. Provide a file with extension .1s')
    }
    let code;
    try {
        code = fs.readFileSync(path, { encoding: 'utf8', flag: 'r' })
    } catch (error) {
        throw error
    }
    if (output) {
        fs.writeFileSync(output, ASTworker(code))
    } else {
        console.log(ASTworker(code))
    }
} else {
    var rl = readline.createInterface(
        process.stdin, process.stdout);
    rl.question('Writedown your OneScript code: \n', (code) => {
        if (output) {
            fs.writeFileSync(output, ASTworker(code))
        } else {
            console.log('The compiled result of your code into JavaScript is: \n', ASTworker(code))
        }
        rl.close();
    })
}