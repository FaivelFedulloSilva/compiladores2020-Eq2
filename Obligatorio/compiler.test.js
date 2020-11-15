const fs = require('fs');
const compiler = require('./compiler');
const readline = require('readline-sync');
const { createLog, logMessages } = require('./logMessages');

jest.mock('readline-sync');

describe('compiler', () => {
  const log = 'testlog';

  test('Should throw exception if source extention is not .1s', async () => {
    await expect(
      compiler({ source: 'code.js', log }),
    ).rejects.toThrow(/The provided extension.*/);
  });

  test('Should output the result in the provided path', async () => {
    const outputPath = 'codeTest.js';
    await compiler({ source: 'code.1s', output: outputPath, log })
    expect(fs.existsSync(outputPath));
    fs.unlinkSync(outputPath);
  })

  test('Should work if no output defined', async () => {
    expect(await compiler({ source: 'code.1s', log }))
      .toMatchInlineSnapshot(`
      "const g = function g(x, y) {
          x[3] = x[2] = x[1] = y;
          let w = 1;
          let z = new Date(Date.UTC(2020, 10, 24, 4));
      };"
    `);
  });

  test('Should default to standard input if no source provided', async () => {
    await compiler({ log });
    expect(readline.promptLoop).toHaveBeenCalledTimes(1);
  })
});
