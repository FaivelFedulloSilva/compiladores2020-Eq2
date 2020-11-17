const realConsole = global.console;
global.console = { log: jest.fn(), error: realConsole.error };

afterAll(() => {
  global.console = realConsole;
})
