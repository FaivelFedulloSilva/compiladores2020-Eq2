const yargs = require('yargs');
const { ASTworker } = require('./astworker');
const fs = require('fs');
const readline = require('readline');
const { minify } = require('terser');
const winston = require('winston');
const { createLog, logMessages } = require('./logMessages');


// console.log(yargs.argv)
let source = yargs.argv['s'] || yargs.argv['source'];
let output = yargs.argv['o'] || yargs.argv['output'];
let optimization = yargs.argv['opt']
let log = yargs.argv['log']
let compiledCode;




const compiler = async(source, output, optimization, log) => {
    let logger = createLog(log);

    logMessages['allStart'](logger);
    if (source) {
        logMessages['sourceProvided'](logger, source);
        let path = source;
        let pathExtension = path.split('.')
        if (pathExtension[pathExtension.length - 1] !== '1s') {
            let extensionNotSupported = new Error('The provided extension is not suported. Provide a file with extension .1s')
            logger ? logger.error(lackOfSemmicolonError.message) : null;
            throw extensionNotSupported;
        }
        let code;
        try {
            code = fs.readFileSync(path, { encoding: 'utf8', flag: 'r' })
            logMessages['successfulLoad'](logger);
            logMessages['startCompilation'](logger);
            compiledCode = ASTworker(code, logger);
            logMessages['endCompilation'](logger);
        } catch (error) {
            logger ? logger.error(error.message) : null;
            throw error
        }

    } else {
        logMessages['sourceNotProvided'](logger);
        var rl = readline.createInterface(
            process.stdin, process.stdout);
        rl.question('Writedown your OneScript code: \n', (code) => {
            try {
                logMessages['successfulLoad'](logger);
                logMessages['startCompilation'](logger);
                compiledCode = ASTworker(code, logger);
                logMessages['endCompilation'](logger);
            } catch (error) {
                logger ? logger.error(error.message) : null;
                throw error
            }
            rl.close();
        })
    }

    if (optimization && optimization.toLowerCase() === 'on') {
        logMessages['optimizationEnable'](logger);
        logMessages['optimizationStart'](logger);
        compiledCode = await minify(compiledCode);
        compiledCode = compiledCode['code']
        logMessages['optimizationEnd'](logger);
    } else {
        logMessages['optimizationDisbale'](logger);
        logMessages['optimizationNotPerform'](logger);
    }


    if (output) {
        logMessages['outputProvided'](logger);
        fs.writeFileSync(output, compiledCode)
        logMessages['outputFileSuccess'](logger, output);
    } else {
        logMessages['outputNotProvided'](logger);
        console.log('The compiled result of your code into JavaScript is: \n', compiledCode)
        logMessages['outputConsoleSuccess'](logger);
    }
    logMessages['allEnd'](logger);
}

compiler(source, output, optimization, log)