const winston = require('winston');
const cg = require('escodegen');



const logMessages = {
    'allStart': (logger) => {
        logger ?
            logger.info(`The process has started.`) :
            null;
    },
    'sourceProvided': (logger, source) => {
        logger ?
            logger.info(`A source file has been provided. The code to be compiled can be found in ${source}`) :
            null;
    },
    'successfulLoad': (logger) => {
        logger ?
            logger.info(`The code has been succesfully load`) :
            null;
    },
    'startCompilation': (logger) => {
        logger ?
            logger.info(`The compilation process is starting`) :
            null;
    },
    'endCompilation': (logger) => {
        logger ?
            logger.info(`The compilation process has ended`) :
            null;
    },
    'sourceNotProvided': (logger) => {
        logger ?
            logger.info(`No source file has been provided. The code will be ask through the console`) :
            null;
    },
    'logEnable': (logger) => {
        logger ?
            logger.info(`--log option has been provided. Proccess will generate log file.`) :
            null;
    },
    'optimizationEnable': (logger) => {
        logger ?
            logger.info(`--opt option has been provided with ON data.`) :
            null;
    },
    'optimizationDisbale': (logger) => {
        logger ?
            logger.info(`--opt option has been provided with OFF data or has not been provided.`) :
            null;
    },
    'optimizationStart': (logger) => {
        logger ?
            logger.info(`Optimisation and minification proccess will start`) :
            null;
    },
    'optimizationEnd': (logger) => {
        logger ?
            logger.info(`Optimization and minification process has ended`) :
            null;
    },
    'optimizationNotPerform': (logger) => {
        logger ?
            logger.info(`Optimization and minification process will not be performed.`) :
            null;
    },
    'outputProvided': (logger, output) => {
        logger ?
            logger.info(`An output file has been provided. Compiled code will be save in ${output}`) :
            null;
    },
    'outputFileSuccess': (logger, output) => {
        logger ?
            logger.info(`The compiled code has been loaded into ${output}.`) :
            null;
    },
    'outputNotProvided': (logger) => {
        logger ?
            logger.info(`No output file has been provided. Compiled code will be return throgh Standard Output`) :
            null;
    },
    'outputConsoleSuccess': (logger) => {
        logger ?
            logger.info(`The compiled code has been loaded into Standard Output`) :
            null;
    },
    'allEnd': (logger) => {
        logger ?
            logger.info(`All proccess has ended without errors`) :
            null;
    },
    'extendParser': (logger) => {
        logger ?
            logger.info('The parser has been extended to support date literals') :
            null;
    },
    'parseStart': (logger) => {
        logger ?
            logger.info('The parsing process has started') :
            null;
    },
    'parseEnd': (logger) => {
        logger ?
            logger.info('The code has been successfully parsed') :
            null;
    },
    'changeToMultiAssign': (logger, node, newNode) => {
        logger ?
            logger.info(`A array multiassign expresison has been found. The code has been changed to an assign seqeunce. \n\t----- ${cg.generate(node)}  \n\t+++++ ${cg.generate(newNode)}`) :
            null;
    },
    'dateLiteral': (logger, node, newNode) => {
        logger ?
            logger.info(`A date literal has been found and it has been converted into a Date object. \n\t----- ${node.raw}\n\t+++++ ${cg.generate(newNode)}`) :
            null;
    },
    'functionAsignment': (logger, node, newNode) => {
        logger ?
            logger.info(`A function in statement context has been found. It has been assign into a constant with the same name. \n\t----- \n${cg.generate(node)}  \n\t+++++ \n${cg.generate(newNode)}`) :
            null;
    },
    'varToLet': (logger, node, newNode) => {
        logger ?
            logger.info(`A var declarator has been found and it has been converted into a let declarator. \n\t----- ${cg.generate(node)}\n\t+++++ ${cg.generate(newNode)}`) :
            null;
    },
}


const createLog = (logFile) => {
    let logger = null;
    const myformat = winston.format.combine(
        winston.format.timestamp(),
        winston.format.align(),
        winston.format.printf(info => `${info.timestamp} \t${info.level}: \t${info.message}`)
    );
    if (logFile) {
        logger = winston.createLogger({
            transports: [
                new winston.transports.File({ filename: logFile + '.log', level: 'info', format: myformat })
            ]
        });
    }
    return logger;
}


module.exports = {
    logMessages: logMessages,
    createLog: createLog,
};