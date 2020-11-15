const winston = require('winston');
const cg = require('escodegen');

const logger = winston.createLogger({
  transports: [],
});

const createLog = logFile => {
  if (logFile) {
    logger.silent = false;
    const myformat = winston.format.combine(
      winston.format.timestamp(),
      winston.format.align(),
      winston.format.printf(
        (info) => `${info.timestamp} \t${info.level}: \t${info.message}`,
      ),
    );
    const files = new winston.transports.File({
      filename: logFile,
      level: 'info',
      format: myformat,
    });
    logger.clear().add(files)
  }
};

const logMessages = {
  error: (message) => logger.error(message),
  allStart: () => logger.info(`The process has started.`),
  sourceProvided: (source) =>
    logger.info(
      `A source file has been provided. The code to be compiled can be found in ${source}`,
    ),
  successfulLoad: () => logger.info(`The code has been succesfully load`),
  startCompilation: () => logger.info(`The compilation process is starting`),
  endCompilation: () => logger.info(`The compilation process has ended`),
  sourceNotProvided: () =>
    logger.info(
      `No source file has been provided. The code will be ask through the console`,
    ),
  optimizationEnable: () =>
    logger.info(`--opt option has been provided with ON data.`),
  optimizationDisbale: () =>
    logger.info(
      `--opt option has been provided with OFF data or has not been provided.`,
    ),
  optimizationStart: () =>
    logger.info(`Optimisation and minification proccess will start`),
  optimizationEnd: () =>
    logger.info(`Optimization and minification process has ended`),
  optimizationNotPerform: () =>
    logger.info(`Optimization and minification process will not be performed.`),
  outputProvided: (output) =>
    logger.info(
      `An output file has been provided. Compiled code will be save in ${output}`,
    ),
  outputFileSuccess: (output) =>
    logger.info(`The compiled code has been loaded into ${output}.`),
  outputNotProvided: () =>
    logger.info(
      `No output file has been provided. Compiled code will be return throgh Standard Output`,
    ),
  outputConsoleSuccess: () =>
    logger.info(`The compiled code has been loaded into Standard Output`),
  allEnd: () => logger.info(`All proccess has ended without errors`),
  extendParser: () =>
    logger.info('The parser has been extended to support date literals'),
  parseStart: () => logger.info('The parsing process has started'),
  parseEnd: () => logger.info('The code has been successfully parsed'),
  changeToMultiAssign: (node, newNode) =>
    logger.info(
      `A array multiassign expresison has been found. The code has been changed to an assign seqeunce. \n\t----- ${cg.generate(
        node,
      )}  \n\t+++++ ${cg.generate(newNode)}`,
    ),
  dateLiteral: (node, newNode) =>
    logger.info(
      `A date literal has been found and it has been converted into a Date object. \n\t----- ${
        node.raw
      }\n\t+++++ ${cg.generate(newNode)}`,
    ),
  functionAsignment: (node, newNode) =>
    logger.info(
      `A function in statement context has been found. It has been assign into a constant with the same name. \n\t----- \n${cg.generate(
        node,
      )}  \n\t+++++ \n${cg.generate(newNode)}`,
    ),
  varToLet: (node, newNode) =>
    logger.info(
      `A var declarator has been found and it has been converted into a let declarator. \n\t----- ${cg.generate(
        node,
      )}\n\t+++++ ${cg.generate(newNode)}`,
    ),
  setSilent: () => {
    logger.silent = true;
  },
};

module.exports = { logMessages, createLog };
