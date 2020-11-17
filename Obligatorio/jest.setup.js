const { logMessages } = require('./logMessages')

const realConsole = global.console;
global.console = { log: jest.fn(), error: realConsole.error };

beforeAll(() => {
  logMessages.s

});

afterAll(() => {
  global.console = realConsole;
});
