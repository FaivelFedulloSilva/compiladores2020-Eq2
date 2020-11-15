const fs = require('fs');
const readline = require('readline-sync');
const { minify } = require('terser');
const { ASTworker } = require('./astworker');
const { createLog, logMessages } = require('./logMessages');

module.exports = async ({ source, output, optimization, log }) => {
  let compiledCode;
  if (log) {
    createLog(log);
  } else {
    logMessages.setSilent();
  }

  logMessages.allStart();
  if (source) {
    logMessages.sourceProvided(source);
    let path = source;
    let pathExtension = path.split('.');
    if (pathExtension[pathExtension.length - 1] !== '1s') {
      let extensionNotSupported = new Error(
        'The provided extension is not suported. Provide a file with extension .1s',
      );
      logMessages.error(extensionNotSupported.message);
      throw extensionNotSupported;
    }
    let code;
    try {
      code = fs.readFileSync(path, { encoding: 'utf8', flag: 'r' });
      logMessages.successfulLoad();
      logMessages.startCompilation();
      compiledCode = ASTworker(code);
      logMessages.endCompilation();
    } catch (error) {
      logMessages.error(error.message);
      throw error;
    }
  } else {
    logMessages.sourceNotProvided();
    let lines = [];
    try {
      readline.promptLoop(function (input) {
        lines.push(input);
        return input.length === 0;
      });
      logMessages.successfulLoad();
      logMessages.startCompilation();
      let code = lines.join('\n');
      compiledCode = ASTworker(code.slice(0, code.length - 1));
      logMessages.endCompilation();
    } catch (error) {
      logMessages.error(error.message);
      throw error;
    }
  }

  if (optimization && optimization.toLowerCase() === 'on') {
    logMessages.optimizationEnable();
    logMessages.optimizationStart();
    compiledCode = await minify(compiledCode);
    compiledCode = compiledCode['code'];
    logMessages.optimizationEnd();
  } else {
    logMessages.optimizationDisbale();
    logMessages.optimizationNotPerform();
  }

  if (output) {
    logMessages.outputProvided();
    fs.writeFileSync(output, compiledCode);
    logMessages.outputFileSuccess(output);
  } else {
    logMessages.outputNotProvided();
    console.log(
      'The compiled result of your code into JavaScript is: \n',
      compiledCode,
    );
    logMessages.outputConsoleSuccess();
  }
  logMessages.allEnd();

  return compiledCode;
};
