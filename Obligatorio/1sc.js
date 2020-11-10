const yargs = require('yargs');
const { ASTworker } = require('./astworker');
const fs = require('fs');
const readline = require('readline');
const { minify } = require('terser');
const winston = require('winston');


// console.log(yargs.argv)
let source = yargs.argv['s'] || yargs.argv['source'];
let output = yargs.argv['o'] || yargs.argv['output'];
let optimization = yargs.argv['opt']
let log = yargs.argv['log']
let compiledCode;




const compiler = async(source, output, optimization, log) => {
    let logger = null;
    const myformat = winston.format.combine(
        winston.format.timestamp(),
        winston.format.align(),
        winston.format.printf(info => `${info.timestamp} \t${info.level}: \t${info.message}`)
    );
    if (log) {
        logger = winston.createLogger({
            transports: [
                new winston.transports.File({ filename: log + '.log', level: 'info', format: myformat })
            ]
        });
    }

    if (source) {
        logger ?
            logger.info(`A source file has been provided. The code to be compiled can be found in ${source}`) :
            null;
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
            logger ?
                logger.info(`The code has been succesfully load`) :
                null;
            logger ?
                logger.info(`The compilation process is starting`) :
                null;
            compiledCode = ASTworker(code, logger);
            logger ?
                logger.info(`The compilation process has ended`) :
                null;
        } catch (error) {
            logger ? logger.error(error.message) : null;
            throw error
        }

    } else {
        logger ?
            logger.info(`No source file has been provided. The code will be ask through the console`) :
            null;
        var rl = readline.createInterface(
            process.stdin, process.stdout);
        rl.question('Writedown your OneScript code: \n', (code) => {
            try {
                logger ?
                    logger.info(`The code has been succesfully load`) :
                    null;
                logger ?
                    logger.info(`The compilation process is starting`) :
                    null;
                compiledCode = ASTworker(code, logger);
                logger ?
                    logger.info(`The compilation process has ended`) :
                    null;
            } catch (error) {
                logger ? logger.error(error.message) : null;
                throw error
            }
            rl.close();
        })
    }

    if (optimization && optimization.toLowerCase() === 'on') {
        logger ?
            logger.info(`--log option has been provided with ON data.`) :
            null;
        logger ?
            logger.info(`Optimisation and minification proccess will start`) :
            null;
        compiledCode = await minify(compiledCode);
        compiledCode = compiledCode['code']
        logger ?
            logger.info(`Optimization and minification process has ended`) :
            null;
    } else {
        logger ?
            logger.info(`--log option has been provided with OFF data or has not been provided.`) :
            null;
        logger ?
            logger.info(`Optimization and minification process will not be performed.`) :
            null;
    }


    if (output) {
        logger ?
            logger.info(`An output file has been provided. Compiled code will be save in ${output}`) :
            null;
        fs.writeFileSync(output, compiledCode)
        logger ?
            logger.info(`The compiled code has been loaded into ${output}.`) :
            null;
    } else {
        logger ?
            logger.info(`No output file has been provided. Compiled code will be return throgh standard output`) :
            null;
        console.log('The compiled result of your code into JavaScript is: \n', compiledCode)
        logger ?
            logger.info(`The compiled code has been loaded into Standard Output`) :
            null;
    }
    logger ?
        logger.info(`All proccess has ended without errors`) :
        null;
}

compiler(source, output, optimization, log)