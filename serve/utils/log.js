export default {
    info: (message) => console.log('\x1b[42;30m INFO \x1b[40;32m' + message + '\x1b[0m'),
    warn: (message) => console.log('\x1b[43;30m WARN \x1b[40;33m' + message + '\x1b[0m'),
    error: (message) => console.log('\x1b[41;30m ERROR \x1b[40;31m' + message + '\x1b[0m'),
};
