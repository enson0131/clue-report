require('colors');

module.exports = {
  info(...args) {
    // eslint-disable-next-line no-console
    console.log(' INFO '.bgBlue.black, ...args);
  },
  done(...args) {
    // eslint-disable-next-line no-console
    console.log(' DONE '.bgGreen.black, ...args);
  },
  error(...args) {
    // eslint-disable-next-line no-console
    console.log(' ERROR '.bgRed.black, ...args);
  },
  warning(...args) {
    // eslint-disable-next-line no-console
    console.log(' WARNING '.bgYellow.black, ...args);
  },
};
