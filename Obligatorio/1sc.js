const yargs = require('yargs');
const { ASTworker } = require('./astworker');
const fs = require('fs');
const readline = require('readline');
const { minify } = require('terser');


// console.log(yargs.argv)
let source = yargs.argv['s'] || yargs.argv['source'];
let output = yargs.argv['o'] || yargs.argv['output'];
let optimization = yargs.argv['opt']
let log = yargs.argv['log']
let compiledCode;


console.log(source, output, optimization, log);

const compiler = async(source, output, optimization, log) => {


    if (source) {
        let path = source;
        let pathExtension = path.split('.')
        if (pathExtension[pathExtension.length - 1] !== '1s') {
            throw new Error('The provided extension is not suported. Provide a file with extension .1s')
        }
        let code;
        try {
            code = fs.readFileSync(path, { encoding: 'utf8', flag: 'r' })
            compiledCode = ASTworker(code, log);
        } catch (error) {
            throw error
        }

    } else {
        var rl = readline.createInterface(
            process.stdin, process.stdout);
        rl.question('Writedown your OneScript code: \n', (code) => {
            try {
                compiledCode = ASTworker(code, log);
            } catch (error) {
                throw error
            }
            rl.close();
        })
    }

    if (optimization && optimization.toLowerCase() === 'on') {
        compiledCode = await minify(compiledCode);
        compiledCode = compiledCode['code']
    }


    if (output) {
        fs.writeFileSync(output, compiledCode)
    } else {
        console.log('The compiled result of your code into JavaScript is: \n', compiledCode)
    }
}

compiler(source, output, optimization, log)